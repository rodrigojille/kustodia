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
const escrowService_1 = require("../services/escrowService");
const initiatePayment = async (req, res) => {
    try {
        const { user_id, recipient_email, amount, currency, description, custody_percent, custody_period } = req.body;
        // Basic validation
        if (!user_id || !recipient_email || !amount || !currency || !custody_percent || !custody_period) {
            res.status(400).json({ error: "Missing required fields." });
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
        // Create Payment record
        const payment = paymentRepo.create({
            user,
            recipient_email,
            amount,
            currency,
            description,
            status: "pending"
        });
        await paymentRepo.save(payment);
        // Create escrow on-chain
        // For demo: assume buyer's wallet is the hardhat default
        const totalAmount = amount.toString();
        const custodyPercent = Number(custody_percent);
        const custodyPeriod = Number(custody_period); // seconds or days, as per contract
        // For demo, you might want to pass the recipient's wallet address here
        const sellerWallet = user.wallet_address || "0x000000000000000000000000000000000000dead";
        const escrowId = await (0, escrowService_1.createEscrow)({
            seller: sellerWallet,
            totalAmount,
            custodyPercent,
            custodyPeriod
        });
        // Create Escrow DB record
        const custodyAmount = Number(amount) * (custodyPercent / 100);
        const releaseAmount = Number(amount) - custodyAmount;
        const escrow = escrowRepo.create({
            payment,
            smart_contract_escrow_id: escrowId,
            custody_percent: custodyPercent,
            custody_amount: custodyAmount,
            release_amount: releaseAmount,
            status: "active",
            dispute_status: "none",
            custody_end: new Date(Date.now() + custodyPeriod * 1000)
        });
        await escrowRepo.save(escrow);
        payment.status = "pending";
        payment.escrow = escrow;
        await paymentRepo.save(payment);
        res.json({ success: true, payment, escrow });
        return;
    }
    catch (err) {
        console.error("Payment initiation failed:", err);
        res.status(500).json({ error: "Payment initiation failed", details: err instanceof Error ? err.message : err });
        return;
    }
};
exports.initiatePayment = initiatePayment;
const emailService_1 = require("../utils/emailService");
const erc20Service_1 = require("../services/erc20Service");
const junoService_1 = require("../services/junoService");
const junoWebhook = async (req, res) => {
    try {
        const { transaction_id, amount, sender_clabe, status } = req.body;
        if (!transaction_id || !amount) {
            res.status(400).json({ error: 'Missing transaction_id or amount' });
            return;
        }
        // Find a pending payment with matching recipient_email and sender_clabe
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payment = await paymentRepo.findOne({
            where: {
                recipient_email: 'test-seller@kustodia.mx',
                status: 'pending',
                amount,
            },
            relations: ['user']
        });
        if (!payment) {
            res.status(404).json({ error: 'No matching pending payment found' });
            return;
        }
        // Optionally, you could also check sender_clabe if you store it in the DB
        // For now, we're matching by recipient_email and amount for demo
        // For production, add sender_clabe to Payment and match it as well.
        // --- ENHANCED LOGIC BELOW ---
        // Fetch associated escrow
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        const escrow = await escrowRepo.findOne({ where: { payment: { id: payment.id } } });
        if (!escrow) {
            res.status(404).json({ error: 'Escrow record not found for payment' });
            return;
        }
        // Assume recipient CLABE is available on payment or user
        const recipientClabe = payment.user.clabe || null;
        // 1. Release amount: send via Juno/Bisto
        if (escrow.release_amount > 0 && recipientClabe) {
            try {
                await (0, junoService_1.sendJunoPayment)(recipientClabe, Number(escrow.release_amount), 'Pago liberado (no custodia)');
                console.log(`[JUNO] Sent release amount ${escrow.release_amount} to ${recipientClabe}`);
            }
            catch (err) {
                console.error('Error sending Juno release payment:', err);
            }
        }
        // 2. Custody amount: lock in smart contract (mint to escrow wallet)
        if (escrow.custody_amount > 0) {
            try {
                // For demo, use payment.user.wallet_address or a fallback
                const escrowWallet = payment.user.wallet_address || '0x000000000000000000000000000000000000dead';
                const custodyAmountWei = (Number(escrow.custody_amount) * 1e18).toString();
                const txHash = await (0, erc20Service_1.mintToEscrow)(escrowWallet, custodyAmountWei);
                escrow.smart_contract_escrow_id = txHash;
                await escrowRepo.save(escrow);
                console.log(`[ERC20] Minted custody amount ${escrow.custody_amount} to ${escrowWallet} (tx: ${txHash})`);
            }
            catch (err) {
                console.error('Error minting custody amount to escrow:', err);
            }
        }
        // Update payment status and transaction_id
        payment.status = 'funded';
        payment.transaction_id = transaction_id;
        await paymentRepo.save(payment);
        // Send notification emails to buyer and seller
        try {
            await (0, emailService_1.sendEmail)({
                to: payment.user.email,
                subject: 'Pago recibido en Kustodia',
                html: `<p>Tu pago de $${amount} ha sido recibido y está en proceso.</p>`
            });
            await (0, emailService_1.sendEmail)({
                to: payment.recipient_email,
                subject: 'Has recibido un pago en Kustodia',
                html: `<p>Has recibido un pago de $${amount}. Puedes rastrear el estado en tu panel.</p>`
            });
        }
        catch (emailErr) {
            // Log but do not fail webhook
            console.error('Email notification failed:', emailErr);
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Juno webhook error:', err);
        res.status(500).json({ error: 'Webhook processing failed', details: err instanceof Error ? err.message : err });
    }
};
exports.junoWebhook = junoWebhook;
