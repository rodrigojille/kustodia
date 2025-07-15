const fetch = require('node-fetch');

// Test admin tickets endpoint in production
async function testAdminTickets() {
  try {
    console.log('🔍 Testing admin tickets endpoint in production...');
    
    // You'll need to get a valid JWT token from production
    // For now, let's test without auth to see the response
    const response = await fetch('https://kustodia-backend-3c8ccc7a9c20.herokuapp.com/api/tickets/admin');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.status === 401) {
      console.log('❌ Authentication required - expected for admin endpoint');
    } else if (response.status === 200) {
      console.log('✅ Endpoint accessible');
      try {
        const jsonData = JSON.parse(data);
        console.log('Parsed JSON:', jsonData);
      } catch (e) {
        console.log('Not valid JSON response');
      }
    } else {
      console.log('⚠️ Unexpected status code');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin tickets endpoint:', error.message);
  }
}

// Test if the route is properly configured
async function testBaseRoute() {
  try {
    console.log('\n🔍 Testing base tickets route...');
    const response = await fetch('https://kustodia-backend-3c8ccc7a9c20.herokuapp.com/api/tickets');
    console.log('Base route status:', response.status);
    const data = await response.text();
    console.log('Base route response:', data.substring(0, 200));
  } catch (error) {
    console.error('❌ Error testing base route:', error.message);
  }
}

// Run tests
testAdminTickets();
testBaseRoute();
