const { ethers } = require('ethers');
require('dotenv').config();

async function verifyDeployedContract() {
  console.log('🔍 Verifying what contract is actually deployed...');
  
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const contractAddress = process.env.NFT_COMPACT_ADDRESS;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`Contract Address: ${contractAddress}`);
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  try {
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('❌ No contract deployed at this address!');
      return;
    }
    
    console.log(`✅ Contract exists (${code.length} bytes of bytecode)`);
    
    // Try basic ERC721 functions that should exist
    console.log('\n📋 TESTING BASIC ERC721 FUNCTIONS:');
    
    const basicABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)"
    ];
    
    const basicContract = new ethers.Contract(contractAddress, basicABI, provider);
    
    try {
      const name = await basicContract.name();
      console.log(`   ✅ name(): ${name}`);
    } catch (e) {
      console.log(`   ❌ name() failed: ${e.message.substring(0, 50)}`);
    }
    
    try {
      const symbol = await basicContract.symbol();
      console.log(`   ✅ symbol(): ${symbol}`);
    } catch (e) {
      console.log(`   ❌ symbol() failed: ${e.message.substring(0, 50)}`);
    }
    
    try {
      const owner = await basicContract.ownerOf(1);
      console.log(`   ✅ ownerOf(1): ${owner}`);
    } catch (e) {
      console.log(`   ❌ ownerOf(1) failed: ${e.message.substring(0, 50)}`);
    }
    
    // Test if this might be UniversalAssetNFTCompact instead
    console.log('\n📋 TESTING IF THIS IS UniversalAssetNFTCompact:');
    
    const compactABI = [
      "function createVehicle(string vin, address owner, string make, string model, uint16 year, string engineNumber, string color, uint8 fuelType, uint16 engineSize, uint32 currentMileage, bool isCommercial, string plateNumber, string tokenURI) external returns (uint256)",
      "function getVehicleData(uint256 tokenId) external view returns (string, string, string, uint16, string, string, uint8, uint16, uint32, bool, string)"
    ];
    
    const compactContract = new ethers.Contract(contractAddress, compactABI, provider);
    
    try {
      const vehicleData = await compactContract.getVehicleData(1);
      console.log(`   ✅ getVehicleData(1) SUCCESS - This IS UniversalAssetNFTCompact!`);
      console.log(`   Vehicle Data: VIN=${vehicleData[0]}, Make=${vehicleData[1]}, Model=${vehicleData[2]}`);
      
      console.log('\n🎯 DIAGNOSIS:');
      console.log('   The deployed contract is UniversalAssetNFTCompact, NOT UniversalAssetNFTPausable!');
      console.log('   This explains why addAssetEvent and other functions fail - they don\'t exist in Compact version.');
      
    } catch (e) {
      console.log(`   ❌ getVehicleData(1) failed: ${e.message.substring(0, 100)}`);
      
      // Test if it might be the original UniversalAssetNFT
      console.log('\n📋 TESTING IF THIS IS ORIGINAL UniversalAssetNFT:');
      
      const originalABI = [
        "function assets(uint256 tokenId) view returns (tuple(string assetId, uint8 assetType, address owner, bool isActive, uint256 createdAt, uint256 lastUpdated))"
      ];
      
      const originalContract = new ethers.Contract(contractAddress, originalABI, provider);
      
      try {
        const asset = await originalContract.assets(1);
        console.log(`   ✅ assets(1) SUCCESS - This might be original UniversalAssetNFT!`);
        console.log(`   Asset: ID=${asset.assetId}, Type=${asset.assetType}, Active=${asset.isActive}`);
      } catch (e2) {
        console.log(`   ❌ assets(1) failed: ${e2.message.substring(0, 100)}`);
        console.log('\n🤔 UNKNOWN CONTRACT TYPE - needs further investigation');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyDeployedContract().catch(console.error);
