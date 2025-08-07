import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';
import { getCurrentNetworkConfig } from '../utils/networkConfig';

// Load environment variables with explicit path
const envPath = path.resolve(__dirname, '../../../.env');
console.log('[escrowService] Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('[escrowService] Environment variables check:', {
  BRIDGE_WALLET_MAIN: process.env.BRIDGE_WALLET_MAIN || 'NOT SET',
  PLATFORM_WALLET_MAIN: process.env.PLATFORM_WALLET_MAIN || 'NOT SET',
  JUNO_MAIN_WALLET: process.env.JUNO_MAIN_WALLET || 'NOT SET'
});

// Get current network configuration
const networkConfig = getCurrentNetworkConfig();
console.log('[escrowService] Network config values:', {
  bridgeWallet: networkConfig.bridgeWallet || 'NOT SET',
  platformWallet: networkConfig.platformWallet || 'NOT SET',
  junoWallet: networkConfig.junoWallet || 'NOT SET',
  networkName: networkConfig.networkName
});

console.log('[escrowService] Starting import');
console.log('[escrowService] ENV.ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('[escrowService] ENV.ESCROW_CONTRACT_ADDRESS_2:', process.env.ESCROW_CONTRACT_ADDRESS_2);
console.log('[escrowService] ENV.ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');

// Artifact paths - Network-aware ABI loading
// In production (dist), artifacts are in dist/artifacts/
// In development, they're copied from src/artifacts/ to dist/artifacts/
const artifactsBase = path.resolve(__dirname, '../artifacts');
const escrowArtifactPath = path.resolve(artifactsBase, networkConfig.escrowAbiPath);
const erc20ArtifactPath = path.resolve(artifactsBase, 'contracts/MockERC20.sol/MockERC20.json');
console.log(`[escrowService] Network: ${networkConfig.networkName}`);
console.log(`[escrowService] Using ABI: ${networkConfig.escrowAbiPath}`);
console.log('[escrowService] Resolved escrow ABI path:', escrowArtifactPath);
console.log('[escrowService] Resolved ERC20.json path:', erc20ArtifactPath);
console.log('[escrowService] Escrow ABI exists:', fs.existsSync(escrowArtifactPath));
console.log('[escrowService] ERC20.json exists:', fs.existsSync(erc20ArtifactPath));

// Dynamic network configuration
const RPC_URL = networkConfig.rpcUrl;
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Use network-specific private key
const PRIVATE_KEY = networkConfig.privateKey;
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Use network-specific escrow contract address
const ESCROW_ADDRESS = networkConfig.escrowV2Address;
console.log(`[escrowService] Using Escrow V2 Address (${networkConfig.networkName}):`, ESCROW_ADDRESS);

// Network-specific MXNB token contract address
const TOKEN_ADDRESS = networkConfig.mxnbTokenAddress;
console.log(`[escrowService] MXNB Token Address (${networkConfig.networkName}):`, TOKEN_ADDRESS);

// Load ABIs with error handling
let ESCROW_ABI;
try {
  const KustodiaEscrowArtifact = require(escrowArtifactPath);
  ESCROW_ABI = KustodiaEscrowArtifact.abi;
  console.log(`[escrowService] Successfully loaded ${networkConfig.escrowAbiPath.split('/').pop()} ABI`);
} catch (error: any) {
  console.error(`[escrowService] Failed to load ${networkConfig.escrowAbiPath} artifact:`, error.message);
  console.log('[escrowService] Using fallback minimal ABI');
  // Minimal ABI with essential functions for basic operation - Updated to match KustodiaEscrow2_0
  ESCROW_ABI = [
    "function createEscrow(address payer, address payee, address token, uint256 amount, uint256 deadline, string memory vertical, string memory clabe, string memory conditions) external returns (uint256)",
    "function fundEscrow(uint256 escrowId) external",
    "function releaseEscrow(uint256 escrowId) external",
    "function release(uint256 escrowId) external",
    "function dispute(uint256 escrowId, string memory reason) external",
    "function resolveDispute(uint256 escrowId, bool inFavorOfSeller) external",
    "function getEscrow(uint256 escrowId) external view returns (tuple(address token, uint256 amount, address sender, address recipient, string reference, bool released, uint256 createdAt))",
    "event EscrowCreated(uint256 indexed escrowId, address indexed sender, address indexed recipient, address token, uint256 amount, string reference)",
    "event EscrowReleased(uint256 indexed escrowId)"
  ];
}
// MXNB is a proxy contract. Merge proxy ABI with ERC20 ABI for full functionality.
const PROXY_ABI = [
  {"inputs":[{"internalType":"address","name":"implementationContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},
  {"stateMutability":"payable","type":"fallback"},
  {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}
];

// Load ERC20 ABI from artifact if available, otherwise use minimal ERC20 ABI
let ERC20_ABI: any[] = [];
try {
  ERC20_ABI = JSON.parse(fs.readFileSync(erc20ArtifactPath, "utf8")).abi;
} catch (e) {
  // Fallback: minimal ERC20 ABI
  ERC20_ABI = [
    {"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},
    {"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},
    {"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}
  ];
}

// Merge proxy and ERC20 ABIs
const TOKEN_ABI = [...PROXY_ABI, ...ERC20_ABI];

export const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

/**
 * Transfers MXNB from the platform bridge wallet to the platform Juno wallet.
 * @param amount Amount of MXNB to transfer (as string, in token decimals)
 * @param to Destination address (platform Juno wallet)
 * @returns Transaction hash
 */
export async function transferMXNBToJunoWallet(amount: string, to: string): Promise<string> {
  try {
    const tx = await tokenContract.transfer(to, amount);
    const receipt = await tx.wait();
    console.log(`[MXNB Transfer] Success. Tx hash: ${tx.hash}`);
    return tx.hash;
  } catch (err) {
    console.error('[MXNB Transfer] Error:', err);
    throw err;
  }
}

/**
 * Sanitizes a string to be ENS-compatible by removing spaces and special characters
 * @param input The input string to sanitize
 * @returns ENS-compatible string
 */
function sanitizeForENS(input: string | null, defaultValue: string = 'default'): string {
  if (!input || input.trim() === '') return defaultValue;
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Updated createEscrow function to match KustodiaEscrow2_0 API
// Flow 2 will use conditions and verticals, current flow can pass null values
export async function createEscrow({
  payer,
  payee,
  token,
  amount,
  deadline,
  vertical,
  clabe,
  conditions
}: {
  payer: string,
  payee: string,
  token: string,
  amount: string,
  deadline: number,
  vertical: string | null,
  clabe: string,
  conditions: string | null
}) {
  console.log('[escrowService] Creating escrow with KustodiaEscrow2_0:', {
    payer, payee, token, amount, deadline, vertical, clabe
  });

  // Convert amount to token units (MXNB uses 6 decimals)
  // Handle both string and number inputs
  const amountString = amount.toString();
  const amountInTokenUnits = ethers.parseUnits(amountString, 6);
  
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
  const sanitizedVertical = sanitizeForENS(vertical, 'general');
  const sanitizedConditions = sanitizeForENS(conditions, 'standard-custody');
  
  console.log('[escrowService] Final parameters before smart contract call:', {
    payer,
    payee,
    token,
    amountInTokenUnits: amountInTokenUnits.toString(),
    deadline,
    sanitizedVertical,
    clabe,
    sanitizedConditions
  });
  
  // Validate addresses before making the call
  if (!ethers.isAddress(payer)) {
    throw new Error(`Invalid payer address: ${payer}`);
  }
  if (!ethers.isAddress(payee)) {
    throw new Error(`Invalid payee address: ${payee}`);
  }
  if (!ethers.isAddress(token)) {
    throw new Error(`Invalid token address: ${token}`);
  }
  
  // Validate contract exists
  console.log('[escrowService] Contract address:', escrowContract.target);
  const contractCode = await provider.getCode(escrowContract.target as string);
  console.log('[escrowService] Contract code length:', contractCode.length);
  if (contractCode === '0x') {
    throw new Error(`No contract found at address: ${escrowContract.target}`);
  }
  
  let tx;
  try {
    console.log('[escrowService] Calling createEscrow with parameters...');
    // Ensure BigInt parameters are properly handled for ethers v6
    tx = await escrowContract.createEscrow(
      payer,                    // address payer
      payee,                    // address payee
      amountInTokenUnits,       // uint256 amount (BigInt)
      BigInt(deadline),         // uint256 deadline (convert to BigInt)
      sanitizedVertical,        // string memory vertical
      clabe,                    // string memory clabe
      sanitizedConditions,      // string memory conditions
      token                     // address token
    );
    console.log('[escrowService] Transaction created:', tx.hash);
  } catch (contractError: any) {
    console.error('[escrowService] Contract call failed:', {
      error: contractError.message,
      code: contractError.code,
      data: contractError.data,
      reason: contractError.reason,
      transaction: contractError.transaction
    });
    throw contractError;
  }
  
  const receipt = await tx.wait();
  console.log('[escrowService] Escrow creation transaction completed:', tx.hash);

  // Parse events from receipt to get escrow ID (ethers v6 fix)
  let escrowId: string | undefined;
  for (const log of receipt.logs) {
    try {
      const parsedLog = escrowContract.interface.parseLog(log);
      if (parsedLog && parsedLog.name === 'EscrowCreated') {
        escrowId = parsedLog.args.escrowId?.toString();
        console.log('[escrowService] Found EscrowCreated event, escrowId:', escrowId);
        console.log('[escrowService] Event args:', {
          escrowId: parsedLog.args.escrowId?.toString(),
          payer: parsedLog.args.payer,
          payee: parsedLog.args.payee,
          amount: parsedLog.args.amount?.toString(),
          vertical: parsedLog.args.vertical,
          clabe: parsedLog.args.clabe
        });
        break;
      }
    } catch (e) {
      console.log('[escrowService] Failed to parse log:', e);
    }
  }
  
  // If still undefined, try manual topic parsing as fallback
  if (!escrowId) {
    console.log('[escrowService] Falling back to manual topic parsing...');
    const escrowCreatedTopic = ethers.id("EscrowCreated(uint256,address,address,uint256,string,string)");
    const escrowLog = receipt.logs.find((log: any) => log.topics[0] === escrowCreatedTopic);
    if (escrowLog && escrowLog.topics[1]) {
      escrowId = ethers.toBigInt(escrowLog.topics[1]).toString();
      console.log('[escrowService] Extracted escrow ID from topics:', escrowId);
    }
  }
  console.log('[escrowService] Escrow created with ID:', escrowId?.toString());
  
  // Note: Pausable contract creates escrow in Pending status, requiring separate funding
  console.log('[escrowService] Escrow created successfully, ID:', escrowId);
  console.log('[escrowService] Note: Escrow is in Pending status and needs to be funded separately');
  
  // Ensure escrowId is defined before returning
  if (!escrowId) {
    throw new Error('Failed to extract escrow ID from transaction logs');
  }
  
  // Return both escrowId and transaction hash
  return { escrowId: escrowId.toString(), txHash: tx.hash };
}

// Fund an existing escrow (for pausable contract)
export async function fundEscrow(escrowId: string, tokenAddress: string, amount: string): Promise<string> {
  console.log('[escrowService] Funding escrow ID:', escrowId, 'with amount:', amount);
  
  // Convert amount to token units (assuming 6 decimals for MXNB)
  const amountInTokenUnits = BigInt(parseFloat(amount) * 1000000);
  
  // Get token contract
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  
  // Check and approve if needed
  const currentAllowance = await tokenContract.allowance(signer.address, ESCROW_ADDRESS);
  console.log('[escrowService] Current allowance for funding:', currentAllowance.toString());
  
  if (currentAllowance < amountInTokenUnits) {
    console.log('[escrowService] Insufficient allowance for funding, approving...');
    if (currentAllowance > BigInt(0)) {
      const resetTx = await tokenContract.approve(ESCROW_ADDRESS, 0);
      await resetTx.wait();
    }
    const approveTx = await tokenContract.approve(ESCROW_ADDRESS, amountInTokenUnits);
    await approveTx.wait();
    console.log('[escrowService] Token approval for funding completed');
  }
  
  // Fund the escrow
  const fundTx = await escrowContract.fundEscrow(BigInt(escrowId));
  await fundTx.wait();
  console.log('[escrowService] Escrow funding completed:', fundTx.hash);
  
  return fundTx.hash;
}

// Updated releaseCustody to use correct function based on network
export async function releaseCustody(escrowId: number): Promise<string> {
  console.log('[escrowService] Releasing escrow with ID:', escrowId);
  
  // Use correct function name based on network
  // Mainnet (Escrow V2 Pausable): releaseEscrow
  // Testnet (Escrow V2): release
  const networkConfig = getCurrentNetworkConfig();
  let tx;
  
  if (networkConfig.networkName.includes('Mainnet')) {
    console.log('[escrowService] Using releaseEscrow for mainnet (Escrow V2 Pausable)');
    tx = await escrowContract.releaseEscrow(BigInt(escrowId));
  } else {
    console.log('[escrowService] Using release for testnet (Escrow V2)');
    tx = await escrowContract.release(BigInt(escrowId));
  }
  
  await tx.wait();
  console.log('[escrowService] Escrow release transaction completed:', tx.hash);
  return tx.hash;
}

// Updated raiseDispute to use 'dispute' function from KustodiaEscrow2_0  
export async function raiseDispute(escrowId: number, reason: string) {
  console.log('[escrowService] Raising dispute for escrow ID:', escrowId, 'with reason:', reason);
  const tx = await escrowContract.dispute(BigInt(escrowId), reason); // Updated function signature
  await tx.wait();
  console.log('[escrowService] Dispute raised transaction completed:', tx.hash);
}

// Updated resolveDispute to match KustodiaEscrow2_0 API
export async function resolveDispute(escrowId: number, inFavorOfSeller: boolean) {
  console.log('[escrowService] Resolving dispute for escrow ID:', escrowId, 'in favor of seller:', inFavorOfSeller);
  const tx = await escrowContract.resolveDispute(BigInt(escrowId), inFavorOfSeller); // Updated parameter name
  await tx.wait();
  console.log('[escrowService] Dispute resolution transaction completed:', tx.hash);
}

export async function getEscrow(escrowId: number) {
  return await escrowContract.escrows(BigInt(escrowId));
}

// Alias for backward compatibility with existing scripts
export async function releaseEscrow(escrowId: number): Promise<string> {
  return await releaseCustody(escrowId);
}

// Pause/Unpause utility functions (only for pausable contracts)
export async function isContractPaused(): Promise<boolean> {
  try {
    // Only check if we're using a pausable contract
    if (!networkConfig.escrowAbiPath.includes('Pausable')) {
      console.log('[escrowService] Contract is not pausable, returning false');
      return false;
    }
    
    const paused = await escrowContract.paused();
    console.log(`[escrowService] Contract paused status: ${paused}`);
    return paused;
  } catch (error: any) {
    console.error('[escrowService] Error checking pause status:', error.message);
    return false;
  }
}

export async function unpauseContract(): Promise<string | null> {
  try {
    // Only unpause if we're using a pausable contract
    if (!networkConfig.escrowAbiPath.includes('Pausable')) {
      console.log('[escrowService] Contract is not pausable, no unpause needed');
      return null;
    }
    
    const isPaused = await isContractPaused();
    if (!isPaused) {
      console.log('[escrowService] Contract is already unpaused');
      return null;
    }
    
    console.log('[escrowService] Attempting to unpause contract...');
    const tx = await escrowContract.unpause();
    await tx.wait();
    
    console.log(`[escrowService] Contract unpaused successfully: ${tx.hash}`);
    return tx.hash;
  } catch (error: any) {
    console.error('[escrowService] Error unpausing contract:', error.message);
    throw error;
  }
}

export async function checkAndUnpauseIfNeeded(): Promise<boolean> {
  try {
    const isPaused = await isContractPaused();
    if (isPaused) {
      console.log('[escrowService] Contract is paused, attempting to unpause...');
      await unpauseContract();
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('[escrowService] Error in checkAndUnpauseIfNeeded:', error.message);
    return false;
  }
}
