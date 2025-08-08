const { ethers, upgrades } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Mainnet deployment configuration
const MAINNET_CONFIG = {
  // New mainnet wallet
  deployerAddress: '0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F',
  
  // Arbitrum Mainnet configuration
  network: 'arbitrum-mainnet',
  chainId: 42161,
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  
  // Contract deployment parameters
  contracts: {
    escrow: {
      bridgeWallet: '0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F', // Same as deployer for mainnet
      platformWallet: '0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F'  // Same as deployer for mainnet
    },
    universalAsset: {
      name: 'Kustodia Universal Asset NFT',
      symbol: 'KUANFT',
      baseURI: 'https://kustodia.mx/api/nft/metadata/'
    }
  }
};

/**
 * Deploy KustodiaEscrow2_0 (Upgradeable)
 */
async function deployEscrowContract(deployer) {
  console.log('\n🏦 Deploying KustodiaEscrow2_0Pausable (Upgradeable)...');
  
  const KustodiaEscrowFactory = await ethers.getContractFactory("KustodiaEscrow2_0Pausable");
  
  console.log('📋 Deployment parameters:');
  console.log('   Bridge Wallet:', MAINNET_CONFIG.contracts.escrow.bridgeWallet);
  console.log('   Platform Wallet:', MAINNET_CONFIG.contracts.escrow.platformWallet);
  
  // Deploy upgradeable proxy
  const escrowDeployTx = await upgrades.deployProxy(
    KustodiaEscrowFactory,
    [MAINNET_CONFIG.contracts.escrow.bridgeWallet, MAINNET_CONFIG.contracts.escrow.platformWallet], // bridgeWallet, platformWallet
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );
  
  await escrowDeployTx.deployed();
  const escrowAddress = escrowDeployTx.address;
  
  console.log(`✅ KustodiaEscrow2_0Pausable Proxy deployed to: ${escrowAddress}`);
  
  // Get implementation address
  const escrowImplAddress = await upgrades.erc1967.getImplementationAddress(escrowAddress);
  console.log(`📍 Implementation address: ${escrowImplAddress}`);
  
  // Verify deployment parameters
  const escrowContract = await ethers.getContractAt("KustodiaEscrow2_0Pausable", escrowAddress);
  const bridgeWallet = await escrowContract.bridgeWallet();
  const platformWallet = await escrowContract.platformWallet();
  const isPaused = await escrowContract.paused();
  
  console.log(`🔍 Bridge Wallet: ${bridgeWallet}`);
  console.log(`🔍 Platform Wallet: ${platformWallet}`);
  console.log(`🔍 Paused: ${isPaused}`);
  
  if (bridgeWallet !== MAINNET_CONFIG.contracts.escrow.bridgeWallet || platformWallet !== MAINNET_CONFIG.contracts.escrow.platformWallet) {
    throw new Error("❌ Escrow wallet configuration mismatch!");
  }
  
  return {
    name: "KustodiaEscrow2_0Pausable",
    proxy: escrowAddress,
    implementation: escrowImplAddress,
    bridgeWallet: bridgeWallet,
    platformWallet: platformWallet,
    isPausable: true,
    deploymentTx: escrowDeployTx.deployTransaction.hash
  };
}

/**
 * Deploy AssetManagementLib Library
 */
async function deployAssetManagementLib(deployer) {
  console.log('\n📚 Deploying AssetManagementLib library...');
  
  const AssetManagementLib = await ethers.getContractFactory("AssetManagementLib", deployer);
  const assetManagementLib = await AssetManagementLib.deploy();
  await assetManagementLib.waitForDeployment();
  const libAddress = await assetManagementLib.getAddress();
  
  console.log('✅ AssetManagementLib deployed to:', libAddress);
  
  return {
    address: libAddress,
    contract: assetManagementLib
  };
}

/**
 * Deploy UniversalAssetNFTPausable with Asset Management Library linking
 */
