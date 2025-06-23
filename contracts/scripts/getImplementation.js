require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const proxyAddress = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const slot = "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC";
  const provider = hre.network.provider;
  const implHex = await provider.send("eth_getStorageAt", [proxyAddress, slot, "latest"]);
  const implAddress = "0x" + implHex.slice(26);
  console.log("Implementation address:", implAddress);
}

main().catch(console.error);
