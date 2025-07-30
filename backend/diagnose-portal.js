// Diagnostic script for Portal API issues
const axios = require('axios');
require('dotenv').config();

async function diagnosePortalAPI() {
  const apiKey = process.env.PORTAL_CUSTODIAN_API_KEY;
  const clientId = 'cmdguzau601xm8u97iaq4ebux'; // From the error log
  
  console.log('🔍 Portal API Diagnostic Tool');
  console.log('============================');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
  console.log('Client ID:', clientId);
  console.log('');

  // Test 1: Verify API key with custodian endpoint
  console.log('📋 Test 1: Checking API key with custodian endpoint...');
  try {
    const response = await axios.get('https://api.portalhq.io/api/v3/custodians/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Custodian API test successful!');
    console.log('Custodian info:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Custodian API test failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }

  console.log('');

  // Test 2: Check if we can access the specific client
  console.log('👤 Test 2: Checking client access...');
  try {
    const response = await axios.get(`https://api.portalhq.io/api/v3/custodians/me/clients/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Client access successful!');
    console.log('Client info:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Client access failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }

  console.log('');

  // Test 3: List all clients to see what we have access to
  console.log('📋 Test 3: Listing all accessible clients...');
  try {
    const response = await axios.get('https://api.portalhq.io/api/v3/custodians/me/clients', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Client listing successful!');
    console.log('Number of clients:', response.data.length);
    response.data.forEach((client, index) => {
      console.log(`Client ${index + 1}:`, {
        id: client.id,
        address: client.address,
        status: client.status
      });
    });
    
  } catch (error) {
    console.log('❌ Client listing failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }

  console.log('');

  // Test 4: Try a simple MPC operation (this will likely fail but shows us the exact error)
  console.log('🔐 Test 4: Testing MPC Enclave API with minimal payload...');
  try {
    const response = await axios.post('https://mpc-client.portalhq.io/v1/sign', {
      share: 'test_share',
      method: 'eth_accounts',
      params: '[]',
      chainId: 'eip155:421614',
      rpcUrl: 'https://api.portalhq.io/rpc/v1/eip155/421614'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ MPC test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ MPC test failed (expected)!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('This helps us understand the exact error format.');
  }

  console.log('');
  console.log('🏁 Diagnostic complete!');
  console.log('');
  console.log('💡 Next steps:');
  console.log('1. If custodian API works but client access fails, the API key may not have access to this client');
  console.log('2. If client access works but MPC fails, the user signing share may be invalid');
  console.log('3. Check the Portal HQ dashboard to verify API key permissions');
  console.log('4. Consider regenerating the user Portal wallet if the signing share is corrupted');
}

diagnosePortalAPI().catch(console.error);
