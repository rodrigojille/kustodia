const EtherFuseService = require('./services/etherfuseService');
require('dotenv').config();

async function testWorkingEndpoints() {
  console.log('🚀 Testing EtherFuse Working Endpoints...');
  
  const etherFuse = new EtherFuseService();
  
  try {
    // Test 1: List Customers (this worked in health check)
    console.log('\n👥 Testing List Customers...');
    const customersResult = await etherFuse.listCustomers(5, 0);
    console.log('Customers Result:', JSON.stringify(customersResult, null, 2));
    
    // Test 2: Order Preview (from documentation)
    console.log('\n📋 Testing Order Preview...');
    const orderPreview = await etherFuse.api.post('/ramp/order-preview', {
      amountFiat: 1000,
      direction: 'onramp'
    });
    console.log('Order Preview Result:', JSON.stringify(orderPreview.data, null, 2));
    
    // Test 3: Try to list orders
    console.log('\n📦 Testing List Orders...');
    const ordersResult = await etherFuse.api.post('/ramp/orders', {
      pageSize: 5,
      pageNumber: 0
    });
    console.log('Orders Result:', JSON.stringify(ordersResult.data, null, 2));
    
    console.log('\n✅ Working endpoints test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

testWorkingEndpoints();
