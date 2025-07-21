"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// CLABE/SPEI Flow - Send MXNB from bridge wallet to Juno for redemption
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
const BRIDGE_WALLET_PK = process.env.DEPLOYER_PRIVATE_KEY;
const PROVIDER_URL = process.env.ETH_RPC_URL;
const TO = process.env.JUNO_WALLET;
const AMOUNT = ethers_1.ethers.parseUnits("2500.00", 6); // MXNB uses 6 decimals
const ERC20_ABI = [
    "function transfer(address to, uint256 amount) external returns (bool)"
];
async function main() {
    const provider = new ethers_1.ethers.JsonRpcProvider(PROVIDER_URL);
    if (!BRIDGE_WALLET_PK) {
        throw new Error('DEPLOYER_PRIVATE_KEY (bridge wallet) is not set in environment variables.');
    }
    const signer = new ethers_1.ethers.Wallet(BRIDGE_WALLET_PK, provider);
    const token = new ethers_1.ethers.Contract(MXNB_TOKEN, ERC20_ABI, signer);
    const tx = await token.transfer(TO, AMOUNT);
    console.log("MXNB transfer tx:", tx.hash);
    await tx.wait();
    console.log("MXNB sent to Juno wallet!");
}
main().catch(console.error);
