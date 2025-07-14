const http = require('http');

console.log('🧪 Testing Analytics API Endpoint (Simple Test)...\n');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/analytics/stats',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📄 Response Body:');
    console.log(data);
    
    if (res.statusCode === 401) {
      console.log('\n✅ Endpoint is properly protected! Returns 401 without authentication.');
    } else if (res.statusCode === 404) {
      console.log('\n❌ Endpoint not found. Check if the route is registered properly.');
    } else {
      console.log('\n⚠️  Unexpected response code.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error);
});

req.end();
