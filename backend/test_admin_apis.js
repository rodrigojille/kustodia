const fetch = require('node-fetch');

const BASE_URL = 'https://kustodia-backend-f991a7cb1824.herokuapp.com';

// Test all admin APIs needed for the admin panel
async function testAdminAPIs() {
  console.log('🔍 Testing Kustodia Admin APIs in Production');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('=' * 50);

  const endpoints = [
    // Basic health check
    { name: 'Health Check', url: '/', expectedStatus: [200, 404] },
    
    // Tickets API (CRITICAL)
    { name: 'Admin Tickets', url: '/api/tickets/admin', expectedStatus: [401, 200], critical: true },
    { name: 'Tickets Base', url: '/api/tickets', expectedStatus: [401, 200, 404] },
    
    // Disputes API (CRITICAL)  
    { name: 'Admin Disputes', url: '/api/disputes/admin', expectedStatus: [401, 200], critical: true },
    { name: 'Disputes Base', url: '/api/disputes', expectedStatus: [401, 200, 404] },
    
    // Operations Center / Logs (UPDATED UNIFIED ENDPOINTS)
    { name: 'Admin Operations', url: '/api/admin/operations', expectedStatus: [401, 200, 404] },
    { name: 'Unified Logs (Auto-detect)', url: '/api/admin/logs?environment=auto&lines=10', expectedStatus: [401, 200], critical: true },
    { name: 'Unified Dynos (Auto-detect)', url: '/api/admin/dynos?environment=auto', expectedStatus: [401, 200], critical: true },
    { name: 'Legacy Production Logs', url: '/api/logs/production', expectedStatus: [401, 200, 404] },
    
    // Payment APIs for admin
    { name: 'Admin Payments', url: '/api/payments/admin', expectedStatus: [401, 200, 404] },
    { name: 'Payments Stats', url: '/api/payments/stats', expectedStatus: [401, 200, 404] },
    
    // User management
    { name: 'Admin Users', url: '/api/users/admin', expectedStatus: [401, 200, 404] },
    { name: 'Users Base', url: '/api/users', expectedStatus: [401, 200, 404] },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Testing: ${endpoint.name}`);
      console.log(`   URL: ${BASE_URL}${endpoint.url}`);
      
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const status = response.status;
      const isExpected = endpoint.expectedStatus.includes(status);
      const statusEmoji = isExpected ? '✅' : '❌';
      
      console.log(`   Status: ${status} ${statusEmoji}`);
      
      // Get response preview
      const text = await response.text();
      const preview = text.substring(0, 100).replace(/\n/g, ' ');
      console.log(`   Response: ${preview}${text.length > 100 ? '...' : ''}`);
      
      const result = {
        name: endpoint.name,
        url: endpoint.url,
        status,
        isExpected,
        critical: endpoint.critical || false,
        working: isExpected,
        response: preview
      };
      
      results.push(result);

      // Special handling for critical APIs
      if (endpoint.critical) {
        if (status === 401) {
          console.log('   ℹ️  Authentication required (expected for admin endpoint)');
        } else if (status === 404) {
          console.log('   ⚠️  CRITICAL: Endpoint not found!');
        } else if (status === 200) {
          console.log('   🎉 CRITICAL: Endpoint accessible!');
        }
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: 'ERROR',
        isExpected: false,
        critical: endpoint.critical || false,
        working: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '=' * 50);
  console.log('📊 ADMIN API TEST SUMMARY');
  console.log('=' * 50);

  const criticalIssues = results.filter(r => r.critical && !r.working);
  const totalCritical = results.filter(r => r.critical).length;
  const workingCritical = results.filter(r => r.critical && r.working).length;

  console.log(`Critical APIs: ${workingCritical}/${totalCritical} working`);
  console.log(`Total APIs tested: ${results.length}`);
  console.log(`Working APIs: ${results.filter(r => r.working).length}`);

  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach(issue => {
      console.log(`❌ ${issue.name}: ${issue.status} - ${issue.error || 'Unexpected status'}`);
    });
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (criticalIssues.some(i => i.status === 404)) {
    console.log('• Check if admin routes are properly configured in the backend');
  }
  if (criticalIssues.some(i => i.status === 'ERROR')) {
    console.log('• Check if the backend server is running and accessible');
  }
  if (results.some(r => r.status === 401 && r.critical)) {
    console.log('• Test with valid admin JWT token for authentication');
  }

  return results;
}

// Run the tests
testAdminAPIs().catch(console.error);
