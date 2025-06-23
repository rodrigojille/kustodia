require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const bridgePrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const bridgeWallet = new ethers.Wallet(bridgePrivateKey, provider);
  const fs = require('fs');
  const path = require('path');
  const abiPath = path.join(__dirname, 'KustodiaEscrow2_0.abi.json');
  const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const escrow = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, KustodiaEscrowABI, bridgeWallet);

  const nextId = await escrow.nextEscrowId();
  console.log(`Total escrows creados: ${nextId}`);
  for (let i = 0; i < Number(nextId); i++) {
    const info = await escrow.escrows(i);
    // EscrowStatus: 0=Pending, 1=Funded, 2=Released, 3=Disputed, 4=Cancelled
    console.log(`Escrow #${i}:`);
    console.log({
      payer: info.payer,
      payee: info.payee,
      token: info.token,
      amount: info.amount.toString(),
      deadline: info.deadline.toString(),
      vertical: info.vertical,
      clabe: info.clabe,
      status: info.status, // 0=Pending, 1=Funded, 2=Released, 3=Disputed, 4=Cancelled
      conditions: info.conditions
    });
  }
}
main().catch(console.error);
