const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Create a test JWT token for user ID 2
const testUserId = 2;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

const testToken = jwt.sign(
  { id: testUserId, email: 'rodrigojille6@gmail.com' },
  jwtSecret,
  { expiresIn: '1h' }
);

console.log('🔑 Generated test JWT token for user ID 2');
console.log('Token:', testToken.substring(0, 50) + '...');

// Test the PRODUCTION API endpoint
async function testProductionUserMeEndpoint() {
  try {
    console.log('\n🚀 Testing PRODUCTION /api/users/me endpoint...');
    console.log('🌐 URL: https://kustodia.mx/api/users/me');
    
    const response = await fetch('https://kustodia.mx/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const userData = await response.json();
      console.log('\n✅ SUCCESS! Production API is working!');
      console.log('User data received:', JSON.stringify(userData, null, 2));
      
      console.log('\n🎯 KEY FIELDS CHECK:');
      console.log('- KYC Status:', userData.kyc_status);
      console.log('- Payout CLABE:', userData.payout_clabe);
      console.log('- Email:', userData.email);
      console.log('- Full Name:', userData.full_name);
      
      console.log('\n🎉 PRODUCTION FIX CONFIRMED: /api/users/me endpoint is working!');
    } else {
      const errorText = await response.text();
      console.log('\n❌ ERROR Response:');
      console.log('Status:', response.status);
      console.log('Body:', errorText);
      
      if (response.status === 404) {
        console.log('\n🔍 DIAGNOSIS: Still getting 404 - deployment may not be complete yet');
        console.log('Wait a few more minutes and try again');
      }
    }
  } catch (error) {
    console.error('\n💥 Request failed:', error.message);
    console.log('Check internet connection and production URL');
  }
}

testProductionUserMeEndpoint();
