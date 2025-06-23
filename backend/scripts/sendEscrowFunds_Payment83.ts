import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import ormconfig from "../src/ormconfig";
import { Escrow } from "../src/entity/Escrow";
import { Payment } from "../src/entity/Payment";
import { PaymentEvent } from "../src/entity/PaymentEvent";
import { createEscrow } from "../src/services/escrowService";

async function main() {
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);

  // Fetch escrow 71 (linked to Payment 83)
  const escrowId = 71;
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
  console.log(`Payment Status: ${payment.status}`);
  console.log(`Escrow Status: ${escrow.status}`);
  console.log(`Custody Amount: ${escrow.custody_amount} MXNB`);

  // Check if escrow already has smart contract ID
  if (escrow.smart_contract_escrow_id) {
    console.log(`✅ Escrow already has smart contract ID: ${escrow.smart_contract_escrow_id}`);
    console.log('Skipping creation, escrow already exists on-chain');
    await ormconfig.destroy();
    return;
  }

  // Prepare parameters for createEscrow
  // In SPEI/CLABE flow, Bridge Wallet manages all MXNB operations
  const payer = process.env.ESCROW_BRIDGE_WALLET!; // Bridge wallet sends MXNB to escrow
  const payee = process.env.ESCROW_BRIDGE_WALLET!; // Bridge wallet receives MXNB when released
  const token = process.env.MOCK_ERC20_ADDRESS!; // MXNB token address
  const amount = (Number(escrow.custody_amount) * 1e6).toString(); // Convert to base units (6 decimals)
  const deadline = Math.floor(new Date(escrow.custody_end).getTime() / 1000); // Unix timestamp
  const vertical = "kustodia";
  const clabe = payment.deposit_clabe || "unknown"; // Handle nullable CLABE
  const conditions = "Standard custody escrow";

  console.log(`\n🚀 Creating on-chain escrow with parameters:`);
  console.log(`Payer (bridge wallet): ${payer}`);
  console.log(`Payee: ${payee}`);
  console.log(`Token (MXNB): ${token}`);
  console.log(`Amount: ${amount} (base units = ${escrow.custody_amount} MXNB)`);
  console.log(`Deadline: ${deadline} (${new Date(deadline * 1000).toISOString()})`);
  console.log(`Vertical: ${vertical}`);
  console.log(`CLABE: ${clabe}`);
  console.log(`Conditions: ${conditions}`);

  try {
    // Create escrow on smart contract
    const result = await createEscrow({
      payer,
      payee,
      token,
      amount,
      deadline,
      vertical,
      clabe,
      conditions
    });

    console.log(`\n✅ Escrow created on-chain successfully!`);
    console.log(`Transaction Hash: ${result.txHash}`);
    console.log(`Smart Contract Escrow ID: ${result.escrowId}`);

    // Update database with blockchain details
    escrow.blockchain_tx_hash = result.txHash;
    escrow.smart_contract_escrow_id = result.escrowId.toString();
    escrow.status = 'active'; // Update status to active
    await escrowRepo.save(escrow);

    console.log(`\n✅ Database updated for Escrow ${escrowId}`);

    // Update payment status
    payment.status = 'active';
    await paymentRepo.save(payment);

    console.log(`✅ Payment ${payment.id} status updated to 'active'`);

    // Log PaymentEvent for timeline
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: "escrow_created_onchain",
      description: `MXNB bloqueados en escrow on-chain. Escrow ID: ${result.escrowId}, TxHash: ${result.txHash}`
    }));

    console.log(`✅ PaymentEvent logged for payment ${payment.id}`);
    console.log(`\n🎉 Complete! Payment 83 is now active with on-chain escrow.`);

  } catch (err) {
    console.error("❌ Error creating on-chain escrow:", err);
    throw err;
  } finally {
    await ormconfig.destroy();
  }
}

// Export main function for use in automateJunoToEscrow.ts
export { main };

// Also allow direct execution
if (require.main === module) {
  main().catch(console.error);
}
