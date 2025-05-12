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
exports.createEscrow = createEscrow;
exports.releaseCustody = releaseCustody;
exports.raiseDispute = raiseDispute;
exports.resolveDispute = resolveDispute;
exports.getEscrow = getEscrow;
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Arbitrum mainnet
const RPC_URL = "https://arb1.arbitrum.io/rpc";
const provider = new ethers_1.ethers.providers.JsonRpcProvider(RPC_URL);
// Use mainnet deployer/escrow key from env
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const signer = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
// Mainnet contract addresses
const ESCROW_ADDRESS = "0x9F920b3444B0FEC26D33dD3D48bdaC7B808E4a03";
const TOKEN_ADDRESS = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA";
// Load ABIs
const artifactPath = path.join(__dirname, '../../../contracts/artifacts/contracts/KustodiaEscrow.sol/KustodiaEscrow.json');
console.log('Resolved KustodiaEscrow.json path:', artifactPath);
const KustodiaEscrowArtifact = require(artifactPath);
const ESCROW_ABI = KustodiaEscrowArtifact.abi;
const TOKEN_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../contracts/artifacts/contracts/MockERC20.sol/MockERC20.json"), "utf8")).abi;
const escrowContract = new ethers_1.ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
const tokenContract = new ethers_1.ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
async function createEscrow({ seller, totalAmount, custodyPercent, custodyPeriod }) {
    // Approve escrow contract to spend buyer's tokens
    const approveTx = await tokenContract.approve(ESCROW_ADDRESS, totalAmount);
    await approveTx.wait();
    // Create escrow on-chain
    const tx = await escrowContract.createEscrow(seller, totalAmount, custodyPercent, custodyPeriod);
    const receipt = await tx.wait();
    // Find EscrowCreated event
    const event = receipt.events?.find((e) => e.event === "EscrowCreated");
    const escrowId = event?.args?.escrowId;
    return escrowId?.toString();
}
async function releaseCustody(escrowId) {
    const tx = await escrowContract.releaseCustody(escrowId);
    await tx.wait();
}
async function raiseDispute(escrowId) {
    const tx = await escrowContract.raiseDispute(escrowId);
    await tx.wait();
}
async function resolveDispute(escrowId, releaseToSeller) {
    const tx = await escrowContract.resolveDispute(escrowId, releaseToSeller);
    await tx.wait();
}
async function getEscrow(escrowId) {
    return escrowContract.escrows(escrowId);
}
