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
              <div style="width:40px;height:40px;background-color:#1da1f2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#ffffff;font-size:18px;">🐦</span>
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
              <a href="https://kustodia.mx/privacy" style="color:#9ca3af;text-decoration:none;">Política de Privacidad</a> | 
              <a href="https://kustodia.mx/terms" style="color:#9ca3af;text-decoration:none;">Términos de Servicio</a> | 
              <a href="https://kustodia.mx/contact" style="color:#9ca3af;text-decoration:none;">Contacto</a>
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
    
    <!-- Special Offer -->
    <div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border:2px solid #f59e0b;border-radius:16px;padding:24px;margin:32px 0;text-align:center;">
      <div style="font-size:20px;margin-bottom:8px;">🎊</div>
      <h3 style="color:#92400e;margin:0 0 8px 0;font-size:18px;font-weight:700;">¡Felicidades!</h3>
      <p style="color:#92400e;margin:0;font-size:16px;font-weight:600;">Tienes <strong>0% fee de por vida</strong> por ser de los primeros 100 registros</p>
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
