// scripts/queryEscrowSepolia.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const fs = require('fs');
  const path = require('path');
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const abiPath = path.join(__dirname, 'KustodiaEscrow2_0.abi.json');
  const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const escrow = new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS,
    KustodiaEscrowABI,
    provider
  );

  const nextEscrowId = await escrow.nextEscrowId();
  const escrowId = nextEscrowId - 1n;
  if (escrowId < 0n) throw new Error('No hay escrows creados');
  console.log("Consultando escrowId:", escrowId.toString());

  const info = await escrow.escrows(escrowId);
  console.log('Escrow info:');
  console.log('  payer:', info.payer);
  console.log('  payee:', info.payee);
  console.log('  amount:', info.amount.toString());
  console.log('  deadline:', info.deadline.toString());
  console.log('  vertical:', info.vertical);
  console.log('  clabe:', info.clabe);
  console.log('  status:', info.status.toString());
  console.log('  conditions:', info.conditions);
}

main().catch(console.error);
