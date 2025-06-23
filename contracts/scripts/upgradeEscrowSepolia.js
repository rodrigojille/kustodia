require("dotenv").config();
const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const KustodiaEscrow2_0 = await ethers.getContractFactory("KustodiaEscrow2_0");
  await upgrades.upgradeProxy(proxyAddress, KustodiaEscrow2_0);
  console.log("Proxy upgraded to new KustodiaEscrow2_0 logic!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
