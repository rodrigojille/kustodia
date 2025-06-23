// scripts/fullEscrowLifecycleSepolia.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const fs = require('fs');
  const path = require('path');
  const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2;
  const MXNB_ADDRESS = process.env.MXNB_TOKEN_ADDRESS;
  const abiPath = path.join(__dirname, 'KustodiaEscrow2_0.abi.json');
  const KustodiaEscrowABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const bridgePrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  const bridgeWallet = new ethers.Wallet(bridgePrivateKey, provider);
  const escrow = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, KustodiaEscrowABI, bridgeWallet);
  const mxnb = new ethers.Contract(MXNB_ADDRESS, ["function approve(address,uint256)", "function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"], bridgeWallet);

  // 1. Crear un nuevo escrow
  const payer = bridgeWallet.address;
  const payee = bridgeWallet.address; // Bridge/platform wallet para in/out
  const amount = ethers.parseUnits("10", 6); // 10 MXNB
  const deadline = Math.floor(Date.now() / 1000) + 86400; // +1 día
  const vertical = "inmobiliaria";
  const clabe = "123456789012345678";
  const conditions = "{\"rule\": \"solo para demo\"}";

  console.log("Creando escrow con payer/payee/bridge:", payer);
  const createTx = await escrow.createEscrow(payer, payee, MXNB_ADDRESS, amount, deadline, vertical, clabe, conditions);
  const createReceipt = await createTx.wait();
  if (createReceipt.status !== 1) {
    console.error("Error: createEscrow revertida o fallida");
    return;
  }
  const nextEscrowId = await escrow.nextEscrowId();
  const escrowId = nextEscrowId - 1n;
  console.log("Escrow creado. Id:", escrowId.toString(), "Tx:", createTx.hash);

  // Validar datos del escrow antes de fondear
  const info = await escrow.escrows(escrowId);
  console.log("Datos del escrow antes de fondear:");
  console.log("  payer:", info.payer);
  console.log("  payee:", info.payee);
  console.log("  token:", info.token);
  console.log("  amount:", info.amount.toString());
  console.log("  status:", info.status.toString());
  if (
    info.payer === ethers.ZeroAddress ||
    info.payee === ethers.ZeroAddress ||
    info.token === ethers.ZeroAddress ||
    info.amount === 0n
  ) {
    console.error("Error: escrow con address(0) o amount 0. Aborta ciclo.");
    return;
  }

  // 2. Aprobar y fundear el escrow
  console.log("Aprobando MXNB...");
  const approveTx = await mxnb.approve(ESCROW_CONTRACT_ADDRESS, amount);
  await approveTx.wait();
  console.log("MXNB aprobado. Tx:", approveTx.hash);
  console.log("Fundeando escrow...");
  const fundTx = await escrow.fundEscrow(escrowId);
  await fundTx.wait();
  console.log("Escrow fundeado. Tx:", fundTx.hash);

  // 3. Disputar el escrow
  console.log("Disputando escrow...");
  const disputeTx = await escrow.dispute(escrowId, "Test: disputa completa");
  await disputeTx.wait();
  console.log("Escrow disputado. Tx:", disputeTx.hash);

  // 4. Resolver disputa a favor del seller
  console.log("Resolviendo disputa a favor del seller...");
  const resolveSellerTx = await escrow.resolveDispute(escrowId, true);
  await resolveSellerTx.wait();
  console.log("Disputa resuelta a favor del seller. Tx:", resolveSellerTx.hash);

  // 5. Liberar fondos
  console.log("Liberando fondos...");
  const releaseTx = await escrow.release(escrowId);
  await releaseTx.wait();
  console.log("Fondos liberados. Tx:", releaseTx.hash);

  // 6. Crear y fundear un segundo escrow para probar disputa a favor del buyer
  console.log("Creando segundo escrow...");
  const createTx2 = await escrow.createEscrow(payer, payee, MXNB_ADDRESS, amount, deadline + 100, vertical, clabe, conditions);
  await createTx2.wait();
  const nextEscrowId2 = await escrow.nextEscrowId();
  const escrowId2 = nextEscrowId2 - 1n;
  console.log("Segundo escrow creado. Id:", escrowId2.toString(), "Tx:", createTx2.hash);

  console.log("Aprobando MXNB para segundo escrow...");
  const approveTx2 = await mxnb.approve(ESCROW_CONTRACT_ADDRESS, amount);
  await approveTx2.wait();
  console.log("MXNB aprobado para segundo escrow. Tx:", approveTx2.hash);
  console.log("Fundeando segundo escrow...");
  const fundTx2 = await escrow.fundEscrow(escrowId2);
  await fundTx2.wait();
  console.log("Segundo escrow fundeado. Tx:", fundTx2.hash);

  // 7. Disputar el segundo escrow
  console.log("Disputando segundo escrow...");
  const disputeTx2 = await escrow.dispute(escrowId2, "Test: disputa buyer");
  await disputeTx2.wait();
  console.log("Segundo escrow disputado. Tx:", disputeTx2.hash);

  // 8. Resolver disputa a favor del buyer (platformWallet)
  console.log("Resolviendo disputa a favor del buyer (platformWallet)...");
  const resolveBuyerTx = await escrow.resolveDispute(escrowId2, false);
  await resolveBuyerTx.wait();
  console.log("Disputa resuelta a favor del buyer/platformWallet. Tx:", resolveBuyerTx.hash);

  // 9. Consulta final de ambos escrows
  const info1 = await escrow.escrows(escrowId);
  const info2 = await escrow.escrows(escrowId2);
  console.log("\nEstado final escrow 1:", info1.status.toString());
  console.log("Estado final escrow 2:", info2.status.toString());
}

main().catch(console.error);
