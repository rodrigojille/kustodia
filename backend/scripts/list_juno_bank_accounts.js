// Script to list registered external bank accounts in Juno for MXNB redemption
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || 'https://stage.buildwithjuno.com';

const path = '/mint_platform/v1/accounts/banks';
const url = `${JUNO_BASE_URL}${path}`;
const method = 'GET';
const body = '';
const nonce = Date.now().toString();
const stringToSign = `${nonce}${method}${path}${body}`;
const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
const headers = {
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  'Content-Type': 'application/json'
};

console.log('--- JUNO LIST BANK ACCOUNTS DEBUG ---');
console.log('String to sign:', stringToSign);
console.log('Signature:', signature);
console.log('Headers:', headers);
console.log('------------------------------');

axios.get(url, { headers })
  .then(resp => {
    console.log('Bank accounts response:', JSON.stringify(resp.data, null, 2));
  })
  .catch(err => {
    if (err.response) {
      console.error('Bank accounts error:', err.response.data);
    } else {
      console.error('Bank accounts error:', err.message);
    }
  });
