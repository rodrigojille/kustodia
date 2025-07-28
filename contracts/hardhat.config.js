require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");
require("./scripts/getImplementation.js");
const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (dotenvResult.error) {
  console.error("Error loading .env file:", dotenvResult.error);
  throw dotenvResult.error;
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY not found in .env file or environment variables. Please check your configuration.");
}

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true,
    },
  },
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
      accounts: [privateKey]
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [privateKey],
      chainId: 421614
    }
  },
  ignoreFiles: [
    "node_modules/@ensdomains/ens/contracts/Deed.sol"
  ],
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY
    }
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  }
};
