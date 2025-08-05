const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying KustodiaEscrow2_0Pausable to Arbitrum Mainnet...");
    console.log("===============================================");

    // Configuration
    const MXNB_TOKEN = "0xf197ffc28c23e0309b5559e7a166f2c6164c80aa"; // Arbitrum Mainnet MXNB
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
    console.log("✅ KustodiaEscrow2_0Pausable deployed to:", await escrowProxy.getAddress());

    // Get implementation address
    const proxyAddress = await escrowProxy.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📋 Implementation address:", implementationAddress);

    // Verify roles
    console.log("\n🔐 Verifying roles...");
    const DEFAULT_ADMIN_ROLE = await escrowProxy.DEFAULT_ADMIN_ROLE();
    const PAUSER_ROLE = await escrowProxy.PAUSER_ROLE();
    
    const hasAdminRole = await escrowProxy.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasPauserRole = await escrowProxy.hasRole(PAUSER_ROLE, deployer.address);
    
    console.log("   👤 Admin role:", hasAdminRole ? "✅" : "❌");
    console.log("   ⏸️  Pauser role:", hasPauserRole ? "✅" : "❌");

    // Check pause state
    const isPaused = await escrowProxy.paused();
    console.log("   🔄 Contract paused:", isPaused ? "Yes" : "No");

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
    console.log("🏦 Escrow Proxy:", proxyAddress);
    console.log("🔧 Implementation:", implementationAddress);
    console.log("🪙 MXNB Token:", MXNB_TOKEN);
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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
