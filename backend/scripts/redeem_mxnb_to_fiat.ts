import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import axios from "axios";
import crypto from "crypto";
import { DataSource } from "typeorm";
import { Payment } from "../src/entity/Payment";
import { PaymentEvent } from "../src/entity/PaymentEvent";
import { JunoTransaction } from "../src/entity/JunoTransaction";
import ormconfig from "../src/ormconfig";

const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || "https://stage.buildwithjuno.com";

const amount = 3000; // Monto a redimir: 2500 MXN for final payout to seller of payment 73
const destination_bank_account_id = process.env.JUNO_SELLER_BANK_ACCOUNT_ID;
const asset = "mxn";
const paymentId = Number(process.env.PAYMENT_ID) || 81;

if (!destination_bank_account_id) {
  console.error("Falta JUNO_SELLER_BANK_ACCOUNT_ID en .env");
  process.exit(1);
}

const apiPath = "/mint_platform/v1/redemptions";
const url = `${JUNO_BASE_URL}${apiPath}`;
const method = "POST";
const bodyObj = {
  amount,
  destination_bank_account_id,
  asset,
};
const body = JSON.stringify(bodyObj);
const nonce = Date.now().toString();
const stringToSign = `${nonce}${method}${apiPath}${body}`;
const signature = crypto.createHmac("sha256", JUNO_API_SECRET!).update(stringToSign).digest("hex");
const headers = {
  Authorization: `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  "Content-Type": "application/json",
};

console.log("--- JUNO REDEMPTION DEBUG ---");
console.log("String to sign:", stringToSign);
console.log("Signature:", signature);
console.log("Headers:", headers);
console.log("Body:", body);
console.log("------------------------------");

async function logRedemptionAndEvent(responseData: any) {
  let dataSource;
  try {
    console.log('[DEBUG] Iniciando logRedemptionAndEvent para paymentId:', paymentId);
    dataSource = await ormconfig.initialize();
    console.log('[DEBUG] DataSource inicializado');
    const paymentRepo = dataSource.getRepository(Payment);
    const paymentEventRepo = dataSource.getRepository(PaymentEvent);
    const junoTxRepo = dataSource.getRepository(JunoTransaction);
    const payment = await paymentRepo.findOne({ where: { id: paymentId } });
    console.log('[DEBUG] payment encontrado:', payment);
    if (!payment) {
      console.error(`[ERROR] Payment with ID ${paymentId} not found!`);
      await dataSource.destroy();
      return;
    }
    // Log JunoTransaction
    const junoTx = junoTxRepo.create({
      type: "redemption",
      reference: responseData.payload?.id || null,
      amount: responseData.payload?.amount || amount,
      status: responseData.payload?.summary_status || "IN_PROGRESS",
    });
    console.log('[DEBUG] junoTx a guardar:', junoTx);
    await junoTxRepo.save(junoTx);
    console.log('[DEBUG] JunoTransaction guardado');
    // Log PaymentEvent: redemption_initiated
    const redemptionEvent = paymentEventRepo.create({
      paymentId: payment.id,
      type: "redemption_initiated",
      description: `Redención MXNB iniciada. Juno redemption ID: ${responseData.payload?.id}`,
    });
    console.log('[DEBUG] redemptionEvent a guardar:', redemptionEvent);
    await paymentEventRepo.save(redemptionEvent);
    console.log('[DEBUG] redemption_initiated event guardado');
    // Log PaymentEvent: payout_initiated
    const payoutEvent = paymentEventRepo.create({
      paymentId: payment.id,
      type: "payout_initiated",
      description: `Pago SPEI al vendedor iniciado. Monto: $${amount} MXN`,
    });
    console.log('[DEBUG] payoutEvent a guardar:', payoutEvent);
    await paymentEventRepo.save(payoutEvent);
    console.log('[DEBUG] payout_initiated event guardado');
    // Cambiar status del payment a 'paid' (con logs detallados)
    try {
      payment.status = 'paid';
      const updatedPayment = await paymentRepo.save(payment);
      console.log('[DEBUG] payment.status actualizado a paid:', updatedPayment.status);
    } catch (err) {
      console.error('[ERROR] Fallo al actualizar status del payment:', err);
    }
    console.log("Redemption and payout events logged for payment:", payment.id);
  } catch (err) {
    console.error("[logRedemptionAndEvent] Error logging redemption/payout events:", err);
  } finally {
    if (dataSource) await dataSource.destroy();
  }
}


axios
  .post(url, bodyObj, { headers, timeout: 30000 }) // 30 segundos
  .then(async (resp) => {
    console.log("Redemption response:", JSON.stringify(resp.data, null, 2));
    await logRedemptionAndEvent(resp.data);
  })
  .catch((err) => {
    if (err.code === 'ECONNABORTED') {
      console.error("Redemption error: TIMEOUT (no respuesta de Juno en 30s)");
    } else if (err.response) {
      console.error("Redemption error:", err.response.data);
    } else {
      console.error("Redemption error:", err.message);
    }
  });
