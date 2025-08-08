// CRITICAL PRODUCTION FIX - Register CLABE 638180000182756357 for Payment 121
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Production Juno credentials
const JUNO_BASE_URL = 'https://buildwithjuno.com';
const JUNO_API_KEY = process.env.JUNO_PROD_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_PROD_API_SECRET;

// Payment 121 seller details
const SELLER_CLABE = '638180000182756357';
const SELLER_NAME = 'Rodrigo Jille'; // You may need to adjust this

console.log('🚨 CRITICAL PRODUCTION FIX - Payment 121 Bank Registration');
console.log('==========================================================');
console.log('CLABE to register:', SELLER_CLABE);
console.log('Account holder:', SELLER_NAME);
console.log('Juno API Key:', JUNO_API_KEY ? `${JUNO_API_KEY.substring(0, 8)}...` : 'NOT SET');

async function registerBankAccount(clabe, accountHolderName) {
  const url = `${JUNO_BASE_URL}/mint_platform/v1/accounts/banks`;
  const requestPath = '/mint_platform/v1/accounts/banks';
  const method = 'POST';
  const nonce = Date.now().toString();
  
  const bodyObj = {
    clabe: clabe,
    recipient_legal_name: accountHolderName,
    currency: 'MXN',
    ownership: 'THIRD_PARTY',
    tag: `kustodia-payment121-fix-${Date.now()}`
  };
  
  const body = JSON.stringify(bodyObj);
  
  // Build signature
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
  };
  
  try {
    console.log('\n📡 Registering bank account with Juno...');
    console.log('Request body:', JSON.stringify(bodyObj, null, 2));
    
    const response = await axios.post(url, bodyObj, { headers });
    
    console.log('\n✅ SUCCESS - Bank account registered!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Extract the bank account ID from response
    const bankAccountId = response.data.payload?.id || response.data.id;
    console.log('\n🎯 BANK ACCOUNT ID:', bankAccountId);
    
    if (bankAccountId) {
      console.log('\n📝 NEXT STEPS:');
      console.log('1. Update user table in database:');
      console.log(`   UPDATE "user" SET juno_bank_account_id = '${bankAccountId}' WHERE email = 'rodrigojille6@gmail.com';`);
      console.log('2. Retry the payment automation');
      console.log('3. Monitor the logs for successful redemption');
    }
    
    return response.data;
    
  } catch (error) {
    console.error('\n❌ ERROR - Bank account registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Message:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const result = await registerBankAccount(SELLER_CLABE, SELLER_NAME);
    console.log('\n🎉 Registration completed successfully!');
  } catch (error) {
    console.error('\n💥 Registration failed:', error.message);
    process.exit(1);
  }
}

main();
