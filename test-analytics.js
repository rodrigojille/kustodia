const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000/api/admin/analytics';

// Test all analytics endpoints
async function testAnalyticsEndpoints() {
  console.log('🧪 Testing Analytics API Endpoints...\n');

  const endpoints = [
    { name: 'Key Metrics', url: `${BASE_URL}/key-metrics?period=30d` },
    { name: 'Acquisition Analytics', url: `${BASE_URL}/acquisition?period=30d` },
    { name: 'Transaction Analytics', url: `${BASE_URL}/transactions?period=30d` },
    { name: 'Growth KPIs', url: `${BASE_URL}/growth-kpis?period=30d` },
    { name: 'Recent Activity', url: `${BASE_URL}/recent-activity?limit=10` },
    { name: 'AI Insights', url: `${BASE_URL}/ai-insights?period=30d` }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📊 Testing ${endpoint.name}...`);
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
      } else {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${await response.text()}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  // Test export endpoint
  try {
    console.log('📄 Testing Export Endpoint...');
    const response = await fetch(`${BASE_URL}/export?period=30&format=csv`, {
      method: 'GET'
    });

    if (response.ok) {
      console.log('✅ Export Endpoint: SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log(`   Content-Disposition: ${response.headers.get('content-disposition')}`);
    } else {
      console.log('❌ Export Endpoint: FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Export Endpoint: ERROR');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎯 Analytics API Testing Complete!');
}

testAnalyticsEndpoints().catch(console.error);
