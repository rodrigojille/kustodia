const http = require('http');

console.log('🧪 Testing Analytics API...\n');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/analytics/stats',
  method: 'GET',
  headers: {
    'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJyb2RyaWdvamls', // Partial token from logs
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📄 Response Body:');
    console.log(data);
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('\n✅ Analytics API working! Data structure:');
        console.log('- Payments This Month:', response.paymentsThisMonth);
        console.log('- Total Volume:', response.totalVolume);
        console.log('- Pending Payments:', response.pendingPayments);
        console.log('- Trends:', response.trends);
        console.log('- Recent Activity:', response.recentActivity?.length, 'items');
      } catch (error) {
        console.log('\n❌ Failed to parse JSON response');
      }
    } else {
      console.log('\n❌ API call failed with status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error);
});

req.end();
