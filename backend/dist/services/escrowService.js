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
exports.escrowContract = void 0;
exports.transferMXNBToJunoWallet = transferMXNBToJunoWallet;
exports.createEscrow = createEscrow;
exports.releaseCustody = releaseCustody;
exports.raiseDispute = raiseDispute;
exports.resolveDispute = resolveDispute;
exports.getEscrow = getEscrow;
exports.releaseEscrow = releaseEscrow;
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log('[escrowService] Starting import');
console.log('[escrowService] ENV.ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('[escrowService] ENV.ESCROW_CONTRACT_ADDRESS_2:', process.env.ESCROW_CONTRACT_ADDRESS_2);
console.log('[escrowService] ENV.ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');
// Artifact paths - Updated to use KustodiaEscrow2_0
const escrowArtifactPath = path.resolve(__dirname, '../artifacts/contracts/KustodiaEscrow2_0.sol/KustodiaEscrow2_0.json');
const erc20ArtifactPath = path.resolve(__dirname, '../artifacts/contracts/MockERC20.sol/MockERC20.json');
console.log('[escrowService] Resolved KustodiaEscrow2_0.json path:', escrowArtifactPath);
console.log('[escrowService] Resolved ERC20.json path:', erc20ArtifactPath);
console.log('[escrowService] KustodiaEscrow2_0.json exists:', fs.existsSync(escrowArtifactPath));
console.log('[escrowService] ERC20.json exists:', fs.existsSync(erc20ArtifactPath));
// Arbitrum testnet/configurable
const RPC_URL = process.env.ETH_RPC_URL;
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
// Use mainnet deployer/escrow key from env
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const signer = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
// Use ESCROW_CONTRACT_ADDRESS_2 for the new KustodiaEscrow2_0 contract
const ESCROW_ADDRESS = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
console.log('[escrowService] Using ESCROW_CONTRACT_ADDRESS_2:', ESCROW_ADDRESS);
// Mainnet contract addresses
const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS;
// Load ABIs with error handling
let ESCROW_ABI;
try {
    const KustodiaEscrowArtifact = require(escrowArtifactPath);
    ESCROW_ABI = KustodiaEscrowArtifact.abi;
    console.log('[escrowService] Successfully loaded KustodiaEscrow2_0 ABI');
}
catch (error) {
    console.error('[escrowService] Failed to load KustodiaEscrow2_0 artifact:', error.message);
    console.log('[escrowService] Using fallback minimal ABI');
    // Minimal ABI with essential functions for basic operation
    ESCROW_ABI = [
        "function createEscrow(address token, uint256 amount, address recipient, string memory reference) external returns (uint256)",
        "function releaseEscrow(uint256 escrowId) external",
        "function getEscrow(uint256 escrowId) external view returns (tuple(address token, uint256 amount, address sender, address recipient, string reference, bool released, uint256 createdAt))",
        "event EscrowCreated(uint256 indexed escrowId, address indexed sender, address indexed recipient, address token, uint256 amount, string reference)",
        "event EscrowReleased(uint256 indexed escrowId)"
    ];
}
// MXNB is a proxy contract. Merge proxy ABI with ERC20 ABI for full functionality.
const PROXY_ABI = [
    { "inputs": [{ "internalType": "address", "name": "implementationContract", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "AdminChanged", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" },
    { "stateMutability": "payable", "type": "fallback" },
    { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "changeAdmin", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "implementation", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }], "name": "upgradeTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "upgradeToAndCall", "outputs": [], "stateMutability": "payable", "type": "function" }
];
// Load ERC20 ABI from artifact if available, otherwise use minimal ERC20 ABI
let ERC20_ABI = [];
try {
    ERC20_ABI = JSON.parse(fs.readFileSync(erc20ArtifactPath, "utf8")).abi;
}
catch (e) {
    // Fallback: minimal ERC20 ABI
    ERC20_ABI = [
        { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" },
        { "constant": false, "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" },
        { "constant": true, "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "type": "function" },
        { "constant": false, "inputs": [{ "name": "recipient", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }
    ];
}
// Merge proxy and ERC20 ABIs
const TOKEN_ABI = [...PROXY_ABI, ...ERC20_ABI];
exports.escrowContract = new ethers_1.ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
const tokenContract = new ethers_1.ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
/**
 * Transfers MXNB from the platform bridge wallet to the platform Juno wallet.
 * @param amount Amount of MXNB to transfer (as string, in token decimals)
 * @param to Destination address (platform Juno wallet)
 * @returns Transaction hash
 */
async function transferMXNBToJunoWallet(amount, to) {
    try {
        const tx = await tokenContract.transfer(to, amount);
        const receipt = await tx.wait();
        console.log(`[MXNB Transfer] Success. Tx hash: ${tx.hash}`);
        return tx.hash;
    }
    catch (err) {
        console.error('[MXNB Transfer] Error:', err);
        throw err;
    }
}
// Updated createEscrow function to match KustodiaEscrow2_0 API
// Flow 2 will use conditions and verticals, current flow can pass null values
async function createEscrow({ payer, payee, token, amount, deadline, vertical, clabe, conditions }) {
    console.log('[escrowService] Creating escrow with KustodiaEscrow2_0:', {
        payer, payee, token, amount, deadline, vertical, clabe
    });
    // Convert amount to token units (MXNB uses 6 decimals)
    // Handle both string and number inputs
    const amountString = amount.toString();
    const amountInTokenUnits = ethers_1.ethers.parseUnits(amountString, 6);
    console.log('[escrowService] Amount conversion:', {
        original: amountString,
        amountInTokenUnits: amountInTokenUnits.toString(),
        decimals: 6
    });
    // Check current allowance
    const currentAllowance = await tokenContract.allowance(signer.address, ESCROW_ADDRESS);
    console.log('[escrowService] Current allowance:', currentAllowance.toString());
    if (currentAllowance < amountInTokenUnits) {
        console.log('[escrowService] Insufficient allowance, approving token spend');
        if (currentAllowance > BigInt(0)) {
            const resetTx = await tokenContract.approve(ESCROW_ADDRESS, 0);
            await resetTx.wait();
        }
        const approveTx = await tokenContract.approve(ESCROW_ADDRESS, amountInTokenUnits);
        await approveTx.wait();
        console.log('[escrowService] Token approval completed');
    }
    // Create escrow on-chain with the new contract parameters
    // Handle null values for Flow 2 compatibility
    const tx = await exports.escrowContract.createEscrow(payer, payee, token, amountInTokenUnits, // Use converted token units (6 decimals for MXNB)
    deadline, vertical || '', // Convert null to empty string for smart contract
    clabe, conditions || '' // Convert null to empty string for smart contract
    );
    const receipt = await tx.wait();
    console.log('[escrowService] Escrow creation transaction completed:', tx.hash);
    // Parse events from receipt to get escrow ID (ethers v6 fix)
    let escrowId;
    for (const log of receipt.logs) {
        try {
            const parsedLog = exports.escrowContract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'EscrowCreated') {
                escrowId = parsedLog.args.escrowId?.toString();
                console.log('[escrowService] Found EscrowCreated event, escrowId:', escrowId);
                break;
            }
        }
        catch (e) {
            // Skip unparseable logs
        }
    }
    // If still undefined, try manual topic parsing as fallback
    if (!escrowId) {
        console.log('[escrowService] Falling back to manual topic parsing...');
        const escrowCreatedTopic = ethers_1.ethers.id("EscrowCreated(uint256,address,address,uint256,string,string)");
        const escrowLog = receipt.logs.find((log) => log.topics[0] === escrowCreatedTopic);
        if (escrowLog && escrowLog.topics[1]) {
            escrowId = ethers_1.ethers.toBigInt(escrowLog.topics[1]).toString();
            console.log('[escrowService] Extracted escrow ID from topics:', escrowId);
        }
    }
    console.log('[escrowService] Escrow created with ID:', escrowId?.toString());
    // CRITICAL: KustodiaEscrow2_0 requires calling fundEscrow() to properly fund the escrow
    console.log('[escrowService] Funding escrow using fundEscrow function...');
    const fundTx = await exports.escrowContract.fundEscrow(escrowId);
    await fundTx.wait();
    console.log('[escrowService] Escrow funding completed:', fundTx.hash);
    // Ensure escrowId is defined before returning
    if (!escrowId) {
        throw new Error('Failed to extract escrow ID from transaction logs');
    }
    // Return both escrowId and transaction hash
    return { escrowId: escrowId.toString(), txHash: tx.hash };
}
// Updated releaseCustody to use 'release' function from KustodiaEscrow2_0
async function releaseCustody(escrowId) {
    console.log('[escrowService] Releasing escrow with ID:', escrowId);
    const tx = await exports.escrowContract.release(escrowId); // Changed from releaseCustody to release
    await tx.wait();
    console.log('[escrowService] Escrow release transaction completed:', tx.hash);
}
// Updated raiseDispute to use 'dispute' function from KustodiaEscrow2_0  
async function raiseDispute(escrowId, reason) {
    console.log('[escrowService] Raising dispute for escrow ID:', escrowId, 'with reason:', reason);
    const tx = await exports.escrowContract.dispute(escrowId, reason); // Updated function signature
    await tx.wait();
    console.log('[escrowService] Dispute raised transaction completed:', tx.hash);
}
// Updated resolveDispute to match KustodiaEscrow2_0 API
async function resolveDispute(escrowId, inFavorOfSeller) {
    console.log('[escrowService] Resolving dispute for escrow ID:', escrowId, 'in favor of seller:', inFavorOfSeller);
    const tx = await exports.escrowContract.resolveDispute(escrowId, inFavorOfSeller); // Updated parameter name
    await tx.wait();
    console.log('[escrowService] Dispute resolution transaction completed:', tx.hash);
}
async function getEscrow(escrowId) {
    return await exports.escrowContract.escrows(escrowId);
}
// Alias for backward compatibility with existing scripts
async function releaseEscrow(escrowId) {
    return await releaseCustody(escrowId);
}
