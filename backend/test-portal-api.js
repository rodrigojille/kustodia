// Test script to verify Portal API key works
const axios = require('axios');
require('dotenv').config();

async function testRegularPortalAPI() {
  const apiKey = process.env.PORTAL_CUSTODIAN_API_KEY;
  console.log('\n=== Testing Regular Portal API ===');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

  try {
    const response = await axios.get('https://api.portalhq.io/api/v3/custodians/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Regular Portal API test successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.log('❌ Regular Portal API test failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
    return false;
  }
}

async function testMPCEnclaveAPI() {
  const apiKey = process.env.PORTAL_CUSTODIAN_API_KEY;
  console.log('\n=== Testing MPC Enclave API ===');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

  try {
    // Try a simple request to the MPC endpoint (this will likely fail but let's see the error)
    const response = await axios.post('https://mpc-client.portalhq.io/v1/sign', {
      share: 'test',
      method: 'test',
      params: 'test',
      chainId: 'eip155:421614',
      rpcUrl: 'https://api.portalhq.io/rpc/v1/eip155/421614'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ MPC Enclave API test successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.log('❌ MPC Enclave API test failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Testing Portal API endpoints...');
  
  const regularAPIWorks = await testRegularPortalAPI();
  const mpcAPIWorks = await testMPCEnclaveAPI();
  
  console.log('\n=== Test Summary ===');
  console.log('Regular Portal API:', regularAPIWorks ? '✅ Works' : '❌ Failed');
  console.log('MPC Enclave API:', mpcAPIWorks ? '✅ Works' : '❌ Failed');
}

runTests();
