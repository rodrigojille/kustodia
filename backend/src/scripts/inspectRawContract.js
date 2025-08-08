const { ethers } = require('ethers');
require('dotenv').config();

async function inspectRawContract() {
  console.log('🔍 Inspecting raw contract data to identify ABI mismatch...');
  
  // Get network configuration
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const contractAddress = process.env.NFT_COMPACT_ADDRESS;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`Contract: ${contractAddress}`);
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const tokenId = 1;
  
  try {
    console.log('\n📋 RAW CONTRACT CALL ANALYSIS:');
    
    // Try to call getAsset with raw data
    console.log('1. Testing getAsset function signature...');
    try {
      // getAsset(uint256) function selector: 0x5be7fde8
      const getAssetSelector = '0x5be7fde8';
      const tokenIdHex = ethers.zeroPadValue(ethers.toBeHex(tokenId), 32);
      const callData = getAssetSelector + tokenIdHex.slice(2);
      
      console.log(`   Call data: ${callData}`);
      
      const result = await provider.call({
        to: contractAddress,
        data: callData
      });
      
      console.log(`   Raw result: ${result}`);
      console.log(`   Result length: ${result.length} characters (${(result.length - 2) / 2} bytes)`);
      
      // Try to decode as different possible struct formats
      console.log('\n   🧪 TRYING DIFFERENT STRUCT FORMATS:');
      
      // Format 1: (string, uint8, address, bool, uint256, uint256, string)
      try {
        const decoded1 = ethers.AbiCoder.defaultAbiCoder().decode(
          ['string', 'uint8', 'address', 'bool', 'uint256', 'uint256', 'string'],
          result
        );
        console.log('   ✅ Format 1 SUCCESS:', decoded1);
      } catch (e) {
        console.log('   ❌ Format 1 failed:', e.message.substring(0, 100));
      }
      
      // Format 2: (string, uint8, address, uint256, uint256, bool, string)
      try {
        const decoded2 = ethers.AbiCoder.defaultAbiCoder().decode(
          ['string', 'uint8', 'address', 'uint256', 'uint256', 'bool', 'string'],
          result
        );
        console.log('   ✅ Format 2 SUCCESS:', decoded2);
      } catch (e) {
        console.log('   ❌ Format 2 failed:', e.message.substring(0, 100));
      }
      
      // Format 3: Just the basic fields
      try {
        const decoded3 = ethers.AbiCoder.defaultAbiCoder().decode(
          ['string', 'uint8', 'address', 'bool', 'uint256', 'uint256'],
          result
        );
        console.log('   ✅ Format 3 SUCCESS:', decoded3);
      } catch (e) {
        console.log('   ❌ Format 3 failed:', e.message.substring(0, 100));
      }
      
    } catch (error) {
      console.log(`   ❌ getAsset call failed: ${error.message}`);
    }
    
    // Try to call getAssetEventCount
    console.log('\n2. Testing getAssetEventCount function signature...');
    try {
      // getAssetEventCount(uint256) function selector: 0x73eeab25
      const getEventCountSelector = '0x73eeab25';
      const tokenIdHex = ethers.zeroPadValue(ethers.toBeHex(tokenId), 32);
      const callData = getEventCountSelector + tokenIdHex.slice(2);
      
      console.log(`   Call data: ${callData}`);
      
      const result = await provider.call({
        to: contractAddress,
        data: callData
      });
      
      console.log(`   Raw result: ${result}`);
      
      if (result && result !== '0x') {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], result);
        console.log(`   ✅ Event count: ${decoded[0].toString()}`);
      }
      
    } catch (error) {
      console.log(`   ❌ getAssetEventCount call failed: ${error.message}`);
    }
    
    // Try to call addAssetEvent with minimal parameters to see what fails
    console.log('\n3. Testing addAssetEvent function signature...');
    try {
      // addAssetEvent function selector: 0xbb6d85cb
      console.log('   Function exists in ABI, but parameters might be wrong');
      console.log('   Previous test showed it fails with "missing revert data"');
      console.log('   This suggests the function exists but has internal validation failures');
    } catch (error) {
      console.log(`   ❌ addAssetEvent analysis failed: ${error.message}`);
    }
    
    console.log('\n🔍 CONCLUSION:');
    console.log('   The contract functions exist but return data in unexpected formats.');
    console.log('   This indicates the deployed contract has different struct definitions');
    console.log('   than what our ABI artifact expects.');
    
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  }
}

inspectRawContract().catch(console.error);
