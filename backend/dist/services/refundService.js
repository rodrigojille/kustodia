"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDisputeRefund = processDisputeRefund;
exports.checkRefundEligibility = checkRefundEligibility;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const User_1 = require("../entity/User");
const JunoTransaction_1 = require("../entity/JunoTransaction");
// Note: Using mock sendMxnPayout for now - integrate with actual Juno service later
const sendMxnPayout = async (amount, clabe, name) => {
    console.log(`🔄 [MOCK PAYOUT] Would send $${amount} to CLABE ${clabe} for ${name}`);
    return { tx_hash: `mock_payout_${Date.now()}`, success: true };
};
const paymentEvent_1 = require("../utils/paymentEvent");
const uuid_1 = require("uuid");
/**
 * Processes a dispute refund to the buyer when admin resolves dispute in buyer's favor
 * @param paymentId The ID of the payment to refund
 * @returns Promise<{success: boolean, txHash: string, amount: number}>
 */
async function processDisputeRefund(paymentId) {
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const userRepo = ormconfig_1.default.getRepository(User_1.User);
    const junoTxRepo = ormconfig_1.default.getRepository(JunoTransaction_1.JunoTransaction);
    console.log(`🔄 [DISPUTE REFUND] Starting refund process for payment ${paymentId}`);
    // 1. Get payment with all necessary details
    const payment = await paymentRepo.findOne({
        where: { id: paymentId },
        relations: ['user', 'escrow']
    });
    if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
    }
    const escrow = payment.escrow;
    if (!escrow) {
        throw new Error(`No escrow found for payment ${paymentId}`);
    }
    // 2. Get buyer details (payer)
    const buyerEmail = payment.payer_email;
    if (!buyerEmail) {
        throw new Error(`No buyer email found for payment ${paymentId}`);
    }
    // Get buyer's CLABE from payment record or user record
    let buyerClabe = payment.payer_clabe;
    if (!buyerClabe) {
        // Try to get from user record if linked
        const buyer = await userRepo.findOne({ where: { email: buyerEmail } });
        buyerClabe = buyer?.payout_clabe;
    }
    if (!buyerClabe) {
        throw new Error(`No CLABE found for buyer ${buyerEmail} in payment ${paymentId}`);
    }
    // 3. Calculate refund amount (full custody amount)
    const refundAmount = Number(escrow.custody_amount);
    if (refundAmount <= 0) {
        throw new Error(`Invalid refund amount: ${refundAmount} for payment ${paymentId}`);
    }
    // 4. Generate transaction hash for tracking
    const refundTxHash = `refund_${(0, uuid_1.v4)().replace(/-/g, '')}`;
    console.log(`💰 [DISPUTE REFUND] Processing $${refundAmount} refund to CLABE ${buyerClabe}`);
    try {
        // 5. Record refund initiation
        await (0, paymentEvent_1.recordPaymentEvent)(payment, 'dispute_refund_initiated', `Refund of $${refundAmount} initiated to buyer ${buyerEmail} (CLABE: ${buyerClabe})`);
        // 6. Execute SPEI payout using existing Juno infrastructure
        const payoutResult = await sendMxnPayout(refundAmount, buyerClabe, buyerEmail // Use email as recipient name if no full name available
        );
        console.log(`✅ [DISPUTE REFUND] Juno payout successful:`, payoutResult);
        // 7. Create JunoTransaction record for tracking
        const junoTx = junoTxRepo.create({
            type: 'refund',
            amount: refundAmount,
            status: 'completed',
            tx_hash: payoutResult.tx_hash || refundTxHash,
            reference: `dispute-refund-${paymentId}`
        });
        await junoTxRepo.save(junoTx);
        // 8. Update payment and escrow statuses
        payment.status = 'refunded';
        escrow.status = 'refunded';
        escrow.release_amount = 0; // No longer releasing to seller
        escrow.custody_amount = 0; // Refunded to buyer
        await paymentRepo.save(payment);
        await escrowRepo.save(escrow);
        // 9. Record successful refund
        await (0, paymentEvent_1.recordPaymentEvent)(payment, 'dispute_refund_completed', `Refund successful. TX: ${payoutResult.tx_hash || refundTxHash}`);
        console.log(`🎉 [DISPUTE REFUND] Completed successfully for payment ${paymentId}`);
        return {
            success: true,
            txHash: payoutResult.tx_hash || refundTxHash,
            amount: refundAmount,
            clabe: buyerClabe,
            beneficiary: buyerEmail
        };
    }
    catch (error) {
        console.error(`❌ [DISPUTE REFUND] Failed for payment ${paymentId}:`, error);
        // Record failure
        await (0, paymentEvent_1.recordPaymentEvent)(payment, 'dispute_refund_failed', `Refund failed: ${error?.message || error}`);
        throw new Error(`Dispute refund failed: ${error?.message || error}`);
    }
}
/**
 * Checks if a payment is eligible for dispute refund
 * @param paymentId The payment ID to check
 * @returns Promise<{eligible: boolean, reason?: string}>
 */
async function checkRefundEligibility(paymentId) {
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const payment = await paymentRepo.findOne({
        where: { id: paymentId },
        relations: ['escrow']
    });
    if (!payment) {
        return { eligible: false, reason: 'Payment not found' };
    }
    if (!payment.escrow) {
        return { eligible: false, reason: 'No escrow associated with payment' };
    }
    if (payment.status === 'refunded') {
        return { eligible: false, reason: 'Payment already refunded' };
    }
    if (payment.status === 'completed') {
        return { eligible: false, reason: 'Payment already completed' };
    }
    if (!payment.payer_email && !payment.payer_clabe) {
        return { eligible: false, reason: 'No buyer information available for refund' };
    }
    if (Number(payment.escrow.custody_amount) <= 0) {
        return { eligible: false, reason: 'No funds in custody to refund' };
    }
    return { eligible: true };
}
