import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const RPC_URL = process.env.ETH_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const PROXY_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2!;
const ESCROW_ID = process.env.ESCROW_ID || "1"; // Set this to the escrowId you want to fund

const ABI = [
  "function fundEscrow(uint256 escrowId) public",
  "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(PROXY_ADDRESS, ABI, signer);

  // Optionally, check escrow details
  const escrow = await contract.escrows(ESCROW_ID);
  console.log("Escrow details before funding:", escrow);

  // Call fundEscrow
  console.log(`Funding escrowId ${ESCROW_ID} ...`);
  const tx = await contract.fundEscrow(ESCROW_ID, { gasLimit: 500_000 });
  const receipt = await tx.wait();
  console.log("fundEscrow txHash:", receipt.transactionHash);

  // Optionally, check escrow details again
  const updatedEscrow = await contract.escrows(ESCROW_ID);
  console.log("Escrow details after funding:", updatedEscrow);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
