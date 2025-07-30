require('dotenv').config({ path: './.env' });
const crypto = require('crypto');
const axios = require('axios');

// Mock deposit data - testing Payment 132 with valid CLABE
const defaults = {
  amount: 1000.00, // Match Payment 132 amount
  receiver_clabe: '710969000000418010', // Valid CLABE from Payment 132
  receiver_name: 'Kustodia', // Business name registered in Juno
  sender_clabe: '032180000118359719',
  sender_name: 'Kustodia', // Must match registered business name
  reference: 'Test deposit Payment 132 - Mock Deposit Test'
};

console.log('--- MOCK DEPOSIT PAYLOAD ---');
console.log(defaults);

const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;

if (!JUNO_API_KEY || !JUNO_API_SECRET) {
  console.error('Missing Juno API credentials!');
  console.error('JUNO_STAGE_API_KEY:', JUNO_API_KEY ? 'Set' : 'Missing');
  console.error('JUNO_STAGE_API_SECRET:', JUNO_API_SECRET ? 'Set' : 'Missing');
  process.exit(1);
}

const nonce = Date.now().toString();
const method = 'POST';
const requestPath = '/spei/test/deposits';
const bodyString = JSON.stringify(defaults); // For signature calculation
const stringToSign = nonce + method + requestPath + bodyString;
const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
};

console.log('--- JUNO MOCK DEPOSIT DEBUG ---');
console.log('String to sign:', stringToSign);
console.log('Signature:', signature);
console.log('Headers:', headers);
console.log('Request payload:', defaults);
console.log('Body for signature:', bodyString);

// Pass the object directly to axios, not the JSON string
axios.post('https://stage.buildwithjuno.com/spei/test/deposits', defaults, { headers })
  .then(res => console.log('Mock deposit response:', res.data))
  .catch(err => {
    if (err.response) {
      console.error('Mock deposit error:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  });