// scripts/deployEscrow3Sepolia.js
require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  const MXNB_TOKEN = process.env.MXNB_TOKEN_ADDRESS;
  if (!MXNB_TOKEN) throw new Error("Please set MXNB_TOKEN_ADDRESS in your .env file");

  const KustodiaEscrow3_0 = await ethers.getContractFactory("KustodiaEscrow3_0");
  const proxy = await upgrades.deployProxy(KustodiaEscrow3_0, [MXNB_TOKEN], { initializer: "initialize" });
  await proxy.waitForDeployment();
  console.log(`KustodiaEscrow3_0 proxy deployed to: ${proxy.target || proxy.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
