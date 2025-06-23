// scripts/deployEscrowSepolia.js
// Deploys KustodiaEscrow to Arbitrum Sepolia using MXNB ERC20 and bridge wallet

require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  // TODO: Replace these with your actual deployed MXNB ERC20 and bridge wallet addresses
  const MXNB_TOKEN = process.env.MXNB_TOKEN_ADDRESS;
  const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS;

  if (!MXNB_TOKEN || !PLATFORM_WALLET) {
    throw new Error("Please set MXNB_TOKEN_ADDRESS and PLATFORM_WALLET_ADDRESS in your .env file");
  }

  try {
    const KustodiaEscrow2_0 = await ethers.getContractFactory("KustodiaEscrow2_0");
    // Deploy as upgradeable proxy, calling initialize(PLATFORM_WALLET)
    const proxy = await upgrades.deployProxy(KustodiaEscrow2_0, [PLATFORM_WALLET], { initializer: "initialize" });
    await proxy.waitForDeployment();
    console.log(`KustodiaEscrow2_0 proxy deployed to: ${proxy.target || proxy.address}`);
  } catch (error) {
    console.error(`Error deploying KustodiaEscrow2_0: ${error.message}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
