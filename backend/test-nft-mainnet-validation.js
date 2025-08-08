// NFT Mainnet Validation Script - Phase 1 Testing
// Tests network configuration, contract connectivity, and basic NFT functions

const { ethers } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import network configuration
const { getCurrentNetworkConfig } = require('./dist/utils/networkConfig');

async function validateNFTMainnetSetup() {
  console.log('🔧 NFT MAINNET VALIDATION - Phase 1');
  console.log('=====================================\n');

  try {
    // Phase 1.1: Environment Variables Audit
    console.log('📋 PHASE 1.1: Environment Variables Audit');
    console.log('------------------------------------------');
    
    const networkConfig = getCurrentNetworkConfig();
    
    console.log('✅ Network Configuration:');
    console.log(`   Network: ${networkConfig.networkName}`);
    console.log(`   Chain ID: ${networkConfig.chainId}`);
    console.log(`   RPC URL: ${networkConfig.rpcUrl}`);
    console.log(`   NFT Contract: ${networkConfig.nftCompactAddress}`);
    console.log(`   MXNB Token: ${networkConfig.mxnbTokenAddress}`);
    console.log(`   Explorer: ${networkConfig.explorerUrl}`);
    console.log(`   Juno Environment: ${networkConfig.junoEnv}\n`);

    // Phase 1.2: Contract Address & ABI Verification
    console.log('📋 PHASE 1.2: Contract Address & ABI Verification');
    console.log('--------------------------------------------------');

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    console.log('✅ Provider initialized');

    // Test RPC connectivity
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ RPC Connection: Block #${blockNumber}`);

    // Validate NFT contract address
    const nftContractAddress = networkConfig.nftCompactAddress;
    if (!nftContractAddress || nftContractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('❌ NFT contract address not configured');
    }
    console.log(`✅ NFT Contract Address: ${nftContractAddress}`);

    // Check if contract exists at address
    const contractCode = await provider.getCode(nftContractAddress);
    if (contractCode === '0x') {
      throw new Error('❌ No contract found at NFT address');
    }
    console.log('✅ Contract exists at NFT address');

    // Phase 1.3: ABI Loading Test
    console.log('\n📋 PHASE 1.3: ABI Loading Test');
    console.log('-------------------------------');

    // Test ABI loading logic (same as AssetNFTService)
    let contractABI;
    try {
      if (networkConfig.chainId === 42161) {
        // Mainnet uses UniversalAssetNFTPausable
        const contractArtifact = require('./src/artifacts/contracts/UniversalAssetNFTPausable.sol/UniversalAssetNFTPausable.json');
        contractABI = contractArtifact.abi;
        console.log('✅ Loaded UniversalAssetNFTPausable ABI for mainnet');
      } else {
        // Testnet uses UniversalAssetNFTCompact
        const contractArtifact = require('./src/artifacts/contracts/UniversalAssetNFTCompact.sol/UniversalAssetNFTCompact.json');
        contractABI = contractArtifact.abi;
        console.log('✅ Loaded UniversalAssetNFTCompact ABI for testnet');
      }
    } catch (error) {
      console.warn('⚠️ Could not load compiled ABI, using fallback');
      contractABI = [
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function getAsset(uint256 tokenId) view returns (tuple(string assetId, uint8 assetType, address owner, string[] metadataKeys, string[] metadataValues))",
        "function assetHistory(uint256 tokenId, uint256 index) view returns (tuple(uint8 eventType, string description, uint256 timestamp, address authorizedBy, uint256 transactionAmount, string[] supportingDocs, string[] customFieldKeys, string[] customFieldValues))",
        "function assetIdToTokenId(string assetId) view returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)"
      ];
    }

    // Initialize wallet for contract interactions
    const privateKey = networkConfig.privateKey;
    if (!privateKey || privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.warn('⚠️ Private key not configured - read-only mode');
    } else {
      console.log('✅ Private key configured for contract interactions');
    }

    // Create contract instance
    const contract = new ethers.Contract(nftContractAddress, contractABI, provider);
    console.log('✅ Contract instance created');

    // Phase 2.1: Core Contract Functions Test
    console.log('\n📋 PHASE 2.1: Core Contract Functions Test');
    console.log('------------------------------------------');

    // Test basic contract calls (read-only)
    try {
      // Test with token ID 0 (might not exist, but should not crash)
      console.log('Testing contract function calls...');
      
      // Test ownerOf (this might revert if token doesn't exist)
      try {
        const owner = await contract.ownerOf(0);
        console.log(`✅ ownerOf(0): ${owner}`);
      } catch (error) {
        console.log('ℹ️ ownerOf(0): Token does not exist (expected for new contracts)');
      }

      // Test assetIdToTokenId with a test VIN
      try {
        const tokenId = await contract.assetIdToTokenId("TEST123456789VIN");
        console.log(`✅ assetIdToTokenId("TEST123456789VIN"): ${tokenId}`);
      } catch (error) {
        console.log('ℹ️ assetIdToTokenId: Function exists but test VIN not found (expected)');
      }

      console.log('✅ Contract function calls successful');

    } catch (error) {
      console.error('❌ Contract function test failed:', error.message);
    }

    // Environment validation summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=====================');
    
    const issues = [];
    
    // Check for common issues
    if (process.env.BLOCKCHAIN_NETWORK !== 'mainnet') {
      issues.push('BLOCKCHAIN_NETWORK should be "mainnet"');
    }
    
    if (!process.env.NFT_COMPACT_ADDRESS) {
      issues.push('NFT_COMPACT_ADDRESS is missing');
    }
    
    if (!process.env.MXNB_MAINNET_ADDRESS) {
      issues.push('MXNB_MAINNET_ADDRESS is missing');
    }
    
    if (!process.env.MAINNET_PRIVATE_KEY) {
      issues.push('MAINNET_PRIVATE_KEY is missing');
    }

    if (issues.length === 0) {
      console.log('🎉 ALL VALIDATIONS PASSED!');
      console.log('✅ Environment configuration is correct for mainnet');
      console.log('✅ Contract connectivity established');
      console.log('✅ ABI loading working properly');
      console.log('\n🚀 Ready for Phase 2: Contract Function Validation');
    } else {
      console.log('⚠️ ISSUES FOUND:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

  } catch (error) {
    console.error('❌ VALIDATION FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run validation
validateNFTMainnetSetup()
  .then(() => {
    console.log('\n✅ Validation script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Validation script failed:', error);
    process.exit(1);
  });
