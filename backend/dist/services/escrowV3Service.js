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
exports.escrowV3Contract = void 0;
exports.createV3Escrow = createV3Escrow;
exports.fundV3Escrow = fundV3Escrow;
exports.releaseV3Escrow = releaseV3Escrow;
const ethers_1 = require("ethers");
const portalSignerService_1 = require("./portalSignerService");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log('[escrowV3Service] Starting import for V3');
// Artifact paths - Pointing to KustodiaEscrow3_0
// In production (dist), artifacts are in dist/artifacts/
// In development, they're copied from src/artifacts/ to dist/artifacts/
const artifactsBase = path.resolve(__dirname, '../artifacts');
const escrowArtifactPath = path.resolve(artifactsBase, 'contracts/KustodiaEscrow3_0.sol/KustodiaEscrow3_0.json');
const erc20ArtifactPath = path.resolve(artifactsBase, 'contracts/MockERC20.sol/MockERC20.json'); // Using MockERC20 ABI for MXNB token (same interface)
console.log('[escrowV3Service] Resolved KustodiaEscrow3_0.json path:', escrowArtifactPath);
console.log('[escrowV3Service] KustodiaEscrow3_0.json exists:', fs.existsSync(escrowArtifactPath));
// Configurable RPC URL
const RPC_URL = process.env.ETH_RPC_URL;
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
// Use the platform's escrow private key for signing transactions
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const signer = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
// Use KUSTODIA_ESCROW_V3_ADDRESS for the Web3 flow
const ESCROW_ADDRESS = process.env.KUSTODIA_ESCROW_V3_ADDRESS;
console.log('[escrowV3Service] Using KUSTODIA_ESCROW_V3_ADDRESS:', ESCROW_ADDRESS);
// MXNB Token contract address
const TOKEN_ADDRESS = process.env.MXNB_CONTRACT_ADDRESS;
// Load ABIs with error handling
let ESCROW_ABI;
try {
    const KustodiaEscrowArtifact = require(escrowArtifactPath);
    ESCROW_ABI = KustodiaEscrowArtifact.abi;
    console.log('[escrowV3Service] Successfully loaded KustodiaEscrow3_0 ABI');
}
catch (error) {
    console.error('[escrowV3Service] Failed to load KustodiaEscrow3_0 artifact:', error.message);
    // Fallback minimal ABI for V3 if artifact is missing
    ESCROW_ABI = [
        "function createEscrow(address token, uint256 amount, address recipient, string memory reference) external returns (uint256)",
        "function fundEscrowFrom(address from, uint256 escrowId, uint256 amount) external",
        "function release(uint256 escrowId) external",
        "event EscrowCreated(uint256 indexed escrowId, address indexed sender, address indexed recipient, address token, uint256 amount, string reference)",
        "event EscrowFunded(uint256 indexed escrowId, address indexed funder, uint256 amount)"
    ];
}
// Load TOKEN_ABI with error handling
let TOKEN_ABI;
try {
    const ERC20Artifact = JSON.parse(fs.readFileSync(erc20ArtifactPath, "utf8"));
    TOKEN_ABI = ERC20Artifact.abi;
    console.log('[escrowV3Service] Successfully loaded ERC20 ABI for MXNB token');
}
catch (error) {
    console.error('[escrowV3Service] Failed to load ERC20 artifact:', error.message);
    // Fallback minimal ERC20 ABI
    TOKEN_ABI = [
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function decimals() external view returns (uint8)"
    ];
    console.log('[escrowV3Service] Using fallback minimal ERC20 ABI for MXNB token');
}
exports.escrowV3Contract = new ethers_1.ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
const tokenContract = new ethers_1.ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
/**
 * Creates a V3 escrow on-chain for the Web3 wallet-to-wallet flow.
 * This function only creates the escrow entry on the contract; it does not fund it.
 */
async function createV3Escrow({ payerAddress, recipientAddress, amount, custodyAmount, custodyPeriod }) {
    console.log('[escrowV3Service] Creating V3 escrow:', { payerAddress, recipientAddress, amount, custodyAmount, custodyPeriod });
    const amountInTokenUnits = ethers_1.ethers.parseUnits(amount.toString(), 6);
    const custodyAmountInTokenUnits = ethers_1.ethers.parseUnits(custodyAmount || amount, 6); // Default to full amount
    const custodyPeriodSeconds = (custodyPeriod || 1) * 24 * 60 * 60; // Convert days to seconds
    // Call with the correct 8 parameters matching the v3 contract
    const tx = await exports.escrowV3Contract.createEscrow(recipientAddress, // seller address
    amountInTokenUnits, // total amount
    custodyAmountInTokenUnits, // custody amount  
    custodyPeriodSeconds, // custody period in seconds
    ethers_1.ethers.ZeroAddress, // userCommissionBeneficiary (none for now)
    0, // userCommissionAmount (none for now)
    ethers_1.ethers.ZeroAddress, // platformCommissionBeneficiary (none for now)
    0 // platformCommissionAmount (none for now)
    );
    const receipt = await tx.wait();
    console.log('[escrowV3Service] V3 Escrow creation transaction completed:', tx.hash);
    let escrowId;
    for (const log of receipt.logs) {
        try {
            const parsedLog = exports.escrowV3Contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'EscrowCreated') {
                escrowId = parsedLog.args.escrowId?.toString();
                break;
            }
        }
        catch (e) { /* ignore */ }
    }
    if (!escrowId) {
        throw new Error('Failed to extract V3 escrow ID from transaction logs');
    }
    return { escrowId, txHash: tx.hash };
}
/**
 * Funds a V3 escrow from a user's wallet using PortalHQ's MPC signing.
 * This requires the user's wallet (funder) to have approved the V3 contract to spend their tokens.
 */
async function fundV3Escrow({ funderAddress, escrowId, amount, userPortalShare, }) {
    console.log('[escrowV3Service] Preparing to fund V3 escrow via Portal:', { funderAddress, escrowId, amount });
    const amountInTokenUnits = ethers_1.ethers.parseUnits(amount.toString(), 6);
    // 1. Encode the transaction data for the `fundEscrowFrom` function call
    const txData = exports.escrowV3Contract.interface.encodeFunctionData('fundEscrowFrom', [
        funderAddress,
        escrowId,
        amountInTokenUnits,
    ]);
    // 2. Use the Portal Signer service to sign and broadcast the transaction
    const txHash = await (0, portalSignerService_1.signAndBroadcastWithPortal)({
        userWalletAddress: funderAddress,
        userPortalShare: userPortalShare,
        userPortalClientId: 'placeholder', // Portal operations moved to frontend
        to: ESCROW_ADDRESS,
        data: txData,
    });
    console.log('[escrowV3Service] V3 Escrow funding transaction sent via Portal. Hash:', txHash);
    return { txHash };
}
/**
 * Releases the funds from a V3 escrow to the seller.
 * This can only be called after the custody period has ended and if there is no active dispute.
 */
async function releaseV3Escrow(escrowId) {
    console.log('[escrowV3Service] Releasing V3 escrow:', { escrowId });
    const tx = await exports.escrowV3Contract.releaseEscrow(escrowId);
    const receipt = await tx.wait();
    console.log('[escrowV3Service] V3 Escrow release transaction completed:', receipt.hash);
    return { txHash: receipt.hash };
}
