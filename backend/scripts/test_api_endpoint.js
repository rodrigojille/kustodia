require('dotenv').config();
const axios = require('axios');

async function testMultiSigEndpoint() {
  console.log('🔍 Testing Multi-Sig API Endpoint...');
  
  try {
    // Test the actual API endpoint
    const response = await axios.get('http://localhost:4000/api/multisig/pending', {
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${process.env.JWT_TOKEN}`
      },
      timeout: 10000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.upcomingPayments && Array.isArray(response.data.upcomingPayments)) {
      console.log(`\n🎯 Found ${response.data.upcomingPayments.length} upcoming multi-sig payments:`);
      
      response.data.upcomingPayments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ${payment.paymentId}:`);
        console.log(`   Amount: $${payment.amount?.toLocaleString()} ${payment.currency}`);
        console.log(`   USD Value: $${payment.amountUsd?.toLocaleString()}`);
        console.log(`   Description: ${payment.description}`);
        console.log(`   Payer: ${payment.payerEmail}`);
        console.log(`   Payee: ${payment.payeeEmail}`);
        console.log(`   Escrow End: ${payment.escrowEndTime}`);
        console.log(`   Hours until release: ${payment.hoursUntilRelease}`);
        console.log(`   Target wallet: ${payment.targetWallet}`);
      });
      
      // Check if Payment 140 is in the results
      const payment140 = response.data.upcomingPayments.find(p => p.paymentId === 140);
      if (payment140) {
        console.log(`\n🎉 SUCCESS: Payment 140 found in API response!`);
        console.log(`   This means the dashboard should now show it correctly.`);
      } else {
        console.log(`\n❌ Payment 140 not found in API response.`);
        console.log(`   Available payment IDs: ${response.data.map(p => p.paymentId).join(', ')}`);
      }
    } else {
      console.log('❌ Unexpected response format:', typeof response.data);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error Response:', error.response.status, error.response.statusText);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.message);
      console.error('Make sure the server is running on http://localhost:4000');
    } else {
      console.error('❌ Request setup error:', error.message);
    }
  }
}

// Also test if we can reach the server at all
async function testServerHealth() {
  try {
    const response = await axios.get('http://localhost:4000/api/health', {
      timeout: 5000
    });
    console.log('✅ Server health check passed:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Server health check failed. Trying multi-sig endpoint anyway...');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testServerHealth();
  console.log('');
  await testMultiSigEndpoint();
}

runTests().catch(console.error);
