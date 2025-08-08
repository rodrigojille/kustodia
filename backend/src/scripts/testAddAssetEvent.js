const { ethers } = require('ethers');
require('dotenv').config();

async function testAddAssetEvent() {
  console.log('🧪 Testing addAssetEvent contract call with actual parameters...');
  
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
  
  // Minimal ABI for addAssetEvent
  const contractABI = [
    "function addAssetEvent(uint256 tokenId, uint8 eventType, string description, uint256 transactionAmount, string[] supportingDocs, string[] customFieldKeys, string[] customFieldValues) external"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  // Test parameters (simulating what the API would send)
  const tokenId = 1;
  const eventType = 4; // INSPECTION
  const description = 'Inspection performed';
  const transactionAmount = ethers.parseEther('0'); // This might be the issue!
  const supportingDocs = [];
  const customFieldKeys = ['inspectionType', 'inspector', 'result'];
  const customFieldValues = ['Annual', 'John Doe', 'Passed'];
  
  console.log('\n📋 PARAMETERS TO SEND:');
  console.log(`   tokenId: ${tokenId}`);
  console.log(`   eventType: ${eventType}`);
  console.log(`   description: "${description}"`);
  console.log(`   transactionAmount: ${transactionAmount.toString()} (${ethers.formatEther(transactionAmount)} ETH)`);
  console.log(`   supportingDocs: [${supportingDocs.join(', ')}]`);
  console.log(`   customFieldKeys: [${customFieldKeys.join(', ')}]`);
  console.log(`   customFieldValues: [${customFieldValues.join(', ')}]`);
  
  try {
    console.log('\n🔄 Estimating gas for addAssetEvent...');
    
    // Try to estimate gas first (this will reveal the revert reason)
    const gasEstimate = await contract.addAssetEvent.estimateGas(
      tokenId,
      eventType,
      description,
      transactionAmount,
      supportingDocs,
      customFieldKeys,
      customFieldValues
    );
    
    console.log(`✅ Gas estimate successful: ${gasEstimate.toString()}`);
    console.log('✅ Contract call should succeed!');
    
    // If gas estimation succeeds, we could make the actual call
    console.log('\n⚠️  Would you like to make the actual transaction? (This script only estimates for safety)');
    
  } catch (error) {
    console.error('\n❌ Gas estimation failed - this reveals the revert reason:');
    console.error('Error:', error.message);
    
    // Try to extract more specific error information
    if (error.data) {
      console.error('Error data:', error.data);
    }
    if (error.reason) {
      console.error('Revert reason:', error.reason);
    }
    
    // Common issues to check
    console.log('\n🔍 POTENTIAL ISSUES TO CHECK:');
    console.log('   1. Token ID 1 exists and is active ✅ (confirmed earlier)');
    console.log('   2. Wallet has required roles ✅ (confirmed earlier)');
    console.log('   3. Contract is not paused ✅ (confirmed earlier)');
    console.log('   4. Parameters are valid - INVESTIGATING...');
    
    // Test with different parameter combinations
    console.log('\n🧪 TESTING PARAMETER VARIATIONS:');
    
    // Test 1: Try with different transactionAmount
    try {
      console.log('   Testing with transactionAmount = 1 wei...');
      await contract.addAssetEvent.estimateGas(
        tokenId, eventType, description, 1, supportingDocs, customFieldKeys, customFieldValues
      );
      console.log('   ✅ Works with 1 wei - issue might be with parseEther(0)');
    } catch (e) {
      console.log('   ❌ Still fails with 1 wei');
    }
    
    // Test 2: Try with empty arrays
    try {
      console.log('   Testing with empty custom fields...');
      await contract.addAssetEvent.estimateGas(
        tokenId, eventType, description, transactionAmount, supportingDocs, [], []
      );
      console.log('   ✅ Works with empty custom fields - issue might be with custom field arrays');
    } catch (e) {
      console.log('   ❌ Still fails with empty custom fields');
    }
    
    // Test 3: Try with different event type
    try {
      console.log('   Testing with MAINTENANCE event type (3)...');
      await contract.addAssetEvent.estimateGas(
        tokenId, 3, description, transactionAmount, supportingDocs, customFieldKeys, customFieldValues
      );
      console.log('   ✅ Works with MAINTENANCE type - issue might be with INSPECTION event type');
    } catch (e) {
      console.log('   ❌ Still fails with MAINTENANCE type');
    }
  }
}

testAddAssetEvent().catch(console.error);
