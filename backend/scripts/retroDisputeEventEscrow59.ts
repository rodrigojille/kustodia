import "reflect-metadata";
import { AppDataSource } from "../src/data-source";
import { Escrow } from "../src/entities/Escrow";
import { Payment } from "../src/entities/Payment";
import { Dispute } from "../src/entities/Dispute";
import { PaymentEvent } from "../src/entities/PaymentEvent";

async function main() {
  await AppDataSource.initialize();
  const escrowRepo = AppDataSource.getRepository(Escrow);
  const paymentRepo = AppDataSource.getRepository(Payment);
  const disputeRepo = AppDataSource.getRepository(Dispute);
  const eventRepo = AppDataSource.getRepository(PaymentEvent);

  const escrowId = 59;
  const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ["payment"] });
  if (!escrow) throw new Error("Escrow not found");
  const payment = escrow.payment;
  if (!payment) throw new Error("Payment not found for escrow");

  // Find dispute for this escrow
  const dispute = await disputeRepo.findOne({ where: { escrow: { id: escrowId } } });
  if (!dispute) throw new Error("No dispute found for this escrow");

  // Check if PaymentEvent for dispute_raised exists
  const existingEvent = await eventRepo.findOne({ where: { payment_id: payment.id, type: "dispute_raised" } });
  if (!existingEvent) {
    await eventRepo.save(eventRepo.create({
      payment_id: payment.id,
      type: "dispute_raised",
      description: `Disputa retroactiva: ${dispute.reason || dispute.details}`,
      data: { disputeId: dispute.id },
    }));
    console.log("Created retroactive dispute_raised PaymentEvent");
  } else {
    console.log("dispute_raised PaymentEvent already exists");
  }

  // Set payment status to in_dispute if event exists
  payment.status = "in_dispute";
  await paymentRepo.save(payment);
  console.log("Payment status set to in_dispute");

  await AppDataSource.destroy();
}

main().catch(err => {
  console.error("Fatal error in retroDisputeEventEscrow59.ts:", err);
  process.exit(1);
});
