"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseEscrowAndPayout = releaseEscrowAndPayout;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const User_1 = require("../entity/User");
const JunoTransaction_1 = require("../entity/JunoTransaction");
const junoClient_1 = require("../utils/junoClient");
const referenceValidation_1 = require("../utils/referenceValidation");
/**
 * Releases escrow and pays out to the seller's CLABE using Juno.
 * @param escrowId The ID of the escrow to release
 */
async function releaseEscrowAndPayout(escrowId) {
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const userRepo = ormconfig_1.default.getRepository(User_1.User);
    const junoTxRepo = ormconfig_1.default.getRepository(JunoTransaction_1.JunoTransaction);
    // Fetch escrow, payment, and seller
    const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ['payment'] });
    if (!escrow)
        throw new Error('Escrow not found');
    const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id }, relations: ['user'] });
    if (!payment)
        throw new Error('Payment not found');
    const seller = await userRepo.findOne({ where: { id: payment.user.id } });
    if (!seller || !seller.payout_clabe)
        throw new Error('Seller or CLABE not found');
    // Prepare payout
    const amount = Number(escrow.release_amount);
    const currency = payment.currency || 'MXN';
    const destination_clabe = seller.payout_clabe;
    // Validate and sanitize references
    let reference = `escrow-${escrow.id}`;
    let notesRef = payment.description || "Pago Kustodia";
    let numericRef = String(payment.id);
    if (!(0, referenceValidation_1.isValidReference)(reference)) {
        reference = (0, referenceValidation_1.sanitizeReference)(reference);
    }
    if (!(0, referenceValidation_1.isValidReference)(notesRef)) {
        notesRef = (0, referenceValidation_1.sanitizeReference)(notesRef);
    }
    if (!(0, referenceValidation_1.isValidReference)(numericRef)) {
        numericRef = (0, referenceValidation_1.sanitizeReference)(numericRef);
    }
    // If after sanitization any reference is empty, throw error
    if (!reference || !notesRef || !numericRef) {
        throw new Error('Reference, notesRef, or numericRef became empty after sanitization.');
    }
    // Call Juno
    let junoResult, junoStatus = 'pending', tx_hash = undefined;
    try {
        junoResult = await (0, junoClient_1.sendJunoPayout)({
            amount,
            beneficiary: seller.full_name || seller.email || "Beneficiario Kustodia",
            clabe: seller.payout_clabe,
            notes_ref: notesRef,
            numeric_ref: numericRef,
            rfc: "XAXX010101000",
            origin_id: `kustodia_${payment.id}`
        });
        junoStatus = 'success';
        tx_hash = junoResult?.id || undefined;
    }
    catch (err) {
        junoStatus = 'failed';
        junoResult = err?.response?.data || err?.message || err;
    }
    // Log Juno transaction
    const junoTx = junoTxRepo.create({
        type: 'payout',
        reference,
        amount,
        status: junoStatus,
        tx_hash,
    });
    await junoTxRepo.save(junoTx);
    // Update escrow/payment status if payout succeeded
    if (junoStatus === 'success') {
        escrow.status = 'released';
        payment.status = 'paid';
        await escrowRepo.save(escrow);
        await paymentRepo.save(payment);
    }
    return { escrow, payment, seller, junoTx, junoResult };
}
