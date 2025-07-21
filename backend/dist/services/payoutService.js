"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseEscrowAndPayout = releaseEscrowAndPayout;
exports.redeemMXNBToMXNAndPayout = redeemMXNBToMXNAndPayout;
exports.redeemAndPayout = redeemAndPayout;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const User_1 = require("../entity/User");
const JunoTransaction_1 = require("../entity/JunoTransaction");
const PaymentEvent_1 = require("../entity/PaymentEvent");
const junoClient_1 = require("../utils/junoClient");
const referenceValidation_1 = require("../utils/referenceValidation");
const junoService_1 = require("../services/junoService");
const escrowService_1 = require("./escrowService"); // Import on-chain release function
const paymentNotificationService_1 = require("../utils/paymentNotificationService");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
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
    // 🔐 CRITICAL: Validate dual approval for Flow 2 payments
    if (payment.payment_type === 'nuevo_flujo') {
        if (!payment.payer_approval || !payment.payee_approval) {
            const missingApprovals = [];
            if (!payment.payer_approval)
                missingApprovals.push('payer');
            if (!payment.payee_approval)
                missingApprovals.push('payee');
            throw new Error(`Dual approval required: Missing ${missingApprovals.join(', ')} approval(s)`);
        }
        console.log(`[SECURITY] Dual approval validated for Payment ${payment.id}`);
    }
    // --- 0. Release from on-chain Escrow Contract ---
    let releaseTxHash;
    try {
        console.log(`[Payout] Releasing escrow ID ${escrow.smart_contract_escrow_id} from V2 contract...`);
        releaseTxHash = await (0, escrowService_1.releaseEscrow)(Number(escrow.smart_contract_escrow_id));
        console.log(`[Payout] On-chain release successful for escrow ID ${escrow.smart_contract_escrow_id}. Tx: ${releaseTxHash}`);
        await logPaymentEvent(payment.id, 'onchain_release_success', `Escrow ${escrow.smart_contract_escrow_id} released from contract. Tx: ${releaseTxHash}`);
    }
    catch (onchainError) {
        console.error(`[Payout] CRITICAL: On-chain release failed for escrow ${escrow.smart_contract_escrow_id}:`, onchainError);
        await logPaymentEvent(payment.id, 'onchain_release_failed', `Failed to release escrow ${escrow.smart_contract_escrow_id} from contract.`);
        // Stop the process if on-chain release fails to prevent incorrect payouts
        throw new Error('On-chain escrow release failed.');
    }
    // Update escrow status to prevent double release
    escrow.status = 'released';
    escrow.release_tx_hash = releaseTxHash;
    await escrowRepo.save(escrow);
    console.log(`[Payout] Escrow ${escrow.id} status updated to 'released' with tx: ${releaseTxHash}`);
    // Prepare payout
    const totalAmount = Number(escrow.release_amount);
    const commissionAmount = payment.commission_amount ? Number(payment.commission_amount) : 0;
    const netSellerAmount = totalAmount - commissionAmount;
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
    // --- 1. Payout to Seller ---
    let sellerJunoResult, sellerJunoStatus = 'pending', sellerTxHash = undefined, sellerJunoReference = undefined;
    try {
        sellerJunoResult = await (0, junoClient_1.sendJunoPayout)({
            amount: netSellerAmount,
            beneficiary: seller.full_name || seller.email || "Beneficiario Kustodia",
            clabe: seller.payout_clabe,
            notes_ref: notesRef,
            numeric_ref: numericRef,
            rfc: "XAXX010101000",
            origin_id: `kustodia_${payment.id}`
        });
        sellerJunoStatus = 'success';
        sellerJunoReference = sellerJunoResult?.id;
        sellerTxHash = sellerJunoReference ? await (0, junoService_1.getJunoTxHashFromTimeline)(sellerJunoReference) : undefined;
    }
    catch (err) {
        sellerJunoStatus = 'failed';
        sellerJunoResult = err?.response?.data || err?.message || err;
    }
    // Log Seller Juno transaction
    const sellerJunoTx = junoTxRepo.create({
        type: 'payout',
        reference: (sellerJunoReference ?? reference) ?? undefined,
        amount: netSellerAmount,
        status: sellerJunoStatus,
        tx_hash: sellerTxHash ?? undefined,
    });
    await junoTxRepo.save(sellerJunoTx);
    // --- 2. Payout to Commission Beneficiary (if any) ---
    let commissionJunoTx = null;
    let commissionJunoResult = null;
    let commissionJunoStatus = null;
    let commissionTxHash = null;
    let commissionJunoReference = null;
    if (commissionAmount > 0 &&
        payment.commission_beneficiary_email &&
        payment.commission_beneficiary_email.trim() !== '') {
        // Find commission beneficiary user by email
        const commissionUser = await userRepo.findOne({ where: { email: payment.commission_beneficiary_email } });
        if (!commissionUser || !commissionUser.payout_clabe) {
            throw new Error('Commission beneficiary or CLABE not found');
        }
        try {
            commissionJunoResult = await (0, junoClient_1.sendJunoPayout)({
                amount: commissionAmount,
                beneficiary: commissionUser.full_name || commissionUser.email || "Beneficiario Comisión",
                clabe: commissionUser.payout_clabe,
                notes_ref: `Comisión Kustodia - ${notesRef}`,
                numeric_ref: numericRef,
                rfc: "XAXX010101000",
                origin_id: `kustodia_commission_${payment.id}`
            });
            commissionJunoStatus = 'success';
            commissionJunoReference = commissionJunoResult?.id;
            commissionTxHash = commissionJunoReference ? await (0, junoService_1.getJunoTxHashFromTimeline)(commissionJunoReference) : undefined;
        }
        catch (err) {
            commissionJunoStatus = 'failed';
            commissionJunoResult = err?.response?.data || err?.message || err;
        }
        // Log Commission Juno transaction
        commissionJunoTx = junoTxRepo.create({
            type: 'commission_payout',
            reference: (commissionJunoReference ?? reference) ?? undefined,
            amount: commissionAmount,
            status: commissionJunoStatus,
            tx_hash: commissionTxHash ?? undefined,
        });
        await junoTxRepo.save(commissionJunoTx);
    }
    // Update escrow/payment status if both payouts succeeded (or only seller if no commission)
    const allSuccess = sellerJunoStatus === 'success' && (commissionAmount === 0 || commissionJunoStatus === 'success');
    if (allSuccess) {
        escrow.status = 'released';
        payment.status = 'paid';
        await escrowRepo.save(escrow);
        await paymentRepo.save(payment);
        // Send SPEI completion notification with receipt
        try {
            // Get original buyer information from payment (user field represents the buyer)
            const buyer = payment.user;
            const speiReceiptData = {
                transactionId: sellerJunoReference || `PAY-${payment.id}-${Date.now()}`,
                junoTransactionId: sellerJunoReference,
                amount: netSellerAmount,
                currency: currency.toUpperCase(),
                status: 'SUCCEEDED',
                createdAt: new Date(),
                paymentId: payment.id,
                paymentDescription: payment.description,
                escrowId: escrow.id,
                recipientName: seller.full_name || seller.email,
                recipientEmail: seller.email,
                bankAccountId: payment.payout_juno_bank_account_id,
                clabe: seller.payout_clabe,
                senderName: 'Kustodia',
                senderInfo: 'Plataforma de Pagos Seguros',
                reference: payment.reference || `KUSTODIA-${payment.id}`,
                concept: payment.description || 'Pago de custodia liberada',
                speiReference: `KUS${payment.id.toString().padStart(6, '0')}`,
                // Original deposit information (buyer's bank → Nvio flow)
                originalSenderName: buyer?.full_name || buyer?.email || 'Comprador',
                custodyProvider: 'Kustodia',
                paymentProcessor: 'Nvio Pagos México',
                originalDepositAmount: payment.amount ? Number(payment.amount) : netSellerAmount,
                originalAmount: Number(payment.amount),
                commissionAmount: commissionAmount,
                netAmount: netSellerAmount
            };
            await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                eventType: 'spei_transfer_completed',
                paymentId: payment.id.toString(),
                paymentDetails: {
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    description: payment.description,
                    netAmount: netSellerAmount,
                    commissionAmount: commissionAmount
                },
                recipients: [{
                        email: seller.email,
                        role: 'seller'
                    }],
                includeSPEIReceipt: true,
                speiReceiptData,
                junoTransactionId: sellerJunoReference
            });
            console.log(`[Payout] SPEI receipt notification sent to ${seller.email}`);
        }
        catch (notificationError) {
            console.error('[Payout] Failed to send SPEI receipt notification:', notificationError);
            // Don't fail the payout if notification fails
        }
    }
    return {
        escrow,
        payment,
        seller,
        sellerJunoTx,
        sellerJunoResult,
        commissionJunoTx,
        commissionJunoResult
    };
}
/**
 * Logs a payment event for traceability
 */
