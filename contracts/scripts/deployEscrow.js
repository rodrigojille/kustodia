const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const mxnbToken = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA";
  const platformWallet = "0xC09b02DDb3BBCC78Fc47446D8D74E677bA8dB3E8";

  const Escrow = await hre.ethers.getContractFactory("KustodiaEscrow");
  const escrow = await Escrow.deploy(mxnbToken, platformWallet);

  await escrow.deployed();
  console.log("KustodiaEscrow deployed to:", escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
