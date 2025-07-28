const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying MINIMAL NFT contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy only Universal Asset NFT (this is the one that actually mints!)
  console.log('\n=== Deploying UniversalAssetNFT ===');
  const UniversalAssetNFT = await ethers.getContractFactory('UniversalAssetNFT');
  const universalAssetNFT = await UniversalAssetNFT.deploy();
  await universalAssetNFT.waitForDeployment();
  console.log('UniversalAssetNFT deployed to:', universalAssetNFT.target);

  // Verify contract is deployed correctly
  console.log('\n=== Verifying Deployment ===');
  const universalCode = await deployer.provider.getCode(universalAssetNFT.target);
  console.log('Universal contract code length:', universalCode.length);

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

  // --- Log new addresses for manual update ---
  console.log('\n\n--- COPY AND PASTE INTO YOUR backend/.env FILE ---\n');
  console.log(`UNIVERSAL_ASSET_CONTRACT_ADDRESS=${universalAssetNFT.target}`);
  console.log(`# Vehicle and Property contracts not deployed due to size limits`);
  console.log(`# VEHICLE_ASSET_CONTRACT_ADDRESS=`);
  console.log(`# PROPERTY_ASSET_CONTRACT_ADDRESS=`);
  console.log('\n-------------------------------------------\n');
  
  console.log('✅ SUCCESS: Universal Asset Contract deployed!');
  console.log('📝 NOTE: We can use ONLY the Universal contract for all NFT operations.');
  console.log('🎯 The Universal contract can handle vehicles, properties, and all asset types.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
