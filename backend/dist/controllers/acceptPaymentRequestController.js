"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptPaymentRequest = exports.rejectPaymentRequest = exports.createEscrowForPayment = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const PaymentEvent_1 = require("../entity/PaymentEvent");
// Accept and process a payment request by ID (payer must be authenticated)
/**
 * Accepts a payment request as the designated payer, triggers escrow/payment logic,
 * updates status and timeline, and sends notifications. Ensures full traceability.
 *
 * @route POST /api/request-payments/:id/accept
 * @access Authenticated (payer only)
 */
const createEscrowForPayment = async (payment) => {
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    // Se espera que payment tenga custody_percent y custody_period definidos
    const custodyPercent = Number(payment.custody_percent || 100); // fallback a 100 si no existe
    const custodyPeriod = Number(payment.custody_period || 1); // fallback a 1 día si no existe
    const custodyAmount = Number(payment.amount) * (custodyPercent / 100);
    const releaseAmount = Number(payment.amount) - custodyAmount;
    const escrow = escrowRepo.create({
        payment: payment,
        smart_contract_escrow_id: "", // Se setea después en el webhook
        custody_percent: custodyPercent,
        custody_amount: Math.trunc(custodyAmount),
        release_amount: Math.trunc(releaseAmount),
        status: "pending",
        dispute_status: "none",
        custody_end: new Date(Date.now() + custodyPeriod * 24 * 60 * 60 * 1000)
    });
    await escrowRepo.save(escrow);
    return escrow;
};
exports.createEscrowForPayment = createEscrowForPayment;
const rejectPaymentRequest = async (req, res) => {
    try {
        const paymentId = parseInt(req.params.id, 10);
        if (!paymentId) {
            res.status(400).json({ error: 'Invalid payment request ID' });
            return;
        }
        const tokenUser = req.user;
        if (!tokenUser || !tokenUser.email) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
        const payment = await paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment) {
            res.status(404).json({ error: 'Payment request not found' });
            return;
        }
        if (payment.status !== 'requested') {
            res.status(400).json({ error: 'Payment request is not pending/available' });
            return;
        }
        if (payment.payer_email !== tokenUser.email) {
            res.status(403).json({ error: 'Only the designated payer can reject this request' });
            return;
        }
        payment.status = 'rejected';
        await paymentRepo.save(payment);
        // Evento de timeline: solicitud rechazada
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: 'request_rejected',
            description: 'Solicitud de cobro rechazada'
        }));
        res.json({ success: true, payment });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al rechazar la solicitud de pago', details: err instanceof Error ? err.message : err });
    }
};
exports.rejectPaymentRequest = rejectPaymentRequest;
const acceptPaymentRequest = async (req, res) => {
    try {
        const paymentId = parseInt(req.params.id, 10);
        if (!paymentId) {
            res.status(400).json({ error: 'Invalid payment request ID' });
            return;
        }
        const tokenUser = req.user;
        if (!tokenUser || !tokenUser.email) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
        const payment = await paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment) {
            res.status(404).json({ error: 'Payment request not found' });
            return;
        }
        if (payment.status !== 'requested') {
            res.status(400).json({ error: 'Payment request is not pending/available' });
            return;
        }
        if (payment.payer_email !== tokenUser.email) {
            res.status(403).json({ error: 'Only the designated payer can accept this request' });
            return;
        }
        // --- Crear escrow simétrico a initiatePayment ---
        // Buscar y guardar la CLABE del pagador
        const userRepo = ormconfig_1.default.getRepository('User');
        const payerUser = await userRepo.findOne({ where: { email: tokenUser.email } });
        if (payerUser && payerUser.deposit_clabe) {
            payment.payer_clabe = payerUser.deposit_clabe;
        }
        const escrow = await (0, exports.createEscrowForPayment)(payment);
        payment.status = 'pending';
        payment.escrow = escrow;
        await paymentRepo.save(payment);
        // Evento de timeline: solicitud aceptada
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: 'request_accepted',
            description: 'Solicitud de cobro aceptada'
        }));
        // Evento de timeline: custodia creada
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: 'escrow_created',
            description: '🔒 Custodia creada'
        }));
        res.json({ success: true, payment, escrow });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al aceptar la solicitud de pago', details: err instanceof Error ? err.message : err });
    }
};
exports.acceptPaymentRequest = acceptPaymentRequest;
