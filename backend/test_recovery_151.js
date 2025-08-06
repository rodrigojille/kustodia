const axios = require('axios');

async function testRecovery() {
  try {
    console.log('🔧 Testing manual recovery for Payment 151...');
    
    const response = await axios.post('http://localhost:3000/api/operations/recover/151', {}, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': 'test-token' // You might need a valid token
      }
    });
    
    console.log('✅ Recovery Response:', response.data);
    
  } catch (error) {
    console.error('❌ Recovery Error:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Full Error:', error.message);
  }
}

testRecovery();
