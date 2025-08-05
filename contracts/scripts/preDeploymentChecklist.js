const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Mainnet deployment wallet
const MAINNET_WALLET = '0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F';
const REQUIRED_ETH_BALANCE = '0.05'; // Minimum ETH required for deployment

/**
 * @title Pre-Deployment Checklist for Kustodia V2 Pausable Contracts Mainnet
 * @dev Validates all requirements before mainnet deployment of pausable contracts
 * @notice Checks network, wallet, contracts, and environment setup
 */
async function runPreDeploymentChecklist() {
  console.log('🔍 Pre-Deployment Checklist for Kustodia V2 Pausable Contracts Mainnet');
  console.log('=======================================');
  
  const checks = {
    networkConnection: false,
    walletBalance: false,
    contractCompilation: false,
    environmentVariables: false,
    gasEstimation: false
  };
  
  try {
    // 1. Network Connection Check
    console.log('\n1️⃣ Checking network connection...');
    const network = await ethers.provider.getNetwork();
    console.log('   Connected to:', network.name);
    console.log('   Chain ID:', network.chainId.toString());
    
    if (network.chainId === 42161n) {
      console.log('   ✅ Connected to Arbitrum Mainnet');
      checks.networkConnection = true;
    } else {
      console.log('   ❌ Not connected to Arbitrum Mainnet (Chain ID: 42161)');
    }
    
    // 2. Wallet Balance Check
    console.log('\n2️⃣ Checking wallet balance...');
    const [deployer] = await ethers.getSigners();
    console.log('   Deployer address:', deployer.address);
    
    if (deployer.address.toLowerCase() !== MAINNET_WALLET.toLowerCase()) {
      console.log('   ❌ Wrong deployer address!');
      console.log('   Expected:', MAINNET_WALLET);
      console.log('   Got:', deployer.address);
    } else {
      console.log('   ✅ Correct deployer address');
      
      const balance = await ethers.provider.getBalance(deployer.address);
      const balanceEth = ethers.formatEther(balance);
      console.log('   Balance:', balanceEth, 'ETH');
      
      if (parseFloat(balanceEth) >= parseFloat(REQUIRED_ETH_BALANCE)) {
        console.log('   ✅ Sufficient balance for deployment');
        checks.walletBalance = true;
      } else {
        console.log('   ❌ Insufficient balance! Minimum required:', REQUIRED_ETH_BALANCE, 'ETH');
      }
    }
    
    // 3. Contract Compilation Check
    console.log("\n📦 3. Checking contract compilation...");
    
    try {
        // Check if pausable contracts are compiled
        const KustodiaEscrowPausable = await ethers.getContractFactory("KustodiaEscrow2_0Pausable");
        const UniversalAssetNFTPausable = await ethers.getContractFactory("UniversalAssetNFTPausable");
        
        console.log(`   ✅ KustodiaEscrow2_0Pausable contract compiled successfully`);
        console.log(`   ✅ UniversalAssetNFTPausable contract compiled successfully`);
        
        // Check if contracts have pausable functionality
        const escrowInterface = KustodiaEscrowPausable.interface;
        const nftInterface = UniversalAssetNFTPausable.interface;
        
        const escrowHasPause = escrowInterface.fragments.some(f => f.name === 'pause');
        const nftHasPause = nftInterface.fragments.some(f => f.name === 'pause');
        
        if (escrowHasPause && nftHasPause) {
            console.log(`   ✅ Both contracts have pausable functionality`);
        } else {
            console.log(`   ⚠️  Warning: Contracts may be missing pausable functionality`);
        }
        
        checks.contractCompilation = true;
    } catch (error) {
        console.log(`   ❌ Contract compilation failed: ${error.message}`);
        console.log(`   💡 Run: npx hardhat compile`);
        checks.contractCompilation = false;
    }
    
    // 4. Environment Variables Check
    console.log('\n4️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'MAINNET_PRIVATE_KEY',
      'ARBITRUM_MAINNET_RPC_URL'
    ];
    
    let envVarsValid = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar} is set`);
      } else {
        console.log(`   ❌ ${envVar} is missing`);
        envVarsValid = false;
      }
    }
    
    if (envVarsValid) {
      checks.environmentVariables = true;
    }
    
    // 5. Gas Estimation
    console.log("\n⛽ 5. Estimating gas costs...");
    
    try {
        const [deployer] = await ethers.getSigners();
        
        // Estimate pausable escrow deployment gas
        const KustodiaEscrowPausable = await ethers.getContractFactory("KustodiaEscrow2_0Pausable");
        const escrowGasEstimate = await ethers.provider.estimateGas({
            data: KustodiaEscrowPausable.bytecode
        });
        
        // Estimate pausable NFT deployment gas
        const UniversalAssetNFTPausable = await ethers.getContractFactory("UniversalAssetNFTPausable");
        const nftGasEstimate = await ethers.provider.estimateGas({
            data: UniversalAssetNFTPausable.bytecode
        });
        
        // Add extra gas for proxy deployments (upgradeable contracts)
        const proxyGasOverhead = 500000n; // ~500k gas overhead for proxies
        const totalGas = escrowGasEstimate + nftGasEstimate + (proxyGasOverhead * 2n);
        
        const gasPrice = await ethers.provider.getGasPrice();
        const estimatedCost = totalGas * gasPrice;
        
        console.log(`   📊 Escrow deployment gas: ~${escrowGasEstimate.toString()}`);
        console.log(`   📊 NFT deployment gas: ~${nftGasEstimate.toString()}`);
        console.log(`   📊 Proxy overhead: ~${(proxyGasOverhead * 2n).toString()}`);
        console.log(`   📊 Total gas estimate: ~${totalGas.toString()}`);
        console.log(`   💰 Estimated cost: ~${ethers.formatEther(estimatedCost)} ETH`);
        
        // Check if balance is sufficient
        const balance = await deployer.getBalance();
        const safetyMargin = estimatedCost * 2n; // 100% safety margin
        
        if (balance >= safetyMargin) {
            console.log(`   ✅ Sufficient balance for deployment with safety margin`);
            checks.gasEstimation = true;
        } else {
            console.log(`   ⚠️  Balance may be insufficient. Recommended: ${ethers.formatEther(safetyMargin)} ETH`);
            checks.gasEstimation = false;
        }
        
    } catch (error) {
        console.log(`   ❌ Gas estimation failed: ${error.message}`);
        checks.gasEstimation = false;
    }
    
    // Summary
    console.log('\n📋 Checklist Summary');
    console.log('====================');
    const allChecks = Object.entries(checks);
    const passedChecks = allChecks.filter(([_, passed]) => passed).length;
    
    allChecks.forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`${status} ${checkName}`);
    });
    
    console.log(`\n${passedChecks}/${allChecks.length} checks passed`);
    
    if (passedChecks === allChecks.length) {
      console.log('\n🎉 All checks passed! Ready for mainnet deployment.');
      console.log('\n📝 Next steps:');
      console.log('1. Run: npx hardhat run scripts/deployMainnet.js --network arbitrum');
      console.log('2. Verify contracts on Arbiscan');
      console.log('3. Update backend environment variables');
      console.log('4. Test contract interactions');
    } else {
      console.log('\n⚠️  Some checks failed. Please resolve issues before deployment.');
      
      if (!checks.walletBalance) {
        console.log('\n💰 To fund the wallet:');
        console.log(`   Send at least ${REQUIRED_ETH_BALANCE} ETH to: ${MAINNET_WALLET}`);
      }
      
      if (!checks.environmentVariables) {
        console.log('\n🔧 Required environment variables:');
        console.log('   MAINNET_PRIVATE_KEY=0x... (private key for the mainnet wallet)');
        console.log('   ARBITRUM_MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc');
      }
    }
    
    return {
      ready: passedChecks === allChecks.length,
      checks,
      summary: `${passedChecks}/${allChecks.length} checks passed`
    };
    
  } catch (error) {
    console.error('\n❌ Pre-deployment check failed:', error.message);
    return {
      ready: false,
      error: error.message
    };
  }
}

// Export for use in other scripts
module.exports = {
  runPreDeploymentChecklist,
  MAINNET_WALLET,
  REQUIRED_ETH_BALANCE
};

// Run checklist if this script is executed directly
if (require.main === module) {
  runPreDeploymentChecklist()
    .then((result) => {
      if (result.ready) {
        console.log('\n✅ Pre-deployment checklist completed - Ready to deploy!');
        process.exit(0);
      } else {
        console.log('\n❌ Pre-deployment checklist failed - Not ready to deploy');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Pre-deployment checklist error:', error);
      process.exit(1);
    });
}
