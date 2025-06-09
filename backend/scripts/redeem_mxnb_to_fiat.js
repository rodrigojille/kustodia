// Script para redimir MXNB a MXN (SPEI payout) usando la API de Juno
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || 'https://stage.buildwithjuno.com';

const amount = 1000; // Monto a redimir (ajustar según lógica de negocio)
const destination_bank_account_id = process.env.JUNO_SELLER_BANK_ACCOUNT_ID; // Debe estar en .env o pasar como arg
const asset = 'mxn';

if (!destination_bank_account_id) {
  console.error('Falta JUNO_SELLER_BANK_ACCOUNT_ID en .env');
  process.exit(1);
}

const path = '/mint_platform/v1/redemptions';
const url = `${JUNO_BASE_URL}${path}`;
const method = 'POST';
const bodyObj = {
  amount,
  destination_bank_account_id,
  asset
};
const body = JSON.stringify(bodyObj);
const nonce = Date.now().toString();
const stringToSign = `${nonce}${method}${path}${body}`;
const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
const headers = {
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  'Content-Type': 'application/json'
};

console.log('--- JUNO REDEMPTION DEBUG ---');
console.log('String to sign:', stringToSign);
console.log('Signature:', signature);
console.log('Headers:', headers);
console.log('Body:', body);
console.log('------------------------------');

// --- DB Logging for traceability ---
const { DataSource } = require('typeorm');
const { Payment } = require('../src/entity/Payment');
const { PaymentEvent } = require('../src/entity/PaymentEvent');
const { JunoTransaction } = require('../src/entity/JunoTransaction');
const ormconfig = require('../src/ormconfig').default;

async function logRedemptionAndEvent(responseData) {
  const dataSource = await ormconfig.initialize();
  const paymentRepo = dataSource.getRepository(Payment);
  const paymentEventRepo = dataSource.getRepository(PaymentEvent);
  const junoTxRepo = dataSource.getRepository(JunoTransaction);
  // Find the latest funded payment (or adapt to your logic)
  const payment = await paymentRepo.findOne({ where: { status: 'funded' }, order: { updated_at: 'DESC' } });
  if (!payment) {
    console.error('No funded payment found to link redemption!');
    return;
  }
  // Log JunoTransaction
  const junoTx = junoTxRepo.create({
    type: 'redemption',
    reference: responseData.payload?.id || null,
    amount: responseData.payload?.amount || amount,
    status: responseData.payload?.summary_status || 'IN_PROGRESS',
  });
  await junoTxRepo.save(junoTx);
  // Log PaymentEvent
  await paymentEventRepo.save(paymentEventRepo.create({
    paymentId: payment.id,
    type: 'redemption_initiated',
    description: `Redención MXNB iniciada. Juno redemption ID: ${responseData.payload?.id}`
  }));
  await paymentEventRepo.save(paymentEventRepo.create({
    paymentId: payment.id,
    type: 'payout_initiated',
    description: `Pago SPEI al vendedor iniciado. Monto: $${amount} MXN` 
  }));
  console.log('Redemption and payout events logged for payment:', payment.id);
  await dataSource.destroy();
}

axios.post(url, bodyObj, { headers })
  .then(async resp => {
    console.log('Redemption response:', JSON.stringify(resp.data, null, 2));
    await logRedemptionAndEvent(resp.data);
  })
  .catch(err => {
    if (err.response) {
      console.error('Redemption error:', err.response.data);
    } else {
      console.error('Redemption error:', err.message);
    }
  });
