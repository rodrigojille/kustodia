const { ethers } = require('ethers');
require('dotenv').config();

async function verifyWalletRoles() {
  console.log('🔍 Verifying wallet roles for NFT contract interaction...');
  
  // Get network configuration
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const contractAddress = process.env.NFT_COMPACT_ADDRESS;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`Contract: ${contractAddress}`);
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Get the private key that AssetNFTService uses
  const privateKey = isMainnet ? process.env.MAINNET_PRIVATE_KEY : process.env.KUSTODIA_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ Private key not found in environment variables');
    return;
  }
  
  // Create wallet from private key
  const wallet = new ethers.Wallet(privateKey, provider);
  const walletAddress = wallet.address;
  
  console.log(`\n📋 WALLET ANALYSIS:`);
  console.log(`   Private Key Variable: ${isMainnet ? 'MAINNET_PRIVATE_KEY' : 'KUSTODIA_PRIVATE_KEY'}`);
  console.log(`   Wallet Address: ${walletAddress}`);
  
  // Expected addresses
  const expectedBridgeWallet = isMainnet ? process.env.BRIDGE_WALLET_MAIN : process.env.BRIDGE_WALLET_ADDRESS;
  console.log(`   Expected Bridge Wallet: ${expectedBridgeWallet}`);
  console.log(`   Addresses Match: ${walletAddress.toLowerCase() === expectedBridgeWallet?.toLowerCase() ? '✅ YES' : '❌ NO'}`);
  
  // Contract ABI for role checking
  const contractABI = [
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function UPDATER_ROLE() view returns (bytes32)",
    "function KUSTODIA_ROLE() view returns (bytes32)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  try {
    // Check roles for the wallet address
    console.log(`\n🔐 ROLE VERIFICATION FOR ${walletAddress}:`);
    
    const updaterRole = await contract.UPDATER_ROLE();
    const hasUpdaterRole = await contract.hasRole(updaterRole, walletAddress);
    console.log(`   UPDATER_ROLE: ${hasUpdaterRole ? '✅ YES' : '❌ NO'}`);
    
    const kustodiaRole = await contract.KUSTODIA_ROLE();
    const hasKustodiaRole = await contract.hasRole(kustodiaRole, walletAddress);
    console.log(`   KUSTODIA_ROLE: ${hasKustodiaRole ? '✅ YES' : '❌ NO'}`);
    
    // Summary
    console.log(`\n📋 DIAGNOSIS:`);
    if (walletAddress.toLowerCase() !== expectedBridgeWallet?.toLowerCase()) {
      console.log(`   🚨 PROBLEM: AssetNFTService is using wrong wallet!`);
      console.log(`   📝 SOLUTION: Update ${isMainnet ? 'MAINNET_PRIVATE_KEY' : 'KUSTODIA_PRIVATE_KEY'} to match ${expectedBridgeWallet}`);
    } else if (!hasUpdaterRole || !hasKustodiaRole) {
      console.log(`   🚨 PROBLEM: Wallet missing required roles!`);
      console.log(`   📝 SOLUTION: Grant missing roles to ${walletAddress}`);
    } else {
      console.log(`   ✅ SUCCESS: Wallet has all required roles and matches expected address`);
    }
    
  } catch (error) {
    console.error('❌ Error checking roles:', error);
  }
}

verifyWalletRoles().catch(console.error);
