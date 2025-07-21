"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// CLABE/SPEI Flow - Script to manually log payout event and tx hashes for traceability
const ormconfig_1 = __importDefault(require("../ormconfig"));
const PaymentEvent_1 = require("../entity/PaymentEvent");
const Escrow_1 = require("../entity/Escrow");
/**
 * Usage: npx ts-node src/scripts/logPayoutEvent.ts <escrowId> <paymentId> <blockchainEscrowId> <releaseTxHash> <payoutTxHash> <amount>
 */
async function main() {
    const [, , escrowIdArg, paymentIdArg, blockchainEscrowId, releaseTxHash, payoutTxHash, amountArg] = process.argv;
    if (!escrowIdArg || !paymentIdArg || !blockchainEscrowId || !releaseTxHash || !payoutTxHash || !amountArg) {
        console.error('Usage: npx ts-node src/scripts/logPayoutEvent.ts <escrowId> <paymentId> <blockchainEscrowId> <releaseTxHash> <payoutTxHash> <amount>');
        process.exit(1);
    }
    const escrowId = Number(escrowIdArg);
    const paymentId = Number(paymentIdArg);
    const amount = Number(amountArg);
    await ormconfig_1.default.initialize();
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    // Update escrow with release tx hash (if not already set)
    const escrow = await escrowRepo.findOne({ where: { id: escrowId } });
    if (escrow) {
        escrow.release_tx_hash = releaseTxHash;
        await escrowRepo.save(escrow);
    }
    // Log payout event
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId,
        type: 'payout_completed',
        description: `Payout of ${amount} MXNB to Juno wallet for escrow ${escrowId} (blockchain escrow ${blockchainEscrowId}). ReleaseTx: ${releaseTxHash}, PayoutTx: ${payoutTxHash}`
    }));
    console.log('Payout event logged and escrow updated.');
    process.exit(0);
}
main().catch(console.error);
