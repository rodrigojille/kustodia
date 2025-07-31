/**
 * Test Script for TransactionRouterService
 * 
 * This script tests the transaction routing logic with various amounts
 * and scenarios to ensure proper classification and fallback behavior.
 */

const { TransactionRouterService } = require('../dist/services/TransactionRouterService');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testTransactionRouter() {
  console.log('🧪 TESTING TRANSACTION ROUTER SERVICE');
  console.log('=====================================\n');

  try {
    // Initialize the service
    const router = new TransactionRouterService();
    
    // Test 1: Configuration Validation
    console.log('📋 Test 1: Configuration Validation');
    console.log('-----------------------------------');
    const config = router.getConfiguration();
    console.log('Current Configuration:', JSON.stringify(config, null, 2));
    
    const validation = router.validateConfiguration();
    console.log('Validation Result:', validation);
    console.log('✅ Configuration test complete\n');

    // Test 2: Various Transaction Amounts
    console.log('💰 Test 2: Transaction Amount Classification');
    console.log('--------------------------------------------');
    
    const testAmounts = [
      500,      // $27 USD - Should be single-sig
      5000,     // $277 USD - Should be single-sig  
      18000,    // $1000 USD - Should be multi-sig (high-value)
      50000,    // $2777 USD - Should be multi-sig (high-value)
      180000,   // $10000 USD - Should be multi-sig (enterprise)
      500000    // $27777 USD - Should be multi-sig (enterprise)
    ];

    console.log('Testing amounts (MXN):', testAmounts);
    
    for (const amount of testAmounts) {
      console.log(`\n💸 Testing ${amount.toLocaleString()} MXN:`);
      
      const route = await router.routeTransaction({
        amount: amount,
        type: 'escrow_creation',
        paymentId: Math.floor(Math.random() * 1000)
      });
      
      console.log(`  Route Type: ${route.type}`);
      console.log(`  Wallet: ${route.wallet}`);
      console.log(`  Threshold: ${route.threshold || 'N/A'}`);
      console.log(`  Requires Approval: ${route.requiresApproval}`);
      console.log(`  Reason: ${route.reason}`);
    }

    // Test 3: Simulation Feature
    console.log('\n🎯 Test 3: Batch Simulation');
    console.log('---------------------------');
    
    const simulationResults = await router.simulateRouting([1000, 10000, 50000, 200000]);
    
    console.log('Simulation Results:');
    simulationResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.amount.toLocaleString()} MXN ($${result.usd.toFixed(2)} USD)`);
      console.log(`     → ${result.route.type} (${result.route.requiresApproval ? 'Approval Required' : 'Automated'})`);
    });

    // Test 4: Different Transaction Types
    console.log('\n🔄 Test 4: Different Transaction Types');
    console.log('-------------------------------------');
    
    const transactionTypes = [
      'escrow_creation',
      'escrow_funding', 
      'escrow_release',
      'bridge_withdrawal',
      'user_transfer',
      'juno_redemption'
    ];

    const testAmount = 25000; // Should trigger multi-sig
    
    for (const txType of transactionTypes) {
      const route = await router.routeTransaction({
        amount: testAmount,
        type: txType,
        description: `Test ${txType}`
      });
      
      console.log(`  ${txType}: ${route.type} (${route.requiresApproval ? 'Needs Approval' : 'Automated'})`);
    }

    // Test 5: Error Handling
    console.log('\n🚨 Test 5: Error Handling');
    console.log('-------------------------');
    
    // Test with invalid amount
    try {
      const route = await router.routeTransaction({
        amount: -1000,
        type: 'escrow_creation'
      });
      console.log('  Negative amount handled:', route.type);
    } catch (error) {
      console.log('  Negative amount error:', error.message);
    }

    // Test with zero amount
    const zeroRoute = await router.routeTransaction({
      amount: 0,
      type: 'user_transfer'
    });
    console.log('  Zero amount route:', zeroRoute.type, '-', zeroRoute.reason);

    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Additional helper function to test exchange rate conversion
async function testExchangeRates() {
  console.log('\n💱 TESTING EXCHANGE RATE CONVERSION');
  console.log('===================================');
  
  try {
    const router = new TransactionRouterService();
    
    // Test various MXN amounts
    const mxnAmounts = [1000, 5000, 18000, 50000, 100000];
    
    for (const mxn of mxnAmounts) {
      // We can't directly access the private method, so we'll route a transaction
      // and observe the USD conversion in the logs
      console.log(`\nConverting ${mxn.toLocaleString()} MXN:`);
      await router.routeTransaction({
        amount: mxn,
        type: 'escrow_creation'
      });
    }
    
  } catch (error) {
    console.error('Exchange rate test failed:', error);
  }
}

// Run the tests
async function runAllTests() {
  await testTransactionRouter();
  await testExchangeRates();
  
  console.log('\n🎉 Test suite completed!');
  console.log('Check the logs above for any issues or unexpected behavior.');
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testTransactionRouter, testExchangeRates, runAllTests };
