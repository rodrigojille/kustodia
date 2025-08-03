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
        subject: "🎉 ¡Bienvenido a Kustodia!",
        html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a Kustodia!</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #2e7ef7 0%, #1d4ed8 100%);padding:40px 24px;text-align:center;">
          <img src="https://kustodia.mx/kustodia-logo-white.png" alt="Kustodia" style="height:50px;margin-bottom:20px;" />
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">🎉 ¡Bienvenido a Kustodia!</h1>
          <p style="color:#e0f2fe;margin:12px 0 0 0;font-size:16px;">El futuro de los pagos seguros</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding:40px 24px;">
          <!-- Greeting -->
          <div style="text-align:center;margin-bottom:32px;">
            <h2 style="color:#111827;margin:0 0 16px 0;font-size:24px;font-weight:600;">¡Hola${userName ? ` ${userName}` : ''}! 👋</h2>
            <p style="font-size:16px;color:#374151;margin:0;line-height:1.6;">¡Gracias por tu interés en Kustodia! Hemos recibido correctamente tu registro para <strong>Early Access</strong>.</p>
            <p style="font-size:16px;color:#374151;margin:16px 0 0 0;line-height:1.6;">Pronto recibirás novedades sobre el acceso y nuevas funcionalidades.</p>
          </div>
          
          ${accessCode ? `
          <!-- Access Code Card -->
          <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:2px solid #2e7ef7;border-radius:16px;padding:24px;margin:32px 0;text-align:center;">
            <div style="font-size:18px;font-weight:600;color:#1e40af;margin-bottom:12px;">🔑 Código de Acceso Anticipado</div>
            <div style="font-family:monospace;color:#2e7ef7;font-size:24px;font-weight:700;background-color:#ffffff;padding:16px;border-radius:8px;letter-spacing:2px;border:1px solid #e5e7eb;">${accessCode}</div>
            <p style="font-size:14px;color:#6b7280;margin:12px 0 0 0;">⚠️ Guarda este código, lo necesitarás para acceder a la plataforma</p>
          </div>
          ` : ''}
          
          <!-- Special Offer -->
          <div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border:2px solid #f59e0b;border-radius:16px;padding:24px;margin:32px 0;text-align:center;">
            <div style="font-size:20px;margin-bottom:8px;">🎊</div>
            <h3 style="color:#92400e;margin:0 0 8px 0;font-size:18px;font-weight:700;">¡Felicidades!</h3>
            <p style="color:#92400e;margin:0;font-size:16px;font-weight:600;">Tienes <strong>0% fee de por vida</strong> por ser de los primeros 100 registros</p>
          </div>
          
          <!-- Features Section -->
          <div style="margin:40px 0;">
            <h3 style="color:#111827;text-align:center;margin:0 0 24px 0;font-size:20px;font-weight:600;">¿Por qué Kustodia? 🚀</h3>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;">
              <div style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:24px;margin-bottom:8px;">🔍</div>
                <div style="font-weight:600;color:#2e7ef7;font-size:16px;margin-bottom:8px;">Transparencia</div>
                <div style="font-size:14px;color:#6b7280;line-height:1.4;">Verifica la existencia y respaldo de MXNB en tiempo real</div>
              </div>
              
              <div style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:24px;margin-bottom:8px;">⚙️</div>
                <div style="font-weight:600;color:#2e7ef7;font-size:16px;margin-bottom:8px;">Automatización</div>
                <div style="font-size:14px;color:#6b7280;line-height:1.4;">Pagos solo se liberan al cumplir condiciones pactadas</div>
              </div>
              
              <div style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:24px;margin-bottom:8px;">🛡️</div>
                <div style="font-weight:600;color:#2e7ef7;font-size:16px;margin-bottom:8px;">Seguridad</div>
                <div style="font-size:14px;color:#6b7280;line-height:1.4;">Fondos protegidos y custodiados con tecnología blockchain</div>
              </div>
            </div>
          </div>
          
          <!-- CTA Section -->
          <div style="text-align:center;margin:40px 0;">
            <a href="https://kustodia.mx" target="_blank" style="display:inline-block;background-color:#2e7ef7;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;margin:8px;transition:background-color 0.2s;">🌐 Visitar Kustodia.mx</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f8fafc;padding:32px 24px;text-align:center;border-top:1px solid #e5e7eb;">
          <div style="margin-bottom:20px;">
            <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia" style="height:28px;opacity:0.7;" />
          </div>
          
          <p style="font-size:16px;color:#374151;margin:0 0 16px 0;font-weight:600;">Síguenos en redes sociales 📱</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px 0;">Mantente al tanto de las últimas novedades</p>
          
          <!-- Social Links -->
          <div style="margin-bottom:20px;">
            <a href="https://x.com/Kustodia_mx" style="display:inline-block;background-color:#1da1f2;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;margin:4px 8px;">🐦 Twitter</a>
            <a href="https://www.instagram.com/kustodia.mx/" style="display:inline-block;background-color:#e1306c;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;margin:4px 8px;">📸 Instagram</a>
            <a href="https://www.linkedin.com/company/kustodia-mx" style="display:inline-block;background-color:#0077b5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;margin:4px 8px;">💼 LinkedIn</a>
          </div>
          
          <p style="font-size:12px;color:#9ca3af;margin:0;">Pagos seguros y automatizados con tecnología blockchain</p>
          <p style="font-size:12px;color:#9ca3af;margin:8px 0 0 0;">© 2024 Kustodia. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
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
