"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentHMAC = generatePaymentHMAC;
exports.verifyPaymentHMAC = verifyPaymentHMAC;
const crypto_1 = __importDefault(require("crypto"));
const SECRET = process.env.RECEIPT_HMAC_SECRET || 'kustodia_secret_dev';
function generatePaymentHMAC(payment) {
    // Canonical string (order matters)
    const data = `${payment.id}|${payment.amount}|${payment.currency}|${payment.payer_email}|${payment.recipient_email}|${new Date(payment.created_at).toISOString()}`;
    return crypto_1.default.createHmac('sha256', SECRET).update(data).digest('hex');
}
function verifyPaymentHMAC(payment, hmac) {
    return generatePaymentHMAC(payment) === hmac;
}
