const { ethers } = require('ethers');
require('dotenv').config();

async function finalDiagnosis() {
  console.log('🎯 FINAL DIAGNOSIS: Testing exact revert reason for addAssetEvent...');
  
  const isMainnet = process.env.BLOCKCHAIN_NETWORK === 'mainnet';
  const rpcUrl = isMainnet ? process.env.ARBITRUM_MAINNET_RPC_URL : process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const privateKey = isMainnet ? process.env.MAINNET_PRIVATE_KEY : process.env.KUSTODIA_PRIVATE_KEY;
  const contractAddress = process.env.NFT_COMPACT_ADDRESS;
  
  console.log(`Network: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`Contract: ${contractAddress}`);
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`Wallet: ${wallet.address}`);
  
  // Use the exact ABI from AssetNFTService.ts
  const contractABI = [
    {
      "inputs": [
        {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
        {"internalType": "uint8", "name": "eventType", "type": "uint8"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "uint256", "name": "transactionAmount", "type": "uint256"},
        {"internalType": "string[]", "name": "supportingDocs", "type": "string[]"},
        {"internalType": "string[]", "name": "customFieldKeys", "type": "string[]"},
        {"internalType": "string[]", "name": "customFieldValues", "type": "string[]"}
      ],
      "name": "addAssetEvent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function paused() view returns (bool)",
    "function ownerOf(uint256 tokenId) view returns (address)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  // Test parameters - exactly as used in the API
  const tokenId = 1;
  const eventType = 4; // INSPECTION
  const description = 'Test maintenance record';
  const transactionAmount = 0;
  const supportingDocs = [];
  const customFieldKeys = ['serviceType', 'location', 'cost'];
  const customFieldValues = ['inspection', 'test location', '0'];
  
  try {
    console.log('\n📋 PRE-FLIGHT CHECKS:');
    
    // Check wallet roles
    const KUSTODIA_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KUSTODIA_ROLE"));
    const UPDATER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UPDATER_ROLE"));
    
    const hasKustodiaRole = await contract.hasRole(KUSTODIA_ROLE, wallet.address);
    const hasUpdaterRole = await contract.hasRole(UPDATER_ROLE, wallet.address);
    
    console.log(`   KUSTODIA_ROLE: ${hasKustodiaRole ? '✅ YES' : '❌ NO'}`);
    console.log(`   UPDATER_ROLE: ${hasUpdaterRole ? '✅ YES' : '❌ NO'}`);
    
    // Check contract state
    const isPaused = await contract.paused();
    console.log(`   Contract Paused: ${isPaused ? '❌ YES' : '✅ NO'}`);
    
    // Check token ownership
    const owner = await contract.ownerOf(tokenId);
    console.log(`   Token ${tokenId} Owner: ${owner}`);
    
    console.log('\n🧪 TESTING addAssetEvent WITH DETAILED ERROR:');
    console.log(`   Parameters:`);
    console.log(`     tokenId: ${tokenId}`);
    console.log(`     eventType: ${eventType}`);
    console.log(`     description: "${description}"`);
    console.log(`     transactionAmount: ${transactionAmount}`);
    console.log(`     supportingDocs: [${supportingDocs.join(', ')}]`);
    console.log(`     customFieldKeys: [${customFieldKeys.join(', ')}]`);
    console.log(`     customFieldValues: [${customFieldValues.join(', ')}]`);
    
    // Try to get detailed revert reason
    try {
      const tx = await contract.addAssetEvent.populateTransaction(
        tokenId, eventType, description, transactionAmount,
        supportingDocs, customFieldKeys, customFieldValues
      );
      
      console.log(`   Transaction data: ${tx.data}`);
      
      // Try to call it and get the revert reason
      const result = await provider.call({
        to: contractAddress,
        data: tx.data,
        from: wallet.address
      });
      
      console.log(`   ✅ SUCCESS! Result: ${result}`);
      
    } catch (error) {
      console.log(`   ❌ CALL FAILED:`);
      console.log(`      Error: ${error.message}`);
      console.log(`      Code: ${error.code}`);
      console.log(`      Data: ${error.data || 'none'}`);
      
      // Try to decode the revert reason if available
      if (error.data && error.data !== '0x') {
        try {
          const reason = ethers.toUtf8String('0x' + error.data.slice(10));
          console.log(`      Decoded reason: "${reason}"`);
        } catch (e) {
          console.log(`      Could not decode revert reason`);
        }
      }
    }
    
    console.log('\n🎯 CONCLUSION:');
    if (!hasKustodiaRole && !hasUpdaterRole) {
      console.log('   ❌ WALLET LACKS REQUIRED ROLES - This is likely the issue!');
    } else if (isPaused) {
      console.log('   ❌ CONTRACT IS PAUSED - This prevents all operations!');
    } else {
      console.log('   ⚠️  All checks pass - issue might be in contract logic or parameters');
    }
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

finalDiagnosis().catch(console.error);
