const { ethers } = require("ethers");
require("dotenv").config();

const ESCROW_CONTRACT = "0xA611101769DbaB678a2380c0550fFf887d7A8A18";
const BRIDGE_WALLET_PK = process.env.BRIDGE_WALLET_PRIVATE_KEY;
const PROVIDER_URL = process.env.ARBITRUM_RPC_URL;
const ESCROW_ID = 71;

const ABI = [
  "function releaseCustody(uint256 escrowId) external"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
  const signer = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
  const escrow = new ethers.Contract(ESCROW_CONTRACT, ABI, signer);

  const tx = await escrow.releaseCustody(ESCROW_ID);
  console.log("releaseCustody tx:", tx.hash);
  await tx.wait();
  console.log("Funds released to bridge wallet!");
}

main().catch(console.error);
