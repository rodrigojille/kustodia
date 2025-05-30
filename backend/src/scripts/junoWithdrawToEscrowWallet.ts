import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Configuración desde .env
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

// Parámetros para el withdrawal
const DESTINATION_ADDRESS = process.env.ESCROW_BRIDGE_WALLET!; // 0xC09b02DDb3BBCC78Fc47446D8D74E677bA8dB3E8
const AMOUNT = process.env.WITHDRAW_AMOUNT || '2000'; // MXNB a transferir
const ASSET = 'mxnbj';
const BLOCKCHAIN_NETWORK = 'arbitrum';

if (!JUNO_API_KEY || !JUNO_API_SECRET) throw new Error('Faltan credenciales de Juno en .env');
if (!DESTINATION_ADDRESS) throw new Error('Falta ESCROW_BRIDGE_WALLET en .env');

async function main() {
  const endpoint = '/mint_platform/v1/crypto_withdrawals';
  const url = `${BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: AMOUNT,
    asset: ASSET,
    destination_address: DESTINATION_ADDRESS,
    blockchain_network: BLOCKCHAIN_NETWORK
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

  console.log('Enviando withdrawal de MXNB a wallet puente/intermedia...');
  console.log('Destino:', DESTINATION_ADDRESS);
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
