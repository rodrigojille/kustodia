const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { ethers } = require("hardhat");

async function main() {
  const mxnbTokenAddress = process.env.MXNB_CONTRACT_SEPOLIA;
  const platformWalletAddress = process.env.BRIDGE_WALLET_ADDRESS;

  if (!mxnbTokenAddress || !platformWalletAddress) {
    throw new Error("MXNB_CONTRACT_SEPOLIA and BRIDGE_WALLET_ADDRESS must be set in the .env file");
  }

  console.log("Deploying KustodiaEscrow contract...");
  console.log(`Using MXNB Token Address: ${mxnbTokenAddress}`);
  console.log(`Using Platform Wallet Address: ${platformWalletAddress}`);

  const KustodiaEscrow = await ethers.getContractFactory("KustodiaEscrow");
  const kustodiaEscrow = await KustodiaEscrow.deploy(mxnbTokenAddress, platformWalletAddress);

  await kustodiaEscrow.waitForDeployment();

  const contractAddress = await kustodiaEscrow.getAddress();
  console.log(`KustodiaEscrow (V1) deployed to: ${contractAddress}`);
  console.log("\nPlease update your .env file with this new KUSTODIA_ESCROW_V1_ADDRESS.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
