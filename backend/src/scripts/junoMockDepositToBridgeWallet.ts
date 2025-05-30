import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

const RECEIVER_CLABE = process.env.JUNO_BRIDGE_CLABE!; // CLABE asociada a la cuenta puente/intermedia
const RECEIVER_NAME = process.env.JUNO_BRIDGE_NAME!; // Nombre registrado en Juno
const SENDER_CLABE = process.env.JUNO_TEST_SENDER_CLABE || '123456789012345678';
const SENDER_NAME = process.env.JUNO_TEST_SENDER_NAME || RECEIVER_NAME;
const AMOUNT = process.env.WITHDRAW_AMOUNT || '2000';

if (!JUNO_API_KEY || !JUNO_API_SECRET) throw new Error('Faltan credenciales de Juno en .env');
if (!RECEIVER_CLABE) throw new Error('Falta JUNO_BRIDGE_CLABE en .env');
if (!RECEIVER_NAME) throw new Error('Falta JUNO_BRIDGE_NAME en .env');

async function main() {
  const endpoint = '/spei/test/deposits';
  const url = `${BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: AMOUNT,
    receiver_clabe: RECEIVER_CLABE,
    receiver_name: RECEIVER_NAME,
    sender_name: SENDER_NAME,
    sender_clabe: SENDER_CLABE
  };
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  console.log('Enviando mock deposit a CLABE puente/intermedia...');
  console.log('CLABE:', RECEIVER_CLABE);
  console.log('Nombre:', RECEIVER_NAME);
  console.log('Monto:', AMOUNT);

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log('Respuesta mock deposit:', response.data);
  } catch (err: any) {
    console.error('Error en mock deposit:', err?.response?.data || err?.message || err);
    process.exit(1);
  }
}

main();
