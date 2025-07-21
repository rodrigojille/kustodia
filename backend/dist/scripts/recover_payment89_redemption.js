"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const junoService_1 = require("../services/junoService");
const paymentService_1 = require("../services/paymentService");
const PAYMENT_ID_TO_RECOVER = 89;
async function recoverPaymentRedemption() {
    console.log(`--- 🚀 Starting Recovery for Payment ${PAYMENT_ID_TO_RECOVER} ---`);
    const paymentService = new paymentService_1.PaymentService();
    try {
        await ormconfig_1.default.initialize();
        console.log('✅ Database connection initialized.');
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payment = await paymentRepo.findOne({
            where: { id: PAYMENT_ID_TO_RECOVER },
            relations: ['escrow']
        });
        if (!payment) {
            throw new Error(`Payment with ID ${PAYMENT_ID_TO_RECOVER} not found.`);
        }
        if (payment.status === 'completed') {
            console.log(`✅ Payment ${PAYMENT_ID_TO_RECOVER} is already completed. No action needed.`);
            return;
        }
        if (!payment.payout_juno_bank_account_id) {
            throw new Error(`Payment ${PAYMENT_ID_TO_RECOVER} is missing a 'payout_juno_bank_account_id'.`);
        }
        if (!payment.escrow || !payment.escrow.custody_amount) {
            throw new Error(`Payment ${PAYMENT_ID_TO_RECOVER} is missing escrow info or custody amount.`);
        }
        const payoutAmount = parseFloat(String(payment.escrow.custody_amount));
        const destinationBankAccountId = payment.payout_juno_bank_account_id;
        console.log(`[RECOVERY] Attempting to redeem ${payoutAmount} MXN to bank account ${destinationBankAccountId}...`);
        // Use a unique idempotency key for this recovery attempt
        const idempotencyKey = `recovery-payment-${payment.id}-${Date.now()}`;
        const result = await (0, junoService_1.redeemMXNBToMXN)(payoutAmount, destinationBankAccountId, idempotencyKey);
        console.log('--- ✅ Juno Redemption Successful ---');
        console.log('Response Payload:', JSON.stringify(result, null, 2));
        // Update payment and escrow status
        payment.status = 'completed';
        payment.juno_payment_id = result.id; // Store the new Juno payment ID
        if (payment.escrow) {
            payment.escrow.status = 'completed';
            payment.escrow.release_tx_hash = `manual-recovery-${result.id}`;
            await ormconfig_1.default.getRepository(Escrow_1.Escrow).save(payment.escrow);
        }
        await paymentRepo.save(payment);
        console.log(`✅ Payment ${payment.id} and Escrow ${payment.escrow.id} status updated to 'completed'.`);
        await paymentService.logPaymentEvent(payment.id, 'payout_recovered', `Redención y SPEI recuperados manualmente. Juno Payment ID: ${result.id}`, true);
    }
    catch (err) {
        console.error('--- ❌ ERROR during Payment Recovery ---');
        console.error('Caught error:', err.message);
        if (err.response?.data) {
            console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
        }
    }
    finally {
        if (ormconfig_1.default.isInitialized) {
            await ormconfig_1.default.destroy();
            console.log('✅ Database connection closed.');
        }
        console.log('--- 🏁 Recovery Script Finished ---');
    }
}
recoverPaymentRedemption();
