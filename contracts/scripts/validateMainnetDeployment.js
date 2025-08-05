const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🔍 MAINNET DEPLOYMENT VALIDATION");
    console.log("=================================");
    
    // Contract addresses
    const ESCROW_ADDRESS = process.env.ESCROW_V2_PAUSABLE_ADDRESS;
    const NFT_ADDRESS = process.env.NFT_COMPACT_ADDRESS;
    const LIB_ADDRESS = process.env.ASSET_MANAGEMENT_LIB;
    
    console.log("📋 Contract Addresses:");
    console.log("  🏦 Escrow:", ESCROW_ADDRESS);
    console.log("  🎨 NFT:", NFT_ADDRESS);
    console.log("  📚 Library:", LIB_ADDRESS);
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("\n👤 Validator Account:", signer.address);
    console.log("💰 Balance:", ethers.formatEther(await signer.provider.getBalance(signer.address)), "ETH");
    
    try {
        // Test Escrow Contract
        console.log("\n🏦 TESTING ESCROW CONTRACT");
        console.log("==========================");
        
        const escrowAbi = [
            "function paused() view returns (bool)",
            "function pausers(address) view returns (bool)",
            "function owner() view returns (address)",
            "function bridgeWallet() view returns (address)",
            "function platformWallet() view returns (address)"
        ];
        
        const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowAbi, signer);
        
        const escrowPaused = await escrow.paused();
        const isOwnerPauser = await escrow.pausers(signer.address);
        const owner = await escrow.owner();
        const bridgeWallet = await escrow.bridgeWallet();
        const platformWallet = await escrow.platformWallet();
        
        console.log("  ⏸️  Paused:", escrowPaused ? "❌ YES" : "✅ NO");
        console.log("  👑 Owner:", owner);
        console.log("  🔐 Is Pauser:", isOwnerPauser ? "✅ YES" : "❌ NO");
        console.log("  🌉 Bridge Wallet:", bridgeWallet);
        console.log("  🏢 Platform Wallet:", platformWallet);
        
        // Test NFT Contract
        console.log("\n🎨 TESTING NFT CONTRACT");
        console.log("=======================");
        
        const nftAbi = [
            "function paused() view returns (bool)",
            "function hasRole(bytes32, address) view returns (bool)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalAssets() view returns (uint256)",
            "function supportsInterface(bytes4) view returns (bool)"
        ];
        
        const nft = new ethers.Contract(NFT_ADDRESS, nftAbi, signer);
        
        // Test each function individually to identify the failing one
        let nftPaused, name, symbol, totalSupply, escrowContract;
        
        try {
            nftPaused = await nft.paused();
            console.log("  ⏸️  Paused:", nftPaused ? "❌ YES" : "✅ NO");
        } catch (error) {
            console.log("  ⏸️  Paused: ❌ ERROR -", error.message);
        }
        
        try {
            name = await nft.name();
            console.log("  📛 Name:", name);
        } catch (error) {
            console.log("  📛 Name: ❌ ERROR -", error.message);
        }
        
        try {
            symbol = await nft.symbol();
            console.log("  🔤 Symbol:", symbol);
        } catch (error) {
            console.log("  🔤 Symbol: ❌ ERROR -", error.message);
        }
        
        try {
            const totalAssets = await nft.totalAssets();
            console.log("  📊 Total Assets:", totalAssets.toString());
        } catch (error) {
            console.log("  📊 Total Assets: ❌ ERROR -", error.message);
        }
        
        try {
            const supportsERC721 = await nft.supportsInterface("0x80ac58cd"); // ERC721 interface ID
            console.log("  🎨 ERC721 Support:", supportsERC721 ? "✅ YES" : "❌ NO");
        } catch (error) {
            console.log("  🎨 ERC721 Support: ❌ ERROR -", error.message);
        }
        
        // Role hashes
        const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
        const KUSTODIA_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KUSTODIA_ROLE"));
        
        // Test role functions individually
        let hasAdminRole, hasPauserRole, hasKustodiaRole;
        
        try {
            hasAdminRole = await nft.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
            console.log("   Admin Role:", hasAdminRole ? " YES" : " NO");
        } catch (error) {
            console.log("   Admin Role: ERROR -", error.message);
        }
        
        try {
            hasPauserRole = await nft.hasRole(PAUSER_ROLE, signer.address);
            console.log("   Pauser Role:", hasPauserRole ? " YES" : " NO");
        } catch (error) {
            console.log("   Pauser Role: ERROR -", error.message);
        }
        
        try {
            hasKustodiaRole = await nft.hasRole(KUSTODIA_ROLE, signer.address);
            console.log("   Kustodia Role:", hasKustodiaRole ? " YES" : " NO");
        } catch (error) {
            console.log("   Kustodia Role: ERROR -", error.message);
        }
        
        // Integration Test
        console.log("\n🔗 INTEGRATION VALIDATION");
        console.log("=========================");
        
        // Check if escrow has KUSTODIA_ROLE on NFT (this validates integration)
        let escrowHasKustodiaRole = false;
        try {
            escrowHasKustodiaRole = await nft.hasRole(KUSTODIA_ROLE, ESCROW_ADDRESS);
            console.log("  🔗 Escrow Integration:", escrowHasKustodiaRole ? "✅ CORRECT" : "❌ MISSING ROLE");
        } catch (error) {
            console.log("  🔗 Escrow Integration: ❌ ERROR -", error.message);
        }
        
        // Library Validation
        console.log("\n📚 LIBRARY VALIDATION");
        console.log("=====================");
        
        const libraryCode = await signer.provider.getCode(LIB_ADDRESS);
        const hasLibraryCode = libraryCode !== "0x";
        console.log("  📚 Library Deployed:", hasLibraryCode ? "✅ YES" : "❌ NO");
        console.log("  📏 Library Size:", libraryCode.length / 2 - 1, "bytes");
        
        // Network Validation
        console.log("\n🌐 NETWORK VALIDATION");
        console.log("=====================");
        
        const network = await signer.provider.getNetwork();
        const isArbitrumMainnet = network.chainId === 42161n;
        console.log("  🌐 Network:", network.name);
        console.log("  🔗 Chain ID:", network.chainId.toString());
        console.log("  ✅ Arbitrum Mainnet:", isArbitrumMainnet ? "✅ YES" : "❌ NO");
        
        // Summary
        console.log("\n📋 VALIDATION SUMMARY");
        console.log("=====================");
        
        const allChecks = [
            { name: "Escrow Not Paused", status: !escrowPaused },
            { name: "NFT Not Paused", status: !nftPaused },
            { name: "Owner Has Pauser Role", status: isOwnerPauser },
            { name: "Admin Role Assigned", status: hasAdminRole },
            { name: "Pauser Role Assigned", status: hasPauserRole },
            { name: "Kustodia Role Assigned", status: hasKustodiaRole },
            { name: "Escrow Integration", status: escrowHasKustodiaRole },
            { name: "Library Deployed", status: hasLibraryCode },
            { name: "Arbitrum Mainnet", status: isArbitrumMainnet }
        ];
        
        const passedChecks = allChecks.filter(check => check.status).length;
        const totalChecks = allChecks.length;
        
        allChecks.forEach(check => {
            const emoji = check.status ? "✅" : "❌";
            console.log(`  ${emoji} ${check.name}`);
        });
        
        console.log(`\n🎯 OVERALL STATUS: ${passedChecks}/${totalChecks} checks passed`);
        
        if (passedChecks === totalChecks) {
            console.log("🎉 ALL VALIDATIONS PASSED - READY FOR PRODUCTION!");
        } else {
            console.log("⚠️  SOME VALIDATIONS FAILED - REVIEW BEFORE PRODUCTION");
        }
        
        // Contract URLs
        console.log("\n🔗 CONTRACT LINKS");
        console.log("=================");
        console.log("🏦 Escrow:", `https://arbiscan.io/address/${ESCROW_ADDRESS}`);
        console.log("🎨 NFT:", `https://arbiscan.io/address/${NFT_ADDRESS}`);
        console.log("📚 Library:", `https://arbiscan.io/address/${LIB_ADDRESS}`);
        
    } catch (error) {
        console.error("\n❌ VALIDATION FAILED:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
