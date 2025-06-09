require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');

const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
const BASE_URL = 'https://stage.buildwithjuno.com';

if (!JUNO_API_KEY || !JUNO_API_SECRET) {
  throw new Error('Missing JUNO_STAGE_API_KEY or JUNO_STAGE_API_SECRET in environment');
}

const nonce = Date.now().toString();
const method = 'GET';
const requestPath = '/mint_platform/v1/transactions';
const body = '';
const stringToSign = nonce + method + requestPath + body;
const signature = require('crypto').createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
};

async function checkJunoTransactions() {
  try {
    const url = BASE_URL + requestPath + '?size=20&sort=createdAt,DESC';
    console.log('Checking Juno transactions at:', url);
    const res = await axios.get(url, { headers });
    if (res.data && res.data.payload && res.data.payload.content) {
      console.log('--- Recent Juno Transactions ---');
      res.data.payload.content.forEach(tx => {
        console.log(`ID: ${tx.id} | Amount: ${tx.amount} | Type: ${tx.transaction_type} | Status: ${tx.summary_status} | Created: ${tx.created_at}`);
      });
    } else {
      console.log('No transaction data found:', res.data);
    }
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  }
}

checkJunoTransactions();
