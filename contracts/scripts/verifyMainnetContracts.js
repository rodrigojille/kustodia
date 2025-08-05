const { run } = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Verify deployed contracts on Arbiscan
 */
async function verifyMainnetContracts() {
  console.log('🔍 Verifying Mainnet Contracts on Arbiscan');
  console.log('==========================================');
  
  try {
    // Load deployment data
    const deploymentPath = path.join(__dirname, '../deployment-mainnet.json');
    
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('Deployment file not found. Please run deployment first.');
    }
    
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log('📋 Loaded deployment data from:', deploymentPath);
    
    const contracts = deploymentData.contracts;
    
    // 1. Verify KustodiaEscrow2_0 Implementation
    console.log('\n1️⃣ Verifying KustodiaEscrow2_0 Implementation...');
    try {
      await run('verify:verify', {
        address: contracts.KustodiaEscrow2_0.implementation,
        constructorArguments: []
      });
      console.log('✅ KustodiaEscrow2_0 implementation verified');
    } catch (error) {
      if (error.message.includes('Already Verified')) {
        console.log('✅ KustodiaEscrow2_0 implementation already verified');
      } else {
        console.log('❌ KustodiaEscrow2_0 implementation verification failed:', error.message);
      }
    }
    
    // 2. Verify KustodiaEscrow2_0 Proxy
    console.log('\n2️⃣ Verifying KustodiaEscrow2_0 Proxy...');
    try {
      await run('verify:verify', {
        address: contracts.KustodiaEscrow2_0.proxy,
        constructorArguments: [
          contracts.KustodiaEscrow2_0.implementation,
          '0x' // Empty data for proxy
        ]
      });
      console.log('✅ KustodiaEscrow2_0 proxy verified');
    } catch (error) {
      if (error.message.includes('Already Verified')) {
        console.log('✅ KustodiaEscrow2_0 proxy already verified');
      } else {
        console.log('❌ KustodiaEscrow2_0 proxy verification failed:', error.message);
        console.log('ℹ️  Note: Proxy verification can be complex. Manual verification may be needed.');
      }
    }
    
    // 3. Verify UniversalAssetNFT
    console.log('\n3️⃣ Verifying UniversalAssetNFT...');
    try {
      await run('verify:verify', {
        address: contracts.UniversalAssetNFT.address,
        constructorArguments: [
          contracts.UniversalAssetNFT.name,
          contracts.UniversalAssetNFT.symbol,
          deploymentData.deployer
        ]
      });
      console.log('✅ UniversalAssetNFT verified');
    } catch (error) {
      if (error.message.includes('Already Verified')) {
        console.log('✅ UniversalAssetNFT already verified');
      } else {
        console.log('❌ UniversalAssetNFT verification failed:', error.message);
      }
    }
    
    console.log('\n🎉 Contract verification completed!');
    console.log('\n📋 Verified Contracts:');
    console.log('KustodiaEscrow2_0 (Proxy):', contracts.KustodiaEscrow2_0.proxy);
    console.log('KustodiaEscrow2_0 (Implementation):', contracts.KustodiaEscrow2_0.implementation);
    console.log('UniversalAssetNFT:', contracts.UniversalAssetNFT.address);
    
    console.log('\n🔗 Arbiscan Links:');
    console.log(`Escrow Proxy: https://arbiscan.io/address/${contracts.KustodiaEscrow2_0.proxy}`);
    console.log(`Escrow Implementation: https://arbiscan.io/address/${contracts.KustodiaEscrow2_0.implementation}`);
    console.log(`Universal Asset NFT: https://arbiscan.io/address/${contracts.UniversalAssetNFT.address}`);
    
  } catch (error) {
    console.error('\n❌ Contract verification failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  verifyMainnetContracts
};

// Run verification if this script is executed directly
if (require.main === module) {
  verifyMainnetContracts()
    .then(() => {
      console.log('\n✅ Verification script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Verification script failed:', error);
      process.exit(1);
    });
}
