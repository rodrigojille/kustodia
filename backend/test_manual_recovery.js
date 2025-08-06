const axios = require('axios');

async function testManualRecovery() {
  try {
    console.log('🔧 Testing manual escrow recovery for Payment 151...');
    
    const response = await axios.post('http://localhost:3000/api/operations/manual-escrow-recovery', {
      paymentId: 151
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJyb2RyaWdvamxsbGU2QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIndhbGxldF9hZGRyZXNzIjoiMHhhMzgzYzg4NDNhZDM3Qjk1QzNDY2VGMmQyZjRlQmYwZjNCOGJCZDJiIiwiaWF0IjoxNzMzNDM1NzU5LCJleHAiOjE3MzM0Mzc1NTl9.VYHHlEJTJCKjWEhCOJJmJBGgHLYQYCGKvEPqFSPQNhk'
      }
    });

    console.log('✅ Manual recovery response:', response.status);
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Manual recovery failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
  }
}

testManualRecovery();
