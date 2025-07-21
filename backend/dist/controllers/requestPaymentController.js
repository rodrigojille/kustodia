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
exports.requestPayment = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const requestPayment = async (req, res) => {
    try {
        const { payer_email, amount, currency = 'MXN', description, commission_percent, commission_amount, commission_beneficiary_name, commission_beneficiary_email } = req.body;
        // The requesting user is the recipient (payee)
        const tokenUser = req.user;
        if (!tokenUser || !tokenUser.email) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        if (!payer_email || !amount) {
            res.status(400).json({ error: 'Faltan datos obligatorios.' });
            return;
        }
        // Validate payer
        const userRepo = ormconfig_1.default.getRepository('User');
        const payer = await userRepo.findOne({ where: { email: payer_email } });
        if (!payer || !payer.email_verified) {
            res.status(400).json({ error: 'El pagador no es un usuario verificado de Kustodia.' });
            return;
        }
        // Validate commission beneficiary if provided
        if (commission_beneficiary_email) {
            const commissioner = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
            if (!commissioner || !commissioner.email_verified) {
                res.status(400).json({ error: 'El beneficiario de la comisión no es un usuario verificado de Kustodia.' });
                return;
            }
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        let beneficiaryClabe = undefined;
        if (commission_beneficiary_email) {
            const beneficiaryUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
            if (!beneficiaryUser || !beneficiaryUser.payout_clabe) {
                res.status(400).json({ error: 'El beneficiario de comisión debe estar registrado y tener CLABE de retiro' });
                return;
            }
            beneficiaryClabe = beneficiaryUser.payout_clabe;
        }
        const payment = paymentRepo.create({
            recipient_email: tokenUser.email,
            payer_email, // <--- ensure payer_email is saved
            amount,
            currency,
            description,
            commission_percent,
            commission_amount,
            commission_beneficiary_name,
            commission_beneficiary_email,
            commission_beneficiary_clabe: beneficiaryClabe,
            status: 'requested'
        });
        await paymentRepo.save(payment);
        // Create in-app notifications
        try {
            const { createPaymentNotifications } = await Promise.resolve().then(() => __importStar(require('../services/paymentNotificationIntegration')));
            await createPaymentNotifications(payment.id, 'payment_created');
        }
        catch (error) {
            console.error('Error creating in-app notifications:', error);
        }
        // Notificación por email a pagador, vendedor y beneficiario de comisión (si existe)
        const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
        const recipients = [
            { email: payer_email, role: 'payer' },
            { email: tokenUser.email, role: 'seller' }
        ];
        await sendPaymentEventNotification({
            eventType: 'payment_created',
            paymentId: payment.id.toString(),
            paymentDetails: payment,
            recipients,
            commissionBeneficiaryEmail: commission_beneficiary_email || undefined
        });
        res.json({ success: true, payment });
    }
    catch (err) {
        res.status(500).json({ error: 'Error al solicitar pago', details: err instanceof Error ? err.message : err });
    }
};
exports.requestPayment = requestPayment;
