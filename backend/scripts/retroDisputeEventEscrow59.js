"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../src/data-source");
const Escrow_1 = require("../src/entities/Escrow");
const Payment_1 = require("../src/entities/Payment");
const Dispute_1 = require("../src/entities/Dispute");
const PaymentEvent_1 = require("../src/entities/PaymentEvent");
async function main() {
    await data_source_1.AppDataSource.initialize();
    const escrowRepo = data_source_1.AppDataSource.getRepository(Escrow_1.Escrow);
    const paymentRepo = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    const disputeRepo = data_source_1.AppDataSource.getRepository(Dispute_1.Dispute);
    const eventRepo = data_source_1.AppDataSource.getRepository(PaymentEvent_1.PaymentEvent);
    const escrowId = 59;
    const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ["payment"] });
    if (!escrow)
        throw new Error("Escrow not found");
    const payment = escrow.payment;
    if (!payment)
        throw new Error("Payment not found for escrow");
    // Find dispute for this escrow
    const dispute = await disputeRepo.findOne({ where: { escrow: { id: escrowId } } });
    if (!dispute)
        throw new Error("No dispute found for this escrow");
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
    }
    else {
        console.log("dispute_raised PaymentEvent already exists");
    }
    // Set payment status to in_dispute if event exists
    payment.status = "in_dispute";
    await paymentRepo.save(payment);
    console.log("Payment status set to in_dispute");
    await data_source_1.AppDataSource.destroy();
}
main().catch(err => {
    console.error("Fatal error in retroDisputeEventEscrow59.ts:", err);
    process.exit(1);
});
