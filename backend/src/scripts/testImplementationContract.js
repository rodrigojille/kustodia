const { ethers } = require('ethers');
require('dotenv').config();

async function testImplementationContract() {
  console.log('🔍 Testing implementation contract directly...');
  
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const privateKey = isMainnet ? process.env.MAINNET_PRIVATE_KEY : process.env.KUSTODIA_PRIVATE_KEY;
  
  // Use BOTH proxy and implementation addresses
  const proxyAddress = process.env.NFT_COMPACT_ADDRESS;
  const implAddress = process.env.NFT_COMPACT_IMPL;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`Proxy Address: ${proxyAddress}`);
  console.log(`Implementation Address: ${implAddress}`);
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // ABI for addAssetEvent
  const contractABI = [
    "function addAssetEvent(uint256 tokenId, uint8 eventType, string description, uint256 transactionAmount, string[] supportingDocs, string[] customFieldKeys, string[] customFieldValues) external"
  ];
  
  const tokenId = 1;
  const eventType = 4; // INSPECTION
  const description = 'Test inspection';
  const transactionAmount = 0;
  const supportingDocs = [];
  const customFieldKeys = ['testKey'];
  const customFieldValues = ['testValue'];
  
  try {
    console.log('\n📋 TESTING PROXY CONTRACT (current approach):');
    
    const proxyContract = new ethers.Contract(proxyAddress, contractABI, wallet);
    
    try {
      console.log('   Estimating gas on proxy...');
      const gasEstimate = await proxyContract.addAssetEvent.estimateGas(
        tokenId, eventType, description, transactionAmount, 
        supportingDocs, customFieldKeys, customFieldValues
      );
      console.log(`   ✅ Proxy gas estimate: ${gasEstimate.toString()}`);
    } catch (error) {
      console.log(`   ❌ Proxy failed: ${error.message.substring(0, 100)}`);
    }
    
    console.log('\n📋 TESTING IMPLEMENTATION CONTRACT DIRECTLY:');
    
    const implContract = new ethers.Contract(implAddress, contractABI, wallet);
    
    try {
      console.log('   Estimating gas on implementation...');
      const gasEstimate = await implContract.addAssetEvent.estimateGas(
        tokenId, eventType, description, transactionAmount, 
        supportingDocs, customFieldKeys, customFieldValues
      );
      console.log(`   ✅ Implementation gas estimate: ${gasEstimate.toString()}`);
      console.log('   🎯 SUCCESS! The function works on implementation contract!');
    } catch (error) {
      console.log(`   ❌ Implementation failed: ${error.message.substring(0, 100)}`);
    }
    
    console.log('\n📋 PROXY ARCHITECTURE ANALYSIS:');
    
    // Check if proxy is properly configured
    const proxyBasicABI = [
      "function implementation() view returns (address)",
      "function admin() view returns (address)"
    ];
    
    const proxyBasicContract = new ethers.Contract(proxyAddress, proxyBasicABI, provider);
    
    try {
      const implAddr = await proxyBasicContract.implementation();
      console.log(`   Current implementation: ${implAddr}`);
      console.log(`   Expected implementation: ${implAddress}`);
      console.log(`   Match: ${implAddr.toLowerCase() === implAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
    } catch (e) {
      console.log(`   ❌ Could not get implementation address: ${e.message.substring(0, 50)}`);
    }
    
    try {
      const adminAddr = await proxyBasicContract.admin();
      console.log(`   Proxy admin: ${adminAddr}`);
    } catch (e) {
      console.log(`   ❌ Could not get admin address: ${e.message.substring(0, 50)}`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    console.log('   If implementation contract works but proxy fails:');
    console.log('   1. Proxy might not be properly configured');
    console.log('   2. ABI might need to be used with proxy address but implementation ABI');
    console.log('   3. There might be proxy-specific access controls');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testImplementationContract().catch(console.error);
