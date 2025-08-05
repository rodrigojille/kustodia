// Network Configuration Test Script
// Validates network switching utility without affecting services

// Load environment variables from backend/.env
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { networkConfig, getCurrentNetworkConfig, isTestnetActive, isMainnetActive } from '../utils/networkConfig';

async function testNetworkConfiguration() {
  console.log('🧪 TESTING NETWORK CONFIGURATION UTILITY');
  console.log('==========================================\n');

  // Test 1: Current network detection
  console.log('📍 TEST 1: Current Network Detection');
  console.log(`Current Network: ${networkConfig.getCurrentNetwork()}`);
  console.log(`Is Testnet Active: ${isTestnetActive()}`);
  console.log(`Is Mainnet Active: ${isMainnetActive()}`);
  console.log(`Network Display: ${networkConfig.getNetworkDisplay()}\n`);

  // Test 2: Configuration validation
  console.log('✅ TEST 2: Configuration Validation');
  const validation = networkConfig.validateConfig();
  console.log(`Configuration Valid: ${validation.valid}`);
  if (!validation.valid) {
    console.log('❌ Configuration Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('✅ All configuration values present');
  }
  console.log('');

  // Test 3: Current configuration values
  console.log('📋 TEST 3: Current Configuration Values');
  const config = getCurrentNetworkConfig();
  console.log(`RPC URL: ${config.rpcUrl}`);
  console.log(`Escrow V2: ${config.escrowV2Address}`);
  console.log(`NFT Compact: ${config.nftCompactAddress}`);
  console.log(`MXNB Token: ${config.mxnbTokenAddress}`);
  console.log(`Bridge Wallet: ${config.bridgeWallet}`);
  console.log(`Platform Wallet: ${config.platformWallet}`);
  console.log(`Juno Wallet: ${config.junoWallet}`);
  console.log(`Juno Environment: ${config.junoEnv}`);
  console.log(`Chain ID: ${config.chainId}`);
  console.log(`Network Name: ${config.networkName}\n`);

  // Test 4: Compare with current environment variables
  console.log('🔄 TEST 4: Environment Variable Comparison');
  console.log('Current ENV vs Network Config:');
  
  const envComparisons = [
    {
      name: 'RPC URL',
      env: process.env.ARBITRUM_SEPOLIA_RPC_URL || process.env.ETH_RPC_URL,
      config: config.rpcUrl
    },
    {
      name: 'Escrow V2',
      env: process.env.KUSTODIA_ESCROW_V2_ADDRESS,
      config: config.escrowV2Address
    },
    {
      name: 'MXNB Token',
      env: process.env.MXNB_CONTRACT_ADDRESS,
      config: config.mxnbTokenAddress
    },
    {
      name: 'Bridge Wallet',
      env: process.env.ESCROW_BRIDGE_WALLET,
      config: config.bridgeWallet
    },
    {
      name: 'Juno Environment',
      env: process.env.JUNO_ENV,
      config: config.junoEnv
    }
  ];

  let allMatch = true;
  envComparisons.forEach(comparison => {
    const match = comparison.env === comparison.config;
    const status = match ? '✅' : '❌';
    console.log(`${status} ${comparison.name}:`);
    console.log(`   ENV: ${comparison.env}`);
    console.log(`   CONFIG: ${comparison.config}`);
    if (!match) allMatch = false;
  });

  console.log(`\n📊 Overall Match Status: ${allMatch ? '✅ PERFECT MATCH' : '⚠️ DIFFERENCES FOUND'}\n`);

  // Test 5: Network switching simulation (without actually switching)
  console.log('🔄 TEST 5: Network Switching Simulation');
  console.log('Current network configuration:');
  networkConfig.logCurrentConfig();

  console.log('Simulating mainnet configuration (read-only):');
  // Temporarily create a new instance to test mainnet config
  const testConfig = {
    rpcUrl: process.env.ARBITRUM_MAINNET_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    escrowV2Address: process.env.ESCROW_V2_PAUSABLE_ADDRESS || '',
    nftCompactAddress: process.env.NFT_COMPACT_ADDRESS || '',
    mxnbTokenAddress: process.env.MXNB_MAINNET_ADDRESS || '',
    bridgeWallet: process.env.BRIDGE_WALLET_MAIN || '',
    platformWallet: process.env.PLATFORM_WALLET_MAIN || '',
    junoWallet: process.env.JUNO_MAIN_WALLET || '',
    junoEnv: process.env.JUNO_PROD_ENV || 'production',
    junoApiKey: process.env.JUNO_PROD_API_KEY || '',
    explorerUrl: process.env.ARBISCAN_URL || 'https://arbiscan.io',
    explorerApiKey: process.env.ARBISCAN_API_KEY || '',
    chainId: 42161,
    networkName: 'Arbitrum One Mainnet'
  };

  console.log('🔴 MAINNET Configuration Preview:');
  console.log(`   Network: 🔴 MAINNET`);
  console.log(`   Chain ID: ${testConfig.chainId}`);
  console.log(`   RPC URL: ${testConfig.rpcUrl}`);
  console.log(`   Escrow V2: ${testConfig.escrowV2Address}`);
  console.log(`   NFT Compact: ${testConfig.nftCompactAddress}`);
  console.log(`   MXNB Token: ${testConfig.mxnbTokenAddress}`);
  console.log(`   Bridge Wallet: ${testConfig.bridgeWallet}`);
  console.log(`   Juno Environment: ${testConfig.junoEnv}\n`);

  // Test 6: Final summary
  console.log('📋 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Network utility initialized: ${networkConfig.getCurrentNetwork()}`);
  console.log(`✅ Configuration validation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Environment comparison: ${allMatch ? 'MATCHED' : 'DIFFERENCES FOUND'}`);
  console.log(`✅ Mainnet config preview: AVAILABLE`);
  console.log('\n🎯 READY FOR SERVICE INTEGRATION');
  console.log('Next step: Update EscrowSafetyService to use networkConfig\n');
}

// Run the test
if (require.main === module) {
  testNetworkConfiguration().catch(console.error);
}

export { testNetworkConfiguration };
