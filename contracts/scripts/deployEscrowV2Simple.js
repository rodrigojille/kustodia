const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying KustodiaEscrow2_0Pausable to Arbitrum Mainnet...");
    console.log("===============================================");

    // Configuration
    const BRIDGE_WALLET = "0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F";
    const PLATFORM_WALLET = "0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F";

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy KustodiaEscrow2_0Pausable
    console.log("\n📦 Deploying KustodiaEscrow2_0Pausable...");
    const KustodiaEscrow2_0Pausable = await ethers.getContractFactory("KustodiaEscrow2_0Pausable");
    
    const escrowProxy = await upgrades.deployProxy(
        KustodiaEscrow2_0Pausable,
        [BRIDGE_WALLET, PLATFORM_WALLET],
        { 
            initializer: 'initialize',
            kind: 'uups'
        }
    );

    await escrowProxy.waitForDeployment();
    const proxyAddress = await escrowProxy.getAddress();
    console.log("✅ KustodiaEscrow2_0Pausable deployed to:", proxyAddress);

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📋 Implementation address:", implementationAddress);

    // Basic verification
    console.log("\n🔍 Basic verification...");
    const isPaused = await escrowProxy.paused();
    const owner = await escrowProxy.owner();
    console.log("   🔄 Contract paused:", isPaused ? "Yes" : "No");
    console.log("   👤 Contract owner:", owner);
    console.log("   🌉 Bridge wallet:", BRIDGE_WALLET);
    console.log("   🏢 Platform wallet:", PLATFORM_WALLET);

    // Contract verification on Arbiscan
    console.log("\n🔍 Verifying contract on Arbiscan...");
    try {
        await hre.run("verify:verify", {
            address: implementationAddress,
            constructorArguments: [],
        });
        console.log("✅ Contract verified successfully!");
    } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
        console.log("   You can verify manually later on Arbiscan");
    }

    // Summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("=====================");
    console.log("🏦 Escrow Proxy:", proxyAddress);
    console.log("🔧 Implementation:", implementationAddress);
    console.log("🌉 Bridge Wallet:", BRIDGE_WALLET);
    console.log("🏢 Platform Wallet:", PLATFORM_WALLET);
    console.log("👤 Deployer:", deployer.address);
    console.log("⏸️  Pausable:", "✅ Enabled");
    console.log("🔄 Upgradeable:", "✅ UUPS Pattern");

    // Save addresses to .env
    console.log("\n💾 Add these to your .env file:");
    console.log(`ESCROW_V2_PAUSABLE_ADDRESS=${proxyAddress}`);
    console.log(`ESCROW_V2_PAUSABLE_IMPL=${implementationAddress}`);

    console.log("\n🎉 EscrowV2 Pausable deployment completed successfully!");
    console.log("🔗 View on Arbiscan: https://arbiscan.io/address/" + proxyAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
