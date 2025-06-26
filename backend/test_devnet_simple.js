const axios = require('axios');
require('dotenv').config();

const devnetApiKey = process.env.ETHERFUSE_API_KEY_SANDBOX;

async function testDevnetEndpoints() {
  console.log('🧪 Testing DevNet Simple Endpoints...');
  console.log('Using API Key:', devnetApiKey ? 'Found' : 'Missing');
  
  const api = axios.create({
    baseURL: 'https://devnet.etherfuse.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': devnetApiKey
    }
  });
  
  try {
    // Test 1: Simple verification endpoint (no auth needed?)
    console.log('\n🔍 Testing /ramp/verify...');
    const verifyResult = await api.get('/ramp/verify');
    console.log('Verify Result:', JSON.stringify(verifyResult.data, null, 2));
    
  } catch (error) {
    console.error('❌ Verify test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
  
  try {
    // Test 2: Try order preview (worked in production)
    console.log('\n📋 Testing /ramp/order-preview...');
    const previewResult = await api.post('/ramp/order-preview', {
      amountFiat: 500,
      direction: 'onramp'
    });
    console.log('Preview Result:', JSON.stringify(previewResult.data, null, 2));
    
  } catch (error) {
    console.error('❌ Preview test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }

  try {
    // Test 3: Try to list customers with GET method
    console.log('\n👥 Testing GET /ramp/customers...');
    const customersResult = await api.get('/ramp/customers');
    console.log('Customers Result:', JSON.stringify(customersResult.data, null, 2));
    
  } catch (error) {
    console.error('❌ GET Customers test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

testDevnetEndpoints();
