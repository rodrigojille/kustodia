import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const JUNO_ENV = process.env.JUNO_ENV || 'stage';
  const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
  const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
  const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
  const endpoint = '/mint_platform/v1/accounts/banks';
  const url = `${BASE_URL}${endpoint}`;

  const nonce = Date.now().toString();
  const method = 'GET';
  const requestPath = endpoint;
  const body = '';
  const dataToSign = nonce + method + requestPath + body;
  const crypto = await import('crypto');
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  try {
    const response = await axios.get(url, { headers });
    const accounts = response.data?.payload || [];
    console.log('Bank Accounts (UUID <-> CLABE):');
    for (const acc of accounts) {
      console.log(`UUID: ${acc.id} | CLABE: ${acc.clabe} | Holder: ${acc.recipient_legal_name || acc.account_holder || ''} | Tag: ${acc.tag || ''}`);
    }
  } catch (err: any) {
    console.error('Error fetching bank accounts:', err?.response?.data || err?.message || err);
    process.exit(1);
  }
}

main();
