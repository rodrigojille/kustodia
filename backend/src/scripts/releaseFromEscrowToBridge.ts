export {};
// CLABE/SPEI Flow - Release MXNB from escrow contract to bridge wallet
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ESCROW_CONTRACT = "0xa5B45Dc1cF2E44844EBA557dF29687D24F5d8543"; // KustodiaEscrow2_0 contract address
const BRIDGE_WALLET_PK = process.env.DEPLOYER_PRIVATE_KEY;
const BRIDGE_WALLET_ADDRESS = process.env.ESCROW_BRIDGE_WALLET;
if (!BRIDGE_WALLET_PK) throw new Error('Missing DEPLOYER_PRIVATE_KEY in .env');
if (!BRIDGE_WALLET_ADDRESS) throw new Error('Missing ESCROW_BRIDGE_WALLET (address) in .env');
const PROVIDER_URL = process.env.ETH_RPC_URL;
// Usage: ts-node releaseFromEscrowToBridge.ts <escrowId>
const ESCROW_ID = Number(process.argv[2]);
if (isNaN(ESCROW_ID)) {
  console.error('Usage: ts-node releaseFromEscrowToBridge.ts <escrowId>');
  process.exit(1);
}

const ABI = [
  "function release(uint256 escrowId) external"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  if (!BRIDGE_WALLET_PK) {
    throw new Error('DEPLOYER_PRIVATE_KEY (bridge wallet) is not set in environment variables.');
  }
  const signer = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
  const escrow = new ethers.Contract(ESCROW_CONTRACT, ABI, signer);

  try {
    const tx = await escrow.release(ESCROW_ID);
    console.log(`[${new Date().toISOString()}] Escrow ${ESCROW_ID} release tx:`, tx.hash);
    await tx.wait();
    console.log(`[${new Date().toISOString()}] Funds released to bridge wallet for escrow ${ESCROW_ID}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error releasing escrow ${ESCROW_ID}:`, err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`[${new Date().toISOString()}] Uncaught error:`, err);
  process.exit(1);
});
