require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const abiPath = path.join(__dirname, "KustodiaEscrow2_0.abi.json");
  const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const bridgeWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  const escrow = new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS,
    KustodiaEscrowABI,
    bridgeWallet
  );

  // Obtener el último escrowId (el más reciente creado)
  const nextId = await escrow.nextEscrowId();
  const escrowId = Number(nextId) - 1;
  if (escrowId < 1) {
    throw new Error("No hay escrows para fondear.");
  }

  // Ejecutar fondeo
  const tx = await escrow.fundEscrow(escrowId);
  await tx.wait();
  console.log("Escrow fondeado. TxHash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
