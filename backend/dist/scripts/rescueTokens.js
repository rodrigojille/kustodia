"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// === CONFIGURE THESE VARIABLES ===
const ESCROW_CONTRACT = "0xa5b45dc1cf2e44844eba557df29687d24f5d8543"; // Proxy contract address
const TOKEN_ADDRESS = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D"; // MXNB token address
const TO_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS || ""; // Bridge wallet address
const AMOUNT = ethers_1.ethers.parseUnits("1000", 6); // 1000 MXNB with 6 decimals
const OWNER_PK = process.env.DEPLOYER_PRIVATE_KEY || "";
const PROVIDER_URL = process.env.ETH_RPC_URL || "";
if (!OWNER_PK || !PROVIDER_URL || !TO_ADDRESS) {
    throw new Error("Missing ENV variables: DEPLOYER_PRIVATE_KEY, ETH_RPC_URL, PLATFORM_WALLET_ADDRESS");
}
const ABI = [
    "function rescueTokens(address token, address to, uint256 amount) external"
];
async function main() {
    const provider = new ethers_1.ethers.JsonRpcProvider(PROVIDER_URL);
    const signer = new ethers_1.ethers.Wallet(OWNER_PK, provider);
    const escrow = new ethers_1.ethers.Contract(ESCROW_CONTRACT, ABI, signer);
    try {
        const tx = await escrow.rescueTokens(TOKEN_ADDRESS, TO_ADDRESS, AMOUNT);
        console.log(`[${new Date().toISOString()}] Rescue tx:`, tx.hash);
        await tx.wait();
        console.log(`[${new Date().toISOString()}] MXNB rescued to bridge wallet.`);
    }
    catch (err) {
        console.error(`[${new Date().toISOString()}] Error rescuing tokens:`, err);
        process.exit(1);
    }
}
main().catch(err => {
    console.error(`[${new Date().toISOString()}] Uncaught error:`, err);
    process.exit(1);
});
