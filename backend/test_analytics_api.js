const fetch = require('node-fetch');

// Your actual JWT token from localStorage
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJyb2RyaWdvamlsbGU2QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIndhbGxldF9hZGRyZXNzIjoiMHg0ODZCODhDYTg3NTMzMjk0RkI0NTI0NzM4NzE2OWYwODFmMzEwMmZmIiwiaWF0IjoxNzUyNTA2ODI3LCJleHAiOjE3NTMxMTE2Mjd9.1qVluyyJV8eItWZYKjBGv7XQ0nCk77ZcHxWJtyHyY8I";

async function testAnalyticsAPI() {
  try {
    console.log('Testing analytics API...\n');
    
    const response = await fetch('http://localhost:4000/api/analytics/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': JWT_TOKEN
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Analytics API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n📊 Key Values:');
      console.log('- Payments This Month:', data.paymentsThisMonth);
      console.log('- Total Volume:', data.totalVolume);
      console.log('- Pending Payments:', data.pendingPayments);
      console.log('- Completed Growth:', data.trends?.completedGrowth);
      console.log('- Recent Activity Count:', data.recentActivity?.length);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testAnalyticsAPI();