async function deployUniversalAssetContract(deployer, assetManagementLibAddress) {
  console.log('\n🎨 Deploying UniversalAssetNFTPausable with library linking...');
  
  // Deploy with library linking
  const UniversalAssetNFT = await ethers.getContractFactory('UniversalAssetNFTPausable', {
    libraries: {
      AssetManagementLib: assetManagementLibAddress
    }
  });
  
  console.log('📋 Deployment parameters:');
  console.log('   Name:', MAINNET_CONFIG.contracts.universalAsset.name);
  console.log('   Symbol:', MAINNET_CONFIG.contracts.universalAsset.symbol);
  console.log('   Admin (Kustodia Role):', MAINNET_CONFIG.deployerAddress);
  console.log('   Linked Library:', assetManagementLibAddress);
  
  // Deploy the contract
  const universalAsset = await UniversalAssetNFT.deploy(
    MAINNET_CONFIG.contracts.universalAsset.name,
    MAINNET_CONFIG.contracts.universalAsset.symbol,
    MAINNET_CONFIG.deployerAddress // Admin address with KUSTODIA_ROLE
  );
  
  await universalAsset.waitForDeployment();
  const universalAssetAddress = await universalAsset.getAddress();
  
  console.log('✅ UniversalAssetNFTPausable deployed to:', universalAssetAddress);
  
  return {
    address: universalAssetAddress,
    contract: universalAsset,
    linkedLibrary: assetManagementLibAddress
  };
}

/**
 * Verify deployment and setup
 */
async function verifyDeployment(escrowResult, universalAssetResult, deployer) {
  console.log('\n🔍 Verifying deployment...');
  
  // Verify escrow contract
  console.log('\n📋 Escrow Contract Verification:');
  const bridgeWallet = await escrowResult.contract.bridgeWallet();
  const platformWallet = await escrowResult.contract.platformWallet();
  const owner = await escrowResult.contract.owner();
  
  console.log('   Bridge Wallet:', bridgeWallet);
  console.log('   Platform Wallet:', platformWallet);
  console.log('   Owner:', owner);
  console.log('   Expected Bridge:', MAINNET_CONFIG.contracts.escrow.bridgeWallet);
  console.log('   Expected Platform:', MAINNET_CONFIG.contracts.escrow.platformWallet);
  
  // Verify Universal Asset contract
  console.log('\n📋 Universal Asset Contract Verification:');
  const name = await universalAssetResult.contract.name();
  const symbol = await universalAssetResult.contract.symbol();
  const hasKustodiaRole = await universalAssetResult.contract.hasRole(
    await universalAssetResult.contract.KUSTODIA_ROLE(),
    deployer.address
  );
  
  console.log('   Name:', name);
  console.log('   Symbol:', symbol);
  console.log('   Deployer has KUSTODIA_ROLE:', hasKustodiaRole);
  
  return {
    escrowVerified: bridgeWallet === MAINNET_CONFIG.contracts.escrow.bridgeWallet &&
                   platformWallet === MAINNET_CONFIG.contracts.escrow.platformWallet,
    universalAssetVerified: name === MAINNET_CONFIG.contracts.universalAsset.name &&
                           symbol === MAINNET_CONFIG.contracts.universalAsset.symbol &&
                           hasKustodiaRole
  };
}

/**
 * Save deployment results
 */
