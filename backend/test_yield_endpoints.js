const axios = require('axios');

const API_BASE = 'http://localhost:4000';

async function testYieldEndpoints() {
  console.log('🚀 Testing Kustodia Yield API Endpoints...\n');
  
  try {
    // Test 1: Health check for yield service (via admin endpoint)
    console.log('📊 Testing Yield Admin Stats...');
    const statsResponse = await axios.get(`${API_BASE}/api/yield/admin/stats`);
    console.log('Admin Stats:', JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Admin stats test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  try {
    // Test 2: EtherFuse service health check
    console.log('\n🔗 Testing EtherFuse Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/api/yield/admin/etherfuse/health`);
    console.log('EtherFuse Health:', JSON.stringify(healthResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ EtherFuse health test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  try {
    // Test 3: Current CETES rate
    console.log('\n📈 Testing Current CETES Rate...');
    const rateResponse = await axios.get(`${API_BASE}/api/yield/admin/cetes-rate`);
    console.log('Current Rate:', JSON.stringify(rateResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Current rate test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  try {
    // Test 4: Try to get yield status for a payment (should return not found or no yield)
    console.log('\n🔍 Testing Yield Status for Payment ID 1...');
    const yieldStatusResponse = await axios.get(`${API_BASE}/api/yield/payments/1/yield-status`, {
      headers: {
        'x-user-email': 'test@kustodia.mx'
      }
    });
    console.log('Yield Status:', JSON.stringify(yieldStatusResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Yield status test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  try {
    // Test 5: Test yield service health check
    console.log('\n🏥 Testing Yield Service Health...');
    const serviceHealthResponse = await axios.get(`${API_BASE}/api/yield/admin/health`);
    console.log('Service Health:', JSON.stringify(serviceHealthResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Service health test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  console.log('\n✅ Yield endpoint testing completed!');
}

testYieldEndpoints();
