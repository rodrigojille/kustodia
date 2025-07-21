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
dotenv.config();
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const tokenAddress = process.env.MOCK_ERC20_ADDRESS;
const custodialWallet = process.env.ESCROW_BRIDGE_WALLET;
const path = require('path');
// Use dist/artifacts in production, artifacts in development
const artifactsDir = fs_1.default.existsSync(path.join(process.cwd(), 'dist', 'artifacts'))
    ? path.join(process.cwd(), 'dist', 'artifacts')
    : path.join(process.cwd(), 'artifacts');
const abiPath = path.join(artifactsDir, 'contracts', 'ERC20.json');
console.log('Intentando leer ABI en:', abiPath);
const abi = JSON.parse(fs_1.default.readFileSync(abiPath, 'utf8')).abi;
async function main() {
    const token = new ethers_1.ethers.Contract(tokenAddress, abi, provider);
    try {
        const symbol = await token.symbol();
        console.log('symbol:', symbol);
    }
    catch (e) {
        console.error('Error calling symbol()', e);
    }
    try {
        const decimals = await token.decimals();
        console.log('decimals:', decimals);
    }
    catch (e) {
        console.error('Error calling decimals()', e);
    }
    try {
        const balance = await token.balanceOf(custodialWallet);
        console.log('balanceOf(custodio):', balance.toString());
    }
    catch (e) {
        console.error('Error calling balanceOf()', e);
    }
    try {
        const paused = await token.paused();
        console.log('paused:', paused);
    }
    catch (e) {
        console.error('Error calling paused()', e);
    }
    try {
        const isBlacklisted = await token.isBlacklisted(custodialWallet);
        console.log('isBlacklisted(custodio):', isBlacklisted);
    }
    catch (e) {
        console.error('Error calling isBlacklisted()', e);
    }
    try {
        const allowance = await token.allowance(custodialWallet, process.env.ESCROW_CONTRACT_ADDRESS);
        console.log('allowance(custodio, escrow):', allowance.toString());
    }
    catch (e) {
        console.error('Error calling allowance()', e);
    }
}
main();
