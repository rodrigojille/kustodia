import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL || 'https://arb1.arbitrum.io/rpc');
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS || '0xF197FFC28c23E0309B5559e7a166f2c6164C80aA';

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  if (!PRIVATE_KEY) {
    console.error('ESCROW_PRIVATE_KEY not set in .env');
    process.exit(1);
  }
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  const [balance, decimals, symbol] = await Promise.all([
    contract.balanceOf(wallet.address),
    contract.decimals(),
    contract.symbol()
  ]);
  const formatted = ethers.utils.formatUnits(balance, decimals);
  console.log(`MXNB Balance for ${wallet.address}: ${formatted} ${symbol}`);
}

main().catch(err => { console.error(err); process.exit(1); });
