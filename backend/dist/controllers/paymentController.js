"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePayment = exports.junoWebhook = exports.releaseWeb3Payment = exports.fundWeb3Escrow = exports.initiateWeb3Payment = exports.getPaymentById = exports.getPayments = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const User_1 = require("../entity/User");
const Escrow_1 = require("../entity/Escrow");
const PaymentEvent_1 = require("../entity/PaymentEvent");
const JunoTransaction_1 = require("../entity/JunoTransaction");
const CommissionRecipient_1 = require("../entity/CommissionRecipient");
const notificationService_1 = require("../services/notificationService");
const escrowV3Service_1 = require("../services/escrowV3Service");
const junoService_1 = require("../services/junoService");
const networkConfig_1 = require("../utils/networkConfig");
// Helper function to create a payment event
const createPaymentEvent = async (payment, type, description, isAutomatic = false) => {
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    const newEvent = new PaymentEvent_1.PaymentEvent();
    newEvent.payment = payment;
    newEvent.type = type;
    newEvent.description = description;
    newEvent.is_automatic = isAutomatic;
    await paymentEventRepo.save(newEvent);
};
// Helper function to create payment notifications
const createPaymentNotifications = async (paymentId, type) => {
    try {
        const { createPaymentNotifications: createNotifications } = await Promise.resolve().then(() => __importStar(require('../services/paymentNotificationIntegration')));
        // Map the type string to PaymentEventType
        let eventType;
        switch (type) {
            case 'funds_received':
                eventType = 'payment_funded';
                break;
            case 'payment_released':
                eventType = 'payment_completed';
                break;
            case 'payment_failed':
                eventType = 'payment_failed';
                break;
            default:
                eventType = 'payment_updated';
        }
        await createNotifications(paymentId, eventType);
        console.log(`Payment notification created: ${type} for payment ${paymentId}`);
    }
    catch (error) {
        console.error(`Error creating payment notification for payment ${paymentId}:`, error);
    }
};
// Helper function to redeem MXNb for MXN (placeholder)
const redeemMXNbForMXN = async (amount, clabe) => {
    console.log(`Redeeming ${amount} MXNb for MXN to CLABE ${clabe}`);
    // TODO: Implement actual redemption logic
};
// Helper function to handle permanent CLABE deposits (placeholder)
const handlePermanentClabeDeposit = async (user, amount) => {
    console.log(`Handling permanent CLABE deposit for user ${user.id}, amount: ${amount}`);
    // TODO: Implement actual deposit handling logic
};
// Helper function to check if SPEI receipt is available for a payment
const isSPEIReceiptAvailable = (payment) => {
    // SPEI receipt is available for completed payments that have been paid out via SPEI
    return payment.status === 'paid' &&
        (payment.juno_payment_id !== null || payment.payout_clabe !== null);
};
// GET all payments for the authenticated user
const getPayments = async (req, res) => {
    try {
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const userId = req.user.id;
        const payments = await paymentRepo.createQueryBuilder("payment")
            .leftJoinAndSelect("payment.escrows", "escrow")
            .leftJoin("payment.payer", "payer")
            .leftJoin("payment.recipient", "recipient")
            .addSelect(["payer.id", "payer.email", "recipient.id", "recipient.email"])
            .where("payment.payerId = :userId OR payment.recipientId = :userId", { userId })
            .orderBy("payment.created_at", "DESC")
            .getMany();
        // Add SPEI receipt availability info to each payment
        const paymentsWithReceiptInfo = payments.map(payment => ({
            ...payment,
            spei_receipt_available: isSPEIReceiptAvailable(payment)
        }));
        res.status(200).json(paymentsWithReceiptInfo);
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: 'Internal server error while fetching payments.' });
    }
};
exports.getPayments = getPayments;
// GET a single payment by ID
const getPaymentById = async (req, res) => {
    try {
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const paymentId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const payment = await paymentRepo.createQueryBuilder("payment")
            .leftJoinAndSelect("payment.escrows", "escrow")
            .leftJoinAndSelect("payment.events", "event")
            .leftJoin("payment.payer", "payer")
            .leftJoin("payment.recipient", "recipient")
            .addSelect(["payer.id", "payer.email", "recipient.id", "recipient.email"])
            .where("payment.id = :paymentId", { paymentId })
            .andWhere("(payment.payerId = :userId OR payment.recipientId = :userId)", { userId })
            .orderBy("event.created_at", "ASC")
            .getOne();
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found or you do not have permission to view it.' });
        }
        // Add SPEI receipt availability info
        const paymentWithReceiptInfo = {
            ...payment,
            spei_receipt_available: isSPEIReceiptAvailable(payment)
        };
        res.status(200).json(paymentWithReceiptInfo);
    }
    catch (error) {
        console.error(`Error fetching payment with ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching the payment.' });
    }
};
exports.getPaymentById = getPaymentById;
// POST a new Web3 payment (on-chain)
const initiateWeb3Payment = async (req, res) => {
    const queryRunner = ormconfig_1.default.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const { recipientEmail, amount, custodyDays, description, warrantyPercent, approvalTxHash, escrowTxHash } = req.body;
        const payerId = req.user?.id;
        // Validate input
        if (!recipientEmail || !amount || !custodyDays || !description || warrantyPercent === undefined) {
            return res.status(400).json({ message: 'Missing required fields: recipientEmail, amount, custodyDays, description, warrantyPercent' });
        }
        // Parse and validate warrantyPercent with default
        const custodyPercent = warrantyPercent !== undefined ? parseFloat(warrantyPercent) : 0;
        if (isNaN(custodyPercent) || custodyPercent < 0 || custodyPercent > 100) {
            return res.status(400).json({ message: 'Warranty percentage must be a valid number between 0 and 100.' });
        }
        // Parse and validate custodyDays with default
        const custodyDaysNum = custodyDays !== undefined ? parseInt(custodyDays, 10) : 30;
        if (isNaN(custodyDaysNum) || custodyDaysNum < 0) {
            return res.status(400).json({ message: 'Custody days must be a valid positive number.' });
        }
        const userRepo = queryRunner.manager.getRepository(User_1.User);
        const paymentRepo = queryRunner.manager.getRepository(Payment_1.Payment);
        const escrowRepo = queryRunner.manager.getRepository(Escrow_1.Escrow);
        const payer = await userRepo.findOneBy({ id: payerId });
        const recipient = await userRepo.findOneBy({ email: recipientEmail });
        if (!payer) {
            return res.status(404).json({ message: 'Payer not found.' });
        }
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found.' });
        }
        if (!payer.wallet_address || !recipient.wallet_address) {
            return res.status(400).json({ message: 'Both payer and recipient must have a wallet address for Web3 payments.' });
        }
        if (!payer.portal_share) {
            return res.status(400).json({ message: 'Payer must have portal share for Web3 payments.' });
        }
        const newPayment = new Payment_1.Payment();
        newPayment.user = payer; // The payer/buyer
        newPayment.seller = recipient; // The recipient/seller
        newPayment.payer_email = payer.email; // Required field
        newPayment.recipient_email = recipient.email; // Required field - was missing!
        newPayment.amount = parseFloat(amount);
        newPayment.description = description;
        newPayment.status = 'pending_escrow';
        newPayment.payment_type = 'web3';
        newPayment.reference = `WEB3-${Date.now()}`;
        const savedPayment = await paymentRepo.save(newPayment);
        const custodyAmount = (parseFloat(amount) * custodyPercent) / 100;
        const releaseAmount = parseFloat(amount) - custodyAmount;
        const custodyEnd = new Date();
        custodyEnd.setDate(custodyEnd.getDate() + custodyDaysNum);
        const newEscrow = new Escrow_1.Escrow();
        newEscrow.payment = savedPayment;
        newEscrow.custody_percent = custodyPercent;
        newEscrow.custody_amount = custodyAmount;
        newEscrow.release_amount = releaseAmount;
        newEscrow.custody_end = custodyEnd;
        newEscrow.status = 'pending_creation';
        const savedEscrow = await escrowRepo.save(newEscrow);
        // Real Portal MPC token approval step
        const MXNB_CONTRACT_ADDRESS = (0, networkConfig_1.getCurrentNetworkConfig)().mxnbTokenAddress;
        const ESCROW_CONTRACT_ADDRESS = process.env.KUSTODIA_ESCROW_V3_ADDRESS;
        if (!MXNB_CONTRACT_ADDRESS || !ESCROW_CONTRACT_ADDRESS) {
            throw new Error('Missing contract addresses in environment variables');
        }
        // Create ERC-20 approve transaction calldata
        // Store real transaction hashes from frontend Portal SDK operations
        if (approvalTxHash) {
            console.log(`[Payment] Storing approval transaction hash: ${approvalTxHash}`);
            savedPayment.blockchain_tx_hash = approvalTxHash;
            await createPaymentEvent(savedPayment, 'token_approved', `MXNB token approval completed via Portal SDK. Tx: ${approvalTxHash}`);
        }
        if (escrowTxHash) {
            console.log(`[Payment] Storing escrow transaction hash: ${escrowTxHash}`);
            savedEscrow.blockchain_tx_hash = escrowTxHash;
            savedEscrow.status = 'active';
            await createPaymentEvent(savedPayment, 'escrow_created', `On-chain escrow created via Portal SDK. Tx: ${escrowTxHash}`);
        }
        else {
            savedEscrow.status = 'pending_creation';
        }
        await escrowRepo.save(savedEscrow);
        console.log(`[Payment] Payment and escrow records updated with real transaction hashes.`);
        savedPayment.status = escrowTxHash ? 'escrow_created' : 'pending_escrow';
        await paymentRepo.save(savedPayment);
        await createPaymentEvent(savedPayment, 'payment_created', `Pago directo iniciado por ${payer.email} a ${recipient.email}`);
        await queryRunner.commitTransaction();
        console.log(`[Payment] Web3 payment initiated successfully. ID: ${savedPayment.id}`);
        // Return payment with tracker URL
        res.status(201).json({
            message: escrowTxHash ? 'Web3 payment and escrow created successfully via Portal SDK.' : 'Web3 payment initiated. Escrow creation pending.',
            payment: savedPayment,
            escrow: savedEscrow,
            trackerUrl: `/dashboard/pagos/${savedPayment.id}`,
            approvalTxHash: approvalTxHash || null,
            escrowTxHash: escrowTxHash || null
        });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error initiating Web3 payment:", error);
        res.status(500).json({ message: 'Internal server error during Web3 payment initiation.' });
    }
    finally {
        await queryRunner.release();
    }
};
exports.initiateWeb3Payment = initiateWeb3Payment;
// POST to fund a Web3 escrow
const fundWeb3Escrow = async (req, res) => {
    const { paymentId } = req.body;
    const funderId = req.user.id;
    // Get user with portal_share from database
    const userRepo = ormconfig_1.default.getRepository(User_1.User);
    const userWithPortalShare = await userRepo.findOne({ where: { id: req.user.id } });
    if (!userWithPortalShare?.portal_share) {
        return res.status(400).json({ message: 'User portal share not found' });
    }
    const userPortalShare = userWithPortalShare.portal_share;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }
    if (!userPortalShare) {
        return res.status(400).json({ message: 'User Portal share is required for funding.' });
    }
    const queryRunner = ormconfig_1.default.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const paymentRepo = queryRunner.manager.getRepository(Payment_1.Payment);
        const escrowRepo = queryRunner.manager.getRepository(Escrow_1.Escrow);
        const userRepo = queryRunner.manager.getRepository(User_1.User);
        const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ["payer", "recipient", "escrows"] });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        if (payment.user.id !== funderId) {
            return res.status(403).json({ message: 'You are not authorized to fund this payment.' });
        }
        if (payment.status !== 'escrow_created') {
            return res.status(400).json({ message: `Payment cannot be funded in its current state: ${payment.status}` });
        }
        const escrow = payment.escrow;
        if (!escrow || !escrow.smart_contract_escrow_id) {
            return res.status(400).json({ message: 'Escrow not properly created on-chain.' });
        }
        const funder = await userRepo.findOneBy({ id: funderId });
        if (!funder || !funder.wallet_address) {
            return res.status(400).json({ message: 'Funder wallet address not found.' });
        }
        const { txHash } = await (0, escrowV3Service_1.fundV3Escrow)({
            funderAddress: funder.wallet_address,
            escrowId: escrow.smart_contract_escrow_id,
            amount: payment.amount.toString(),
            userPortalShare: userPortalShare
        });
        escrow.status = 'funded';
        escrow.blockchain_tx_hash = txHash;
        await escrowRepo.save(escrow);
        payment.status = 'in_escrow';
        await paymentRepo.save(payment);
        await createPaymentEvent(payment, 'escrow_funded', `Escrow funded by ${funder.email}. Tx: ${txHash}.`);
        await queryRunner.commitTransaction();
        await (0, notificationService_1.createNotification)(payment.user.id, `Your payment of ${payment.amount} has been successfully funded.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');
        await (0, notificationService_1.createNotification)(payment.seller.id, `The payment from ${payment.user.email} is now funded and in escrow.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');
        res.status(200).json({ message: 'Escrow funded successfully.', txHash });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error funding Web3 escrow:", error);
        res.status(500).json({ message: 'Internal server error during escrow funding.' });
    }
    finally {
        await queryRunner.release();
    }
};
exports.fundWeb3Escrow = fundWeb3Escrow;
// POST to release a Web3 escrow
const releaseWeb3Payment = async (req, res) => {
    const { paymentId } = req.body;
    const releasingUserId = req.user.id;
    if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID is required.' });
    }
    const queryRunner = ormconfig_1.default.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const paymentRepo = queryRunner.manager.getRepository(Payment_1.Payment);
        const escrowRepo = queryRunner.manager.getRepository(Escrow_1.Escrow);
        const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ["payer", "recipient", "escrows"] });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }
        if (payment.user.id !== releasingUserId && payment.seller.id !== releasingUserId) {
            return res.status(403).json({ message: 'You are not a party to this payment.' });
        }
        if (payment.status !== 'in_escrow') {
            return res.status(400).json({ message: `Payment cannot be released in its current state: ${payment.status}` });
        }
        const escrow = payment.escrow;
        if (!escrow || !escrow.smart_contract_escrow_id) {
            return res.status(400).json({ message: 'Escrow not properly created on-chain.' });
        }
        if (new Date() < new Date(escrow.custody_end)) {
            return res.status(400).json({ message: 'Custody period has not ended yet.' });
        }
        const { txHash } = await (0, escrowV3Service_1.releaseV3Escrow)(escrow.smart_contract_escrow_id);
        escrow.status = 'released';
        escrow.blockchain_tx_hash = txHash;
        await escrowRepo.save(escrow);
        payment.status = 'completed';
        await paymentRepo.save(payment);
        await createPaymentEvent(payment, 'escrow_released', `Escrow released. Tx: ${txHash}.`);
        await queryRunner.commitTransaction();
        await (0, notificationService_1.createNotification)(payment.user.id, `The payment to ${payment.seller.email} has been released from escrow.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');
        await (0, notificationService_1.createNotification)(payment.seller.id, `Funds from ${payment.user.email} have been released to you.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');
        res.status(200).json({ message: 'Escrow released successfully.', txHash });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error releasing Web3 escrow:", error);
        if (error instanceof Error && error.message.includes("Custody period not over")) {
            return res.status(400).json({ message: "Release failed: The custody period has not yet ended." });
        }
        res.status(500).json({ message: 'Internal server error during escrow release.' });
    }
    finally {
        await queryRunner.release();
    }
};
exports.releaseWeb3Payment = releaseWeb3Payment;
// Juno webhook handler for processing bank deposits
const junoWebhook = async (req, res) => {
    try {
        const { clabe, amount, transaction_id } = req.body;
        const webhookClabe = clabe;
        const webhookAmount = amount;
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const junoTxRepo = ormconfig_1.default.getRepository(JunoTransaction_1.JunoTransaction);
        const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
        // --- Flow 1: Check for a temporary payment CLABE ---
        const payment = await paymentRepo.findOne({
            where: { deposit_clabe: webhookClabe, status: 'pending' },
            relations: ['user', 'escrow']
        });
        if (payment) {
            console.log(`[JUNO] Processing webhook for payment ID: ${payment.id}, CLABE: ${webhookClabe}`);
            const webhookTransactionId = transaction_id;
            let junoTransaction = await junoTxRepo.findOne({ where: { reference: webhookTransactionId } });
            if (!junoTransaction) {
                console.log(`[junoWebhook] JunoTransaction not found for reference ${webhookTransactionId}. Creating a new one.`);
                junoTransaction = new JunoTransaction_1.JunoTransaction();
                junoTransaction.reference = webhookTransactionId;
                junoTransaction.amount = parseFloat(webhookAmount);
                junoTransaction.type = 'DEPOSIT';
                junoTransaction.status = 'COMPLETED';
                await junoTxRepo.save(junoTransaction);
            }
            else {
                console.log(`[junoWebhook] Found existing JunoTransaction: ${junoTransaction.id}`);
            }
            // Assign the entity to the relation
            payment.junoTransaction = junoTransaction;
            // Also populate the legacy field for compatibility
            payment.transaction_id = webhookTransactionId;
            payment.status = 'funded';
            await paymentRepo.save(payment);
            await paymentEventRepo.save(paymentEventRepo.create({
                paymentId: payment.id,
                type: 'deposit_received',
                description: `💸 Depósito recibido en CLABE. ID de Juno: ${transaction_id}`
            }));
            // Logic for handling escrow, notifications, and potential payout
            payment.status = 'funded';
            await createPaymentNotifications(payment.id, 'funds_received');
            // If the payment has a payout_clabe, it implies direct transfer, not escrow
            if (payment.payout_clabe) {
                try {
                    console.log(`[JUNO] Redeeming funds for payment ${payment.id}`);
                    await redeemMXNbForMXN(payment.amount, payment.payout_clabe);
                    payment.status = 'completed';
                    await createPaymentNotifications(payment.id, 'payment_released');
                }
                catch (redemptionErr) {
                    console.error(`[JUNO] Redemption failed for payment ${payment.id}:`, redemptionErr);
                    payment.status = 'failed';
                    await createPaymentNotifications(payment.id, 'payment_failed');
                }
            }
            await paymentRepo.save(payment);
        }
        // --- Flow 2: Check for a permanent user deposit CLABE ---
        const user = await userRepo.findOne({ where: { deposit_clabe: webhookClabe } });
        if (user) {
            console.log(`[JUNO] Processing webhook for permanent user CLABE: ${webhookClabe} for user ID: ${user.id}`);
            // This is a deposit to a permanent user CLABE, handle Web3 logic
            await handlePermanentClabeDeposit(user, parseFloat(webhookAmount));
        }
        else {
            // Neither a payment nor a user CLABE was found
            console.log(`[JUNO] Webhook for CLABE ${webhookClabe} did not match any pending payment or user.`);
        }
        // Always respond with 200 OK to Juno to prevent retries
        res.status(200).send('Webhook received');
    }
    catch (err) {
        console.error('Juno webhook processing error:', String(err));
        res.status(500).json({ error: 'Webhook processing failed', details: String(err) });
    }
};
exports.junoWebhook = junoWebhook;
/**
 * Initiate Direct Payment (CLABE/SPEI)
 * Creates Payment and Escrow records, generates unique CLABE via Juno API
 */
const initiatePayment = async (req, res) => {
    try {
        const { recipient_email, amount, currency = 'mxn', description, custody_percent = 100, // Default 100% in custody
        custody_period = 5, // Default 5 days
        commission_amount = 0, commission_beneficiary_email, commission_recipients, // Array of multiple commission recipients
        travel_rule_data, 
        // Nuevo flujo parameters
        payment_type = 'traditional', // 'traditional' | 'nuevo_flujo' | 'web3'
        vertical_type, // e.g., 'freelance', 'inmobiliaria', 'marketplace'
        release_conditions, // Custom release conditions for nuevo_flujo
        // Product-specific fields
        transaction_subtype, 
        // Vehicle fields
        vehicle_brand, vehicle_model, vehicle_year, vehicle_vin, vehicle_mileage, vehicle_condition, 
        // Electronics fields
        electronics_brand, electronics_model, electronics_condition, electronics_warranty, electronics_serial, 
        // Appliance fields
        appliance_type, appliance_brand, appliance_years_use, appliance_efficiency, appliance_condition, appliance_serial, 
        // Furniture fields
        furniture_type, furniture_material, furniture_dimensions, furniture_condition } = req.body;
        // Validate required fields
        if (!recipient_email || !amount || amount <= 0) {
            res.status(400).json({ error: 'Recipient email and positive amount are required' });
            return;
        }
        if (custody_percent < 0 || custody_percent > 100) {
            res.status(400).json({ error: 'Custody percent must be between 0 and 100' });
            return;
        }
        // Validate travel_rule_data structure if present
        if (travel_rule_data && typeof travel_rule_data !== 'object') {
            res.status(400).json({ error: 'travel_rule_data must be an object if provided' });
            return;
        }
        // Validate nuevo_flujo specific requirements
        if (payment_type === 'nuevo_flujo' && !vertical_type) {
            res.status(400).json({ error: 'vertical_type is required for nuevo_flujo payments' });
            return;
        }
        const tokenUser = req.user;
        if (!tokenUser || !tokenUser.email) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        // Initialize repositories
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
        // 1. Validate payer user exists
        const payerUser = await userRepo.findOne({ where: { email: tokenUser.email } });
        if (!payerUser) {
            res.status(404).json({ error: 'Usuario pagador no encontrado' });
            return;
        }
        // 2. Validate recipient user exists and is verified
        const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });
        if (!recipientUser) {
            res.status(404).json({ error: 'Usuario destinatario no encontrado' });
            return;
        }
        if (recipientUser.kyc_status !== 'approved') {
            res.status(400).json({ error: 'El destinatario debe estar verificado para recibir pagos' });
            return;
        }
        // 3. Validate commission recipients (multiple brokers support)
        let commissionBeneficiaryUser = null;
        let validatedCommissionRecipients = [];
        if (commission_recipients && Array.isArray(commission_recipients) && commission_recipients.length > 0) {
            // Validate multiple commission recipients
            let totalCommissionPercentage = 0;
            for (const recipient of commission_recipients) {
                if (!recipient.broker_email || !recipient.broker_percentage) {
                    res.status(400).json({ error: 'Cada beneficiario de comisión debe tener email y porcentaje' });
                    return;
                }
                const brokerPercentage = Number(recipient.broker_percentage);
                if (brokerPercentage <= 0 || brokerPercentage > 50) {
                    res.status(400).json({ error: 'El porcentaje de comisión individual debe estar entre 0.1% y 50%' });
                    return;
                }
                totalCommissionPercentage += brokerPercentage;
                // Validate broker user exists and is verified
                const brokerUser = await userRepo.findOne({ where: { email: recipient.broker_email } });
                if (!brokerUser) {
                    res.status(404).json({ error: `Asesor ${recipient.broker_email} no encontrado` });
                    return;
                }
                if (brokerUser.kyc_status !== 'approved') {
                    res.status(400).json({ error: `El asesor ${recipient.broker_email} debe estar verificado` });
                    return;
                }
                validatedCommissionRecipients.push({
                    broker_email: recipient.broker_email,
                    broker_name: recipient.broker_name || '',
                    broker_percentage: brokerPercentage,
                    broker_amount: (Number(amount) * brokerPercentage) / 100,
                    brokerUser
                });
            }
            // Validate total commission percentage doesn't exceed 50%
            if (totalCommissionPercentage > 50) {
                res.status(400).json({ error: `El total de comisiones (${totalCommissionPercentage}%) no puede exceder 50%` });
                return;
            }
            console.log(`[Payment] Validated ${validatedCommissionRecipients.length} commission recipients, total: ${totalCommissionPercentage}%`);
        }
        else if (commission_amount > 0 && commission_beneficiary_email) {
            // Legacy single commission support
            commissionBeneficiaryUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
            if (!commissionBeneficiaryUser) {
                res.status(404).json({ error: 'Beneficiario de comisión no encontrado' });
                return;
            }
            if (commissionBeneficiaryUser.kyc_status !== 'approved') {
                res.status(400).json({ error: 'El beneficiario de comisión debe estar verificado' });
                return;
            }
        }
        // 4. Generate unique CLABE via Juno API for deposit
        let depositClabe;
        try {
            depositClabe = await (0, junoService_1.createJunoClabe)();
            console.log(`Generated CLABE: ${depositClabe} for user ${payerUser.email}`);
        }
        catch (error) {
            console.error('Error generating CLABE:', error);
            res.status(500).json({ error: 'Error al generar CLABE para depósito' });
            return;
        }
        // 5. Create Payment record
        const payment = new Payment_1.Payment();
        payment.user = payerUser;
        payment.seller = recipientUser;
        payment.recipient_email = recipient_email; // Fix: Add missing recipient_email
        payment.amount = parseFloat(amount.toString());
        payment.currency = currency;
        payment.description = description || 'Pago directo';
        payment.status = 'pending';
        payment.deposit_clabe = depositClabe;
        payment.payout_clabe = recipientUser.payout_clabe;
        payment.payout_juno_bank_account_id = recipientUser.juno_bank_account_id;
        payment.commission_amount = commission_amount ? parseFloat(commission_amount.toString()) : 0;
        payment.commission_beneficiary_email = commission_beneficiary_email || undefined;
        payment.commission_beneficiary_juno_bank_account_id = commissionBeneficiaryUser?.juno_bank_account_id || undefined;
        payment.travel_rule_data = travel_rule_data || null;
        payment.payer_email = payerUser.email;
        payment.payer_clabe = payerUser.deposit_clabe;
        payment.reference = undefined; // Will be set by automation when deposit is detected
        // Set nuevo_flujo specific fields
        payment.payment_type = payment_type;
        payment.vertical_type = vertical_type || undefined;
        payment.release_conditions = release_conditions || undefined;
        // Set product-specific fields
        payment.transaction_subtype = transaction_subtype || undefined;
        // Vehicle fields
        payment.vehicle_brand = vehicle_brand || undefined;
        payment.vehicle_model = vehicle_model || undefined;
        payment.vehicle_year = vehicle_year ? parseInt(vehicle_year.toString()) : undefined;
        payment.vehicle_vin = vehicle_vin || undefined;
        payment.vehicle_mileage = vehicle_mileage ? parseInt(vehicle_mileage.toString()) : undefined;
        payment.vehicle_condition = vehicle_condition || undefined;
        // Electronics fields
        payment.electronics_brand = electronics_brand || undefined;
        payment.electronics_model = electronics_model || undefined;
        payment.electronics_condition = electronics_condition || undefined;
        payment.electronics_warranty = electronics_warranty || undefined;
        payment.electronics_serial = electronics_serial || undefined;
        // Appliance fields
        payment.appliance_type = appliance_type || undefined;
        payment.appliance_brand = appliance_brand || undefined;
        payment.appliance_years_use = appliance_years_use ? parseInt(appliance_years_use.toString()) : undefined;
        payment.appliance_efficiency = appliance_efficiency || undefined;
        payment.appliance_condition = appliance_condition || undefined;
        payment.appliance_serial = appliance_serial || undefined;
        // Furniture fields
        payment.furniture_type = furniture_type || undefined;
        payment.furniture_material = furniture_material || undefined;
        payment.furniture_dimensions = furniture_dimensions || undefined;
        payment.furniture_condition = furniture_condition || undefined;
        // Initialize approval fields for nuevo_flujo
        if (payment_type === 'nuevo_flujo') {
            payment.payer_approval = false;
            payment.payee_approval = false;
            payment.payer_approval_timestamp = undefined;
            payment.payee_approval_timestamp = undefined;
        }
        const savedPayment = await paymentRepo.save(payment);
        // 6. Calculate custody split with vertical-specific periods
        const custodyPercent = Number(custody_percent || 100); // Default to 100%
        // Apply vertical-specific custody periods if not explicitly provided
        let finalCustodyPeriod = Number(custody_period);
        if (!custody_period && vertical_type) {
            switch (vertical_type) {
                case 'inmobiliaria':
                    finalCustodyPeriod = 30; // 30 days for real estate
                    break;
                case 'freelance':
                    finalCustodyPeriod = 7; // 7 days for freelance work
                    break;
                case 'marketplace':
                default:
                    finalCustodyPeriod = 5; // 5 days default
                    break;
            }
            console.log(`[Payment ${savedPayment.id}] Applied vertical-specific custody period: ${finalCustodyPeriod} days for ${vertical_type}`);
        }
        else {
            finalCustodyPeriod = finalCustodyPeriod || 5; // Default to 5 days
        }
        const custodyPeriod = finalCustodyPeriod;
        const paymentAmount = Number(savedPayment.amount);
        const custodyAmount = paymentAmount * (custodyPercent / 100);
        const releaseAmount = paymentAmount - custodyAmount;
        console.log(`[Payment ${savedPayment.id}] Custody calculation:`, {
            paymentAmount,
            custodyPercent,
            custodyPeriod,
            custodyAmount,
            releaseAmount
        });
        // 7. Create Escrow record (matches original implementation)
        const escrow = new Escrow_1.Escrow();
        escrow.payment = savedPayment;
        escrow.smart_contract_escrow_id = ""; // Will be set after webhook
        escrow.custody_percent = custodyPercent;
        escrow.custody_amount = Math.trunc(custodyAmount);
        escrow.release_amount = Math.trunc(releaseAmount);
        escrow.status = 'pending';
        escrow.dispute_status = 'none';
        // Save escrow first to get created_at timestamp
        const savedEscrow = await escrowRepo.save(escrow);
        // Now set custody_end based on the actual created_at time (convert days to milliseconds)
        savedEscrow.custody_end = new Date(savedEscrow.created_at.getTime() + custodyPeriod * 24 * 60 * 60 * 1000);
        await escrowRepo.save(savedEscrow);
        // Calculate custody days for frontend display (already in days)
        const custodyDays = custodyPeriod;
        console.log(`[Payment ${savedPayment.id}] Custody days: ${custodyDays} days`);
        console.log(`[Payment ${savedPayment.id}] Escrow saved:`, {
            id: savedEscrow.id,
            custody_amount: savedEscrow.custody_amount,
            release_amount: savedEscrow.release_amount,
            custody_percent: savedEscrow.custody_percent,
            custody_end: savedEscrow.custody_end,
            status: savedEscrow.status
        });
        // Link the escrow to the payment and save
        savedPayment.escrow = savedEscrow;
        await paymentRepo.save(savedPayment);
        console.log(`[Payment ${savedPayment.id}] Payment updated with escrow_id: ${savedEscrow.id}`);
        // 7.5. Create CommissionRecipient records for multiple brokers
        const commissionRecipientRepo = ormconfig_1.default.getRepository(CommissionRecipient_1.CommissionRecipient);
        const createdCommissionRecipients = [];
        if (validatedCommissionRecipients.length > 0) {
            for (const recipient of validatedCommissionRecipients) {
                const commissionRecipient = new CommissionRecipient_1.CommissionRecipient();
                commissionRecipient.payment_id = savedPayment.id;
                commissionRecipient.broker_email = recipient.broker_email;
                commissionRecipient.broker_name = recipient.broker_name;
                commissionRecipient.broker_percentage = recipient.broker_percentage;
                commissionRecipient.broker_amount = recipient.broker_amount;
                commissionRecipient.paid = false;
                const savedCommissionRecipient = await commissionRecipientRepo.save(commissionRecipient);
                createdCommissionRecipients.push(savedCommissionRecipient);
                console.log(`[Payment ${savedPayment.id}] Created commission recipient: ${recipient.broker_email} (${recipient.broker_percentage}% = ${recipient.broker_amount} MXN)`);
            }
            console.log(`[Payment ${savedPayment.id}] Created ${createdCommissionRecipients.length} commission recipients`);
        }
        // 8. Log payment event (NO blockchain event yet - only after deposit is received)
        await createPaymentEvent(savedPayment, 'payment_created', `Pago directo iniciado por ${payerUser.email} a ${recipientUser.email}`);
        // Only log escrow creation, NOT blockchain custody (that happens after deposit)
        // 9. Create notifications
        await createPaymentNotifications(savedPayment.id, 'payment_created');
        // 10. Send notification to recipient
        await (0, notificationService_1.createNotification)(recipientUser.id, 'Nuevo pago recibido', `Has recibido un pago de ${savedPayment.amount} MXN de ${payerUser.full_name || payerUser.email}`, 'success', savedPayment.id, 'payment');
        // 10.5. Create in-app notifications
        try {
            const { createPaymentNotifications } = await Promise.resolve().then(() => __importStar(require('../services/paymentNotificationIntegration')));
            await createPaymentNotifications(savedPayment.id, 'payment_created');
        }
        catch (error) {
            console.error('Error creating in-app notifications:', error);
        }
        // 10.6. Send email notifications
        try {
            const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
            const recipients = [
                { email: payerUser.email, role: 'buyer', name: payerUser.full_name || 'Comprador' },
                { email: recipientUser.email, role: 'seller', name: recipientUser.full_name || 'Rodrigo' }
            ];
            // Add commission recipients if they exist
            if (createdCommissionRecipients.length > 0) {
                createdCommissionRecipients.forEach(cr => {
                    recipients.push({ email: cr.broker_email, role: 'broker', name: cr.broker_name || 'Asesor' });
                });
            }
            await sendPaymentEventNotification({
                eventType: 'payment_created',
                paymentId: savedPayment.id.toString(),
                paymentDetails: savedPayment,
                recipients,
                commissionBeneficiaryEmail: createdCommissionRecipients[0]?.broker_email
            });
        }
        catch (error) {
            console.error('Error sending email notifications:', error);
        }
        // 11. Return success response with payment details (avoid circular references)
        const paymentResponse = {
            id: savedPayment.id,
            recipient_email: savedPayment.recipient_email,
            payer_email: savedPayment.payer_email,
            amount: savedPayment.amount,
            currency: savedPayment.currency,
            description: savedPayment.description,
            reference: savedPayment.reference,
            deposit_clabe: savedPayment.deposit_clabe,
            payout_clabe: savedPayment.payout_clabe,
            status: savedPayment.status,
            payment_type: savedPayment.payment_type,
            vertical_type: savedPayment.vertical_type,
            release_conditions: savedPayment.release_conditions,
            payer_approval: savedPayment.payer_approval,
            payee_approval: savedPayment.payee_approval,
            created_at: savedPayment.created_at,
            escrow_id: savedEscrow.id // Include escrow_id to confirm linkage
        };
        const escrowResponse = {
            id: savedEscrow.id,
            custody_percent: savedEscrow.custody_percent,
            custody_amount: savedEscrow.custody_amount,
            release_amount: savedEscrow.release_amount,
            status: savedEscrow.status,
            dispute_status: savedEscrow.dispute_status,
            custody_end: savedEscrow.custody_end,
            created_at: savedEscrow.created_at,
            payment_id: savedPayment.id // Include payment_id to confirm linkage
        };
        res.json({
            success: true,
            payment: paymentResponse,
            escrow: escrowResponse,
            commission_recipients: createdCommissionRecipients.map(cr => ({
                id: cr.id,
                broker_email: cr.broker_email,
                broker_name: cr.broker_name,
                broker_percentage: cr.broker_percentage,
                broker_amount: cr.broker_amount,
                paid: cr.paid
            }))
        });
    }
    catch (error) {
        console.error('Error in initiatePayment:', error);
        res.status(500).json({
            error: 'Error interno del servidor al iniciar pago',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.initiatePayment = initiatePayment;
