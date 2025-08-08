const { ethers } = require('ethers');
require('dotenv').config();

async function verifyAssetState() {
  console.log('🔍 Verifying asset state for Token ID 1...');
  
  // Get network configuration
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const contractAddress = process.env.NFT_COMPACT_ADDRESS;
  const privateKey = isMainnet ? process.env.MAINNET_PRIVATE_KEY : process.env.KUSTODIA_PRIVATE_KEY;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`Contract: ${contractAddress}`);
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`Wallet: ${wallet.address}`);
  
  // Contract ABI for checking asset state
  const contractABI = [
    "function _exists(uint256 tokenId) view returns (bool)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function getAsset(uint256 tokenId) view returns (tuple(string assetId, uint8 assetType, address owner, bool isActive, uint256 createdAt, uint256 lastUpdated, string tokenURI))",
    "function assetHistory(uint256 tokenId, uint256 index) view returns (tuple(uint8 eventType, uint256 timestamp, address authorizedBy, string description, uint256 transactionAmount, string[] supportingDocs))",
    "function getAssetEventCount(uint256 tokenId) view returns (uint256)",
    "function paused() view returns (bool)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  const tokenId = 1;
  
  try {
    console.log('\n📋 ASSET STATE VERIFICATION:');
    
    // Check if contract is paused
    const isPaused = await contract.paused();
    console.log(`   Contract Paused: ${isPaused ? '❌ YES' : '✅ NO'}`);
    
    // Check if token exists
    try {
      const owner = await contract.ownerOf(tokenId);
      console.log(`   Token ${tokenId} Owner: ✅ ${owner}`);
    } catch (error) {
      console.log(`   Token ${tokenId} Owner: ❌ Does not exist`);
      return;
    }
    
    // Get asset data
    try {
      const asset = await contract.getAsset(tokenId);
      console.log(`   Asset ID: ${asset.assetId}`);
      console.log(`   Asset Type: ${asset.assetType}`);
      console.log(`   Is Active: ${asset.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created At: ${new Date(Number(asset.createdAt) * 1000).toISOString()}`);
      console.log(`   Last Updated: ${new Date(Number(asset.lastUpdated) * 1000).toISOString()}`);
      
      if (!asset.isActive) {
        console.log('   🚨 ISSUE: Asset is not active - this might prevent adding events!');
      }
    } catch (error) {
      console.log(`   ❌ Error getting asset data: ${error.message}`);
    }
    
    // Check asset history
    try {
      const eventCount = await contract.getAssetEventCount(tokenId);
      console.log(`   Current Event Count: ${eventCount.toString()}`);
      
      if (eventCount > 0) {
        console.log(`   📋 EXISTING EVENTS:`);
        for (let i = 0; i < Math.min(eventCount, 3); i++) {
          try {
            const event = await contract.assetHistory(tokenId, i);
            console.log(`      Event ${i}: Type=${event.eventType}, Description="${event.description}"`);
          } catch (e) {
            console.log(`      Event ${i}: ❌ Error reading event`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Error getting event count: ${error.message}`);
    }
    
    console.log('\n🧪 DIAGNOSIS:');
    console.log('   If asset is inactive or has structural issues, addAssetEvent might fail.');
    console.log('   All validation checks passed in previous tests, so the issue is likely internal.');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyAssetState().catch(console.error);
