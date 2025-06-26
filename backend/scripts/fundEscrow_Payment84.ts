import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import ormconfig from "../src/ormconfig";
import { Escrow } from "../src/entity/Escrow";
import { Payment } from "../src/entity/Payment";
import { PaymentEvent } from "../src/entity/PaymentEvent";
import { ethers } from "ethers";
import * as fs from "fs";

async function main() {
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);

  // Get Payment 84 / Escrow 72
  const escrowId = 72;
  const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ["payment"] });
  if (!escrow) {
    console.error(`❌ Escrow ${escrowId} not found`);
    process.exit(1);
  }
  
  const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id } });
  if (!payment) {
    console.error(`❌ Payment ${escrow.payment.id} not found`);
    process.exit(1);
  }

  console.log(`✅ Found Payment ${payment.id} / Escrow ${escrowId}`);
  console.log(`Smart Contract Escrow ID: ${escrow.smart_contract_escrow_id}`);
  console.log(`Custody Amount: ${escrow.custody_amount} MXNB`);

  if (!escrow.smart_contract_escrow_id) {
    console.error(`❌ Escrow has no smart contract ID. Run sendEscrowFunds_Payment84.ts first.`);
    process.exit(1);
  }

  // Setup blockchain connection
  const RPC_URL = process.env.ETH_RPC_URL!;
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Contract addresses
  const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS_2!;
  const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS!;
  
  // Load contract ABIs
  const backendDir = path.resolve(__dirname, '..');
  const escrowArtifactPath = path.join(backendDir, 'artifacts/contracts/KustodiaEscrow2_0.sol/KustodiaEscrow2_0.json');
  console.log(`🔍 Looking for escrow artifact at: ${escrowArtifactPath}`);
  console.log(`📂 Backend directory: ${backendDir}`);
  console.log(`📂 Artifact exists: ${fs.existsSync(escrowArtifactPath)}`);
  
  if (!fs.existsSync(escrowArtifactPath)) {
    console.error(`❌ Escrow artifact not found at: ${escrowArtifactPath}`);
    process.exit(1);
  }
  
  const KustodiaEscrowArtifact = require(escrowArtifactPath);
  const ESCROW_ABI = KustodiaEscrowArtifact.abi;

  // ERC20 ABI for token operations
  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

  // Calculate amount in base units (6 decimals for MXNB)
  const amount = (Number(escrow.custody_amount) * 1e6).toString();
  
  console.log(`\n🔍 Pre-funding checks:`);
  
  // Check bridge wallet balance
  const balance = await tokenContract.balanceOf(signer.address);
  const decimals = await tokenContract.decimals();
  const formattedBalance = ethers.utils.formatUnits(balance, decimals);
  console.log(`Bridge wallet balance: ${formattedBalance} MXNB`);
  
  if (balance.lt(amount)) {
    console.error(`❌ Insufficient balance. Need ${escrow.custody_amount} MXNB, have ${formattedBalance} MXNB`);
    process.exit(1);
  }

  // Check current allowance
  const currentAllowance = await tokenContract.allowance(signer.address, ESCROW_ADDRESS);
  console.log(`Current allowance: ${ethers.utils.formatUnits(currentAllowance, decimals)} MXNB`);
  
  if (currentAllowance.lt(amount)) {
    console.log(`💰 Approving ${escrow.custody_amount} MXNB spend...`);
    const approveTx = await tokenContract.approve(ESCROW_ADDRESS, amount);
    await approveTx.wait();
    console.log(`✅ Approval completed: ${approveTx.hash}`);
  }

  try {
    console.log(`\n🚀 Funding escrow ${escrow.smart_contract_escrow_id} with ${escrow.custody_amount} MXNB...`);
    
    // Call fundEscrow function
    const fundTx = await escrowContract.fundEscrow(escrow.smart_contract_escrow_id);
    const receipt = await fundTx.wait();
    
    console.log(`✅ Escrow funded successfully!`);
    console.log(`Transaction Hash: ${fundTx.hash}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);

    // Log PaymentEvent for escrow funding
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: "escrow_funded",
      description: `Escrow ${escrow.smart_contract_escrow_id} funded with ${escrow.custody_amount} MXNB. TxHash: ${fundTx.hash}`
    }));

    console.log(`✅ PaymentEvent logged for escrow funding`);

    // Verify final bridge wallet balance
    const finalBalance = await tokenContract.balanceOf(signer.address);
    const finalFormatted = ethers.utils.formatUnits(finalBalance, decimals);
    console.log(`\n💰 Final bridge wallet balance: ${finalFormatted} MXNB`);
    
    console.log(`\n🎉 SUCCESS! Escrow ${escrow.smart_contract_escrow_id} is now funded with ${escrow.custody_amount} MXNB`);
    console.log(`Payment 84 is fully operational with funded on-chain custody!`);

  } catch (error) {
    console.error("❌ Error funding escrow:", error);
    throw error;
  } finally {
    await ormconfig.destroy();
  }
}

main().catch(console.error);
