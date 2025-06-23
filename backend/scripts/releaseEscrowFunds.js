"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../src/data-source");
const Escrow_1 = require("../src/entities/Escrow");
const Payment_1 = require("../src/entities/Payment");
const PaymentEvent_1 = require("../src/entities/PaymentEvent");
const escrowService_1 = require("../src/services/escrowService");
const typeorm_1 = require("typeorm");
/**
 * This script finds all escrows whose on-chain deadline has passed
 * and which have not yet been released, then calls the smart contract
 * to release the funds, and logs the event in the database.
 * Intended to be run on a schedule (e.g. cron) for automation.
 */
async function main() {
    await data_source_1.AppDataSource.initialize();
    const escrowRepo = data_source_1.AppDataSource.getRepository(Escrow_1.Escrow);
    const paymentRepo = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    const eventRepo = data_source_1.AppDataSource.getRepository(PaymentEvent_1.PaymentEvent);
    // Update statuses for all escrows before processing releases
    const allEscrows = await escrowRepo.find();
    const now = Math.floor(Date.now() / 1000);
    for (const escrow of allEscrows) {
        if (!escrow.blockchain_tx_hash) {
            escrow.status = 'pending';
        }
        else if (escrow.blockchain_tx_hash && !escrow.release_tx_hash && escrow.custody_end > now) {
            escrow.status = 'active';
        }
        else if (escrow.release_tx_hash) {
            escrow.status = 'released';
        }
        await escrowRepo.save(escrow);
    }
    // Find escrows whose custody_end has passed and are not yet released
    const escrowsToRelease = await escrowRepo.find({
        where: {
            custody_end: (0, typeorm_1.LessThanOrEqual)(now),
            release_tx_hash: (0, typeorm_1.IsNull)(),
            status: (0, typeorm_1.In)(['active'])
        }
    });
    for (const escrow of escrowsToRelease) {
        if (!escrow.smart_contract_escrow_id)
            continue;
        try {
            const onchainEscrow = await (0, escrowService_1.getEscrow)(Number(escrow.smart_contract_escrow_id));
            const deadline = onchainEscrow.deadline?.toNumber?.() ?? 0;
            if (now < deadline) {
                // Not yet eligible for release
                continue;
            }
            // Release the escrow on-chain
            console.log(`Releasing escrow on-chain for escrowId=${escrow.smart_contract_escrow_id}`);
            const tx = await (0, escrowService_1.releaseCustody)(Number(escrow.smart_contract_escrow_id));
            // Update DB
            escrow.release_tx_hash = tx.hash;
            await escrowRepo.save(escrow);
            // Log event
            const payment = await paymentRepo.findOneBy({ escrow: { id: escrow.id } });
            if (payment) {
                const event = eventRepo.create({
                    payment_id: payment.id,
                    type: "escrow_released",
                    data: { txHash: tx.hash, releasedAt: Date.now() },
                });
                await eventRepo.save(event);
            }
            console.log(`Escrow ${escrow.id} released on-chain. Tx: ${tx.hash}`);
        }
        catch (e) {
            console.error(`Error releasing escrow ${escrow.smart_contract_escrow_id}:`, e);
        }
    }
    await data_source_1.AppDataSource.destroy();
}
main().catch((err) => {
    console.error("Fatal error in releaseEscrowFunds.ts:", err);
    process.exit(1);
});
