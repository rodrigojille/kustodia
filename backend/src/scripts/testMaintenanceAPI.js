/**
 * Test script for NFT Maintenance Update API
 * Tests all three update types: maintenance, upgrade, inspection
 */

const axios = require('axios');

const BASE_URL = 'https://kustodia-backend-b24c251c4b8b.herokuapp.com';
const TEST_TOKEN_ID = '1'; // Using token ID 1 for testing

// Test data for different update types
const testData = {
  maintenance: {
    tokenId: TEST_TOKEN_ID,
    updateType: 'maintenance',
    providerType: 'dealership',
    updateData: {
      description: 'Regular maintenance service - Oil change and filter replacement',
      serviceType: 'oil_change',
      provider: 'Kustodia Test Dealership',
      mileage: 45000,
      cost: 150.00,
      supportingDocs: ['maintenance_receipt_001.pdf']
    }
  },
  upgrade: {
    tokenId: TEST_TOKEN_ID,
    updateType: 'upgrade',
    providerType: 'tuning_shop',
    updateData: {
      description: 'Performance upgrade - Cold air intake installation',
      upgradeType: 'performance',
      provider: 'Performance Plus',
      cost: 350.00,
      supportingDocs: ['upgrade_invoice_001.pdf']
    }
  },
  inspection: {
    tokenId: TEST_TOKEN_ID,
    updateType: 'inspection',
    providerType: 'inspection_center',
    updateData: {
      description: 'Annual safety inspection',
      inspectionType: 'safety',
      inspector: 'Certified Inspector #12345',
      result: 'PASSED',
      certificateNumber: 'INSP-2025-001',
      expiryDate: '2026-08-08',
      cost: 75.00,
      supportingDocs: ['inspection_certificate_001.pdf']
    }
  }
};

async function testMaintenanceAPI() {
  console.log('🔧 Testing NFT Maintenance Update API');
  console.log('=====================================');
  
  // Test authentication token (you'll need to replace this with a valid token)
  const authToken = 'your-test-token-here'; // Replace with actual token
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  for (const [updateType, data] of Object.entries(testData)) {
    console.log(`\n📋 Testing ${updateType.toUpperCase()} update...`);
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/assets/service-update`,
        data,
        { headers }
      );
      
      console.log(`✅ ${updateType} update SUCCESS:`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Transaction Hash: ${response.data.transactionHash}`);
      console.log(`   Message: ${response.data.message}`);
      
    } catch (error) {
      console.log(`❌ ${updateType} update FAILED:`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Test completed!');
  console.log('\nExpected Results:');
  console.log('✅ All three update types should succeed with transaction hashes');
  console.log('✅ No more "no matching fragment" or parameter mismatch errors');
  console.log('✅ Contract calls should use 5-parameter addAssetEvent signature');
}

// Test without authentication (should fail with 401)
async function testWithoutAuth() {
  console.log('\n🔒 Testing without authentication (should fail)...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/assets/service-update`,
      testData.maintenance
    );
    console.log('❌ Unexpected success - authentication should be required');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected unauthenticated request (401)');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting NFT Maintenance API Tests');
  console.log('====================================');
  
  await testWithoutAuth();
  
  console.log('\n⚠️  To test authenticated requests:');
  console.log('1. Get a valid JWT token from login');
  console.log('2. Replace "your-test-token-here" in the script');
  console.log('3. Run the authenticated tests');
  
  // Uncomment the line below and add a valid token to test authenticated requests
  // await testMaintenanceAPI();
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testMaintenanceAPI, testWithoutAuth };
