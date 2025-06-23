require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;
  const bridgePrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const bridgeWallet = new ethers.Wallet(bridgePrivateKey, provider);
  const fs = require('fs');
  const path = require('path');
  const abiPath = path.join(__dirname, 'KustodiaEscrow2_0.abi.json');
  const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const escrow = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, KustodiaEscrowABI, bridgeWallet);

  console.log("Platform wallet actual:", await escrow.platformWallet());
  console.log("Seteando platform wallet a:", PLATFORM_WALLET_ADDRESS);
  const tx = await escrow.setPlatformWallet(PLATFORM_WALLET_ADDRESS);
  await tx.wait();
  console.log("Platform wallet actualizado:", await escrow.platformWallet());
}

main().catch(console.error);
