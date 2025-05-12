require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {},
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  },
  ignoreFiles: [
    "node_modules/@ensdomains/ens/contracts/Deed.sol"
  ]
};
