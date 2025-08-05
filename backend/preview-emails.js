/**
 * Email Preview Tool
 * Generates HTML files to preview email templates in browser
 */

const fs = require('fs');
const path = require('path');

// Import the email templates (we'll need to compile TypeScript or use a simple version)
// For now, let's create a simplified version to preview

const createEmailTemplate = (options) => {
  const {
    greeting = 'Hola',
    title,
    subtitle,
    mainMessage,
    actionButton,
    additionalContent = '',
    footerMessage,
    includeFeatures = false
  } = options;

  const actionButtonSection = actionButton ? `
    <div style="text-align:center;margin:32px 0;">
      <a href="${actionButton.url}" style="display:inline-block;background-color:${actionButton.color};color:#ffffff;padding:16px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">${actionButton.text}</a>
    </div>
  ` : '';

  const featuresSection = includeFeatures ? `
    <!-- Features Section -->
    <div style="margin:40px 0;">
      <h3 style="color:#111827;text-align:center;margin:0 0 24px 0;font-size:20px;font-weight:600;">¿Por qué Kustodia? 🚀</h3>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;">
        <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:32px;margin-bottom:12px;">🔒</div>
          <h4 style="color:#111827;margin:0 0 8px 0;font-size:16px;font-weight:600;">Seguridad Total</h4>
          <p style="color:#6b7280;margin:0;font-size:14px;">Custodia institucional y tecnología blockchain</p>
        </div>
        
        <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:32px;margin-bottom:12px;">⚡</div>
          <h4 style="color:#111827;margin:0 0 8px 0;font-size:16px;font-weight:600;">Transferencias Rápidas</h4>
          <p style="color:#6b7280;margin:0;font-size:14px;">Envíos instantáneos 24/7</p>
        </div>
        
        <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:32px;margin-bottom:12px;">💰</div>
          <h4 style="color:#111827;margin:0 0 8px 0;font-size:16px;font-weight:600;">Rendimientos</h4>
          <p style="color:#6b7280;margin:0;font-size:14px;">Genera ingresos pasivos con DeFi</p>
        </div>
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0;padding:0;background-color:#f6f8fc;font-family:'Montserrat',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #2e7ef7 0%, #1d4ed8 100%);padding:32px 24px;text-align:center;">
          <div style="margin-bottom:16px;">
            <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia" style="height:40px;" />
          </div>
          <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">${title}</h1>
          ${subtitle ? `<p style="color:#bfdbfe;margin:8px 0 0 0;font-size:16px;">${subtitle}</p>` : ''}
        </div>
        
        <!-- Content -->
        <div style="padding:32px 24px;">
          <!-- Greeting -->
          <p style="font-size:16px;color:#374151;margin:0 0 24px 0;line-height:1.6;">${greeting},</p>
          
          <!-- Main Message -->
          <div style="background-color:#f8fafc;border-left:4px solid #2e7ef7;padding:20px;margin:24px 0;border-radius:0 8px 8px 0;">
            <p style="font-size:16px;color:#374151;margin:0;line-height:1.6;">${mainMessage}</p>
          </div>
          
          ${actionButtonSection}
          ${additionalContent}
          ${featuresSection}
          
          <!-- Footer Message -->
          ${footerMessage ? `
            <div style="background-color:#f8fafc;border-radius:8px;padding:16px;margin:32px 0;text-align:center;">
              <p style="font-size:14px;color:#6b7280;margin:0;">${footerMessage}</p>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f8fafc;padding:32px 24px;text-align:center;border-top:1px solid #e5e7eb;">
          <div style="margin-bottom:20px;">
            <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia" style="height:28px;opacity:0.7;" />
          </div>
          
          <p style="font-size:16px;color:#374151;margin:0 0 16px 0;font-weight:600;">Síguenos en redes sociales 📱</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px 0;">Mantente al tanto de las últimas novedades</p>
          
          <!-- Social Links -->
          <div style="margin:20px 0;">
            <a href="https://twitter.com/kustodia_mx" target="_blank" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <div style="width:40px;height:40px;background-color:#1da1f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#ffffff;font-size:18px;">𝕏</span>
              </div>
            </a>
            <a href="https://linkedin.com/company/kustodia" target="_blank" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <div style="width:40px;height:40px;background-color:#0077b5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#ffffff;font-size:18px;">💼</span>
              </div>
            </a>
          </div>
          
          <!-- Legal Footer -->
          <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:20px;">
            <p style="font-size:12px;color:#9ca3af;margin:0 0 8px 0;">© 2025 Kustodia. Todos los derechos reservados.</p>
            <p style="font-size:12px;color:#9ca3af;margin:0;">
              <a href="https://kustodia.mx/privacidad" style="color:#9ca3af;text-decoration:none;">Política de Privacidad</a> | 
              <a href="https://kustodia.mx/terminos" style="color:#9ca3af;text-decoration:none;">Términos de Servicio</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email verification template
const createEmailVerificationTemplate = (verifyUrl, userName) => {
  return createEmailTemplate({
    greeting: userName ? `Hola ${userName}` : 'Hola',
    title: '📧 Verifica tu correo electrónico',
    subtitle: 'Confirma tu cuenta para comenzar',
    mainMessage: 'Para completar tu registro en Kustodia, necesitamos verificar tu dirección de correo electrónico. Haz clic en el botón de abajo para confirmar tu cuenta.',
    actionButton: {
      text: '✅ Verificar Correo Electrónico',
      url: verifyUrl,
      color: '#10b981'
    },
    footerMessage: 'Si no creaste esta cuenta, puedes ignorar este mensaje de forma segura.',
    includeFeatures: true
  });
};

// KYC status templates
const createKYCStatusTemplate = (status, userName, reason) => {
  let title, mainMessage, actionButton, additionalContent = '';
  
  const frontendUrl = 'https://kustodia.mx';
  
  switch (status) {
    case 'approved':
      title = '✅ ¡Verificación KYC Aprobada!';
      mainMessage = 'Excelente noticia: tu identidad ha sido verificada exitosamente. Ya puedes operar sin restricciones en Kustodia y acceder a todas nuestras funcionalidades.';
      actionButton = {
        text: '🚀 Ir al Dashboard',
        url: `${frontendUrl}/dashboard`,
        color: '#10b981'
      };
      additionalContent = `
        <div style="background-color:#ecfdf5;border:1px solid #10b981;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="color:#065f46;margin:0;font-size:14px;font-weight:600;">✨ ¡Felicidades! Ahora puedes:</p>
          <ul style="color:#065f46;margin:8px 0 0 0;font-size:14px;">
            <li>Realizar transferencias sin límites</li>
            <li>Acceder a productos de inversión</li>
            <li>Utilizar todas las funciones premium</li>
          </ul>
        </div>
      `;
      break;
      
    case 'rejected':
      title = '❌ Verificación KYC Rechazada';
      mainMessage = 'Lamentablemente, tu verificación de identidad no pudo ser completada en esta ocasión.';
      actionButton = {
        text: '🔄 Intentar de Nuevo',
        url: `${frontendUrl}/kyc`,
        color: '#ef4444'
      };
      additionalContent = `
        ${reason ? `
          <div style="background-color:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#991b1b;margin:0;font-size:14px;font-weight:600;">⚠️ Motivo del rechazo:</p>
            <p style="color:#991b1b;margin:8px 0 0 0;font-size:14px;">${reason}</p>
          </div>
        ` : ''}
        <div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="color:#92400e;margin:0;font-size:14px;font-weight:600;">📝 Consejos para el próximo intento:</p>
          <ul style="color:#92400e;margin:8px 0 0 0;font-size:14px;">
            <li>Asegúrate de que los documentos estén claros y legibles</li>
            <li>Verifica que la información coincida exactamente</li>
            <li>Usa buena iluminación al tomar las fotos</li>
          </ul>
        </div>
      `;
      break;
      
    case 'pending':
    default:
      title = '🔍 Verificación KYC en Proceso';
      mainMessage = 'Hemos recibido tu documentación y estamos revisando tu información. Este proceso puede tomar entre 24 y 48 horas hábiles.';
      additionalContent = `
        <div style="background-color:#f0f9ff;border:1px solid #2e7ef7;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="color:#1e40af;margin:0;font-size:14px;font-weight:600;">⏳ ¿Qué sigue?</p>
          <ul style="color:#1e40af;margin:8px 0 0 0;font-size:14px;">
            <li>Nuestro equipo revisará tu documentación</li>
            <li>Te notificaremos por email cuando esté listo</li>
            <li>Mientras tanto, puedes explorar la plataforma</li>
          </ul>
        </div>
      `;
      break;
  }
  
  return createEmailTemplate({
    greeting: userName ? `Hola ${userName}` : 'Hola',
    title,
    mainMessage,
    actionButton,
    additionalContent,
    footerMessage: 'Si tienes alguna pregunta sobre tu verificación, no dudes en contactarnos.',
    includeFeatures: status === 'approved'
  });
};

// Generate preview files
const previewsDir = path.join(__dirname, 'email-previews');
if (!fs.existsSync(previewsDir)) {
  fs.mkdirSync(previewsDir);
}

// 1. Email Verification
const emailVerification = createEmailVerificationTemplate('https://kustodia.mx/verify?token=abc123', 'Carlos Aguero');
fs.writeFileSync(path.join(previewsDir, '1-email-verification.html'), emailVerification);

// 2. KYC Approved
const kycApproved = createKYCStatusTemplate('approved', 'Carlos Aguero');
fs.writeFileSync(path.join(previewsDir, '2-kyc-approved.html'), kycApproved);

// 3. KYC Rejected
const kycRejected = createKYCStatusTemplate('rejected', 'Carlos Aguero', 'Documento de identidad no legible');
fs.writeFileSync(path.join(previewsDir, '3-kyc-rejected.html'), kycRejected);

// 4. KYC Pending
const kycPending = createKYCStatusTemplate('pending', 'Carlos Aguero');
fs.writeFileSync(path.join(previewsDir, '4-kyc-pending.html'), kycPending);

// Create index file
const indexHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kustodia Email Previews</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .email-link { display: block; padding: 15px; margin: 10px 0; background: #2e7ef7; color: white; text-decoration: none; border-radius: 5px; text-align: center; }
        .email-link:hover { background: #1d4ed8; }
        h1 { color: #333; text-align: center; }
        p { color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Kustodia Email Previews</h1>
        <p>Haz clic en los enlaces para ver las plantillas de email:</p>
        
        <a href="1-email-verification.html" class="email-link">
            📧 Email Verification - Verificación de Correo
        </a>
        
        <a href="2-kyc-approved.html" class="email-link">
            ✅ KYC Approved - KYC Aprobado
        </a>
        
        <a href="3-kyc-rejected.html" class="email-link">
            ❌ KYC Rejected - KYC Rechazado
        </a>
        
        <a href="4-kyc-pending.html" class="email-link">
            🔍 KYC Pending - KYC en Proceso
        </a>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(previewsDir, 'index.html'), indexHtml);

console.log('✅ Email previews generated successfully!');
console.log('📁 Files created in:', previewsDir);
console.log('🌐 Open index.html in your browser to view all email templates');
console.log('');
console.log('Generated files:');
console.log('- index.html (main menu)');
console.log('- 1-email-verification.html');
console.log('- 2-kyc-approved.html');
console.log('- 3-kyc-rejected.html');
console.log('- 4-kyc-pending.html');
