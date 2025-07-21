"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// CLABE/SPEI Flow - Logs PaymentEvent for escrow and payment after a manual blockchain release
const ormconfig_1 = __importDefault(require("../ormconfig"));
const PaymentEvent_1 = require("../entity/PaymentEvent");
async function main() {
    await ormconfig_1.default.initialize();
    const escrowId = 59; // DB escrow ID
    const paymentId = 71; // Payment ID
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    // Add event for escrow release
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId,
        type: 'escrow_released',
        description: 'Escrow liberado y fondos liberados on-chain.'
    }));
    // Add event for payout initiated (optional, if you want to reflect payout start)
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId,
        type: 'payout_initiated',
        description: 'Payout iniciado tras liberación de fondos.'
    }));
    console.log('PaymentEvents for escrow release and payout logged for escrow', escrowId, 'and payment', paymentId);
    process.exit(0);
}
main().catch(console.error);
