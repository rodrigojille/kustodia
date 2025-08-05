require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");
require("./scripts/getImplementation.js");
const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.resolve(__dirname, '.env') });

if (dotenvResult.error) {
  console.error("Error loading .env file:", dotenvResult.error);
  throw dotenvResult.error;
}

const privateKey = process.env.MAINNET_PRIVATE_KEY || process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY or MAINNET_PRIVATE_KEY not found in .env file or environment variables. Please check your configuration.");
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
      accounts: [privateKey],
      chainId: 42161
    },
    "arbitrum-mainnet": {
      url: process.env.ARBITRUM_MAINNET_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: [privateKey],
      chainId: 42161
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [privateKey],
      chainId: 421614
    }
  },
  ignoreFiles: [
    "node_modules/@ensdomains/ens/contracts/Deed.sol",
    "contracts/deprecated/**/*",
    "contracts/KustodiaEscrow.sol",
    "contracts/KustodiaEscrow2_0.sol",
    "contracts/KustodiaEscrow3_0.sol",
    "contracts/PropertyAssetNFT.sol",
    "contracts/UniversalAssetNFT.sol",
    "contracts/UniversalAssetNFTUpgradeable.sol.backup"
  ],
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY
    }
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6",
  }
};
