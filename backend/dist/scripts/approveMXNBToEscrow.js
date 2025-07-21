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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv.config();
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const privateKey = process.env.ESCROW_PRIVATE_KEY;
const signer = new ethers_1.ethers.Wallet(privateKey, provider);
const tokenAddress = process.env.MOCK_ERC20_ADDRESS;
const escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS;
// Use dist/artifacts in production, artifacts in development
const artifactsDir = fs_1.default.existsSync(path_1.default.join(process.cwd(), 'dist', 'artifacts'))
    ? path_1.default.join(process.cwd(), 'dist', 'artifacts')
    : path_1.default.join(process.cwd(), 'artifacts');
const abiPath = path_1.default.join(artifactsDir, 'contracts', 'ERC20.json');
const abi = JSON.parse(fs_1.default.readFileSync(abiPath, 'utf8')).abi;
async function main() {
    const token = new ethers_1.ethers.Contract(tokenAddress, abi, signer);
    const amount = ethers_1.ethers.parseUnits('2000', 6); // 2000 MXNB (6 decimales)
    console.log(`Aprobando ${amount.toString()} tokens para ${escrowAddress}`);
    try {
        const tx = await token.approve(escrowAddress, amount);
        console.log('approve tx hash:', tx.hash);
        await tx.wait();
        console.log('Approve confirmado en blockchain');
    }
    catch (e) {
        console.error('Error en approve:', e);
    }
}
main();
