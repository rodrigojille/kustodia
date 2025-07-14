const https = require('https');

// Test the analytics endpoint
const testAnalytics = async () => {
  console.log('🧪 Testing Analytics API Endpoint...\n');
  
  // You'll need to replace this with a valid JWT token from your browser
  // To get the token:
  // 1. Login to the frontend at http://localhost:3000
  // 2. Open browser dev tools -> Application -> Local Storage
  // 3. Copy the "auth_token" value
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
  
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

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n📊 Analytics Response:');
          console.log(JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.log('\n❌ Response (Raw):', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.end();
  });
};

// Alternative test using HTTP instead of HTTPS for local testing
const http = require('http');

const testAnalyticsHTTP = async () => {
  console.log('🧪 Testing Analytics API Endpoint (HTTP)...\n');
  
  const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
  
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

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('\n📊 Analytics Response:');
            console.log(JSON.stringify(response, null, 2));
            console.log('\n✅ Analytics endpoint is working correctly!');
          } else {
            console.log('\n❌ Response (Raw):', data);
            console.log('\n⚠️  Authentication may be required. Please update the JWT token.');
          }
          resolve(data);
        } catch (error) {
          console.log('\n❌ Response (Raw):', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.end();
  });
};

// Instructions
console.log('📋 Analytics API Test Instructions:');
console.log('1. Make sure the backend server is running (npm run dev)');
console.log('2. Login to the frontend at http://localhost:3000');
console.log('3. Get your JWT token from browser dev tools -> Local Storage -> auth_token');
console.log('4. Replace "YOUR_JWT_TOKEN_HERE" in this file with your actual token');
console.log('5. Run: node test_analytics.js\n');

// Uncomment the line below after setting up the JWT token
// testAnalyticsHTTP().catch(console.error);

console.log('⚠️  Please update the JWT token first, then uncomment the test line.');
