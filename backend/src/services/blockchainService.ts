import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Use the correct environment variable names from the user's .env file
const rpcUrl = process.env.ETH_RPC_URL;
const privateKey = process.env.ESCROW_PRIVATE_KEY;
const contractAddress = process.env.MOCK_ERC20_ADDRESS;

if (!rpcUrl || !privateKey || !contractAddress) {
  throw new Error('Missing required blockchain environment variables. Please check your .env file for ETH_RPC_URL, ESCROW_PRIVATE_KEY, and MOCK_ERC20_ADDRESS.');
}

// Set up provider and wallet using ethers v5 syntax
const provider = new ethers.JsonRpcProvider(rpcUrl);
const bridgeWallet = new ethers.Wallet(privateKey, provider);
export const bridgeWalletAddress = bridgeWallet.address;

// Minimal ERC20 ABI for the transfer and decimals functions
const erc20Abi = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)'
];

// Create a contract instance using ethers v5 syntax
const mxnbContract = new ethers.Contract(contractAddress, erc20Abi, bridgeWallet);

/**
 * Sends MXNB tokens from the bridge wallet to a specified user address on Arbitrum Sepolia.
 * @param userAddress The recipient's wallet address.
 * @param amountMxn The amount of tokens to send, expressed in standard units (e.g., 100.50).
 * @returns The transaction hash of the blockchain transaction.
 */
export async function sendMxnbToAddress(userAddress: string, amountMxn: number): Promise<string> {
  try {
    console.log(`Preparing to send ${amountMxn} MXNB to ${userAddress} on Arbitrum Sepolia.`);

    // Get token decimals to convert the amount to the correct format
    const decimals = await mxnbContract.decimals();
    // Using ethers.utils.parseUnits for ethers v5 compatibility
    const amountInSmallestUnit = ethers.parseUnits(amountMxn.toString(), decimals);

    console.log(`Sending ${amountInSmallestUnit.toString()} (in smallest unit) to ${userAddress}.`);

    // Execute the transfer
    const tx = await mxnbContract.transfer(userAddress, amountInSmallestUnit);
    
    console.log(`Transaction sent. Hash: ${tx.hash}`);
    
    // We return the hash immediately. A separate process will watch for confirmation.
    return tx.hash;

  } catch (error) {
    console.error(`Blockchain transaction failed:`, error);
    throw new Error('Failed to send MXNB tokens.');
  }
}

/**
 * Fetches the receipt for a given transaction hash.
 * The receipt is available only after the transaction has been mined.
 * @param txHash The hash of the transaction to check.
 * @returns The transaction receipt, or null if it's not yet mined.
 */
export async function getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error(`Failed to get transaction receipt for hash ${txHash}:`, error);
    throw error;
  }
}
