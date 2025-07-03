import { ethers } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const RPC_URL = process.env.ETH_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const PROXY_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2!;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET!;
const PLATFORM_WALLET = process.env.ESCROW_PLATFORM_WALLET || BRIDGE_WALLET; // fallback

const ABI = [
  "function initialize(address _bridgeWallet, address _platformWallet) public",
  "function owner() view returns (address)",
  "function bridgeWallet() view returns (address)",
  "function platformWallet() view returns (address)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(PROXY_ADDRESS, ABI, signer);

  // Check owner
  const owner = await contract.owner();
  console.log("Current owner:", owner);
  if (owner !== "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract already initialized or owner set. Owner: ${owner}`);
  }

  // Call initialize
  console.log("Calling initialize with:", BRIDGE_WALLET, PLATFORM_WALLET);
  const tx = await contract.initialize(BRIDGE_WALLET, PLATFORM_WALLET, { gasLimit: 500_000 });
  await tx.wait();
  console.log("Initialization transaction sent and confirmed!");

  // Confirm
  const newOwner = await contract.owner();
  const newBridge = await contract.bridgeWallet();
  const newPlatform = await contract.platformWallet();
  console.log("owner:", newOwner);
  console.log("bridgeWallet:", newBridge);
  console.log("platformWallet:", newPlatform);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
