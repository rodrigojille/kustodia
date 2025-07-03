import { ethers, JsonRpcProvider, formatUnits } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS!;
const ESCROW_ADDRESS = '0x9F920b3444B0FEC26D33dD3D48bdaC7B808E4a03';

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  const [allowance, decimals, symbol] = await Promise.all([
    contract.allowance(wallet.address, ESCROW_ADDRESS),
    contract.decimals(),
    contract.symbol()
  ]);
  console.log(`Allowance: ${formatUnits(allowance, 6)} USDC`);
}

main().catch(console.error);
