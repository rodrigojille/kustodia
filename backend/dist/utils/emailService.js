"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendKYCStatusEmail = sendKYCStatusEmail;
exports.sendEmail = sendEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
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
        subject: "¡Bienvenido a Kustodia!",
        html: `
      <div style="font-family:Montserrat,Arial,sans-serif;background:#fff;padding:2rem;max-width:420px;margin:2rem auto;border-radius:16px;box-shadow:0 2px 12px #0001;">
        <div style="text-align:center;">
          <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia Logo" width="72" height="72" style="display:block;margin:0 auto 1rem auto;">
        </div>
        <h2 style="color:#2e7ef7;text-align:center;margin-top:0;">¡Hola${userName ? ` ${userName}` : ''}!</h2>
        <p style="text-align:center;">¡Gracias por tu interés en Kustodia! Hemos recibido correctamente tu registro para Early Access.<br>Pronto recibirás novedades sobre el acceso y nuevas funcionalidades.</p>
        ${accessCode ? `<div style="background:#f6f8fc;padding:1rem;border-radius:8px;margin:1.5rem 0;text-align:center;">
          <div style="font-weight:bold;color:#222;">Código de Acceso Anticipado:</div>
          <div style="font-family:monospace;color:#2e7ef7;font-size:1.1rem;margin-top:4px;">${accessCode}</div>
        </div>` : ''}
        <p style="text-align:center;"><b>¡Felicidades!</b> Tienes 0% fee de por vida por ser de los primeros 100 registros.<br><span style="font-size:13px;color:#666;">Guarda este código, lo necesitarás para acceder a la plataforma cuando se cierre la página de Early Access.</span></p>
        <div style="margin:1.5rem 0;text-align:center;">
          <span style="color:#222;">¿Por qué Kustodia?</span>
          <div style="display:flex;justify-content:center;gap:16px;margin-top:10px;">
            <div style="min-width:90px;padding:10px 0;">
              <div style="font-weight:bold;color:#2e7ef7;">Transparencia</div>
              <div style="font-size:12px;color:#333;">Verifica la existencia y respaldo de MXNB.</div>
            </div>
            <div style="min-width:90px;padding:10px 0;">
              <div style="font-weight:bold;color:#2e7ef7;">Automatización</div>
              <div style="font-size:12px;color:#333;">Pagos solo se liberan al cumplir condiciones pactadas.</div>
            </div>
            <div style="min-width:90px;padding:10px 0;">
              <div style="font-weight:bold;color:#2e7ef7;">Seguridad</div>
              <div style="font-size:12px;color:#333;">Fondos protegidos y custodiados.</div>
            </div>
          </div>
        </div>
        <div style="margin:1.5rem 0;text-align:center;">
          <span style="color:#222;">Síguenos en redes sociales para estar al tanto de las novedades:</span><br>
          <a href="https://x.com/Kustodia_mx" style="color:#1da1f2;text-decoration:none;font-weight:bold;margin:0 6px;">X (antes Twitter)</a>
          <a href="https://www.instagram.com/kustodia.mx/" style="color:#e1306c;text-decoration:none;font-weight:bold;margin:0 6px;">Instagram</a>
          <a href="https://www.linkedin.com/company/kustodia-mx" style="color:#0077b5;text-decoration:none;font-weight:bold;margin:0 6px;">LinkedIn</a>
        </div>
        <p style="font-size:13px;color:#999;text-align:center;">Equipo Kustodia</p>
      </div>
    `
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
