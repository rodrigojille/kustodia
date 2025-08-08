// Debug script to check Juno registered bank accounts and investigate Payment 121 issue
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Use PRODUCTION Juno credentials (this is a critical production issue)
const JUNO_BASE_URL = 'https://buildwithjuno.com';
const JUNO_API_KEY = process.env.JUNO_PROD_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_PROD_API_SECRET;

console.log('🔍 JUNO ACCOUNT DEBUG SCRIPT');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Base URL:', JUNO_BASE_URL);
console.log('API Key:', JUNO_API_KEY ? `${JUNO_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('API Secret:', JUNO_API_SECRET ? 'SET' : 'NOT SET');

async function getRegisteredBankAccounts() {
  const url = `${JUNO_BASE_URL}/mint_platform/v1/accounts/banks`;
  const requestPath = '/mint_platform/v1/accounts/banks';
  const method = 'GET';
  const nonce = Date.now().toString();
  const body = '';

  // Build signature
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
  };

  try {
    console.log('\n📡 Making request to Juno API...');
    const response = await axios.get(url, { headers });
    
    console.log('\n✅ SUCCESS - Juno API Response:');
    console.log('Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    const accounts = response.data.payload || [];
    console.log(`\n📋 Found ${accounts.length} registered bank accounts:`);
    
    accounts.forEach((account, index) => {
      console.log(`\n${index + 1}. Account ID: ${account.id}`);
      console.log(`   CLABE: ${account.clabe || 'N/A'}`);
      console.log(`   Holder: ${account.account_holder_name || 'N/A'}`);
      console.log(`   Status: ${account.status || 'N/A'}`);
      console.log(`   Created: ${account.created_at || 'N/A'}`);
    });
    
    // Check for the specific failing account
    const failingAccountId = 'f14bdec6-45ba-4e55-8c42-599df650c8cf';
    const foundAccount = accounts.find(acc => acc.id === failingAccountId);
    
    console.log(`\n🔍 Looking for failing account ID: ${failingAccountId}`);
    if (foundAccount) {
      console.log('✅ FOUND the failing account:');
      console.log(JSON.stringify(foundAccount, null, 2));
    } else {
      console.log('❌ FAILING ACCOUNT NOT FOUND in registered accounts');
      console.log('This explains why the redemption is failing!');
    }
    
    return accounts;
    
  } catch (error) {
    console.error('\n❌ ERROR - Juno API Request Failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Message:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await getRegisteredBankAccounts();
  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  }
}

main();
