"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.junoWebhook = exports.initiatePayment = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const User_1 = require("../entity/User");
const PaymentEvent_1 = require("../entity/PaymentEvent");
const escrowService_1 = require("../services/escrowService");
const JunoTransaction_1 = require("../entity/JunoTransaction");
const junoService_1 = require("../services/junoService");
const notificationService_1 = require("../services/notificationService");
const initiatePayment = async (req, res) => {
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    try {
        const { user_id, recipient_email, amount, currency, description, custody_percent, custody_period, travel_rule_data, payment_type } = req.body; // Re-add payment_type
        // Basic validation
        if (!user_id || !recipient_email || !amount || !currency || !custody_percent || !custody_period) {
            res.status(400).json({ error: "Missing required fields." });
            return;
        }
        // Optional: validate travel_rule_data structure if present
        if (travel_rule_data && typeof travel_rule_data !== 'object') {
            res.status(400).json({ error: "travel_rule_data must be an object if provided." });
            return;
        }
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        const user = await userRepo.findOne({ where: { id: user_id } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Fetch recipient user for payout_clabe
        const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });
        if (!recipientUser) {
            res.status(404).json({ error: "Recipient not found" });
            return;
        }
        // **CREATE UNIQUE CLABE FOR THIS PAYMENT** - Key change for per-payment CLABE
        let paymentClabe;
        try {
            paymentClabe = await (0, junoService_1.createJunoClabe)();
            console.log(`✅ Created unique CLABE for payment: ${paymentClabe}`);
        }
        catch (clabeErr) {
            console.error('❌ Failed to create payment CLABE:', clabeErr);
            res.status(500).json({ error: "Failed to create payment CLABE", details: clabeErr });
            return;
        }
        // Buscar payout_clabe del beneficiario de comisión si aplica
        let commission_beneficiary_clabe = undefined;
        if (req.body.commission_beneficiary_email) {
            const beneficiaryUser = await userRepo.findOne({ where: { email: req.body.commission_beneficiary_email } });
            if (!beneficiaryUser || !beneficiaryUser.payout_clabe) {
                res.status(400).json({ error: 'El beneficiario de comisión debe estar registrado y tener CLABE de retiro' });
                return;
            }
            commission_beneficiary_clabe = beneficiaryUser.payout_clabe;
        }
        // Create Payment record with UNIQUE payment CLABE (not recipient's deposit_clabe)
        const payment = paymentRepo.create({
            user: user, // typeorm expects entity or id
            recipient_email,
            payer_email: req.body.payer_email || user.email, // guarda el email del pagador si viene, si no el del usuario
            amount: Math.trunc(Number(amount)),
            currency,
            description,
            status: "pending",
            vertical_type: req.body.vertical_type || null, // Add vertical type
            release_conditions: req.body.release_conditions || null, // Add release conditions
            reference: '', // will update after save
            deposit_clabe: paymentClabe, // UNIQUE CLABE PER PAYMENT
            payout_clabe: recipientUser.payout_clabe || undefined,
            commission_beneficiary_name: req.body.commission_beneficiary_name,
            commission_beneficiary_email: req.body.commission_beneficiary_email,
            commission_beneficiary_clabe,
            // Store Travel Rule compliance data if provided
            travel_rule_data: travel_rule_data || null,
            payment_type: payment_type || 'traditional', // Default to traditional if not provided
        });
        await paymentRepo.save(payment);
        // Registrar evento: Pago iniciado
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: 'initiated',
            description: `💳 Pago iniciado - CLABE única: ${paymentClabe}`
        }));
        // Set reference to payment.id (string) and update
        payment.reference = String(payment.id);
        await paymentRepo.save(payment);
        // Only create DB records, do NOT interact with the smart contract yet
        const custodyPercent = Number(custody_percent);
        const custodyPeriod = Number(custody_period);
        const custodyAmount = Number(amount) * (custodyPercent / 100);
        const releaseAmount = Number(amount) - custodyAmount;
        const escrow = escrowRepo.create({
            payment: payment,
            smart_contract_escrow_id: "", // Will be set after webhook
            custody_percent: custodyPercent,
            custody_amount: Math.trunc(custodyAmount),
            release_amount: Math.trunc(releaseAmount),
            status: "pending",
            dispute_status: "none",
            custody_end: new Date(Date.now() + custodyPeriod * 24 * 60 * 60 * 1000)
        });
        await escrowRepo.save(escrow);
        // NO crear evento de custodia aquí. Se creará cuando se fondeen los fondos.
        payment.status = "pending";
        payment.escrow = escrow;
        await paymentRepo.save(payment);
        console.log(`✅ Payment created with unique CLABE: ${paymentClabe} | Payment ID: ${payment.id}`);
        res.json({
            success: true,
            payment: {
                ...payment,
                deposit_clabe: paymentClabe // Ensure CLABE is returned to frontend
            },
            escrow,
            clabe: paymentClabe // Explicit CLABE for frontend
        });
        return;
    }
    catch (err) {
        console.error('❌ Payment initiation failed:', err);
        res.status(500).json({ error: "Payment initiation failed", details: String(err) });
        return;
    }
};
exports.initiatePayment = initiatePayment;
const junoWebhook = async (req, res) => {
    console.log('==== Webhook recibido de Juno ====');
    console.log('Body:', req.body);
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    try {
        const { transaction_id, amount: webhookAmount, status, clabe: webhookClabe } = req.body;
        if (!transaction_id || !webhookAmount || !webhookClabe) {
            res.status(400).json({ error: 'Missing required fields: transaction_id, amount, or clabe' });
            return;
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        const payment = await paymentRepo.findOne({
            where: {
                deposit_clabe: webhookClabe,
                // Use a range to avoid floating point issues with amount
                // amount: Number(webhookAmount),
                status: 'pending',
            },
            relations: ['user', 'escrow'] // Eagerly load user and escrow
        });
        if (!payment) {
            console.log(`[JUNO] No payment found for CLABE ${webhookClabe}. Ignoring webhook.`);
            res.status(200).json({ message: 'No payment found for this CLABE.' });
            return;
        }
        const recipientUser = await ormconfig_1.default.getRepository(User_1.User).findOne({ where: { email: payment.recipient_email } });
        const escrow = payment.escrow;
        if (!escrow) {
            console.error(`[Webhook] Escrow record not found for payment ID ${payment.id}`);
            res.status(404).json({ error: 'Escrow record not found for payment' });
            return;
        }
        // Mark that we are processing this payment
        payment.status = 'processing';
        await paymentRepo.save(payment);
        // Registrar evento: Depósito recibido
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: 'deposit_received',
            description: `✅ Depósito de ${webhookAmount} MXN recibido. CLABE: ${webhookClabe}.`
        }));
        // 1. Payout Immediate Release Amount (if any)
        const recipientClabe = payment.payout_clabe;
        if (escrow.release_amount > 0 && recipientClabe) {
            console.log(`[Juno] Attempting to pay out release amount of ${escrow.release_amount} to CLABE ${recipientClabe}`);
            try {
                const payoutResult = await (0, junoService_1.redeemMXNbForMXN)(Number(escrow.release_amount), recipientClabe);
                console.log(`[Juno] SUCCESS: Payout for release amount sent. Details: ${JSON.stringify(payoutResult)}`);
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: payment.id,
                    type: 'payout_released',
                    description: `💸 Monto de liberación inmediata (${escrow.release_amount} MXN) pagado a ${recipientClabe}.`
                }));
            }
            catch (payoutErr) {
                console.error('❌ [Juno] FAILED to send release payment:', payoutErr);
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: payment.id,
                    type: 'payout_failed',
                    description: `❌ Falló el pago del monto de liberación inmediata: ${String(payoutErr)}`
                }));
                // Decide if this is a critical failure. For now, we will proceed to escrow the rest.
            }
        }
        // 2. Create On-Chain Escrow for Custody Amount (if any)
        if (escrow.custody_amount > 0) {
            let escrowIdOrTx;
            try {
                const { ethers } = require("ethers");
                const custodyAmountStr = Math.trunc(escrow.custody_amount).toString();
                const custodyAmountBN = ethers.utils.parseUnits(custodyAmountStr, 18); // Assuming 18 decimals for the token
                const custodyPeriod = Math.floor((escrow.custody_end.getTime() - Date.now()) / 1000);
                if (custodyPeriod <= 0) {
                    throw new Error(`Custody end time must be in the future. It is currently ${custodyPeriod}s.`);
                }
                const payer = process.env.ESCROW_BRIDGE_WALLET;
                const payee = process.env.ESCROW_BRIDGE_WALLET;
                const token = process.env.MOCK_ERC20_ADDRESS;
                const vertical = payment.vertical_type || '';
                const clabe = payment.deposit_clabe || '';
                const conditions = payment.release_conditions || '';
                console.log(`[Escrow] Creating on-chain escrow with V2 params...`);
                escrowIdOrTx = await (0, escrowService_1.createEscrow)({
                    payer,
                    payee,
                    token,
                    amount: custodyAmountBN.toString(), // Pass as string to match service signature
                    deadline: custodyPeriod,
                    vertical,
                    clabe,
                    conditions
                });
                if (typeof escrowIdOrTx === 'object' && escrowIdOrTx !== null) {
                    escrow.smart_contract_escrow_id = escrowIdOrTx.escrowId || escrowIdOrTx.txHash || '';
                    escrow.blockchain_tx_hash = escrowIdOrTx.txHash || '';
                    payment.blockchain_tx_hash = escrowIdOrTx.txHash || '';
                }
                else {
                    escrow.smart_contract_escrow_id = String(escrowIdOrTx);
                }
                escrow.status = 'active';
                await escrowRepo.save(escrow);
                console.log(`[Escrow] SUCCESS: Created on-chain escrow. EscrowID: ${escrow.smart_contract_escrow_id}, TxHash: ${escrow.blockchain_tx_hash}`);
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: payment.id,
                    type: 'escrow_created',
                    description: `🔒 Custodia creada en blockchain. ID: ${escrow.smart_contract_escrow_id}`
                }));
            }
            catch (escrowErr) {
                console.error('❌ FAILED to create on-chain escrow:', String(escrowErr));
                payment.status = 'failed';
                escrow.status = 'failed';
                await escrowRepo.save(escrow);
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: payment.id,
                    type: 'escrow_failed',
                    description: `❌ Falló la creación de la custodia en blockchain: ${String(escrowErr)}`
                }));
            }
        }
        // Finalize payment status
        if (payment.status !== 'failed') {
            payment.status = 'funded';
            // Create notifications for both users
            if (payment.user) {
                (0, notificationService_1.createNotification)(payment.user.id, `Tu pago de $${payment.amount} ha sido fondeado.`, `/dashboard/pagos/${payment.id}`);
            }
            if (recipientUser) {
                (0, notificationService_1.createNotification)(recipientUser.id, `Has recibido un pago de $${payment.amount}.`, `/dashboard/pagos/${payment.id}`);
            }
        }
        // If the payment is fully funded and has a valid payout CLABE, redeem the funds
        if (payment.status === 'funded' && payment.payout_clabe) {
            try {
                console.log(`[JUNO] Initiating redemption for payment ${payment.id}...`);
                const redemptionResult = await (0, junoService_1.redeemMXNbForMXN)(payment.amount, payment.payout_clabe);
                console.log(`[JUNO] Redemption successful for payment ${payment.id}:`, redemptionResult);
                // Update payment status to 'completed'
                payment.status = 'completed';
                // Notify both users that the payment is complete
                if (payment.user) {
                    (0, notificationService_1.createNotification)(payment.user.id, `Tu pago de $${payment.amount} ha sido completado y enviado.`, `/dashboard/pagos/${payment.id}`);
                }
                if (recipientUser) {
                    (0, notificationService_1.createNotification)(recipientUser.id, `El pago de $${payment.amount} ha sido liberado a tu cuenta.`, `/dashboard/pagos/${payment.id}`);
                }
                await paymentRepo.save(payment);
                // Log the redemption event
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: payment.id,
                    type: 'payout_initiated',
                    description: `💸 Pago enviado a la CLABE del beneficiario. ID de transacción de Juno: ${redemptionResult.id}`
                }));
            }
            catch (redemptionErr) {
                console.error(`❌ FAILED to redeem funds for payment ${payment.id}:`, String(redemptionErr));
                // Optionally, update status to 'payout_failed' or similar
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: payment.id,
                    type: 'payout_failed',
                    description: `❌ Falló el envío de fondos al beneficiario: ${String(redemptionErr)}`
                }));
            }
        }
        // Link Juno Transaction
        const junoTransactionRepo = ormconfig_1.default.getRepository(JunoTransaction_1.JunoTransaction);
        let junoTransaction = await junoTransactionRepo.findOne({ where: { reference: transaction_id } });
        if (!junoTransaction) {
            junoTransaction = junoTransactionRepo.create({
                reference: transaction_id,
                type: 'deposit',
                amount: Number(webhookAmount),
                status: status || 'completed',
            });
            await junoTransactionRepo.save(junoTransaction);
        }
        payment.junoTransaction = junoTransaction;
        await paymentRepo.save(payment);
        // Send notifications
        try {
            const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
            const recipients = [
                { email: payment.payer_email, role: 'payer' },
                { email: payment.recipient_email, role: 'seller' }
            ];
            await sendPaymentEventNotification({
                eventType: 'escrow_created', // Generic "funded" notification
                paymentId: payment.id.toString(),
                paymentDetails: payment,
                recipients,
                commissionBeneficiaryEmail: payment.commission_beneficiary_email || undefined
            });
        }
        catch (emailErr) {
            console.error('Email notification failed:', String(emailErr));
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Juno webhook error:', String(err));
        res.status(500).json({ error: 'Webhook processing failed', details: String(err) });
    }
};
exports.junoWebhook = junoWebhook;
