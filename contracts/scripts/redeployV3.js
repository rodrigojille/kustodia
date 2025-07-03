const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { ethers, upgrades } = require("hardhat");

async function main() {
  const mxnbTokenAddress = process.env.MXNB_CONTRACT_SEPOLIA;

  if (!mxnbTokenAddress) {
    throw new Error("MXNB_CONTRACT_SEPOLIA must be set in the .env file");
  }

  console.log("Redeploying KustodiaEscrow3_0 as an upgradeable proxy...");
  console.log(`Using MXNB Token Address: ${mxnbTokenAddress}`);

  const KustodiaEscrowV3 = await ethers.getContractFactory("KustodiaEscrow3_0");
  const proxy = await upgrades.deployProxy(KustodiaEscrowV3, 
    [mxnbTokenAddress], 
    { initializer: 'initialize' }
  );

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log(`\nKustodiaEscrow3_0 proxy deployed to: ${proxyAddress}`);
  
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log(`Implementation contract deployed to: ${implementationAddress}`);
  console.log("\nPlease update KUSTODIA_ESCROW_V3_ADDRESS in your .env file and run verification on the IMPLEMENTATION address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
