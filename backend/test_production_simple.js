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

console.log('🔑 Testing Production API with simple requests...');

// Test different endpoints to isolate the issue
async function testEndpoints() {
  const baseUrl = 'https://kustodia.mx';
  
  console.log('\n1️⃣ Testing health/basic endpoint...');
  try {
    const healthResponse = await fetch(`${baseUrl}/api/auth/test`, {
      method: 'GET'
    });
    console.log('Health Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health Response:', healthData);
    }
  } catch (error) {
    console.log('Health test failed:', error.message);
  }

  console.log('\n2️⃣ Testing JWT middleware with simple endpoint...');
  try {
    const jwtResponse = await fetch(`${baseUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    console.log('JWT Test Status:', jwtResponse.status);
    console.log('JWT Test Headers:', Object.fromEntries(jwtResponse.headers.entries()));
    
    const responseText = await jwtResponse.text();
    console.log('Response Body:', responseText);
    
    // Try to parse as JSON if possible
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('Parsed JSON:', JSON.stringify(jsonResponse, null, 2));
    } catch (parseError) {
      console.log('Response is not JSON:', responseText);
    }
    
  } catch (error) {
    console.log('JWT test failed:', error.message);
  }

  console.log('\n3️⃣ Testing with invalid token to see error handling...');
  try {
    const invalidResponse = await fetch(`${baseUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('Invalid Token Status:', invalidResponse.status);
    const invalidText = await invalidResponse.text();
    console.log('Invalid Token Response:', invalidText);
  } catch (error) {
    console.log('Invalid token test failed:', error.message);
  }
}

testEndpoints();
