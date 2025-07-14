const axios = require('axios');

async function testAdminAccess() {
  console.log('🔐 Testing Admin Panel Access...\n');
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://kustodia-backend-73d50a6a61b8.herokuapp.com'
    : 'http://localhost:5000';
    
  // Test JWT token (you'll need to replace this with a real token)
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsImlhdCI6MTcxOTUxMzQ1MH0.5rrDgF8bQqPVZ0E7xEv3QpCLqP2H8NCj2ZQMvPjjCGM';
  
  const headers = {
    'Authorization': `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('1️⃣ Testing /users/me endpoint...');
    const userResponse = await axios.get(`${baseUrl}/users/me`, { headers });
    const user = userResponse.data.user || userResponse.data;
    
    console.log('✅ User details:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'
    });

    if (user.role !== 'admin') {
      console.log('❌ User is not admin - admin panel access should be blocked');
      return;
    }

    console.log('\n2️⃣ Testing admin endpoints...');
    
    // Test admin routes
    const adminTests = [
      { name: 'Admin Users', path: '/admin/users' },
      { name: 'Admin Payments', path: '/admin/payments' },
      { name: 'Admin Disputes', path: '/admin/disputes' },
      { name: 'Admin System Overview', path: '/admin/system/overview' },
      { name: 'Admin Analytics', path: '/admin/analytics/payments' }
    ];

    for (const test of adminTests) {
      try {
        console.log(`Testing ${test.name}...`);
        const response = await axios.get(`${baseUrl}${test.path}`, { headers });
        console.log(`✅ ${test.name}: ${response.status} - Access granted`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log(`❌ ${test.name}: 403 Forbidden - Admin role required`);
        } else if (error.response?.status === 401) {
          console.log(`❌ ${test.name}: 401 Unauthorized - Authentication failed`);
        } else {
          console.log(`⚠️ ${test.name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to test admin access:', error.response?.data || error.message);
  }
}

// Show instructions
console.log(`
🎯 Admin Access Test Script

This script tests if admin panel authentication is working correctly.

To use this script:
1. Get a valid JWT token from a login request
2. Replace the testToken variable above with the real token
3. Run: node test_admin_access.js

Expected behavior:
- Non-admin users should get 403 Forbidden on admin routes
- Admin users should get 200 OK on admin routes
- Frontend admin panel should redirect non-admin users

`);

testAdminAccess();
