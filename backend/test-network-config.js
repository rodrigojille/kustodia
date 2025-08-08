// Test script to verify network configuration
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 Network Configuration Test');
console.log('============================');
console.log('BLOCKCHAIN_NETWORK env var:', process.env.BLOCKCHAIN_NETWORK);
console.log('Type:', typeof process.env.BLOCKCHAIN_NETWORK);
console.log('Is mainnet?:', process.env.BLOCKCHAIN_NETWORK === 'mainnet');
console.log('Is testnet?:', process.env.BLOCKCHAIN_NETWORK === 'testnet');
console.log('Default fallback would be:', process.env.BLOCKCHAIN_NETWORK || 'testnet');

// Test the actual network config
try {
  const { getCurrentNetworkConfig, isMainnetActive, isTestnetActive } = require('./src/utils/networkConfig');
  
  console.log('\n📊 Current Network Status:');
  console.log('isMainnetActive():', isMainnetActive());
  console.log('isTestnetActive():', isTestnetActive());
  
  const config = getCurrentNetworkConfig();
  console.log('Network Name:', config.networkName);
  console.log('Chain ID:', config.chainId);
  console.log('Explorer URL:', config.explorerUrl);
  console.log('NFT Contract:', config.nftCompactAddress);
  
} catch (error) {
  console.error('Error loading network config:', error.message);
}
