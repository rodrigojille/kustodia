"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../src/data-source");
const Escrow_1 = require("../src/entities/Escrow");
const Payment_1 = require("../src/entities/Payment");
const PaymentEvent_1 = require("../src/entities/PaymentEvent");
// import your Juno API client here
// import { redeemMXNB, sendSPEIPayout } from '../src/services/junoService';
/**
 * This script finds released escrows (with release_tx_hash, not yet redeemed)
 * and redeems MXNB via Juno, then initiates a SPEI payout to the seller.
 * Logs all actions as PaymentEvents for traceability.
 * Intended to be run on a schedule (e.g. cron).
 */
async function main() {
    await data_source_1.AppDataSource.initialize();
    const escrowRepo = data_source_1.AppDataSource.getRepository(Escrow_1.Escrow);
    const paymentRepo = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    const eventRepo = data_source_1.AppDataSource.getRepository(PaymentEvent_1.PaymentEvent);
    // Find all escrows released but not yet redeemed (use a PaymentEvent or add a DB field for 'redeemed')
    const escrows = await escrowRepo.find({
        where: {
            release_tx_hash: Not(null),
            // Add your own filter to exclude already redeemed escrows
        },
    });
    for (const escrow of escrows) {
        try {
            // Find the associated payment
            const payment = await paymentRepo.findOneBy({ escrow: { id: escrow.id } });
            if (!payment)
                continue;
            // 1. Redeem MXNB via Juno API
            // const redeemResult = await redeemMXNB({ amount: escrow.custody_amount, ... });
            // 2. Log redemption event
            const redeemEvent = eventRepo.create({
                payment_id: payment.id,
                type: "mxnb_redeemed",
                data: { /* fill with redeemResult or relevant info */},
            });
            await eventRepo.save(redeemEvent);
            // 3. Initiate SPEI payout
            // const speiResult = await sendSPEIPayout({ clabe: payment.recipient_deposit_clabe, amount: ... });
            // 4. Log payout event
            const payoutEvent = eventRepo.create({
                payment_id: payment.id,
                type: "spei_payout_initiated",
                data: { /* fill with speiResult or relevant info */},
            });
            await eventRepo.save(payoutEvent);
            console.log(`Redemption and payout completed for escrow ${escrow.id} / payment ${payment.id}`);
        }
        catch (e) {
            console.error(`Error redeeming/payout for escrow ${escrow.id}:`, e);
        }
    }
    await data_source_1.AppDataSource.destroy();
}
main().catch((err) => {
    console.error("Fatal error in redeemAndPayout.ts:", err);
    process.exit(1);
});
