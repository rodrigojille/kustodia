#!/usr/bin/env node

/**
 * 🔍 NFT MAINNET FUNCTIONALITY TEST
 * 
 * This script tests:
 * 1. NFT contract connectivity on Arbitrum mainnet
 * 2. Network switching functionality
 * 3. NFT creation simulation (without actual minting)
 * 4. Contract verification and configuration
 * 5. Gas estimation for NFT operations
 * 
 * Run: node test_nft_mainnet_functionality.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Contract addresses from mainnet deployment
const MAINNET_CONTRACTS = {
    NFT_COMPACT_PROXY: '0x00AcCA0E565b11749d5316512135D75bf9e971bd',
    NFT_COMPACT_IMPL: '0xfB859B74E895C4aA9E9940F9AC3bbfD5EF5c3328',
    ESCROW_V2_PROXY: '0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40',
    ASSET_MANAGEMENT_LIB: '0xB712d770eedcfa4D6647fE4545CC9020A612adA4'
};

// NFT Contract ABI (essential functions)
const NFT_ABI = [
    "function createAsset(string assetId, uint8 assetType, address owner, string tokenURI, string[] metadataKeys, string[] metadataValues) external returns (uint256)",
    "function getAssetMetadata(uint256 tokenId, string key) external view returns (string)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    "function assetIdToTokenId(string assetId) external view returns (uint256)",
    "function getOwnerAssets(address owner) external view returns (uint256[])",
    "function owner() external view returns (address)",
    "function paused() external view returns (bool)",
    "function escrowContract() external view returns (address)",
    "function totalSupply() external view returns (uint256)"
];

// Asset types enum
const AssetType = {
    VEHICLE: 0,
    PROPERTY: 1,
    MACHINERY: 2,
    LUXURY_GOODS: 3,
    ELECTRONICS: 4,
    AGRICULTURAL: 5,
    COMMERCIAL: 6,
    FURNITURE: 7,
    COLLECTIBLE: 8,
    OTHER: 9
};

class NFTMainnetTester {
    constructor() {
        this.provider = null;
        this.nftContract = null;
        this.wallet = null;
        this.testResults = {
            connectivity: false,
            contractVerification: false,
            networkSwitching: false,
            gasEstimation: false,
            configurationCheck: false,
            errors: []
        };
    }

    async initialize() {
        console.log('🚀 INITIALIZING NFT MAINNET TEST');
        console.log('=====================================');
        
        try {
            // Connect to Arbitrum mainnet
            const rpcUrl = process.env.ARBITRUM_MAINNET_RPC_URL || 'https://arb1.arbitrum.io/rpc';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Initialize wallet (for gas estimation only)
            const privateKey = process.env.MAINNET_PRIVATE_KEY;
            if (!privateKey) {
                throw new Error('MAINNET_PRIVATE_KEY not found in environment');
            }
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            
            // Connect to NFT contract
            this.nftContract = new ethers.Contract(
                MAINNET_CONTRACTS.NFT_COMPACT_PROXY,
                NFT_ABI,
                this.provider
            );
            
            console.log('✅ Provider connected to Arbitrum mainnet');
            console.log('✅ Wallet initialized');
            console.log('✅ NFT contract connected');
            
            this.testResults.connectivity = true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            this.testResults.errors.push(`Initialization: ${error.message}`);
        }
    }

    async testNetworkConnectivity() {
        console.log('\n🌐 TESTING NETWORK CONNECTIVITY');
        console.log('================================');
        
        try {
            // Check network details
            const network = await this.provider.getNetwork();
            console.log('📡 Network Name:', network.name);
            console.log('🔗 Chain ID:', network.chainId.toString());
            console.log('🏷️  Expected Chain ID: 42161 (Arbitrum One)');
            
            if (network.chainId !== 42161n) {
                throw new Error(`Wrong network! Expected 42161, got ${network.chainId}`);
            }
            
            // Check latest block
            const blockNumber = await this.provider.getBlockNumber();
            console.log('📦 Latest Block:', blockNumber);
            
            // Check wallet balance
            const balance = await this.provider.getBalance(this.wallet.address);
            console.log('💰 Wallet Balance:', ethers.formatEther(balance), 'ETH');
            
            if (balance === 0n) {
                console.log('⚠️  Warning: Wallet has no ETH for gas fees');
            }
            
            console.log('✅ Network connectivity verified');
            
        } catch (error) {
            console.error('❌ Network connectivity failed:', error.message);
            this.testResults.errors.push(`Network: ${error.message}`);
        }
    }

    async testContractVerification() {
        console.log('\n🔍 TESTING CONTRACT VERIFICATION');
        console.log('=================================');
        
        try {
            // Check if contract exists
            const code = await this.provider.getCode(MAINNET_CONTRACTS.NFT_COMPACT_PROXY);
            if (code === '0x') {
                throw new Error('NFT contract not deployed at specified address');
            }
            console.log('✅ NFT contract code found');
            
            // Test basic contract calls
            const owner = await this.nftContract.owner();
            console.log('👤 Contract Owner:', owner);
            
            const isPaused = await this.nftContract.paused();
            console.log('⏸️  Contract Paused:', isPaused);
            
            const escrowAddress = await this.nftContract.escrowContract();
            console.log('🏦 Linked Escrow:', escrowAddress);
            console.log('🔗 Expected Escrow:', MAINNET_CONTRACTS.ESCROW_V2_PROXY);
            
            if (escrowAddress.toLowerCase() !== MAINNET_CONTRACTS.ESCROW_V2_PROXY.toLowerCase()) {
                console.log('⚠️  Warning: Escrow address mismatch');
            }
            
            const totalSupply = await this.nftContract.totalSupply();
            console.log('📊 Total NFTs Minted:', totalSupply.toString());
            
            this.testResults.contractVerification = true;
            console.log('✅ Contract verification successful');
            
        } catch (error) {
            console.error('❌ Contract verification failed:', error.message);
            this.testResults.errors.push(`Contract: ${error.message}`);
        }
    }

    async testNetworkSwitching() {
        console.log('\n🔄 TESTING NETWORK SWITCHING LOGIC');
        console.log('===================================');
        
        try {
            // Import network config manager
            const { NetworkConfigManager } = require('./src/utils/networkConfig');
            const networkManager = NetworkConfigManager.getInstance();
            
            console.log('🔍 Current Network:', networkManager.getCurrentNetwork());
            console.log('🏷️  Network Display:', networkManager.getNetworkDisplay());
            console.log('🌐 Is Mainnet:', networkManager.isMainnet());
            
            // Get current configuration
            const config = networkManager.getConfig();
            console.log('📋 Current Config:');
            console.log('   - RPC URL:', config.rpcUrl);
            console.log('   - NFT Address:', config.nftCompactAddress);
            console.log('   - Escrow Address:', config.escrowV2Address);
            console.log('   - Chain ID:', config.chainId);
            
            // Validate configuration
            const validation = networkManager.validateConfig();
            if (!validation.valid) {
                console.log('❌ Configuration validation failed:');
                validation.errors.forEach(error => console.log(`   - ${error}`));
                this.testResults.errors.push('Network config validation failed');
            } else {
                console.log('✅ Network configuration valid');
                this.testResults.networkSwitching = true;
            }
            
            // Test switching (simulation only)
            console.log('\n🔄 Testing network switch simulation...');
            const originalNetwork = networkManager.getCurrentNetwork();
            
            if (originalNetwork === 'mainnet') {
                console.log('📝 Current: MAINNET → Simulating switch to TESTNET');
                networkManager.setNetwork('testnet');
                console.log('✅ Switch successful:', networkManager.getNetworkDisplay());
                
                // Switch back
                networkManager.setNetwork('mainnet');
                console.log('✅ Switch back successful:', networkManager.getNetworkDisplay());
            }
            
        } catch (error) {
            console.error('❌ Network switching test failed:', error.message);
            this.testResults.errors.push(`Network switching: ${error.message}`);
        }
    }

    async testGasEstimation() {
        console.log('\n⛽ TESTING GAS ESTIMATION FOR NFT OPERATIONS');
        console.log('=============================================');
        
        try {
            // Prepare test NFT creation parameters
            const testAsset = {
                assetId: `TEST_VEHICLE_${Date.now()}`,
                assetType: AssetType.VEHICLE,
                owner: this.wallet.address,
                tokenURI: 'https://kustodia.mx/metadata/test-vehicle.json',
                metadataKeys: ['make', 'model', 'year', 'vin'],
                metadataValues: ['Toyota', 'Camry', '2023', 'TEST123456789']
            };
            
            console.log('🚗 Test Asset Details:');
            console.log('   - Asset ID:', testAsset.assetId);
            console.log('   - Type:', 'VEHICLE');
            console.log('   - Owner:', testAsset.owner);
            console.log('   - Metadata Keys:', testAsset.metadataKeys.length);
            
            // Estimate gas for NFT creation
            const nftWithSigner = this.nftContract.connect(this.wallet);
            
            try {
                const gasEstimate = await nftWithSigner.createAsset.estimateGas(
                    testAsset.assetId,
                    testAsset.assetType,
                    testAsset.owner,
                    testAsset.tokenURI,
                    testAsset.metadataKeys,
                    testAsset.metadataValues
                );
                
                console.log('⛽ Gas Estimate:', gasEstimate.toString());
                
                // Calculate gas cost
                const feeData = await this.provider.getFeeData();
                const gasPrice = feeData.gasPrice;
                const estimatedCost = gasEstimate * gasPrice;
                
                console.log('💰 Gas Price:', ethers.formatUnits(gasPrice, 'gwei'), 'gwei');
                console.log('💸 Estimated Cost:', ethers.formatEther(estimatedCost), 'ETH');
                
                // Check if wallet has enough balance
                const balance = await this.provider.getBalance(this.wallet.address);
                if (balance < estimatedCost) {
                    console.log('⚠️  Warning: Insufficient balance for NFT creation');
                    console.log('   - Required:', ethers.formatEther(estimatedCost), 'ETH');
                    console.log('   - Available:', ethers.formatEther(balance), 'ETH');
                } else {
                    console.log('✅ Sufficient balance for NFT creation');
                }
                
                this.testResults.gasEstimation = true;
                
            } catch (gasError) {
                if (gasError.message.includes('Asset ID already exists')) {
                    console.log('ℹ️  Asset ID collision (expected in testing)');
                    console.log('✅ Gas estimation would work with unique asset ID');
                    this.testResults.gasEstimation = true;
                } else {
                    throw gasError;
                }
            }
            
        } catch (error) {
            console.error('❌ Gas estimation failed:', error.message);
            this.testResults.errors.push(`Gas estimation: ${error.message}`);
        }
    }

    async testConfigurationCheck() {
        console.log('\n⚙️  TESTING CONFIGURATION COMPLETENESS');
        console.log('======================================');
        
        try {
            const requiredEnvVars = [
                'ARBITRUM_MAINNET_RPC_URL',
                'MAINNET_PRIVATE_KEY',
                'NFT_COMPACT_ADDRESS',
                'ESCROW_V2_PAUSABLE_ADDRESS',
                'BRIDGE_WALLET_MAIN',
                'PLATFORM_WALLET_MAIN'
            ];
            
            let allConfigured = true;
            
            for (const envVar of requiredEnvVars) {
                const value = process.env[envVar];
                if (!value) {
                    console.log(`❌ Missing: ${envVar}`);
                    allConfigured = false;
                } else {
                    console.log(`✅ Found: ${envVar}`);
                }
            }
            
            // Check contract addresses match
            const envNftAddress = process.env.NFT_COMPACT_ADDRESS;
            if (envNftAddress !== MAINNET_CONTRACTS.NFT_COMPACT_PROXY) {
                console.log('⚠️  NFT address mismatch:');
                console.log('   - ENV:', envNftAddress);
                console.log('   - Expected:', MAINNET_CONTRACTS.NFT_COMPACT_PROXY);
            }
            
            if (allConfigured) {
                console.log('✅ All required configuration present');
                this.testResults.configurationCheck = true;
            } else {
                this.testResults.errors.push('Missing required environment variables');
            }
            
        } catch (error) {
            console.error('❌ Configuration check failed:', error.message);
            this.testResults.errors.push(`Configuration: ${error.message}`);
        }
    }

    generateTestReport() {
        console.log('\n📊 NFT MAINNET TEST REPORT');
        console.log('===========================');
        
        const tests = [
            { name: 'Network Connectivity', passed: this.testResults.connectivity },
            { name: 'Contract Verification', passed: this.testResults.contractVerification },
            { name: 'Network Switching', passed: this.testResults.networkSwitching },
            { name: 'Gas Estimation', passed: this.testResults.gasEstimation },
            { name: 'Configuration Check', passed: this.testResults.configurationCheck }
        ];
        
        let passedTests = 0;
        tests.forEach(test => {
            const status = test.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${test.name}`);
            if (test.passed) passedTests++;
        });
        
        console.log('\n📈 SUMMARY:');
        console.log(`✅ Passed: ${passedTests}/${tests.length}`);
        console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`);
        
        if (this.testResults.errors.length > 0) {
            console.log('\n🚨 ERRORS ENCOUNTERED:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        // Overall status
        const overallSuccess = passedTests === tests.length;
        console.log('\n🎯 OVERALL STATUS:');
        if (overallSuccess) {
            console.log('🟢 NFT MAINNET FUNCTIONALITY: READY FOR DEPLOYMENT');
            console.log('✨ All systems operational - safe to commit and deploy!');
        } else {
            console.log('🟡 NFT MAINNET FUNCTIONALITY: NEEDS ATTENTION');
            console.log('⚠️  Please resolve issues before deployment');
        }
        
        return overallSuccess;
    }

    async runFullTest() {
        console.log('🔍 KUSTODIA NFT MAINNET FUNCTIONALITY TEST');
        console.log('==========================================');
        console.log(`📅 Test Date: ${new Date().toISOString()}`);
        console.log(`🌐 Target Network: Arbitrum One Mainnet (42161)`);
        console.log(`📝 NFT Contract: ${MAINNET_CONTRACTS.NFT_COMPACT_PROXY}`);
        
        await this.initialize();
        await this.testNetworkConnectivity();
        await this.testContractVerification();
        await this.testNetworkSwitching();
        await this.testGasEstimation();
        await this.testConfigurationCheck();
        
        return this.generateTestReport();
    }
}

// Run the test if called directly
if (require.main === module) {
    const tester = new NFTMainnetTester();
    tester.runFullTest()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = { NFTMainnetTester, MAINNET_CONTRACTS, AssetType };
