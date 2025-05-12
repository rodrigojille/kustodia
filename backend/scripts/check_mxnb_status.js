// Usage: npx ts-node scripts/check_mxnb_status.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load env vars
const RPC_URL = process.env.ETH_RPC_URL;
const WALLET = process.env.ESCROW_PRIVATE_KEY;
const MXNB_ADDRESS = process.env.MOCK_ERC20_ADDRESS;
const ACCOUNT = new ethers.Wallet(WALLET).address;

// Load ABI
const abiPath = path.join(__dirname, '../../contracts/artifacts/contracts/MockERC20.sol/MockERC20.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const token = new ethers.Contract(MXNB_ADDRESS, abi, provider);
  const decimals = await token.decimals();
  const balance = await token.balanceOf(ACCOUNT);
  console.log('MXNB decimals:', decimals);
  console.log('Backend wallet:', ACCOUNT);
  console.log('MXNB balance (raw):', balance.toString());
  console.log('MXNB balance (formatted):', ethers.utils.formatUnits(balance, decimals));
}

main().catch(console.error);