async function logPaymentEvent(paymentId, type, description) {
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    const event = paymentEventRepo.create({ paymentId, type, description });
    await paymentEventRepo.save(event);
}
/**
 * Redeems MXNB from Juno (crypto withdrawal to platform wallet), then triggers payout to seller.
 * Logs all actions as PaymentEvent.
 * @param escrowId The ID of the escrow to process
 * @param destAddress The platform wallet address to receive MXNB (from .env or config)
 */
/**
 * Redeems MXNB to MXN and pays out to the seller's bank account via Juno redemption API.
 * Logs all actions for traceability.
 * @param escrowId The ID of the escrow to process
 * @param amountMXNB The amount of MXNB to redeem (human, not base units)
 */
async function redeemMXNBToMXNAndPayout(escrowId, amountMXNB) {
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
    if (!seller || !seller.juno_bank_account_id)
        throw new Error('Seller or juno_bank_account_id not found. Please register the Juno bank account UUID for this user.');
    // 1. Initiate MXNB redemption (to MXN in seller's account)
    await logPaymentEvent(payment.id, 'redemption_initiated', `Initiating MXNB redemption to seller Juno bank account UUID: ${seller.juno_bank_account_id}`);
    // Prepare redemption body
    const bodyObj = {
        amount: amountMXNB, // Juno expects MXNB in human units
        destination_bank_account_id: seller.juno_bank_account_id,
        asset: 'mxn',
    };
    // Prepare headers/signature
    const JUNO_ENV = process.env.JUNO_ENV || 'stage';
    const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
    const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
    const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
    const endpoint = '/mint_platform/v1/redemptions';
    const url = `${BASE_URL}${endpoint}`;
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = endpoint;
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto_1.default.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    let redemptionResult, redemptionStatus = 'pending', redemptionReference = undefined;
    try {
        const response = await axios_1.default.post(url, bodyObj, { headers });
        redemptionResult = response.data;
        redemptionStatus = 'success';
        redemptionReference = redemptionResult?.payload?.id;
        await logPaymentEvent(payment.id, 'redemption_success', `MXNB redemption successful. Juno ref: ${redemptionReference}`);
    }
    catch (err) {
        redemptionStatus = 'failed';
        // Enhanced error logging for debugging
        const safeError = {
            responseData: err?.response?.data,
            message: err?.message,
            stack: err?.stack
        };
        redemptionResult = safeError;
        await logPaymentEvent(payment.id, 'redemption_failed', `MXNB redemption failed: ${JSON.stringify(safeError)}`);
        // Log failed JunoTransaction
        const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference ?? undefined, amount: amountMXNB, status: redemptionStatus });
        await junoTxRepo.save(junoTx);
        console.error('Full Juno redemption error:', safeError);
        throw new Error('MXNB redemption failed: ' + JSON.stringify(safeError));
    }
    // Log successful JunoTransaction
    const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference ?? undefined, amount: amountMXNB, status: redemptionStatus });
    await junoTxRepo.save(junoTx);
    // Update payment status to completed
    payment.status = 'completed';
    await paymentRepo.save(payment);
    console.log(`[Payout] MXNB redemption successful for payment ${payment.id}. Amount: ${amountMXNB} MXNB. Reference: ${redemptionReference}`);
    await logPaymentEvent(payment.id, 'redemption_success', `MXNB redemption successful. Amount: ${amountMXNB} MXNB. Reference: ${redemptionReference}`);
    // Send SPEI completion notification with receipt for MXNB redemption
    try {
        // Get original buyer information from payment (user field represents the buyer)
        const buyer = payment.user;
        const speiReceiptData = {
            transactionId: redemptionReference || `MXNB-${payment.id}-${Date.now()}`,
            junoTransactionId: redemptionReference,
            amount: amountMXNB,
            currency: 'MXN',
            status: 'SUCCEEDED',
            createdAt: new Date(),
            paymentId: payment.id,
            paymentDescription: payment.description,
            escrowId: escrow.id,
            recipientName: seller.full_name || seller.email,
            recipientEmail: seller.email,
            bankAccountId: seller.juno_bank_account_id,
            clabe: seller.payout_clabe,
            senderName: 'Kustodia',
            senderInfo: 'Plataforma de Pagos Seguros - Redención MXNB',
            reference: payment.reference || `KUSTODIA-${payment.id}`,
            concept: payment.description || 'Redención MXNB a MXN',
            speiReference: `MXNB${payment.id.toString().padStart(6, '0')}`,
            // Original deposit information (buyer's bank → Nvio flow)
            originalSenderName: buyer?.full_name || buyer?.email || 'Comprador',
            custodyProvider: 'Kustodia',
            paymentProcessor: 'Nvio Pagos México',
            originalDepositAmount: payment.amount ? Number(payment.amount) : amountMXNB,
            originalAmount: amountMXNB,
            commissionAmount: 0, // No commission on MXNB redemption
            netAmount: amountMXNB
        };
        await (0, paymentNotificationService_1.sendPaymentEventNotification)({
            eventType: 'spei_transfer_completed',
            paymentId: payment.id.toString(),
            paymentDetails: {
                amount: amountMXNB,
                currency: 'MXN',
                status: payment.status,
                description: payment.description || 'Redención MXNB'
            },
            recipients: [{
                    email: seller.email,
                    role: 'seller'
                }],
            includeSPEIReceipt: true,
            speiReceiptData,
            junoTransactionId: redemptionReference
        });
        console.log(`[Payout] MXNB redemption SPEI receipt sent to ${seller.email}`);
    }
    catch (notificationError) {
        console.error('[Payout] Failed to send MXNB redemption notification:', notificationError);
    }
    return { escrow, payment, redemptionResult };
}
// (legacy) Redeems MXNB from Juno (crypto withdrawal to platform wallet), then triggers payout to seller.
// Logs all actions as PaymentEvent.
// @param escrowId The ID of the escrow to process
// @param destAddress The platform wallet address to receive MXNB (from .env or config)
async function redeemAndPayout(escrowId, destAddress) {
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const junoTxRepo = ormconfig_1.default.getRepository(JunoTransaction_1.JunoTransaction);
    // Fetch escrow and payment
    const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ['payment'] });
    if (!escrow)
        throw new Error('Escrow not found');
    const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id }, relations: ['user'] });
    if (!payment)
        throw new Error('Payment not found');
    // 1. Initiate MXNB withdrawal (redemption) from Juno
    const amount = Number(escrow.release_amount);
    const asset = 'MXNB';
    const blockchain = 'ARBITRUM';
    const address = destAddress;
    await logPaymentEvent(payment.id, 'redemption_initiated', `Initiating MXNB withdrawal to platform wallet: ${address}`);
    // Prepare withdrawal body
    const bodyObj = { amount, asset, blockchain, address };
    // Optionally add compliance if needed (future)
    // Prepare headers/signature (same as junoWithdrawOnchain.ts)
    const JUNO_ENV = process.env.JUNO_ENV || 'stage';
    const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
    const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
    const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
    const endpoint = '/mint_platform/v1/withdrawals';
    const url = `${BASE_URL}${endpoint}`;
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = endpoint;
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto_1.default.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    let redemptionResult, redemptionStatus = 'pending', redemptionReference = undefined;
    try {
        const response = await axios_1.default.post(url, bodyObj, { headers });
        redemptionResult = response.data;
        redemptionStatus = 'success';
        redemptionReference = redemptionResult?.id;
        await logPaymentEvent(payment.id, 'redemption_success', `MXNB withdrawal successful. Juno ref: ${redemptionReference}`);
    }
    catch (err) {
        redemptionStatus = 'failed';
        redemptionResult = err?.response?.data || err?.message || err;
        await logPaymentEvent(payment.id, 'redemption_failed', `MXNB withdrawal failed: ${JSON.stringify(redemptionResult)}`);
        // Log failed JunoTransaction
        const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference, amount, status: redemptionStatus });
        await junoTxRepo.save(junoTx);
        throw new Error('MXNB withdrawal failed: ' + JSON.stringify(redemptionResult));
    }
    // Log successful JunoTransaction
    const junoTx = junoTxRepo.create({ type: 'redemption', reference: redemptionReference, amount, status: redemptionStatus });
    await junoTxRepo.save(junoTx);
    // 2. After redemption, trigger payout to seller
    await logPaymentEvent(payment.id, 'payout_initiated', 'Triggering payout to seller after redemption.');
    // Use existing payout logic
    // We assume releaseEscrowAndPayout logs its own events and status
    const payoutResult = await releaseEscrowAndPayout(escrowId);
    await logPaymentEvent(payment.id, 'payout_completed', 'Payout to seller completed.');
    return { escrow, payment, redemptionResult, payoutResult };
}
