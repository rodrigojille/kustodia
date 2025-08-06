const hre = require("hardhat");

async function main() {
  console.log("🎯 KUSTODIA ASSET MANAGEMENT LIBRARY VERIFICATION");
  console.log("================================================");
  console.log("📚 Verifying Asset Management Library via Hardhat...");

  const LIBRARY_ADDRESS = "0xB712d770eedcfa4D6647fE4545CC9020A612adA4";
  
  try {
    console.log("📍 Library Address:", LIBRARY_ADDRESS);
    console.log("🔧 Using Hardhat verification plugin...");
    
    // Verify the Asset Management Library
    await hre.run("verify:verify", {
      address: LIBRARY_ADDRESS,
      constructorArguments: [], // Libraries don't have constructor arguments
      contract: "contracts/libraries/AssetManagementLib.sol:AssetManagementLib"
    });

    console.log("✅ Asset Management Library verification completed!");
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Asset Management Library is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.error("Full error:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
