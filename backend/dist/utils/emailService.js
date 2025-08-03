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
async function sendKYCStatusEmail(to, status, reason) {
    let subject = 'Actualización de tu verificación KYC';
    let html = `<div style='font-family:Montserrat,Arial,sans-serif;background:#f6f8fc;padding:2rem;'>
    <img src='https://kustodia.mx/kustodia-logo.png' alt='Kustodia Logo' width='56' height='56' style='display:block;margin-bottom:1rem;'>`;
    if (status === 'approved') {
        html += `<h2 style='color:#27ae60;'>¡Verificación KYC aprobada!</h2>
      <p>Tu identidad ha sido verificada exitosamente. Ya puedes operar sin restricciones en Kustodia.</p>`;
    }
    else if (status === 'rejected') {
        html += `<h2 style='color:#c0392b;'>Verificación KYC rechazada</h2>
      <p>Lamentablemente, tu verificación fue rechazada.${reason ? `<br>Motivo: <b>${reason}</b>` : ''}</p>
      <p>Por favor revisa tus documentos y vuelve a intentarlo.</p>`;
    }
    else {
        html += `<h2 style='color:#2e7ef7;'>Verificación KYC en proceso</h2>
      <p>Estamos revisando tu información. Te avisaremos cuando el proceso finalice.</p>`;
    }
    html += `<br><p style='font-size:13px;color:#999;'>Equipo Kustodia</p></div>`;
    return sendEmail({ to, subject, html });
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
