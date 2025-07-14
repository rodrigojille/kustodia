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

console.log('🔑 Testing Heroku Backend Directly...');

// Test the Heroku backend
async function testHerokuBackend() {
  const herokuUrl = 'https://kustodia-backend-f991a7cb1824.herokuapp.com';
  
  console.log('\n1️⃣ Testing Heroku health check...');
  try {
    const healthResponse = await fetch(`${herokuUrl}/`, {
      method: 'GET'
    });
    console.log('Health Status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthText = await healthResponse.text();
      console.log('Health Response:', healthText);
    } else {
      const errorText = await healthResponse.text();
      console.log('Health Error:', errorText);
    }
  } catch (error) {
    console.log('Health test failed:', error.message);
  }

  console.log('\n2️⃣ Testing Heroku /api/users/me endpoint...');
  try {
    const response = await fetch(`${herokuUrl}/api/users/me`, {
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
      console.log('\n✅ SUCCESS! Heroku backend is working!');
      console.log('User data:', JSON.stringify(userData, null, 2));
    } else {
      const errorText = await response.text();
      console.log('\n❌ ERROR Response:');
      console.log('Status:', response.status);
      console.log('Body:', errorText);
    }
  } catch (error) {
    console.log('Heroku test failed:', error.message);
  }

  console.log('\n3️⃣ Testing Heroku with Auth endpoint...');
  try {
    const authResponse = await fetch(`${herokuUrl}/api/auth/test`, {
      method: 'GET'
    });
    console.log('Auth Test Status:', authResponse.status);
    if (authResponse.ok) {
      const authText = await authResponse.text();
      console.log('Auth Response:', authText);
    } else {
      const authError = await authResponse.text();
      console.log('Auth Error:', authError);
    }
  } catch (error) {
    console.log('Auth test failed:', error.message);
  }
}

testHerokuBackend();
