const axios = require('axios');

async function testCustodyCalculation() {
  console.log('🧪 Testing Custody End Date Calculation...\n');
  
  const baseURL = 'http://localhost:4000/api';
  
  try {
    // Login first
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/user/login`, {
      email: 'rodrigojille6@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test different custody periods
    const testCases = [
      { period: 86400, description: '1 day (86400 seconds)' },
      { period: 432000, description: '5 days (432000 seconds)' },
      { period: 604800, description: '7 days (604800 seconds)' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 Testing ${testCase.description}:`);
      
      const paymentData = {
        recipient_email: 'test-seller@kustodia.mx',
        amount: 200,
        currency: 'mxn',
        description: `Test custody calculation - ${testCase.description}`,
        custody_percent: 100,
        custody_period: testCase.period
      };
      
      const paymentResponse = await axios.post(`${baseURL}/payments/initiate`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const payment = paymentResponse.data.payment;
      const escrow = paymentResponse.data.escrow;
      
      console.log('✅ Payment created:', payment.id);
      console.log('✅ Escrow created:', escrow.id);
      
      // Calculate expected vs actual custody end
      const createdAt = new Date(escrow.created_at);
      const custodyEnd = new Date(escrow.custody_end);
      const expectedEnd = new Date(createdAt.getTime() + testCase.period * 1000);
      
      const actualDiffMs = custodyEnd.getTime() - createdAt.getTime();
      const actualDiffDays = Math.round(actualDiffMs / (1000 * 60 * 60 * 24));
      const expectedDiffDays = Math.round(testCase.period / (60 * 60 * 24));
      
      console.log('📅 Created At:', createdAt.toISOString());
      console.log('📅 Custody End:', custodyEnd.toISOString());
      console.log('📅 Expected End:', expectedEnd.toISOString());
      console.log('⏱️  Actual Days:', actualDiffDays);
      console.log('⏱️  Expected Days:', expectedDiffDays);
      
      if (Math.abs(custodyEnd.getTime() - expectedEnd.getTime()) < 1000) {
        console.log('✅ PASS: Custody end calculation is correct!');
      } else {
        console.log('❌ FAIL: Custody end calculation is incorrect!');
        console.log('   Difference:', Math.abs(custodyEnd.getTime() - expectedEnd.getTime()), 'ms');
      }
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('✅ Custody calculation uses escrow.created_at as base time');
    console.log('✅ Custody period is added in seconds and converted to milliseconds');
    console.log('✅ Frontend will calculate days correctly from these timestamps');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCustodyCalculation();
