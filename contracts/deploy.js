const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

// Contract compilation results (you'll need to compile these first)
const UniversalAssetNFT = {
  abi: [], // Will be populated after compilation
  bytecode: "0x" // Will be populated after compilation
};

const VehicleAssetNFT = {
  abi: [], // Will be populated after compilation  
  bytecode: "0x" // Will be populated after compilation
};

const PropertyAssetNFT = {
  abi: [], // Will be populated after compilation
  bytecode: "0x" // Will be populated after compilation
};

async function deployContracts() {
  try {
    console.log('🚀 Starting NFT contract deployment...');
    
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc');
    const wallet = new ethers.Wallet(process.env.KUSTODIA_PRIVATE_KEY, provider);
    
    console.log('📍 Deployer address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      throw new Error('❌ Deployer wallet has no ETH. Please fund the wallet first.');
    }
    
    // Get network info
    const network = await provider.getNetwork();
    console.log('🌐 Network:', network.name, 'Chain ID:', network.chainId.toString());
    
    const deployedContracts = {};
    
    // Deploy UniversalAssetNFT first (base contract)
    console.log('\n📄 Deploying UniversalAssetNFT...');
    const UniversalAssetFactory = new ethers.ContractFactory(
      UniversalAssetNFT.abi, 
      UniversalAssetNFT.bytecode, 
      wallet
    );
    
    const universalAsset = await UniversalAssetFactory.deploy();
    await universalAsset.waitForDeployment();
    const universalAddress = await universalAsset.getAddress();
    
    console.log('✅ UniversalAssetNFT deployed to:', universalAddress);
    deployedContracts.UNIVERSAL_ASSET_CONTRACT_ADDRESS = universalAddress;
    
    // Deploy VehicleAssetNFT
    console.log('\n🚗 Deploying VehicleAssetNFT...');
    const VehicleAssetFactory = new ethers.ContractFactory(
      VehicleAssetNFT.abi,
      VehicleAssetNFT.bytecode,
      wallet
    );
    
    const vehicleAsset = await VehicleAssetFactory.deploy();
    await vehicleAsset.waitForDeployment();
    const vehicleAddress = await vehicleAsset.getAddress();
    
    console.log('✅ VehicleAssetNFT deployed to:', vehicleAddress);
    deployedContracts.VEHICLE_ASSET_CONTRACT_ADDRESS = vehicleAddress;
    
    // Deploy PropertyAssetNFT
    console.log('\n🏠 Deploying PropertyAssetNFT...');
    const PropertyAssetFactory = new ethers.ContractFactory(
      PropertyAssetNFT.abi,
      PropertyAssetNFT.bytecode,
      wallet
    );
    
    const propertyAsset = await PropertyAssetFactory.deploy();
    await propertyAsset.waitForDeployment();
    const propertyAddress = await propertyAsset.getAddress();
    
    console.log('✅ PropertyAssetNFT deployed to:', propertyAddress);
    deployedContracts.PROPERTY_ASSET_CONTRACT_ADDRESS = propertyAddress;
    
    // Update .env file with deployed addresses
    console.log('\n📝 Updating .env file with deployed addresses...');
    await updateEnvFile(deployedContracts);
    
    // Save deployment info
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: wallet.address,
      deployedAt: new Date().toISOString(),
      contracts: deployedContracts,
      transactionHashes: {
        universalAsset: universalAsset.deploymentTransaction()?.hash,
        vehicleAsset: vehicleAsset.deploymentTransaction()?.hash,
        propertyAsset: propertyAsset.deploymentTransaction()?.hash
      }
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('📋 Contract addresses:');
    console.log('   UniversalAssetNFT:', universalAddress);
    console.log('   VehicleAssetNFT:', vehicleAddress);
    console.log('   PropertyAssetNFT:', propertyAddress);
    console.log('\n💾 Deployment info saved to deployment.json');
    console.log('🔧 Environment file updated with contract addresses');
    
    return deployedContracts;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

async function updateEnvFile(contracts) {
  const envPath = path.resolve(__dirname, '../backend/.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update contract addresses
  envContent = envContent.replace(
    /UNIVERSAL_ASSET_CONTRACT_ADDRESS=.*/,
    `UNIVERSAL_ASSET_CONTRACT_ADDRESS=${contracts.UNIVERSAL_ASSET_CONTRACT_ADDRESS}`
  );
  
  envContent = envContent.replace(
    /VEHICLE_ASSET_CONTRACT_ADDRESS=.*/,
    `VEHICLE_ASSET_CONTRACT_ADDRESS=${contracts.VEHICLE_ASSET_CONTRACT_ADDRESS}`
  );
  
  envContent = envContent.replace(
    /PROPERTY_ASSET_CONTRACT_ADDRESS=.*/,
    `PROPERTY_ASSET_CONTRACT_ADDRESS=${contracts.PROPERTY_ASSET_CONTRACT_ADDRESS}`
  );
  
  fs.writeFileSync(envPath, envContent);
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deployContracts()
    .then(() => {
      console.log('🚀 Ready to launch NFT platform!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Deployment error:', error);
      process.exit(1);
    });
}

module.exports = { deployContracts };
