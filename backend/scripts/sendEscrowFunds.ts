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
  const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id } });
  if (!payment) {
    console.error(`Payment ${escrow.payment.id} not found`);
    process.exit(1);
  }

  // Use bridge wallet as seller
  const seller = process.env.ESCROW_BRIDGE_WALLET!;
  // MXNB uses 6 decimals (e.g., 1000 MXNB = 1000000000)
  const custodyAmount = (Number(escrow.custody_amount) * 1e6).toFixed(0); // string in base units
  // Use custody period in seconds (or adapt as needed)
  const custodyPeriod = Math.floor((new Date(escrow.custody_end).getTime() - Date.now()) / 1000);

  console.log(`Creating on-chain escrow for escrowId=${escrowId}, paymentId=${payment.id}`);
  console.log(`Seller (bridge wallet): ${seller}`);
  console.log(`Custody amount: ${custodyAmount} (base units)`);
  console.log(`Custody period: ${custodyPeriod} seconds`);

  try {
    const result = await createEscrow({ seller, custodyAmount, custodyPeriod });
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
