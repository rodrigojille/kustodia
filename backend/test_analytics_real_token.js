const http = require('http');

console.log('🧪 Testing Analytics API with Real Token...\n');

// INSTRUCTIONS:
// 1. Login to http://localhost:3000
// 2. Open Dev Tools -> Application -> Local Storage  
// 3. Copy the "auth_token" value
// 4. Paste it below replacing 'PASTE_YOUR_TOKEN_HERE'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJyb2RyaWdvamlsbGU2QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIndhbGxldF9hZGRyZXNzIjoiMHg0ODZCODhDYTg3NTMzMjk0RkI0NTI0NzM4NzE2OWYwODFmMzEwMmZmIiwiaWF0IjoxNzUyNTA2ODI3LCJleHAiOjE3NTMxMTE2Mjd9.1qVluyyJV8eItWZYKjBGv7XQ0nCk77ZcHxWJtyHyY8I';

if (token === 'PASTE_YOUR_TOKEN_HERE') {
  console.log('❌ Please get your real JWT token first!');
  console.log('Steps:');
  console.log('1. Login to http://localhost:3000');
  console.log('2. Dev Tools -> Application -> Local Storage');
  console.log('3. Copy "auth_token" value');
  console.log('4. Replace "PASTE_YOUR_TOKEN_HERE" in this file');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/analytics/stats',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-auth-token': token,
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
        console.log('\n✅ SUCCESS! Real Analytics Data:');
        console.log('==========================================');
        console.log('📊 PAYMENTS THIS MONTH:', response.paymentsThisMonth);
        console.log('💰 TOTAL VOLUME: $', response.totalVolume);
        console.log('⏳ PENDING PAYMENTS:', response.pendingPayments);
        console.log('📈 COMPLETION GROWTH:', response.trends.completedGrowth + '%');
        console.log('⏱️  AVG PROCESSING TIME:', response.trends.avgProcessingDays, 'days');
        console.log('✅ SUCCESS RATE:', response.trends.successRate + '%');
        console.log('🕒 RECENT ACTIVITY:', response.recentActivity.length, 'items');
        
        if (response.recentActivity.length > 0) {
          console.log('\nRecent Activity Details:');
          response.recentActivity.forEach((activity, i) => {
            console.log(`  ${i+1}. ${activity.statusText} - ${activity.timeAgo}`);
          });
        }
      } catch (error) {
        console.log('\n❌ Failed to parse JSON response:', error.message);
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
