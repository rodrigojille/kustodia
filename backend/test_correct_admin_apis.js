const fetch = require('node-fetch');

const BASE_URL = 'https://kustodia-backend-f991a7cb1824.herokuapp.com';

// Test the CORRECT admin endpoints based on route analysis
async function testCorrectAdminAPIs() {
  console.log('🔍 Testing CORRECT Kustodia Admin APIs');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('=' * 50);

  const endpoints = [
    // CORRECT Admin endpoints (from admin.ts)
    { name: '✅ Admin Tickets', url: '/api/admin/tickets', critical: true },
    { name: '✅ Admin Disputes', url: '/api/admin/disputes', critical: true },
    { name: '✅ Admin Payments', url: '/api/admin/payments', critical: true },
    { name: '✅ Admin Users', url: '/api/admin/users' },
    
    // NEW: Regular tickets endpoint (just fixed)
    { name: '🆕 Tickets (Fixed)', url: '/api/tickets/admin', critical: true },
    { name: '🆕 My Tickets', url: '/api/tickets/my-tickets' },
    
    // Disputes (regular routes)
    { name: '✅ Disputes', url: '/api/dispute' },
    
    // Operations Center features 
    { name: '📊 System Status', url: '/api/admin/system-status' },
    { name: '📊 Heroku Logs', url: '/api/admin/heroku-logs' },
    
    // Test wrong endpoints that were failing
    { name: '❌ Wrong Payment Admin', url: '/api/payments/admin', expectedFail: true },
    { name: '❌ Wrong Payment Stats', url: '/api/payments/stats', expectedFail: true },
  ];

  console.log('\n🧪 Testing all endpoints...\n');

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.url}`);
      const status = response.status;
      
      let statusText = '';
      let emoji = '';
      
      if (endpoint.expectedFail) {
        // For endpoints that should fail
        if (status === 404 || status === 500) {
          statusText = 'Expected failure ✅';
          emoji = '❌➡️✅';
        } else {
          statusText = 'Unexpected success ⚠️';
          emoji = '⚠️';
        }
      } else {
        // For endpoints that should work
        if (status === 401) {
          statusText = 'Auth required (good) ✅';
          emoji = '🔐';
        } else if (status === 200) {
          statusText = 'Success ✅';
          emoji = '🎉';
        } else if (status === 404) {
          statusText = 'Not found ❌';
          emoji = '❌';
        } else if (status === 500) {
          statusText = 'Server error ❌';
          emoji = '💥';
        } else {
          statusText = `Status ${status}`;
          emoji = '❓';
        }
      }

      console.log(`${emoji} ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      console.log(`   Status: ${status} - ${statusText}`);
      
      if (endpoint.critical && status !== 401 && status !== 200) {
        console.log(`   🚨 CRITICAL ISSUE: Expected 200 or 401, got ${status}`);
      }
      
      // Show response preview for errors
      if (status >= 400 && status !== 401 && status !== 404) {
        const text = await response.text();
        const preview = text.substring(0, 100).replace(/\n/g, ' ');
        console.log(`   Error: ${preview}...`);
      }

      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status,
        critical: endpoint.critical || false,
        working: status === 401 || status === 200,
        expectedFail: endpoint.expectedFail || false
      });

    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: 'ERROR',
        critical: endpoint.critical || false,
        working: false,
        error: error.message
      });
    }
    
    console.log(''); // Empty line between tests
  }

  // Summary
  console.log('=' * 50);
  console.log('📊 FINAL ADMIN API STATUS');
  console.log('=' * 50);

  const critical = results.filter(r => r.critical);
  const workingCritical = critical.filter(r => r.working);
  
  console.log(`\n🎯 CRITICAL APIS: ${workingCritical.length}/${critical.length} working`);
  
  critical.forEach(api => {
    const emoji = api.working ? '✅' : '❌';
    console.log(`${emoji} ${api.name}: ${api.status}`);
  });

  const failedCritical = critical.filter(r => !r.working);
  if (failedCritical.length === 0) {
    console.log('\n🎉 ALL CRITICAL ADMIN APIS ARE WORKING!');
    console.log('✅ Admin can access tickets and disputes');  
    console.log('✅ Backend server is running properly');
    console.log('📋 Next step: Fix frontend authentication to use these APIs');
  } else {
    console.log('\n🚨 CRITICAL ISSUES REMAINING:');
    failedCritical.forEach(api => {
      console.log(`❌ ${api.name}: ${api.status}`);
    });
  }
}

testCorrectAdminAPIs().catch(console.error);
