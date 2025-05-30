import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

const DEST_ADDRESS = process.env.ESCROW_BRIDGE_WALLET!;
const AMOUNT = process.env.WITHDRAW_AMOUNT || '1.0'; // MXNB (no wei)
const ASSET = 'MXNB';
const BLOCKCHAIN = 'ARBITRUM';

if (!JUNO_API_KEY || !JUNO_API_SECRET) throw new Error('Faltan credenciales de Juno en .env');
if (!DEST_ADDRESS) throw new Error('Falta ESCROW_BRIDGE_WALLET en .env');

async function main() {
  const endpoint = '/mint_platform/v1/withdrawals';
  const url = `${BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: Number(AMOUNT),
    asset: ASSET,
    blockchain: BLOCKCHAIN,
    address: DEST_ADDRESS
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

  console.log('Solicitando retiro on-chain de MXNB desde Juno...');
  console.log('Destino:', DEST_ADDRESS);
  console.log('Monto:', AMOUNT);

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log('Respuesta withdrawal:', response.data);
  } catch (err: any) {
    console.error('Error en withdrawal:', err?.response?.data || err?.message || err);
    process.exit(1);
  }
}

main();
