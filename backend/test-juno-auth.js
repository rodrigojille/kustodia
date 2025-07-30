const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

async function testJunoAuth() {
  console.log('🔍 Testing Juno API Authentication...\n');
  
  const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
  const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
  
  console.log('📋 Environment Variables:');
  console.log(`JUNO_API_KEY: ${JUNO_API_KEY}`);
  console.log(`JUNO_API_SECRET: ${JUNO_API_SECRET ? '[SET]' : '[MISSING]'}`);
  console.log(`Key Length: ${JUNO_API_KEY ? JUNO_API_KEY.length : 0} characters\n`);
  
  if (!JUNO_API_KEY || !JUNO_API_SECRET) {
    console.error('❌ Missing Juno API credentials');
    return;
  }
  
  // Test 1: CLABE Creation
  console.log('🧪 Test 1: CLABE Creation');
  try {
    const nonce = Date.now().toString();
    const method = 'POST';
    const path = '/mint_platform/v1/clabes';
    const body = '{}';
    const dataToSign = nonce + method + path + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    console.log(`Nonce: ${nonce}`);
    console.log(`String to sign: "${dataToSign}"`);
    console.log(`Signature: ${signature}`);
    console.log(`Authorization: Bitso ${JUNO_API_KEY}:${nonce}:${signature}\n`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    const response = await axios.post('https://stage.buildwithjuno.com/mint_platform/v1/clabes', {}, { headers });
    console.log('✅ CLABE Creation Success:', response.data);
  } catch (error) {
    console.log('❌ CLABE Creation Failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: SPEI Deposits List
  console.log('🧪 Test 2: SPEI Deposits List');
  try {
    const nonce = Date.now().toString();
    const method = 'GET';
    const path = '/spei/v1/deposits';
    const body = '';
    const dataToSign = nonce + method + path + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    console.log(`Nonce: ${nonce}`);
    console.log(`String to sign: "${dataToSign}"`);
    console.log(`Signature: ${signature}`);
    console.log(`Authorization: Bitso ${JUNO_API_KEY}:${nonce}:${signature}\n`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    const response = await axios.get('https://stage.buildwithjuno.com/spei/v1/deposits', { headers });
    console.log('✅ SPEI Deposits Success:', response.data);
  } catch (error) {
    console.log('❌ SPEI Deposits Failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Different nonce format (in case they expect integer)
  console.log('🧪 Test 3: CLABE Creation with Integer Nonce');
  try {
    const nonce = Date.now(); // Integer instead of string
    const method = 'POST';
    const path = '/mint_platform/v1/clabes';
    const body = '{}';
    const dataToSign = nonce + method + path + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    console.log(`Nonce: ${nonce} (integer)`);
    console.log(`String to sign: "${dataToSign}"`);
    console.log(`Signature: ${signature}`);
    console.log(`Authorization: Bitso ${JUNO_API_KEY}:${nonce}:${signature}\n`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`
    };
    
    const response = await axios.post('https://stage.buildwithjuno.com/mint_platform/v1/clabes', {}, { headers });
    console.log('✅ CLABE Creation with Integer Nonce Success:', response.data);
  } catch (error) {
    console.log('❌ CLABE Creation with Integer Nonce Failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testJunoAuth().catch(console.error);
