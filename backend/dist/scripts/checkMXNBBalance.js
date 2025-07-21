"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = process.env.ESCROW_BRIDGE_WALLET;
const tokenAddress = process.env.MOCK_ERC20_ADDRESS;
// Minimal ERC20 ABI for balanceOf
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];
async function main() {
    const token = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [balance, decimals, symbol] = await Promise.all([
        token.balanceOf(wallet),
        token.decimals(),
        token.symbol()
    ]);
    const human = ethers_1.ethers.formatUnits(balance, decimals);
    console.log(`Saldo de ${symbol} en ${wallet}: ${human}`);
}
main().catch(console.error);
