// scripts/checkWalletAddress.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
  console.log("Address for DEPLOYER_PRIVATE_KEY:", wallet.address);
}

main().catch(console.error);
