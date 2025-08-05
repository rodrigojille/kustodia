const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying UniversalAssetNFTCompact to Arbitrum Mainnet...");
    console.log("===============================================");

    // Get escrow address from environment
    const ESCROW_V2_ADDRESS = process.env.ESCROW_V2_PAUSABLE_ADDRESS || "0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40";

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    console.log("🏦 Escrow V2 Address:", ESCROW_V2_ADDRESS);

    // Deploy AssetManagementLib library first
    console.log("\n📚 Deploying AssetManagementLib library...");
    const AssetManagementLib = await ethers.getContractFactory("AssetManagementLib");
    const assetManagementLib = await AssetManagementLib.deploy();
    await assetManagementLib.waitForDeployment();
    const libAddress = await assetManagementLib.getAddress();
    console.log("✅ AssetManagementLib deployed to:", libAddress);

    // Deploy UniversalAssetNFTCompact with library linking
    console.log("\n📦 Deploying UniversalAssetNFTCompact...");
    const UniversalAssetNFTCompact = await ethers.getContractFactory("UniversalAssetNFTCompact", {
        libraries: {
            AssetManagementLib: libAddress
        }
    });
    
    const nftProxy = await upgrades.deployProxy(
        UniversalAssetNFTCompact,
        [ESCROW_V2_ADDRESS],
        { 
            initializer: 'initialize',
            kind: 'uups',
            unsafeAllowLinkedLibraries: true
        }
    );

    await nftProxy.waitForDeployment();
    const proxyAddress = await nftProxy.getAddress();
    console.log("✅ UniversalAssetNFTCompact deployed to:", proxyAddress);

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📋 Implementation address:", implementationAddress);

    // Verify roles
    console.log("\n🔐 Verifying roles...");
    const hasAdminRole = await nftProxy.hasRole(await nftProxy.DEFAULT_ADMIN_ROLE(), deployer.address);
    const hasKustodiaRole = await nftProxy.hasRole(await nftProxy.KUSTODIA_ROLE(), deployer.address);
    const hasPauserRole = await nftProxy.hasRole(await nftProxy.PAUSER_ROLE(), deployer.address);
    console.log("   👤 Admin role:", hasAdminRole ? "✅" : "❌");
    console.log("   🏛️  Kustodia role:", hasKustodiaRole ? "✅" : "❌");
    console.log("   ⏸️  Pauser role:", hasPauserRole ? "✅" : "❌");

    // Check if escrow has Kustodia role
    if (ESCROW_V2_ADDRESS && ESCROW_V2_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const escrowHasRole = await nftProxy.hasRole(await nftProxy.KUSTODIA_ROLE(), ESCROW_V2_ADDRESS);
        console.log("   🏦 Escrow Kustodia role:", escrowHasRole ? "✅" : "❌");
    }

    // Verify pause state
    console.log("\n⏸️  Verifying pause state...");
    const isPaused = await nftProxy.paused();
    console.log("   Contract paused:", isPaused ? "Yes" : "No");

    // Basic functionality test
    console.log("\n🧪 Basic functionality test...");
    const totalAssets = await nftProxy.totalAssets();
    const name = await nftProxy.name();
    const symbol = await nftProxy.symbol();
    console.log("   📛 Name:", name);
    console.log("   🔤 Symbol:", symbol);
    console.log("   📊 Total assets:", totalAssets.toString());

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
    console.log("🎨 NFT Proxy:", proxyAddress);
    console.log("🔧 Implementation:", implementationAddress);
    console.log("📚 Library:", libAddress);
    console.log("🏦 Escrow V2:", ESCROW_V2_ADDRESS);
    console.log("👤 Deployer:", deployer.address);
    console.log("⏸️  Pausable:", "✅ Enabled");
    console.log("🔄 Upgradeable:", "✅ UUPS Pattern");

    // Save addresses to .env
    console.log("\n💾 Add these to your .env file:");
    console.log(`NFT_COMPACT_ADDRESS=${proxyAddress}`);
    console.log(`NFT_COMPACT_IMPL=${implementationAddress}`);
    console.log(`ASSET_MANAGEMENT_LIB=${libAddress}`);

    console.log("\n🎉 NFT Compact deployment completed successfully!");
    console.log("🔗 View on Arbiscan: https://arbiscan.io/address/" + proxyAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
