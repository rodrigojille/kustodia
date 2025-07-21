"use strict";
// paymentControllerV2.ts
// Version 2: Handles Flow 2.0 wallet-based payment flow with payment tracker integration
Object.defineProperty(exports, "__esModule", { value: true });
exports.flow2v2Notify = void 0;
const typeorm_1 = require("typeorm");
const Payment_1 = require("../entity/Payment");
const escrowService_1 = require("../services/escrowService"); // fundEscrow removed because it is not exported
// POST /api/payments/flow2v2-notify
const flow2v2Notify = async (req, res) => {
    try {
        const { recipient_email, amount, custody_percent, custody_days, description, tx_hash_direct, tx_hash_custody } = req.body;
        // 1. Create payment record
        const paymentRepo = (0, typeorm_1.getRepository)(Payment_1.Payment);
        // Only use properties defined in Payment entity
        const payment = paymentRepo.create({
            amount,
            status: "pending",
            description
            // Add other valid Payment entity properties as needed
        });
        await paymentRepo.save(payment);
        // 2. Wait for custody payment confirmation (optional: poll or webhook)
        // 3. Create and fund escrow on-chain
        const custodyAmountStr = (amount * (custody_percent / 100)).toString();
        const custodyDays = Number(custody_days || 1);
        const deadline = Math.floor(Date.now() / 1000) + custodyDays * 86400;
        // Updated for KustodiaEscrow2_0 API
        const escrow = await (0, escrowService_1.createEscrow)({
            payer: process.env.ESCROW_BRIDGE_WALLET, // Bridge wallet acts as payer
            payee: req.body.recipient_wallet || '', // Recipient wallet as payee
            token: process.env.MOCK_ERC20_ADDRESS, // MXNB token address
            amount: custodyAmountStr, // Custody amount
            deadline: deadline, // Unix timestamp for deadline
            vertical: 'flow2v2', // Business vertical
            clabe: '', // No CLABE for wallet-based flow
            conditions: `Flow2v2 payment custody for ${custody_days} days` // Escrow conditions
        });
        // await fundEscrow(escrow.escrowId); // Removed because fundEscrow is not exported
        // 4. Update payment and escrow status
        payment.status = "funded";
        await paymentRepo.save(payment);
        // 5. Generate tracker URL (if you have a tracker UI)
        const trackerUrl = `/payments/tracker/${payment.id}`;
        res.json({ success: true, tracker_url: trackerUrl });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.flow2v2Notify = flow2v2Notify;
