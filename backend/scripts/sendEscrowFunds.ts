import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import ormconfig from "../src/ormconfig";
import { Escrow } from "../src/entity/Escrow";
import { Payment } from "../src/entity/Payment";
import { createEscrow } from "../src/services/escrowService";

async function main() {
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);

  // Fetch escrow 59 and linked payment
  const escrowId = 59;
  const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ["payment"] });
  if (!escrow) {
    console.error(`Escrow ${escrowId} not found`);
    process.exit(1);
  }
  if (!escrow.payment) {
    console.error(`Escrow ${escrowId} has no associated payment`);
    process.exit(1);
  }
  const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id } });
  if (!payment) {
    console.error(`Payment ${escrow.payment.id} not found`);
    process.exit(1);
  }

  // Map escrow data to createEscrow parameters
  // Flow 1: Both payer and payee are bridge wallet (platform-managed custody)
  const payer = process.env.ESCROW_BRIDGE_WALLET!; // Bridge wallet acts as payer
  const payee = process.env.ESCROW_BRIDGE_WALLET!; // Bridge wallet acts as payee (Flow 1)
  const token = process.env.MOCK_ERC20_ADDRESS!; // MXNB token address
  // MXNB uses 6 decimals (e.g., 1000 MXNB = 1000000000)
  const amount = (Number(escrow.custody_amount) * 1e6).toFixed(0); // string in base units
  // Calculate deadline from custody_end date
  const deadline = Math.floor(new Date(escrow.custody_end).getTime() / 1000);
  const vertical = null; // Not using verticals for this flow
  const clabe = payment.payout_clabe || ''; // Use payout CLABE from payment if available
  const conditions = null; // Not using conditions for this flow

  console.log(`Creating on-chain escrow for escrowId=${escrowId}, paymentId=${payment.id}`);
  console.log(`Payer (bridge wallet): ${payer}`);
  console.log(`Payee: ${payee}`);
  console.log(`Token: ${token}`);
  console.log(`Amount: ${amount} (base units)`);
  console.log(`Deadline: ${deadline} (timestamp)`);
  console.log(`CLABE: ${clabe}`);

  try {
    const result = await createEscrow({ payer, payee, token, amount, deadline, vertical, clabe, conditions });
    console.log("Escrow created on-chain:", result);
    // Update DB with tx hash and smart contract escrow ID
    escrow.blockchain_tx_hash = result.txHash;
    escrow.smart_contract_escrow_id = result.escrowId;
    await escrowRepo.save(escrow);
    console.log(`DB updated for escrow ${escrowId}: txHash and smart_contract_escrow_id saved.`);

    // Log PaymentEvent for timeline
    const paymentEventRepo = ormconfig.getRepository(require("../src/entity/PaymentEvent").PaymentEvent);
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: "escrow_funded_onchain",
      description: `MXNB bloqueados en escrow on-chain. TxHash: ${result.txHash}`
    }));
    console.log(`PaymentEvent logged for payment ${payment.id} with txHash.`);
  } catch (err) {
    console.error("Error creating on-chain escrow:", err);
  } finally {
    await ormconfig.destroy();
  }
}

main();
