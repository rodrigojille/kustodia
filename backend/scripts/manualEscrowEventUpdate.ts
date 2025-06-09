import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import ormconfig from "../src/ormconfig";
import { Escrow } from "../src/entity/Escrow";
import { Payment } from "../src/entity/Payment";
import { PaymentEvent } from "../src/entity/PaymentEvent";

async function main() {
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);

  // --- UPDATE THESE VALUES AS NEEDED ---
  const escrowId = 59; // Escrow to update
  const txHash = "0xc3d13d1bdf92e8c056bb7657786fde56e276c465ba32b553b95829919b228133"; // Your on-chain tx hash

  // Fetch escrow and payment
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

  // Log PaymentEvent for retroactive timeline update
  await paymentEventRepo.save(paymentEventRepo.create({
    paymentId: payment.id,
    type: "escrow_funded_onchain",
    description: `MXNB bloqueados en escrow on-chain. TxHash: ${txHash}`
  }));
  console.log(`Retroactive PaymentEvent logged for payment ${payment.id} with txHash.`);

  await ormconfig.destroy();
}

main();
