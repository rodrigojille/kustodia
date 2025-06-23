require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;

console.log('=== Debugging Juno API Connection ===');
console.log('API Key available:', !!JUNO_API_KEY);
console.log('API Secret available:', !!JUNO_API_SECRET);

async function testJunoAPI() {
  const baseUrl = 'https://stage.buildwithjuno.com';
  const requestPath = '/mint_platform/v1/transactions';
  const url = `${baseUrl}${requestPath}`;
  const method = 'GET';
  const nonce = Date.now().toString();
  const body = '';
  
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  console.log('\n=== API Request Details ===');
  console.log('URL:', url);
  console.log('Method:', method);
  console.log('Nonce:', nonce);
  console.log('Data to sign:', dataToSign);
  console.log('Signature:', signature);
  console.log('Authorization header:', headers.Authorization);

  try {
    console.log('\n=== Making API Request ===');
    const response = await axios.get(url, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    console.log('✅ SUCCESS - Response status:', response.status);
    
    if (response.data && response.data.payload && Array.isArray(response.data.payload.content)) {
      const transactions = response.data.payload.content;
      console.log(`\n=== Found ${transactions.length} total transactions ===`);
      
      // Look for ISSUANCE transactions with amount 1000
      const issuances = transactions.filter(tx => tx.transaction_type === 'ISSUANCE' && tx.amount === 1000);
      console.log(`Found ${issuances.length} ISSUANCE transactions with amount 1000`);
      
      // Specifically look for our transaction
      const ourTx = transactions.find(tx => tx.id === 'af9ae01-c904-4fb7-a39cc-7a2b4542a796');
      if (ourTx) {
        console.log('\n🎯 FOUND OUR SPECIFIC TRANSACTION!');
        console.log('ID:', ourTx.id);
        console.log('Type:', ourTx.transaction_type);
        console.log('Amount:', ourTx.amount);
        console.log('CLABE:', ourTx.clabe);
        console.log('Status:', ourTx.status);
        console.log('Created:', ourTx.created_at);
      } else {
        console.log('\n❌ Our specific transaction af9ae01-c904-4fb7-a39cc-7a2b4542a796 not found in API response');
      }
    } else {
      console.log('❌ Unexpected API response structure');
      console.log('Response keys:', Object.keys(response.data || {}));
    }
  } catch (error) {
    console.log('❌ ERROR making API request');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error code:', error.response.data?.code);
      console.log('Error message:', error.response.data?.message);
    } else if (error.code === 'ECONNABORTED') {
      console.log('Request timed out');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testJunoAPI().catch(console.error);
