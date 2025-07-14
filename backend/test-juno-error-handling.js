/**
 * Test script for improved Juno error handling
 * This script tests the new withdrawal verification functionality
 */

require('dotenv').config();
const AppDataSource = require('./src/ormconfig').default;
const { 
  withdrawMXNBToBridge, 
  verifyWithdrawalProcessed, 
  listRecentWithdrawals,
  initializeJunoService 
} = require('./src/services/junoService');

async function testJunoErrorHandling() {
  try {
    console.log('🚀 Testing Juno error handling improvements...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    // Initialize Juno service
    initializeJunoService();
    console.log('✅ Juno service initialized');
    
    // Test 1: List recent withdrawals
    console.log('\n📋 Test 1: Listing recent withdrawals...');
    const recentWithdrawals = await listRecentWithdrawals();
    console.log(`Found ${recentWithdrawals.length} recent withdrawals`);
    if (recentWithdrawals.length > 0) {
      console.log('Most recent withdrawal:', recentWithdrawals[0]);
    }
    
    // Test 2: Verify withdrawal verification function
    console.log('\n🔍 Test 2: Testing withdrawal verification...');
    const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET;
    if (!bridgeWallet) {
      console.log('❌ ESCROW_BRIDGE_WALLET not set in environment');
      return;
    }
    
    // Check if there's a recent withdrawal we can verify
    if (recentWithdrawals.length > 0) {
      const testWithdrawal = recentWithdrawals[0];
      console.log(`Testing verification for withdrawal: ${testWithdrawal.amount} MXNB to ${testWithdrawal.address}`);
      
      const verified = await verifyWithdrawalProcessed(
        testWithdrawal.amount, 
        testWithdrawal.address, 
        60 // Check last 60 minutes
      );
      
      if (verified) {
        console.log('✅ Withdrawal verification successful');
        console.log('Verified withdrawal details:', verified);
      } else {
        console.log('❌ Withdrawal verification failed');
      }
    }
    
    // Test 3: Test small withdrawal with error handling
    console.log('\n💰 Test 3: Testing small withdrawal with improved error handling...');
    console.log('Note: This may trigger error 34003 which should be handled gracefully');
    
    try {
      const testAmount = 1; // 1 MXNB for testing
      console.log(`Attempting withdrawal of ${testAmount} MXNB to ${bridgeWallet}`);
      
      const result = await withdrawMXNBToBridge(testAmount, bridgeWallet);
      console.log('✅ Withdrawal completed successfully');
      console.log('Result:', result);
      
    } catch (error) {
      console.log('⚠️ Withdrawal threw an error (this might be expected):');
      console.log('Error:', error.message);
      
      // The improved error handling should have already verified if the withdrawal was processed
      console.log('✅ Error handling completed - check logs above for verification results');
    }
    
    console.log('\n🎉 Juno error handling test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the test
testJunoErrorHandling().catch(console.error);
