const { ethers } = require('ethers');
require('dotenv').config();

async function diagnoseNFTIssue() {
  console.log('🔍 Diagnosing NFT addAssetEvent revert issue...');
  
  // Get network configuration (same as AssetNFTService)
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const contractAddress = process.env.NFT_COMPACT_ADDRESS;
  const backendWallet = isMainnet ? process.env.BRIDGE_WALLET_MAIN : process.env.BRIDGE_WALLET_ADDRESS;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`RPC URL: ${rpcUrl}`);
  
  // Setup provider and contract
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  console.log(`Contract: ${contractAddress}`);
  console.log(`Backend Wallet: ${backendWallet}`);
  
  // Minimal ABI for diagnostic functions
  const diagnosticABI = [
    "function paused() view returns (bool)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function UPDATER_ROLE() view returns (bytes32)",
    "function KUSTODIA_ROLE() view returns (bytes32)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalAssets() view returns (uint256)",
    "function getAsset(uint256 tokenId) view returns (string assetId, uint8 assetType, address currentOwner, uint256 creationDate, bool isVerified, bool isActive)"
  ];
  
  const contract = new ethers.Contract(contractAddress, diagnosticABI, provider);
  
  try {
    // 1. Check if contract is paused
    console.log('\n1. Checking contract pause state...');
    const isPaused = await contract.paused();
    console.log(`   Contract paused: ${isPaused}`);
    
    // 2. Check total assets
    console.log('\n2. Checking total assets...');
    const totalAssets = await contract.totalAssets();
    console.log(`   Total assets: ${totalAssets.toString()}`);
    
    // 3. Check if token ID 1 exists
    console.log('\n3. Checking if token ID 1 exists...');
    try {
      const owner = await contract.ownerOf(1);
      console.log(`   Token 1 owner: ${owner}`);
      
      // Get asset details
      const asset = await contract.getAsset(1);
      console.log(`   Asset ID: ${asset.assetId}`);
      console.log(`   Asset Type: ${asset.assetType}`);
      console.log(`   Current Owner: ${asset.currentOwner}`);
      console.log(`   Is Active: ${asset.isActive}`);
      console.log(`   Is Verified: ${asset.isVerified}`);
    } catch (error) {
      console.log(`   ❌ Token 1 does not exist: ${error.message}`);
    }
    
    // 4. Check backend wallet roles
    console.log('\n4. Checking backend wallet roles...');
    
    try {
      const updaterRole = await contract.UPDATER_ROLE();
      const hasUpdaterRole = await contract.hasRole(updaterRole, backendWallet);
      console.log(`   UPDATER_ROLE: ${updaterRole}`);
      console.log(`   Backend has UPDATER_ROLE: ${hasUpdaterRole}`);
    } catch (error) {
      console.log(`   Error checking UPDATER_ROLE: ${error.message}`);
    }
    
    try {
      const kustodiaRole = await contract.KUSTODIA_ROLE();
      const hasKustodiaRole = await contract.hasRole(kustodiaRole, backendWallet);
      console.log(`   KUSTODIA_ROLE: ${kustodiaRole}`);
      console.log(`   Backend has KUSTODIA_ROLE: ${hasKustodiaRole}`);
    } catch (error) {
      console.log(`   Error checking KUSTODIA_ROLE: ${error.message}`);
    }
    
    // 5. Summary
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log(`   Contract paused: ${isPaused ? '❌ YES (blocking calls)' : '✅ NO'}`);
    console.log(`   Total assets: ${totalAssets.toString()}`);
    
    if (totalAssets.toString() === '0') {
      console.log('   🚨 ROOT CAUSE: No assets exist in contract - token ID 1 does not exist');
      console.log('   💡 SOLUTION: Create NFT token first, or use existing token ID');
    }
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

diagnoseNFTIssue().catch(console.error);
