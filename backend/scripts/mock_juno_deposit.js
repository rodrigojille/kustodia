require('dotenv').config({ path: './.env' });
const crypto = require('crypto');
const axios = require('axios');

const defaults = {
  amount: "1000",
  receiver_clabe: "710969000000400730", // Payment ID 85 correct CLABE
  receiver_name: "test-seller@kustodia.mx", // Receiver's full name
  sender_name: "rodrigojille6@gmail.com" // Sender's full name
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
const body = JSON.stringify(defaults);
const stringToSign = nonce + method + requestPath + body;
const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
};

console.log('--- JUNO MOCK DEPOSIT DEBUG ---');
console.log('String to sign:', stringToSign);
console.log('Signature:', signature);
console.log('Headers:', headers);
console.log('Body:', body);

axios.post('https://stage.buildwithjuno.com/spei/test/deposits', body, { headers })
  .then(res => console.log('Mock deposit response:', res.data))
  .catch(err => {
    if (err.response) {
      console.error('Mock deposit error:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  });