const http = require('http');

console.log('🧪 Testing Analytics API with Token...\n');

// You need to get a real JWT token from the frontend
// Instructions:
// 1. Login to frontend at http://localhost:3000
// 2. Open dev tools -> Application -> Local Storage
// 3. Copy the "auth_token" value and paste it below

const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

if (token === 'YOUR_JWT_TOKEN_HERE') {
  console.log('❌ Please update the JWT token first!');
  console.log('Instructions:');
  console.log('1. Login to frontend at http://localhost:3000');
  console.log('2. Open dev tools -> Application -> Local Storage');
  console.log('3. Copy the "auth_token" value');
  console.log('4. Replace "YOUR_JWT_TOKEN_HERE" in this file');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/analytics/stats',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
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
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        console.log('\n✅ Analytics API working! Formatted response:');
        console.log(JSON.stringify(response, null, 2));
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
