require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');
const crypto = require('crypto');

const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
const BASE_URL = 'https://stage.buildwithjuno.com';
const requestPath = '/mint_platform/v1/balances';
const method = 'GET';
const body = '';
const nonce = Date.now().toString();

if (!JUNO_API_KEY || !JUNO_API_SECRET) {
  throw new Error('Missing JUNO_STAGE_API_KEY or JUNO_STAGE_API_SECRET in environment');
}

const stringToSign = nonce + method + requestPath + body;
const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
};

async function checkJunoBalance() {
  try {
    const url = BASE_URL + requestPath;
    console.log('Checking Juno balance at:', url);
    const res = await axios.get(url, { headers });
    if (res.data && res.data.payload && res.data.payload.balances) {
      console.log('--- Juno MXNB Balances ---');
      res.data.payload.balances.forEach(bal => {
        console.log(`Asset: ${bal.asset} | Balance: ${bal.balance}`);
      });
    } else {
      console.log('No balance data found:', res.data);
    }
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  }
}

checkJunoBalance();
