const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x82Fc44836e73b2e811C37890b51D76c1E9a8D3C6";
  const EscrowV2 = await ethers.getContractFactory("KustodiaEscrow2_0");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, EscrowV2);
  let proxyAddr;
  if (typeof upgraded.getAddress === "function") {
    proxyAddr = await upgraded.getAddress();
  } else if (upgraded.address) {
    proxyAddr = upgraded.address;
  } else {
    proxyAddr = upgraded;
  }
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddr);
  console.log("Proxy upgraded. New implementation:", implAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
