"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPayments = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const getAllPayments = async (req, res) => {
    try {
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        // Get all payments with user relationships for proper payer/seller display
        const payments = await paymentRepo.find({
            relations: ['user', 'seller'],
            order: {
                created_at: 'DESC'
            }
        });
        // Transform the data to include all needed fields for the frontend
        const transformedPayments = payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            created_at: payment.created_at,
            recipient_email: payment.recipient_email,
            payer_email: payment.user?.email || payment.payer_email || null,
            description: payment.description || null,
            payment_type: payment.payment_type || 'traditional'
        }));
        res.json(transformedPayments);
    }
    catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({
            error: 'Failed to fetch payments',
            message: error.message
        });
    }
};
exports.getAllPayments = getAllPayments;
