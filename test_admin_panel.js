const https = require('https');

// Admin user login to get JWT token
const login = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'rodrigojille6@gmail.com',
      password: 'adminpassword123' // Replace with actual admin password
    });

    const options = {
      hostname: 'kustodia-backend-f991a7cb1824.herokuapp.com',
      port: 443,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.token) {
            console.log('✅ Login successful, got token');
            resolve(response.token);
          } else {
            console.log('❌ Login failed:', response);
            reject(new Error('Login failed'));
          }
        } catch (error) {
          console.log('❌ Login parse error:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Login request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Test admin API endpoints
const testEndpoint = (path, token, description) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'kustodia-backend-f991a7cb1824.herokuapp.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n🔍 Testing ${description}`);
        console.log(`📡 ${path}`);
        console.log(`📊 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`✅ Success - Data length: ${JSON.stringify(response).length} chars`);
            if (Array.isArray(response)) {
              console.log(`📈 Array with ${response.length} items`);
            } else if (response.disputes) {
              console.log(`📈 Disputes array with ${response.disputes.length} items`);
            } else {
              console.log(`📈 Response keys: ${Object.keys(response).join(', ')}`);
            }
          } catch (error) {
            console.log('✅ Success - Non-JSON response');
          }
        } else {
          console.log(`❌ Failed - Response: ${data}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request error for ${description}:`, error);
      resolve();
    });

    req.end();
  });
};

// Main test function
async function testAdminPanel() {
  console.log('🚀 Testing Admin Panel APIs...\n');
  
  try {
    // Login to get token
    const token = await login();
    
    // Test all admin endpoints
    await testEndpoint('/api/admin/tickets', token, 'Admin Tickets (Restricted)');
    await testEndpoint('/api/tickets/admin', token, 'Tickets Admin (Alternative)');
    await testEndpoint('/api/admin/disputes', token, 'Admin Disputes');
    await testEndpoint('/api/admin/system/overview', token, 'System Overview');
    await testEndpoint('/api/admin/system/activity', token, 'System Activity');
    
    console.log('\n🏁 Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminPanel();
