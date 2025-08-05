require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");
const path = require('path');

// Load environment variables from root directory
const dotenvResult = require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (dotenvResult.error) {
  console.error("Error loading .env file:", dotenvResult.error);
  throw dotenvResult.error;
}

// Mainnet private key - should be the private key for 0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F
const mainnetPrivateKey = process.env.MAINNET_PRIVATE_KEY;
if (!mainnetPrivateKey) {
  throw new Error("MAINNET_PRIVATE_KEY not found in .env file. Please add the private key for the mainnet wallet: 0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F");
}

// Validate private key format
if (!mainnetPrivateKey.startsWith('0x') || mainnetPrivateKey.length !== 66) {
  throw new Error("MAINNET_PRIVATE_KEY must be a valid 64-character hex string starting with 0x");
}

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Higher runs for mainnet optimization
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
    hardhat: {
      chainId: 31337
    },
    // Arbitrum Mainnet configuration
    arbitrum: {
      url: process.env.ARBITRUM_MAINNET_RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: [mainnetPrivateKey],
      chainId: 42161,
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000,
      confirmations: 2
    },
    // Keep testnet for development
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614
    }
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "YOUR_ARBISCAN_API_KEY",
      arbitrumTestnet: process.env.ARBISCAN_API_KEY || "YOUR_ARBISCAN_API_KEY"
    },
    customChains: [
      {
        network: "arbitrumOne",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  mocha: {
    timeout: 60000
  }
};
