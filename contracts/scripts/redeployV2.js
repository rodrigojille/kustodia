const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { ethers, upgrades } = require("hardhat");

async function main() {
  const bridgeWalletAddress = process.env.BRIDGE_WALLET_ADDRESS;

  if (!bridgeWalletAddress) {
    throw new Error("BRIDGE_WALLET_ADDRESS must be set in the .env file");
  }

  console.log("Redeploying KustodiaEscrow2_0 as an upgradeable proxy...");
  console.log(`Using Wallet Address for Bridge and Platform: ${bridgeWalletAddress}`);

  const KustodiaEscrowV2 = await ethers.getContractFactory("KustodiaEscrow2_0");
  const proxy = await upgrades.deployProxy(KustodiaEscrowV2, 
    [bridgeWalletAddress, bridgeWalletAddress], 
    { initializer: 'initialize' }
  );

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log(`\nKustodiaEscrow2_0 proxy deployed to: ${proxyAddress}`);
  
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`Implementation contract deployed to: ${implementationAddress}`);
  console.log("\nPlease update KUSTODIA_ESCROW_V2_ADDRESS in your .env file and run verification on the IMPLEMENTATION address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
