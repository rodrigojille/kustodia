"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: require('path').join(__dirname, '../.env') });
const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL || 'https://arb1.arbitrum.io/rpc');
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
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
    const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers_1.ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(wallet.address),
        contract.decimals(),
        contract.symbol()
    ]);
    const formatted = ethers_1.ethers.utils.formatUnits(balance, decimals);
    console.log(`MXNB Balance for ${wallet.address}: ${formatted} ${symbol}`);
}
main().catch(err => { console.error(err); process.exit(1); });
