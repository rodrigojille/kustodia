import { createEmailTemplate } from './emailTemplates';

/**
 * Early access confirmation template
 */
export function createEarlyAccessConfirmationTemplate(userName?: string): string {
  const accessCode = 'kustodiapremier';
  
  return createEmailTemplate({
    greeting: userName ? `¡Hola ${userName}! 🚀` : '¡Hola! 🚀',
    title: '🎆 Acceso Prioritario Confirmado',
    subtitle: 'Tu registro ha sido exitoso',
    mainMessage: '¡Gracias por tu interés en Kustodia! Hemos recibido correctamente tu registro para Acceso Prioritario. Pronto recibirás novedades sobre el acceso exclusivo y nuevas funcionalidades.',
    actionButton: {
      text: '🚀 Visitar Kustodia',
      url: 'https://kustodia.mx',
      color: '#2e7ef7'
    },
    additionalContent: `
      <!-- Access Code Card -->
      <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:2px solid #2e7ef7;border-radius:16px;padding:24px;margin:32px 0;text-align:center;">
        <div style="font-size:18px;font-weight:600;color:#1e40af;margin-bottom:12px;">🔑 Código de Acceso Prioritario</div>
        <div style="font-family:monospace;color:#2e7ef7;font-size:24px;font-weight:700;background-color:#ffffff;padding:16px;border-radius:8px;letter-spacing:2px;border:1px solid #e5e7eb;">${accessCode}</div>
        <p style="font-size:14px;color:#6b7280;margin:12px 0 0 0;">⚠️ Guarda este código, lo necesitarás para acceder a la plataforma con privilegios prioritarios</p>
      </div>
      
      <!-- Benefits Section -->
      <div style="background-color:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;">
        <h3 style="color:#111827;margin:0 0 16px 0;font-size:18px;font-weight:600;">🎆 Beneficios del Acceso Prioritario</h3>
        <ul style="color:#374151;margin:0;padding-left:20px;line-height:1.8;">
          <li>Acceso temprano a nuevas funcionalidades</li>
          <li>Soporte prioritario y personalizado</li>
          <li>Comisiones preferenciales</li>
          <li>Invitaciones exclusivas a eventos</li>
        </ul>
      </div>
    `,
    includeFeatures: false
  });
}
