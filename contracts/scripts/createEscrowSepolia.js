// scripts/createEscrowSepolia.js
// Crea un escrow real en Arbitrum Sepolia usando el contrato desplegado y MXNB ERC20
require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // Cargar variables de entorno
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const mxnbAddress = process.env.MXNB_TOKEN_ADDRESS;
  const buyerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY; // Para demo, usar el deployer como buyer
  const seller = "0x000000000000000000000000000000000000dead"; // Cambia por un address válido de seller
  const custodyPeriod = 3600 * 24 * 2; // 2 días

  if (!ESCROW_CONTRACT_ADDRESS || !mxnbAddress || !buyerPrivateKey) {
    throw new Error("Faltan variables ESCROW_CONTRACT_ADDRESS_2, MXNB_TOKEN_ADDRESS o DEPLOYER_PRIVATE_KEY en .env");
  }

  // Conectar a Sepolia con el buyer
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const buyer = new ethers.Wallet(buyerPrivateKey, provider);

  // Instanciar contratos
  const abiPath = path.join(__dirname, 'KustodiaEscrow2_0.abi.json');
const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const mxnb = new ethers.Contract(mxnbAddress, [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ], buyer);
const escrow = new ethers.Contract(
  ESCROW_CONTRACT_ADDRESS,
  KustodiaEscrowABI,
  buyer
);

  // Obtener decimales dinámicamente
  const decimals = await mxnb.decimals();
  console.log('MXNB token decimals:', decimals);

  // Debug: imprimir balance antes de aprobar
  const balance = await mxnb.balanceOf(buyer.address);
  console.log('MXNB balance:', ethers.formatUnits(balance, decimals));

  // Ajustar el monto de custodia según decimales
  const custodyAmount = ethers.parseUnits("10", decimals); // 10 MXNB

  // 1. Aprobar tokens al contrato proxy
  const approveTx = await mxnb.approve(ESCROW_CONTRACT_ADDRESS, custodyAmount);
  await approveTx.wait();
  console.log(`Aprobados ${ethers.formatUnits(custodyAmount, decimals)} MXNB para escrow.`);

  // 2. Crear escrow usando la nueva firma
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + custodyPeriod;
  const vertical = "inmobiliaria";
  const clabe = "123456789012345678";
  const conditions = "{\"rule\": \"solo para demo\"}";

  const tx = await escrow.createEscrow(
    buyer.address, // payer
    seller,        // payee
    mxnbAddress,   // token
    custodyAmount, // amount
    deadline,      // deadline
    vertical,
    clabe,
    conditions
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(l => l.topics && l.topics.length && l.address.toLowerCase() === ESCROW_CONTRACT_ADDRESS.toLowerCase());
  if (event) {
    console.log("Escrow creado en Sepolia. TxHash:", tx.hash);
  } else {
    console.log("No se encontró el evento EscrowCreated. Revisa el contrato y los parámetros.");
  }
}

main().catch(console.error);
