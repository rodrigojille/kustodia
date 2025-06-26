require('dotenv').config({ path: './.env' });
const crypto = require('crypto');
const axios = require('axios');

// Payment 84 specific details
const PAYMENT_84_CLABE = "710969000000396640";
const PAYMENT_84_AMOUNT = "5000";

const mockDepositData = {
  amount: PAYMENT_84_AMOUNT,
  receiver_clabe: PAYMENT_84_CLABE,
  receiver_name: "test-seller@kustodia.mx", // Receiver's full name
  sender_name: "rodrigojille6@gmail.com" // Sender's full name (payer)
};

console.log('🚀 CREATING MOCK DEPOSIT FOR PAYMENT 84');
console.log('📋 Payment Details:');
console.log('   Amount: $' + mockDepositData.amount);
console.log('   CLABE: ' + mockDepositData.receiver_clabe);
console.log('   Receiver: ' + mockDepositData.receiver_name);
console.log('   Sender: ' + mockDepositData.sender_name);
console.log();

const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;

if (!JUNO_API_KEY || !JUNO_API_SECRET) {
  console.error('❌ Missing Juno API credentials!');
  console.error('JUNO_STAGE_API_KEY:', JUNO_API_KEY ? '✅ Set' : '❌ Missing');
  console.error('JUNO_STAGE_API_SECRET:', JUNO_API_SECRET ? '✅ Set' : '❌ Missing');
  console.log('\n💡 Add these to your .env file:');
  console.log('JUNO_STAGE_API_KEY=your_stage_key');
  console.log('JUNO_STAGE_API_SECRET=your_stage_secret');
  process.exit(1);
}

const nonce = Date.now().toString();
const method = 'POST';
const requestPath = '/spei/test/deposits';
const body = JSON.stringify(mockDepositData);
const stringToSign = nonce + method + requestPath + body;
const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
};

console.log('🔐 Authentication Details:');
console.log('   Nonce:', nonce);
console.log('   Signature:', signature.substring(0, 20) + '...');
console.log();

console.log('📡 Sending mock deposit to Juno Stage API...');

axios.post('https://stage.buildwithjuno.com/spei/test/deposits', mockDepositData, { headers })
  .then(res => {
    console.log('✅ MOCK DEPOSIT CREATED SUCCESSFULLY!');
    console.log('📄 Response:', JSON.stringify(res.data, null, 2));
    console.log();
    console.log('🎯 Next Steps:');
    console.log('1. Wait 1-2 minutes for Juno to process the deposit');
    console.log('2. The automation system will detect it within 5 minutes');
    console.log('3. Check payment tracker: http://localhost:3000/dashboard/pagos/84/tracker');
    console.log('4. Monitor backend logs for automation messages');
    console.log();
    console.log('🔍 To trigger automation manually:');
    console.log('   curl -X POST http://localhost:4000/api/automation/trigger \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"process": "deposits"}\'');
  })
  .catch(err => {
    console.error('❌ MOCK DEPOSIT FAILED!');
    if (err.response) {
      console.error('📄 Error Response:', JSON.stringify(err.response.data, null, 2));
      console.error('📊 Status Code:', err.response.status);
    } else {
      console.error('🔗 Request Failed:', err.message);
    }
    console.log();
    console.log('🛠️ Troubleshooting:');
    console.log('1. Check your Juno Stage API credentials');
    console.log('2. Verify the CLABE format is correct');
    console.log('3. Ensure you have access to Juno test environment');
    console.log('4. Try running: npm run check-juno-credentials');
  });
