import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const RPC_URL = process.env.ETH_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const PROXY_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2!;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET!;
const PLATFORM_WALLET = process.env.ESCROW_PLATFORM_WALLET || BRIDGE_WALLET; // fallback

const ABI = [
  "function setBridgeWallet(address _bridgeWallet) public",
  "function setPlatformWallet(address _platformWallet) public",
  "function bridgeWallet() view returns (address)",
  "function platformWallet() view returns (address)",
  "function owner() view returns (address)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(PROXY_ADDRESS, ABI, signer);

  // Check owner
  const owner = await contract.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer is not the contract owner. Owner: ${owner}, Signer: ${signer.address}`);
  }

  // Set bridge wallet
  console.log("Setting bridge wallet to:", BRIDGE_WALLET);
  const tx1 = await contract.setBridgeWallet(BRIDGE_WALLET, { gasLimit: 500_000 });
  await tx1.wait();
  console.log("Bridge wallet set!");

  // Set platform wallet
  console.log("Setting platform wallet to:", PLATFORM_WALLET);
  const tx2 = await contract.setPlatformWallet(PLATFORM_WALLET, { gasLimit: 500_000 });
  await tx2.wait();
  console.log("Platform wallet set!");

  // Confirm
  const newBridge = await contract.bridgeWallet();
  const newPlatform = await contract.platformWallet();
  console.log("bridgeWallet:", newBridge);
  console.log("platformWallet:", newPlatform);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});