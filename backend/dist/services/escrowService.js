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
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
console.log('[escrowService] Starting import');
console.log('[escrowService] ENV.ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('[escrowService] ENV.ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');
// Artifact paths
const escrowArtifactPath = path.join(__dirname, '../../artifacts/contracts/KustodiaEscrow.sol/KustodiaEscrow.json');
const erc20ArtifactPath = path.join(__dirname, '../../artifacts/contracts/ERC20.json');
console.log('[escrowService] Resolved KustodiaEscrow.json path:', escrowArtifactPath);
console.log('[escrowService] Resolved ERC20.json path:', erc20ArtifactPath);
console.log('[escrowService] KustodiaEscrow.json exists:', fs.existsSync(escrowArtifactPath));
console.log('[escrowService] ERC20.json exists:', fs.existsSync(erc20ArtifactPath));
// Arbitrum testnet/configurable
const RPC_URL = process.env.ETH_RPC_URL;
const provider = new ethers_1.ethers.providers.JsonRpcProvider(RPC_URL);
// Use mainnet deployer/escrow key from env
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const signer = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
// Mainnet contract addresses
const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;
const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS;
// Load ABIs
const KustodiaEscrowArtifact = require(escrowArtifactPath);
const ESCROW_ABI = KustodiaEscrowArtifact.abi;
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
async function createEscrow({ seller, custodyAmount, custodyPeriod }) {
    // Check current allowance
    const currentAllowance = await tokenContract.allowance(signer.address, ESCROW_ADDRESS);
    if (currentAllowance.lt(custodyAmount)) {
        if (!currentAllowance.isZero()) {
            const resetTx = await tokenContract.approve(ESCROW_ADDRESS, 0);
            await resetTx.wait();
        }
        const approveTx = await tokenContract.approve(ESCROW_ADDRESS, custodyAmount);
        await approveTx.wait();
    }
    // Create escrow on-chain with the custody amount
    const tx = await exports.escrowContract.createEscrow(seller, custodyAmount, custodyPeriod);
    const receipt = await tx.wait();
    // Find EscrowCreated event
    const event = receipt.events?.find((e) => e.event === "EscrowCreated");
    const escrowId = event?.args?.escrowId;
    // Return both escrowId and transaction hash
    return { escrowId: escrowId?.toString(), txHash: tx.hash };
}
async function releaseCustody(escrowId) {
    const tx = await exports.escrowContract.releaseCustody(escrowId);
    await tx.wait();
}
async function raiseDispute(escrowId) {
    const tx = await exports.escrowContract.raiseDispute(escrowId);
    await tx.wait();
}
async function resolveDispute(escrowId, releaseToSeller) {
    const tx = await exports.escrowContract.resolveDispute(escrowId, releaseToSeller);
    await tx.wait();
}
async function getEscrow(escrowId) {
    return exports.escrowContract.escrows(escrowId);
}
