const fetch = require('node-fetch');

// Test the enhanced analytics API with period filtering
const testAnalyticsAPI = async () => {
  console.log('🧪 Testing Enhanced Analytics API...\n');
  
  // JWT token from localStorage
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJyb2RyaWdvamlsbGU2QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIndhbGxldF9hZGRyZXNzIjoiMHg0ODZCODhDYTg3NTMzMjk0RkI0NTI0NzM4NzE2OWYwODFmMzEwMmZmIiwiaWF0IjoxNzUyNTA2ODI3LCJleHAiOjE3NTMxMTE2Mjd9.1qVluyyJV8eItWZYKjBGv7XQ0nCk77ZcHxWJtyHyY8I';
  
  const periods = ['current_month', 'last_month', 'last_3_months', 'current_year', 'all_time'];
  
  for (const period of periods) {
    try {
      console.log(`📊 Testing period: ${period}`);
      
      const response = await fetch(`http://localhost:4000/api/analytics/stats?period=${period}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${period}:`, {
          paymentsCount: data.paymentsCount,
          totalVolume: data.totalVolume,
          pendingPayments: data.pendingPayments,
          trends: data.trends
        });
      } else {
        console.log(`❌ ${period}: ${response.status} - ${response.statusText}`);
      }
      
      console.log('---');
    } catch (error) {
      console.error(`❌ Error testing ${period}:`, error.message);
    }
  }
  
  // Test export functionality
  console.log('\n📄 Testing Export Functionality...');
  
  try {
    const pdfResponse = await fetch('http://localhost:4000/api/analytics/export?format=pdf&period=current_month', {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (pdfResponse.ok) {
      console.log('✅ PDF Export: Success');
    } else {
      console.log(`❌ PDF Export: ${pdfResponse.status}`);
    }
  } catch (error) {
    console.error('❌ PDF Export Error:', error.message);
  }
};

// Instructions for user
console.log(`
🔧 To test this script:
1. Open your browser and go to http://localhost:3000
2. Login to your dashboard
3. Open Developer Tools (F12)
4. Go to Application/Storage tab → Local Storage → http://localhost:3000
5. Copy the value of 'auth_token'
6. Replace 'YOUR_JWT_TOKEN_HERE' in this script with that token
7. Run: node test_analytics_enhanced.js

📍 Without a valid token, the API will return 401 Unauthorized
`);

// Run the test
testAnalyticsAPI();
