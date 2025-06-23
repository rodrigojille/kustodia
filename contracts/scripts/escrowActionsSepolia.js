// scripts/escrowActionsSepolia.js
// Script para liberar, disputar y consultar saldo de un escrow real en Arbitrum Sepolia
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const fs = require('fs');
  const path = require('path');
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const abiPath = path.join(__dirname, 'KustodiaEscrow2_0.abi.json');
  const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const bridgePrivateKey = process.env.DEPLOYER_PRIVATE_KEY; // Bridge wallet para liberar/disputar
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const bridgeWallet = new ethers.Wallet(bridgePrivateKey, provider);

  const escrow = new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS,
    KustodiaEscrowABI,
    bridgeWallet
  );

  const ACTION = "resolveDisputeSeller";
  console.log("ACTION:", ACTION);

  const nextEscrowId = await escrow.nextEscrowId();
  const escrowId = nextEscrowId - 1n;
  if (escrowId < 0n) throw new Error('No hay escrows creados');
  console.log("EscrowId a resolver:", escrowId.toString());

  try {
    console.log("Intentando resolver disputa a favor del seller para escrowId:", escrowId.toString());
    console.log("Este script está listo para acciones manuales unitarias. Usa fullEscrowLifecycleSepolia.js para pruebas end-to-end.");
    return;
  } catch (e) {
    console.error("Error en resolveDisputeSeller:", e);
  }
  return;

  if (ACTION === "dispute") {
    const reason = "Test: disputa automática";
    const tx = await escrow.dispute(escrowId, reason);
    await tx.wait();
    console.log("Escrow disputado. Tx:", tx.hash);
    return;
  }
}

main().catch(console.error);
