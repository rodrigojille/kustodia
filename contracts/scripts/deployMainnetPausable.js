const { ethers, upgrades, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * @title Mainnet Deployment Script for Kustodia V2 Pausable Contracts
 * @dev Deploys KustodiaEscrow2_0Pausable and UniversalAssetNFTPausable to Arbitrum Mainnet
 * @notice Uses new mainnet wallet: 0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F
 * @notice Both contracts are upgradeable and pausable for enhanced security
 */

async function main() {
    console.log("\n🚀 KUSTODIA V2 MAINNET DEPLOYMENT (PAUSABLE CONTRACTS)");
    console.log("======================================================\n");
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await deployer.getBalance();
    
    console.log("📋 Deployment Configuration:");
    console.log(`   Deployer: ${deployerAddress}`);
    console.log(`   Balance: ${ethers.utils.formatEther(balance)} ETH`);
    console.log(`   Network: ${network.name}`);
    console.log(`   Chain ID: ${network.config.chainId}\n`);
    
    // Verify minimum balance
    const minBalance = ethers.utils.parseEther("0.05");
    if (balance.lt(minBalance)) {
        throw new Error(`❌ Insufficient balance. Need at least 0.05 ETH, have ${ethers.utils.formatEther(balance)} ETH`);
    }
    
    // New mainnet wallet address
    const MAINNET_WALLET = "0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F";
    
    console.log(`🎯 Target Wallet: ${MAINNET_WALLET}\n`);
    
    // Deployment data storage
    const deploymentData = {
        network: network.name,
        chainId: network.config.chainId,
        deployer: deployerAddress,
        mainnetWallet: MAINNET_WALLET,
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    // ========================================
    // 1. DEPLOY KUSTODIA ESCROW 2.0 PAUSABLE (UPGRADEABLE)
    // ========================================
    
    console.log("📦 1. Deploying KustodiaEscrow2_0Pausable (Upgradeable Proxy)...");
    
    const KustodiaEscrowFactory = await ethers.getContractFactory("KustodiaEscrow2_0Pausable");
    
    // Deploy upgradeable proxy
    const escrowDeployTx = await upgrades.deployProxy(
        KustodiaEscrowFactory,
        [MAINNET_WALLET, MAINNET_WALLET], // bridgeWallet, platformWallet
        { 
            initializer: "initialize",
            kind: "uups"
        }
    );
    
    await escrowDeployTx.deployed();
    const escrowAddress = escrowDeployTx.address;
    
    console.log(`   ✅ KustodiaEscrow2_0Pausable Proxy deployed to: ${escrowAddress}`);
    
    // Get implementation address
    const escrowImplAddress = await upgrades.erc1967.getImplementationAddress(escrowAddress);
    console.log(`   📋 Implementation address: ${escrowImplAddress}`);
    
    // Verify deployment parameters
    const escrowContract = await ethers.getContractAt("KustodiaEscrow2_0Pausable", escrowAddress);
    const bridgeWallet = await escrowContract.bridgeWallet();
    const platformWallet = await escrowContract.platformWallet();
    const isPaused = await escrowContract.paused();
    
    console.log(`   🔍 Bridge Wallet: ${bridgeWallet}`);
    console.log(`   🔍 Platform Wallet: ${platformWallet}`);
    console.log(`   🔍 Paused: ${isPaused}`);
    
    if (bridgeWallet !== MAINNET_WALLET || platformWallet !== MAINNET_WALLET) {
        throw new Error("❌ Escrow wallet configuration mismatch!");
    }
    
    deploymentData.contracts.escrow = {
        name: "KustodiaEscrow2_0Pausable",
        proxy: escrowAddress,
        implementation: escrowImplAddress,
        bridgeWallet: bridgeWallet,
        platformWallet: platformWallet,
        isPausable: true,
        deploymentTx: escrowDeployTx.deployTransaction.hash
    };

    // ========================================
    // 2. DEPLOY UNIVERSAL ASSET NFT PAUSABLE (UPGRADEABLE)
    // ========================================
    
    console.log("\n📦 2. Deploying UniversalAssetNFTPausable (Upgradeable Proxy)...");
    
    const UniversalAssetNFTFactory = await ethers.getContractFactory("UniversalAssetNFTPausable");
    
    // Deploy upgradeable proxy
    const nftDeployTx = await upgrades.deployProxy(
        UniversalAssetNFTFactory,
        [
            "Kustodia Universal Asset", // name
            "KUA",                      // symbol
            MAINNET_WALLET              // admin
        ],
        { 
            initializer: "initialize",
            kind: "uups"
        }
    );
    
    await nftDeployTx.deployed();
    const nftAddress = nftDeployTx.address;
    
    console.log(`   ✅ UniversalAssetNFTPausable Proxy deployed to: ${nftAddress}`);
    
    // Get implementation address
    const nftImplAddress = await upgrades.erc1967.getImplementationAddress(nftAddress);
    console.log(`   📋 Implementation address: ${nftImplAddress}`);
    
    // Verify deployment parameters
    const nftContract = await ethers.getContractAt("UniversalAssetNFTPausable", nftAddress);
    const KUSTODIA_ROLE = await nftContract.KUSTODIA_ROLE();
    const PAUSER_ROLE = await nftContract.PAUSER_ROLE();
    const DEFAULT_ADMIN_ROLE = await nftContract.DEFAULT_ADMIN_ROLE();
    
    const hasKustodiaRole = await nftContract.hasRole(KUSTODIA_ROLE, MAINNET_WALLET);
    const hasPauserRole = await nftContract.hasRole(PAUSER_ROLE, MAINNET_WALLET);
    const hasAdminRole = await nftContract.hasRole(DEFAULT_ADMIN_ROLE, MAINNET_WALLET);
    const nftIsPaused = await nftContract.paused();
    
    console.log(`   🔍 Admin Role: ${hasAdminRole}`);
    console.log(`   🔍 Kustodia Role: ${hasKustodiaRole}`);
    console.log(`   🔍 Pauser Role: ${hasPauserRole}`);
    console.log(`   🔍 Paused: ${nftIsPaused}`);
    
    if (!hasKustodiaRole || !hasPauserRole || !hasAdminRole) {
        throw new Error("❌ NFT role assignment failed!");
    }
    
    deploymentData.contracts.nft = {
        name: "UniversalAssetNFTPausable",
        proxy: nftAddress,
        implementation: nftImplAddress,
        admin: MAINNET_WALLET,
        isPausable: true,
        roles: {
            DEFAULT_ADMIN_ROLE: MAINNET_WALLET,
            KUSTODIA_ROLE: MAINNET_WALLET,
            PAUSER_ROLE: MAINNET_WALLET
        },
        deploymentTx: nftDeployTx.deployTransaction.hash
    };

    // ========================================
    // 3. VERIFY CONTRACTS ON ARBISCAN
    // ========================================
    
    console.log("\n🔍 3. Verifying contracts on Arbiscan...");
    
    try {
        // Wait a bit for contracts to be indexed
        console.log("   ⏳ Waiting for contracts to be indexed...");
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
        
        // Verify Escrow Implementation
        console.log("   📋 Verifying KustodiaEscrow2_0Pausable implementation...");
        try {
            await run("verify:verify", {
                address: escrowImplAddress,
                constructorArguments: []
            });
            console.log(`   ✅ Escrow implementation verified`);
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log(`   ✅ Escrow implementation already verified`);
            } else {
                console.log(`   ⚠️  Escrow implementation verification failed: ${error.message}`);
            }
        }
        
        // Verify NFT Implementation
        console.log("   📋 Verifying UniversalAssetNFTPausable implementation...");
        try {
            await run("verify:verify", {
                address: nftImplAddress,
                constructorArguments: []
            });
            console.log(`   ✅ NFT implementation verified`);
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log(`   ✅ NFT implementation already verified`);
            } else {
                console.log(`   ⚠️  NFT implementation verification failed: ${error.message}`);
            }
        }
        
        deploymentData.verification = {
            escrowImplementation: escrowImplAddress,
            nftImplementation: nftImplAddress,
            verifiedAt: new Date().toISOString()
        };
        
    } catch (error) {
        console.log(`   ⚠️  Verification process failed: ${error.message}`);
        console.log(`   📝 You can verify manually later using the verification script`);
    }
    
    // ========================================
    // 4. SAVE DEPLOYMENT DATA
    // ========================================
    
    console.log("\n💾 4. Saving deployment data...");
    
    const deploymentFile = path.join(__dirname, "..", "deployment-mainnet-pausable.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    
    console.log(`   ✅ Deployment data saved to: ${deploymentFile}`);
    
    // ========================================
    // 5. GENERATE ENVIRONMENT TEMPLATE
    // ========================================
    
    console.log("\n📝 5. Generating environment template...");
    
    const envTemplate = `# Kustodia V2 Pausable Contracts - Mainnet Environment Variables
# Generated on ${new Date().toISOString()}

# Contract Addresses (Deployed)
ESCROW_CONTRACT_ADDRESS=${escrowAddress}
NFT_CONTRACT_ADDRESS=${nftAddress}

# Implementation Addresses (for reference)
ESCROW_IMPLEMENTATION_ADDRESS=${escrowImplAddress}
NFT_IMPLEMENTATION_ADDRESS=${nftImplAddress}

# Network Configuration
ARBITRUM_MAINNET_RPC_URL=https://arb1.arbitrum.io/rpc
CHAIN_ID=42161

# Wallet Configuration
MAINNET_WALLET_ADDRESS=${MAINNET_WALLET}
BRIDGE_WALLET_ADDRESS=${MAINNET_WALLET}
PLATFORM_WALLET_ADDRESS=${MAINNET_WALLET}

# Contract Verification
ARBISCAN_API_KEY=your_arbiscan_api_key_here

# Token Integration
MXNB_TOKEN_ADDRESS=0xf197ffc28c23e0309b5559e7a166f2c6164c80aa

# Role Addresses
ADMIN_ADDRESS=${MAINNET_WALLET}
PAUSER_ADDRESS=${MAINNET_WALLET}

# Security Features
CONTRACTS_ARE_PAUSABLE=true
CONTRACTS_ARE_UPGRADEABLE=true

# Optional: Arbiscan API Key for verification
# ARBISCAN_API_KEY=your_api_key_here

`;
    
    const envFile = path.join(__dirname, "..", ".env.mainnet.pausable");
    fs.writeFileSync(envFile, envTemplate);
    
    console.log(`   ✅ Environment template saved to: ${envFile}`);
    
    // ========================================
    // 6. DEPLOYMENT SUMMARY
    // ========================================
    
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=====================================\n");
    
    console.log("📋 Contract Addresses (Pausable & Upgradeable):");
    console.log(`   KustodiaEscrow2_0Pausable Proxy: ${escrowAddress}`);
    console.log(`   KustodiaEscrow2_0Pausable Impl:  ${escrowImplAddress}`);
    console.log(`   UniversalAssetNFTPausable Proxy: ${nftAddress}`);
    console.log(`   UniversalAssetNFTPausable Impl:  ${nftImplAddress}\n`);
    
    console.log("🔑 Wallet Configuration:");
    console.log(`   Bridge Wallet:   ${MAINNET_WALLET}`);
    console.log(`   Platform Wallet: ${MAINNET_WALLET}`);
    console.log(`   NFT Admin:       ${MAINNET_WALLET}\n`);
    
    console.log("🛡️  Security Features:");
    console.log(`   ✅ Both contracts are PAUSABLE`);
    console.log(`   ✅ Both contracts are UPGRADEABLE`);
    console.log(`   ✅ Role-based access control`);
    console.log(`   ✅ Reentrancy protection\n`);
    
    console.log("⚡ Gas Usage Summary:");
    console.log(`   Escrow Deployment: ${escrowDeployTx.deployTransaction.gasLimit?.toString() || 'N/A'}`);
    console.log(`   NFT Deployment:    ${nftDeployTx.deployTransaction.gasLimit?.toString() || 'N/A'}\n`);
    
    console.log("📝 Next Steps:");
    console.log("   1. Provide MXNB token address for environment configuration");
    console.log("   2. Update backend .env with new contract addresses");
    console.log("   3. Update frontend contract configurations");
    console.log("   4. Test pause/unpause functionality");
    console.log("   5. Test contract interactions on mainnet");
    console.log("   6. Monitor contract usage and security\n");
    
    console.log("🔗 Useful Links:");
    console.log(`   Arbiscan Escrow: https://arbiscan.io/address/${escrowAddress}`);
    console.log(`   Arbiscan NFT:    https://arbiscan.io/address/${nftAddress}`);
    console.log(`   Escrow Impl:     https://arbiscan.io/address/${escrowImplAddress}`);
    console.log(`   NFT Impl:        https://arbiscan.io/address/${nftImplAddress}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