async function saveDeploymentResults(escrowResult, universalAssetResult, deploymentTx) {
  const deploymentData = {
    network: MAINNET_CONFIG.network,
    chainId: MAINNET_CONFIG.chainId,
    deployer: MAINNET_CONFIG.deployerAddress,
    deployedAt: new Date().toISOString(),
    contracts: {
      KustodiaEscrow2_0Pausable: {
        proxy: escrowResult.proxy,
        implementation: escrowResult.implementation,
        bridgeWallet: escrowResult.bridgeWallet,
        platformWallet: escrowResult.platformWallet,
        isPausable: escrowResult.isPausable,
        deploymentTx: escrowResult.deploymentTx
      },
      UniversalAssetNFTPausable: {
        address: universalAssetResult.address,
        name: MAINNET_CONFIG.contracts.universalAsset.name,
        symbol: MAINNET_CONFIG.contracts.universalAsset.symbol
      }
    },
    transactionHashes: deploymentTx,
    gasUsed: {
      escrow: deploymentTx.escrowGas || 'N/A',
      universalAsset: deploymentTx.universalAssetGas || 'N/A'
    }
  };
  
  // Save to deployment file
  const deploymentPath = path.join(__dirname, '../deployment-mainnet.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log('\n💾 Deployment data saved to:', deploymentPath);
  
  // Update environment variables template
  const envTemplate = `
# Mainnet Contract Addresses - Generated ${new Date().toISOString()}
KUSTODIA_ESCROW_CONTRACT_ADDRESS=${escrowResult.proxy}
UNIVERSAL_ASSET_CONTRACT_ADDRESS=${universalAssetResult.address}

# Mainnet Configuration
ARBITRUM_MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc
MAINNET_CHAIN_ID=42161
MAINNET_DEPLOYER_ADDRESS=${MAINNET_CONFIG.deployerAddress}

# Bridge and Platform Wallets
BRIDGE_WALLET_ADDRESS=${MAINNET_CONFIG.contracts.escrow.bridgeWallet}
PLATFORM_WALLET_ADDRESS=${MAINNET_CONFIG.contracts.escrow.platformWallet}
`;
  
  const envPath = path.join(__dirname, '../.env.mainnet');
  fs.writeFileSync(envPath, envTemplate);
  console.log('📝 Environment template saved to:', envPath);
  
  return deploymentData;
}

/**
 * Main deployment function
 */
async function deployMainnet() {
  try {
    console.log('🚀 Starting Mainnet Deployment');
    console.log('================================');
    console.log('Network:', MAINNET_CONFIG.network);
    console.log('Chain ID:', MAINNET_CONFIG.chainId);
    console.log('Deployer:', MAINNET_CONFIG.deployerAddress);
    console.log('RPC URL:', MAINNET_CONFIG.rpcUrl);
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log('\n👤 Deployer address:', deployer.address);
    
    // Verify deployer address matches expected
    if (deployer.address.toLowerCase() !== MAINNET_CONFIG.deployerAddress.toLowerCase()) {
      throw new Error(`❌ Deployer address mismatch! Expected: ${MAINNET_CONFIG.deployerAddress}, Got: ${deployer.address}`);
    }
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.01')) {
      console.warn('⚠️  Warning: Low ETH balance. Deployment may fail.');
    }
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log('🌐 Connected to network:', network.name, 'Chain ID:', network.chainId.toString());
    
    if (network.chainId !== BigInt(MAINNET_CONFIG.chainId)) {
      throw new Error(`❌ Wrong network! Expected chain ID: ${MAINNET_CONFIG.chainId}, Got: ${network.chainId}`);
    }
    
    const deploymentTx = {};
    
    // Deploy contracts
    console.log('\n📦 Starting contract deployments...');
    
    // 1. Deploy Escrow Contract
    const escrowResult = await deployEscrowContract(deployer);
    deploymentTx.escrow = escrowResult.proxy;
    
    // 2. Deploy Asset Management Library
    const assetManagementLibResult = await deployAssetManagementLib(deployer);
    deploymentTx.assetManagementLib = assetManagementLibResult.address;
    
    // 3. Deploy Universal Asset Contract with library linking
    const universalAssetResult = await deployUniversalAssetContract(deployer, assetManagementLibResult.address);
    deploymentTx.universalAsset = universalAssetResult.address;
    
    // 3. Verify deployment
    const verification = await verifyDeployment(escrowResult, universalAssetResult, deployer);
    
    if (!verification.escrowVerified || !verification.universalAssetVerified) {
      throw new Error('❌ Deployment verification failed!');
    }
    
    console.log('\n✅ All contracts verified successfully!');
    
    // 4. Save deployment results
    const deploymentData = await saveDeploymentResults(escrowResult, universalAssetResult, deploymentTx);
    
    console.log('\n🎉 Mainnet Deployment Complete!');
    console.log('================================');
    console.log('KustodiaEscrow2_0 (Proxy):', escrowResult.proxy);
    console.log('UniversalAssetNFT:', universalAssetResult.address);
    console.log('\n📋 Next Steps:');
    console.log('1. Update backend environment variables with new contract addresses');
    console.log('2. Update frontend configuration');
    console.log('3. Test contract interactions on mainnet');
    console.log('4. Set up monitoring and alerts');
    
    return deploymentData;
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = {
  deployMainnet,
  MAINNET_CONFIG
};

// Run deployment if this script is executed directly
if (require.main === module) {
  deployMainnet()
    .then((result) => {
      console.log('\n✅ Deployment script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment script failed:', error);
      process.exit(1);
    });
}
