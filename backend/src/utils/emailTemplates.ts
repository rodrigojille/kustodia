/**
 * Unified Email Template System for Kustodia
 * Provides consistent styling and branding across all email types
 */

export interface EmailTemplateOptions {
  greeting?: string;
  title: string;
  subtitle?: string;
  mainMessage: string;
  actionButton?: {
    text: string;
    url: string;
    color?: string;
  };
  additionalContent?: string;
  footerMessage?: string;
  includeFeatures?: boolean;
  includeTimeline?: boolean;
  timeline?: Array<{
    date: string;
    status: string;
    description: string;
    completed: boolean;
  }>;
}

/**
 * Base HTML template with consistent Kustodia branding
 */
export function createEmailTemplate(options: EmailTemplateOptions): string {
  const {
    greeting = 'Hola',
    title,
    subtitle,
    mainMessage,
    actionButton,
    additionalContent = '',
    footerMessage,
    includeFeatures = false,
    includeTimeline = false,
    timeline = []
  } = options;

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
          <div style="font-size:32px;margin-bottom:12px;">⚙️</div>
          <h4 style="color:#111827;margin:0 0 8px 0;font-size:16px;font-weight:600;">Condiciones Controladas</h4>
          <p style="color:#6b7280;margin:0;font-size:14px;">Pagos automatizados según condiciones pactadas</p>
        </div>
        
        <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:32px;margin-bottom:12px;">📄</div>
          <h4 style="color:#111827;margin:0 0 8px 0;font-size:16px;font-weight:600;">Contratos Inteligentes</h4>
          <p style="color:#6b7280;margin:0;font-size:14px;">Ejecución automática y transparente</p>
        </div>
      </div>
    </div>
  ` : '';

  const timelineSection = includeTimeline && timeline.length > 0 ? `
    <!-- Timeline Section -->
    <div style="margin:32px 0;">
      <h3 style="color:#111827;margin:0 0 20px 0;font-size:18px;font-weight:600;">📅 Cronología del Pago</h3>
      <div style="background-color:#f8fafc;border-radius:12px;padding:20px;">
        ${timeline.map((item, index) => `
          <div style="display:flex;align-items:center;margin-bottom:${index === timeline.length - 1 ? '0' : '16px'};">
            <div style="width:24px;height:24px;border-radius:50%;background-color:${item.completed ? '#10b981' : '#e5e7eb'};display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
              <div style="width:8px;height:8px;border-radius:50%;background-color:${item.completed ? '#ffffff' : '#9ca3af'};"></div>
            </div>
            <div style="flex:1;">
              <div style="font-weight:600;color:${item.completed ? '#10b981' : '#6b7280'};font-size:14px;">${item.status}</div>
              <div style="color:#6b7280;font-size:13px;margin-top:2px;">${item.description}</div>
              <div style="color:#9ca3af;font-size:12px;margin-top:2px;">${item.date}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const actionButtonSection = actionButton ? `
    <!-- Action Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="${actionButton.url}" target="_blank" style="display:inline-block;background-color:${actionButton.color || '#2e7ef7'};color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:600;font-size:16px;transition:background-color 0.2s;">${actionButton.text}</a>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #2e7ef7 0%, #1d4ed8 100%);padding:32px 24px;text-align:center;">
          <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia" style="height:40px;margin-bottom:16px;filter:brightness(0) invert(1);" />
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">${title}</h1>
          ${subtitle ? `<p style="color:#e0f2fe;margin:8px 0 0 0;font-size:16px;">${subtitle}</p>` : ''}
        </div>
        
        <!-- Main Content -->
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
          ${timelineSection}
          
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
              <div style="width:40px;height:40px;background-color:#000000;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
            </a>
            <a href="https://linkedin.com/company/kustodia-mx" target="_blank" style="display:inline-block;margin:0 8px;text-decoration:none;">
              <div style="width:40px;height:40px;background-color:#0077b5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
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
}

/**
 * Email verification template
 */
export function createEmailVerificationTemplate(verifyUrl: string, userName?: string): string {
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
}

/**
 * Password reset template
 */
export function createPasswordResetTemplate(resetUrl: string, userName?: string): string {
  return createEmailTemplate({
    title: '🔐 Restablece tu contraseña',
    greeting: `¡Hola${userName ? ` ${userName}` : ''}!`,
    mainMessage: 'Hemos recibido una solicitud para restablecer tu contraseña.',
    actionButton: {
      text: '🔑 Restablecer Contraseña',
      url: resetUrl,
      color: '#2e7ef7'
    },
    additionalContent: `
      <div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="color:#92400e;margin:0;font-size:14px;font-weight:600;">⚠️ Este enlace expirará en 1 hora por seguridad.</p>
      </div>
      <p style="font-size:14px;color:#6b7280;margin:16px 0 0 0;line-height:1.5;">Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
    `
  });
}

/**
 * KYC status notification template
 */
export function createKYCStatusTemplate(status: 'approved' | 'rejected' | 'pending', userName?: string, reason?: string): string {
  let title: string;
  let mainMessage: string;
  let actionButton: { text: string; url: string; color: string } | undefined;
  let additionalContent = '';
  
  const frontendUrl = process.env.FRONTEND_URL || 'https://kustodia.mx';
  
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
}

/**
 * Welcome email template (enhanced)
 */
export function createWelcomeTemplate(userName?: string, accessCode?: string): string {
  const accessCodeSection = accessCode ? `
    <!-- Access Code Card -->
    <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:2px solid #2e7ef7;border-radius:16px;padding:24px;margin:32px 0;text-align:center;">
      <div style="font-size:18px;font-weight:600;color:#1e40af;margin-bottom:12px;">🔑 Código de Acceso Anticipado</div>
      <div style="font-family:monospace;color:#2e7ef7;font-size:24px;font-weight:700;background-color:#ffffff;padding:16px;border-radius:8px;letter-spacing:2px;border:1px solid #e5e7eb;">${accessCode}</div>
      <p style="font-size:14px;color:#6b7280;margin:12px 0 0 0;">⚠️ Guarda este código, lo necesitarás para acceder a la plataforma</p>
    </div>
  ` : '';

  return createEmailTemplate({
    greeting: userName ? `¡Hola ${userName}! 👋` : '¡Hola! 👋',
    title: '🎉 ¡Bienvenido a Kustodia!',
    subtitle: 'El futuro de los pagos seguros',
    mainMessage: '¡Gracias por tu interés en Kustodia! Hemos recibido correctamente tu registro para Early Access. Pronto recibirás novedades sobre el acceso y nuevas funcionalidades.',
    actionButton: {
      text: '🌐 Visitar Kustodia.mx',
      url: 'https://kustodia.mx',
      color: '#2e7ef7'
    },
    additionalContent: accessCodeSection,
    includeFeatures: true
  });
}
