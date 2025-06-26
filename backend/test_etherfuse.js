const EtherFuseService = require('./services/etherfuseService');
require('dotenv').config();

async function testEtherFuseConnection() {
  console.log('🚀 Testing EtherFuse API Connection...');
  
  const etherFuse = new EtherFuseService();
  
  try {
    // Test 1: Health Check
    console.log('\n📡 Testing API Health Check...');
    const healthResult = await etherFuse.healthCheck();
    console.log('Health Check Result:', healthResult);
    
    // Test 2: Get Current CETES Rate
    console.log('\n📈 Testing Current CETES Rate...');
    const rateResult = await etherFuse.getCurrentRate();
    console.log('Current Rate Result:', rateResult);
    
    // Test 3: Test Customer Creation (with test data)
    console.log('\n👤 Testing Customer Creation...');
    const customerResult = await etherFuse.createCustomer({
      email: 'test-yield@kustodia.mx',
      firstName: 'Test',
      lastName: 'User',
      phone: '+521234567890'
    });
    console.log('Customer Creation Result:', customerResult);
    
    console.log('\n✅ EtherFuse API tests completed!');
    
  } catch (error) {
    console.error('❌ EtherFuse API test failed:', error);
  }
}

testEtherFuseConnection();
