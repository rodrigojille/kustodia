const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying UniversalAssetNFTPausable to Arbitrum Mainnet...");
    console.log("===============================================");

    // Configuration
    const ESCROW_V2_ADDRESS = process.env.ESCROW_V2_PAUSABLE_ADDRESS || ""; // Set this after escrow deployment
    
    if (!ESCROW_V2_ADDRESS) {
        console.log("⚠️  ESCROW_V2_PAUSABLE_ADDRESS not set in .env");
        console.log("   Please deploy EscrowV2 first and add the address to .env");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy UniversalAssetNFTPausable
    console.log("\n📦 Deploying UniversalAssetNFTPausable...");
    const UniversalAssetNFTPausable = await ethers.getContractFactory("UniversalAssetNFTPausable");
    
    const nftProxy = await upgrades.deployProxy(
        UniversalAssetNFTPausable,
        [ESCROW_V2_ADDRESS],
        { 
            initializer: 'initialize',
            kind: 'uups'
        }
    );

    await nftProxy.waitForDeployment();
    const proxyAddress = await nftProxy.getAddress();
    console.log("✅ UniversalAssetNFTPausable deployed to:", proxyAddress);

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📋 Implementation address:", implementationAddress);

    // Verify roles
    console.log("\n🔐 Verifying roles...");
    const DEFAULT_ADMIN_ROLE = await nftProxy.DEFAULT_ADMIN_ROLE();
    const PAUSER_ROLE = await nftProxy.PAUSER_ROLE();
    const KUSTODIA_ROLE = await nftProxy.KUSTODIA_ROLE();
    
    const hasAdminRole = await nftProxy.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasPauserRole = await nftProxy.hasRole(PAUSER_ROLE, deployer.address);
    const hasKustodiaRole = await nftProxy.hasRole(KUSTODIA_ROLE, deployer.address);
    
    console.log("   👤 Admin role:", hasAdminRole ? "✅" : "❌");
    console.log("   ⏸️  Pauser role:", hasPauserRole ? "✅" : "❌");
    console.log("   🏦 Kustodia role:", hasKustodiaRole ? "✅" : "❌");

    // Check pause state
    const isPaused = await nftProxy.paused();
    console.log("   🔄 Contract paused:", isPaused ? "Yes" : "No");

    // Verify NFT details
    console.log("\n🎨 NFT Contract Details:");
    const name = await nftProxy.name();
    const symbol = await nftProxy.symbol();
    console.log("   📛 Name:", name);
    console.log("   🏷️  Symbol:", symbol);
    console.log("   🏦 Escrow Address:", ESCROW_V2_ADDRESS);

    // Contract verification
    console.log("\n🔍 Verifying contract on Arbiscan...");
    try {
        await hre.run("verify:verify", {
            address: implementationAddress,
            constructorArguments: [],
        });
        console.log("✅ Contract verified successfully!");
    } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
    }

    // Summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("=====================");
    console.log("🎨 NFT Proxy:", proxyAddress);
    console.log("🔧 Implementation:", implementationAddress);
    console.log("🏦 Escrow V2:", ESCROW_V2_ADDRESS);
    console.log("👤 Deployer:", deployer.address);
    console.log("⏸️  Pausable:", "✅ Enabled");
    console.log("🔄 Upgradeable:", "✅ UUPS Pattern");
    console.log("🔗 Escrow Integration:", "✅ V2 Compatible");

    // Save addresses to .env
    console.log("\n💾 Add these to your .env file:");
    console.log(`NFT_PAUSABLE_ADDRESS=${proxyAddress}`);
    console.log(`NFT_PAUSABLE_IMPL=${implementationAddress}`);

    console.log("\n🎉 NFT Pausable deployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
