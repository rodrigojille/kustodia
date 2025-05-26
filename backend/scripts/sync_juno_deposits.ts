import axios from 'axios';
import { DataSource } from 'typeorm';
import ormconfig from '../src/ormconfig';
import { Payment } from '../src/entity/Payment';
import { JunoTransaction } from '../src/entity/JunoTransaction';
import crypto from 'crypto';
import 'dotenv/config';
import { sendEmail } from '../src/utils/emailService';

const JUNO_API_KEY = process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = "https://stage.buildwithjuno.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kustodia.com';

function getJunoAuthHeaders(method: string, path: string, body: string = '') {
  const nonce = Date.now().toString();
  const stringToSign = `${nonce}${method}${path}${body}`;
  const signature = crypto
    .createHmac('sha256', JUNO_API_SECRET)
    .update(stringToSign)
    .digest('hex');
  const header = `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`;
  // Logs de depuración
  console.log('--- JUNO API DEBUG ---');
  console.log('JUNO_API_KEY:', JUNO_API_KEY);
  console.log('JUNO_API_SECRET:', JUNO_API_SECRET ? JUNO_API_SECRET.slice(0, 4) + '...' : undefined);
  console.log('nonce:', nonce);
  console.log('method:', method);
  console.log('path:', path);
  console.log('body:', body);
  console.log('stringToSign:', stringToSign);
  console.log('signature:', signature);
  console.log('Authorization header:', header);
  console.log('----------------------');
  return {
    'Authorization': header,
    'Content-Type': 'application/json'
  };
}

async function fetchDeposits() {
  const method = 'GET';
  const path = '/spei/v1/deposits';
  const url = `${JUNO_BASE_URL}${path}`;
  const headers = getJunoAuthHeaders(method, path);
  try {
    const res = await axios.get(url, { headers });
    console.log('Juno API response:', JSON.stringify(res.data, null, 2));
    return res.data.payload.response; // Array de depósitos
  } catch (err: any) {
    if (err.response) {
      console.error('Juno API error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Juno API error:', err);
    }
    throw err;
  }
}

async function notifyAdmin(unmatchedDeposits: any[]) {
  if (unmatchedDeposits.length > 0) {
    const subject = 'Depósitos sin match detectados en Juno';
    let html = `<h2>Depósitos sin match</h2><ul>`;
    for (const dep of unmatchedDeposits) {
      html += `<li><b>ID (fid):</b> ${dep.fid} | <b>CLABE:</b> ${dep.receiver_clabe} | <b>Monto:</b> ${dep.amount} | <b>Fecha:</b> ${dep.created_at}</li>`;
    }
    html += '</ul>';
    await sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
      text: `Hay depósitos sin match en Juno. Revisa el panel de administración.`
    });
    console.log(`[NOTIFICACIÓN EMAIL] Notificado a ${ADMIN_EMAIL}`);
  }
}

async function syncJunoDeposits() {
  const dataSource = await ormconfig.initialize();
  const depositRepo = dataSource.getRepository(JunoTransaction);
  const paymentRepo = dataSource.getRepository(Payment);

  const deposits = await fetchDeposits();
  const unmatched: any[] = [];

  for (const dep of deposits) {
    // 1. ¿Ya existe el depósito en juno_transaction?
    const exists = await depositRepo.findOne({ where: { reference: dep.fid } });
    if (!exists) {
      // 2. Insertar el depósito
      await depositRepo.save({
        type: "deposit",
        reference: dep.fid,
        amount: dep.amount,
        status: dep.status,
        // Puedes mapear más campos si tu entidad lo permite
      });
    }

    // 3. Buscar pago pendiente que haga match
    const payment = await paymentRepo.findOne({
      where: {
        deposit_clabe: dep.receiver_clabe,
        amount: Number(dep.amount),
        status: 'pending'
      }
    });

    if (payment) {
      payment.status = 'funded';
      payment.transaction_id = dep.fid;
      await paymentRepo.save(payment);
    } else {
      unmatched.push(dep);
    }
  }
  await notifyAdmin(unmatched);
  console.log(`[${new Date().toISOString()}] Sync Juno deposits completed`);
}

syncJunoDeposits().catch(console.error);
