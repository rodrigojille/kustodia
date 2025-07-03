const { task } = require("hardhat/config");

task("get-implementation", "Fetches the EIP-1967 implementation address for a proxy")
  .addParam("proxyAddress", "The address of the proxy contract")
  .setAction(async (taskArgs, { ethers }) => {
    const { proxyAddress } = taskArgs;

    if (!ethers.isAddress(proxyAddress)) {
      console.error(`Error: Invalid address provided: ${proxyAddress}`);
      process.exit(1);
    }

    const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

    console.log(`Querying implementation address for proxy: ${proxyAddress}`);

    const implementationAddressHex = await ethers.provider.getStorage(
      proxyAddress,
      implementationSlot
    );

    const implementationAddress = ethers.getAddress(implementationAddressHex.slice(0, 2) + implementationAddressHex.slice(26));

    if (implementationAddress === '0x0000000000000000000000000000000000000000') {
      console.error("Error: Could not find implementation address. Is this a valid proxy contract?");
      process.exit(1);
    }

    console.log(`\n✅ Found Implementation Address: ${implementationAddress}`);
    console.log("You can now use this address to verify the contract on Arbiscan.");
  });
