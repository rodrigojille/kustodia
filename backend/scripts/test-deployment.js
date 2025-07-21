#!/usr/bin/env node

/**
 * Kustodia Deployment Test Script
 * Tests the deployed Heroku application endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const APP_NAME = 'kustodia-backend'; // Update this with your actual Heroku app name
const BASE_URL = `https://${APP_NAME}.herokuapp.com`;

// Test endpoints
const ENDPOINTS = [
  { path: '/health', method: 'GET', description: 'Health Check' },
  { path: '/api/health', method: 'GET', description: 'API Health Check' },
  { path: '/api/spei-receipt/health', method: 'GET', description: 'SPEI Receipt Service Health' },
  { path: '/api/payments/health', method: 'GET', description: 'Payments Service Health' },
  { path: '/api/auth/health', method: 'GET', description: 'Auth Service Health' }
];

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 10000;

    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(timeout);
  });
}

/**
 * Test single endpoint
 */
async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  console.log(`\n🔍 Testing: ${endpoint.description}`);
  console.log(`   URL: ${url}`);

  try {
    const response = await makeRequest(url);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`   ✅ Status: ${response.statusCode} - SUCCESS`);
      
      // Try to parse JSON response
      try {
        const jsonData = JSON.parse(response.body);
        console.log(`   📊 Response:`, JSON.stringify(jsonData, null, 2).slice(0, 200));
      } catch (e) {
        console.log(`   📄 Response: ${response.body.slice(0, 100)}...`);
      }
      
      return { success: true, status: response.statusCode, endpoint };
    } else {
      console.log(`   ❌ Status: ${response.statusCode} - ERROR`);
      console.log(`   📄 Response: ${response.body.slice(0, 200)}`);
      return { success: false, status: response.statusCode, endpoint };
    }
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return { success: false, error: error.message, endpoint };
  }
}

/**
 * Main test function
 */
async function runDeploymentTests() {
  console.log('🚀 KUSTODIA DEPLOYMENT TEST');
  console.log('=' .repeat(50));
  console.log(`🌐 Testing app: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  const results = [];
  
  // Test each endpoint
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n✅ WORKING ENDPOINTS:');
    successful.forEach(r => {
      console.log(`   • ${r.endpoint.description} (${r.status})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    failed.forEach(r => {
      console.log(`   • ${r.endpoint.description} - ${r.error || r.status}`);
    });
  }

  // Overall status
  const overallSuccess = successful.length >= results.length / 2;
  console.log(`\n🎯 OVERALL STATUS: ${overallSuccess ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);

  if (overallSuccess) {
    console.log('\n🎉 Your Kustodia backend is successfully deployed and responding!');
    console.log(`🌐 Access your app at: ${BASE_URL}`);
  } else {
    console.log('\n⚠️  Some issues detected. Check the failed endpoints above.');
  }

  return overallSuccess;
}

// Run tests if called directly
if (require.main === module) {
  runDeploymentTests().catch(console.error);
}

module.exports = { runDeploymentTests, testEndpoint, BASE_URL };
