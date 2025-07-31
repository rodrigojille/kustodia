#!/usr/bin/env node

/**
 * Test Script: Multi-Sig Configuration Validation
 * 
 * This script validates the new multi-sig environment configuration
 * and tests the TransactionRouterService with the updated settings.
 */

require('dotenv').config();
const { TransactionRouterService } = require('../dist/services/TransactionRouterService');

async function testMultiSigConfiguration() {
  console.log('🔧 Multi-Sig Configuration Test');
  console.log('================================\n');

  // Initialize the router service
  const router = new TransactionRouterService();

  // Test 1: Configuration Validation
  console.log('1️⃣ Configuration Validation:');
  const config = router.getConfiguration();
  console.log('   Thresholds:', config.thresholds);
  console.log('   Bridge Wallet:', config.walletConfig.BRIDGE_WALLET.address || 'NOT CONFIGURED');
  console.log('   High-Value Multi-Sig:', config.walletConfig.HIGH_VALUE_MULTISIG.address || 'NOT CONFIGURED');
  console.log('   Enterprise Multi-Sig:', config.walletConfig.ENTERPRISE_MULTISIG.address || 'NOT CONFIGURED');
  
  const validation = config.validation;
  console.log('   Validation Status:', validation.isValid ? '✅ VALID' : '❌ INVALID');
  if (!validation.isValid) {
    console.log('   Issues:', validation.issues);
  }
  console.log();

  // Test 2: Environment Variables Check
  console.log('2️⃣ Environment Variables:');
  const envVars = [
    'BRIDGE_WALLET_ADDRESS',
    'HIGH_VALUE_MULTISIG_ADDRESS',
    'ENTERPRISE_MULTISIG_ADDRESS',
    'MULTISIG_HIGH_VALUE_THRESHOLD',
    'MULTISIG_ENTERPRISE_THRESHOLD',
    'MULTISIG_DAILY_LIMIT'
  ];

  envVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value || 'NOT SET'}`);
  });
  console.log();

  // Test 3: Transaction Routing with New Configuration
  console.log('3️⃣ Transaction Routing Tests:');
  
  const testTransactions = [
    { amount: 500, description: 'Low-value transaction' },
    { amount: 18770, description: 'High-value transaction (~$1,000)' },
    { amount: 187700, description: 'Enterprise transaction (~$10,000)' },
    { amount: 937850, description: 'Large enterprise transaction (~$50,000)' }
  ];

  for (const tx of testTransactions) {
    try {
      const route = await router.routeTransaction({
        amount: tx.amount,
        type: 'DEPOSIT',
        recipientAddress: '0x1234567890123456789012345678901234567890',
        metadata: { description: tx.description }
      });

      console.log(`   ${tx.description} (${tx.amount} MXN):`);
      console.log(`     Route Type: ${route.type}`);
      console.log(`     Wallet: ${route.wallet}`);
      console.log(`     Requires Approval: ${route.requiresApproval}`);
      console.log(`     Reason: ${route.reason}`);
      console.log();
    } catch (error) {
      console.error(`   ❌ Error routing ${tx.description}:`, error.message);
    }
  }

  // Test 4: Multi-Sig Wallet Details
  console.log('4️⃣ Multi-Sig Wallet Configuration Details:');
  
  const highValueConfig = config.walletConfig.HIGH_VALUE_MULTISIG;
  console.log('   High-Value Multi-Sig:');
  console.log(`     Address: ${highValueConfig.address || 'NOT CONFIGURED'}`);
  console.log(`     Type: ${highValueConfig.type}`);
  console.log(`     Threshold: ${highValueConfig.threshold}`);
  console.log(`     Total Signers: ${highValueConfig.totalSigners}`);
  console.log(`     Owners: ${highValueConfig.owners.length > 0 ? highValueConfig.owners.join(', ') : 'NOT CONFIGURED'}`);
  
  const enterpriseConfig = config.walletConfig.ENTERPRISE_MULTISIG;
  console.log('   Enterprise Multi-Sig:');
  console.log(`     Address: ${enterpriseConfig.address || 'NOT CONFIGURED'}`);
  console.log(`     Type: ${enterpriseConfig.type}`);
  console.log(`     Threshold: ${enterpriseConfig.threshold}`);
  console.log(`     Total Signers: ${enterpriseConfig.totalSigners}`);
  console.log(`     Owners: ${enterpriseConfig.owners.length > 0 ? enterpriseConfig.owners.join(', ') : 'NOT CONFIGURED'}`);
  console.log();

  // Test 5: Fallback Behavior
  console.log('5️⃣ Fallback Behavior Test:');
  console.log('   Current behavior: All transactions fall back to bridge wallet');
  console.log('   This is expected until multi-sig wallets are configured.');
  console.log();

  console.log('✅ Multi-Sig Configuration Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Configure actual Gnosis Safe addresses');
  console.log('   2. Set multi-sig owner addresses');
  console.log('   3. Test with real multi-sig wallets');
  console.log('   4. Implement approval workflow service');
}

// Run the test
if (require.main === module) {
  testMultiSigConfiguration().catch(console.error);
}

module.exports = { testMultiSigConfiguration };
