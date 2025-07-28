const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying NFT contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  // Load environment variables from the root .env file
  const envPath = path.resolve(__dirname, '../../backend/.env');
  require('dotenv').config({ path: envPath });

  // Deploy Universal Asset NFT first
  console.log('\n=== Deploying UniversalAssetNFT ===');
  const UniversalAssetNFT = await ethers.getContractFactory('UniversalAssetNFT');
  const universalAssetNFT = await UniversalAssetNFT.deploy();
  await universalAssetNFT.waitForDeployment();
  console.log('UniversalAssetNFT deployed to:', universalAssetNFT.target);

  // Deploy Vehicle Asset NFT
  console.log('\n=== Deploying VehicleAssetNFT ===');
  const VehicleAssetNFT = await ethers.getContractFactory('VehicleAssetNFT');
  const vehicleAssetNFT = await VehicleAssetNFT.deploy();
  await vehicleAssetNFT.waitForDeployment();
  console.log('VehicleAssetNFT deployed to:', vehicleAssetNFT.target);

  // Deploy Property Asset NFT
  console.log('\n=== Deploying PropertyAssetNFT ===');
  const PropertyAssetNFT = await ethers.getContractFactory('PropertyAssetNFT');
  const propertyAssetNFT = await PropertyAssetNFT.deploy();
  await propertyAssetNFT.waitForDeployment();
  console.log('PropertyAssetNFT deployed to:', propertyAssetNFT.target);

  // Verify contracts are deployed correctly
  console.log('\n=== Verifying Deployments ===');
  const universalCode = await deployer.provider.getCode(universalAssetNFT.target);
  const vehicleCode = await deployer.provider.getCode(vehicleAssetNFT.target);
  const propertyCode = await deployer.provider.getCode(propertyAssetNFT.target);
  
  console.log('Universal contract code length:', universalCode.length);
  console.log('Vehicle contract code length:', vehicleCode.length);
  console.log('Property contract code length:', propertyCode.length);

  // --- Log new addresses for manual update ---
  console.log('\n\n--- COPY AND PASTE INTO YOUR backend/.env FILE ---\n');
  console.log(`UNIVERSAL_ASSET_CONTRACT_ADDRESS=${universalAssetNFT.target}`);
  console.log(`VEHICLE_ASSET_CONTRACT_ADDRESS=${vehicleAssetNFT.target}`);
  console.log(`PROPERTY_ASSET_CONTRACT_ADDRESS=${propertyAssetNFT.target}`);
  console.log('\n-------------------------------------------\n');

  // Test basic functionality
  console.log('\n=== Testing Basic Functionality ===');
  try {
    const name = await universalAssetNFT.name();
    const symbol = await universalAssetNFT.symbol();
    console.log(`Universal NFT: ${name} (${symbol})`);
    
    // Check if deployer has KUSTODIA_ROLE
    const KUSTODIA_ROLE = await universalAssetNFT.KUSTODIA_ROLE();
    const hasRole = await universalAssetNFT.hasRole(KUSTODIA_ROLE, deployer.address);
    console.log('Deployer has KUSTODIA_ROLE:', hasRole);
    
    if (!hasRole) {
      console.log('⚠️  WARNING: Deployer does not have KUSTODIA_ROLE. You may need to grant it manually.');
    }
  } catch (error) {
    console.error('Error testing functionality:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
