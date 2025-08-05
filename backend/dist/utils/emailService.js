"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendKYCStatusEmail = sendKYCStatusEmail;
exports.sendEmail = sendEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const emailTemplates_1 = require("./emailTemplates");
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
// Only set API key if it exists and is not placeholder
if (SENDGRID_API_KEY && !SENDGRID_API_KEY.includes('your-sendgrid-api-key-here')) {
    mail_1.default.setApiKey(SENDGRID_API_KEY);
}
else {
    console.warn('[EMAIL] SendGrid API key not configured - emails will be logged instead of sent');
}
async function sendWelcomeEmail(to, userName, accessCode) {
    return sendEmail({
        to,
        subject: "🎉 ¡Bienvenido a Kustodia!",
        html: (0, emailTemplates_1.createWelcomeTemplate)(userName, accessCode)
    });
}
async function sendKYCStatusEmail(to, status, userName, reason) {
    return sendEmail({
        to,
        subject: 'Actualización de tu verificación KYC',
        html: (0, emailTemplates_1.createKYCStatusTemplate)(status, userName, reason)
    });
}
async function sendEmail({ to, subject, html, text }) {
    // Fallback: If only HTML is provided, generate a plain text version by stripping tags
    let finalText = text;
    if (!finalText && html) {
        finalText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    }
    if (!(html && html.trim()) && !(finalText && finalText.trim())) {
        throw new Error('sendEmail: Either html or text content must be provided and non-empty.');
    }
    const msg = {
        to,
        from: EMAIL_FROM,
        subject,
        text: finalText,
        html: html,
    };
    await mail_1.default.send(msg);
}
