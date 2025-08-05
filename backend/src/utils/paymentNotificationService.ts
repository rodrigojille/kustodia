import { sendEmail } from './emailService';
import { SPEIReceiptService, SPEIReceiptData } from '../services/speiReceiptService';
import fs from 'fs';
import path from 'path';

export type PaymentEventType =
  | 'payment_created'
  | 'escrow_created'
  | 'funds_received'
  | 'escrow_executing'
  | 'escrow_finished'
  | 'payment_released'
  | 'dispute_started'
  | 'bridge_withdrawal_success'
  | 'payout_completed'
  | 'escrow_release_success'
  | 'payout_processing_error'
  | 'escrow_error'
  | 'spei_transfer_completed'
  | 'spei_transfer_processing';

interface NotificationRecipient {
  email: string;
  role: 'payer' | 'seller' | 'commission_beneficiary' | 'admin' | 'support' | string;
  name?: string; // User's full name or first name for personalization
}

interface PaymentEventNotification {
  eventType: PaymentEventType;
  paymentId: string;
  paymentDetails: any; // Use a more specific type if you have one
  recipients: NotificationRecipient[];
  timeline?: Array<any>;
  customMessage?: string;
  commissionBeneficiaryEmail?: string;
  // SPEI Receipt options
  includeSPEIReceipt?: boolean;
  speiReceiptData?: SPEIReceiptData;
  junoTransactionId?: string;
}

// Flexible function for sending payment notifications
export async function sendPaymentEventNotification({
  eventType,
  paymentId,
  paymentDetails,
  recipients,
  timeline = [],
  customMessage,
  commissionBeneficiaryEmail,
  includeSPEIReceipt = false,
  speiReceiptData,
  junoTransactionId
}: PaymentEventNotification) {
  const subjectMap: Record<PaymentEventType, string> = {
    payment_created: 'Pago creado en Kustodia',
    escrow_created: 'Custodia creada',
    funds_received: 'Fondos recibidos en custodia',
    escrow_executing: 'Custodia en ejecución',
    escrow_finished: 'Custodia finalizada',
    payment_released: 'Pago liberado',
    dispute_started: 'Disputa iniciada',
    bridge_withdrawal_success: 'Retiro exitoso',
    payout_completed: 'Pago completado',
    escrow_release_success: 'Custodia liberada',
    payout_processing_error: 'Error en pago',
    escrow_error: 'Error en custodia',
    spei_transfer_completed: 'Transferencia SPEI completada',
    spei_transfer_processing: 'Transferencia SPEI en proceso'
  };

  const subject = subjectMap[eventType] || 'Notificación de evento de pago';

  // Generate SPEI receipt if requested
  let receiptAttachment: { filename: string; path: string } | undefined;
  if (includeSPEIReceipt && speiReceiptData) {
    try {
      const receiptPath = await SPEIReceiptService.saveReceiptToFile(speiReceiptData, { format: 'pdf' });
      receiptAttachment = {
        filename: `Comprobante-SPEI-${paymentId}.pdf`,
        path: receiptPath
      };
      console.log(`[Notification] SPEI receipt generated: ${receiptPath}`);
    } catch (error) {
      console.error('[Notification] Failed to generate SPEI receipt:', error);
    }
  }

  // Modern, professional HTML template following industry best practices
  const buildHtml = (recipient: NotificationRecipient) => {
    // Get personalized greeting
    let greeting = 'Hola';
    if (recipient.name) {
      greeting = `Hola ${recipient.name}`;
    } else if (recipient.role) {
      greeting = `Hola (${recipient.role})`;
    }
    
    // Get status color and icon
    const getStatusDisplay = (status: string) => {
      const statusMap: { [key: string]: { color: string; icon: string; label: string } } = {
        'pending': { color: '#f59e0b', icon: '⏳', label: 'Pendiente' },
        'funded': { color: '#10b981', icon: '💰', label: 'Fondos Recibidos' },
        'in_custody': { color: '#3b82f6', icon: '🔒', label: 'En Custodia' },
        'escrowed': { color: '#3b82f6', icon: '🔒', label: 'En Custodia' },
        'completed': { color: '#10b981', icon: '✅', label: 'Completado' },
        'released': { color: '#10b981', icon: '🎉', label: 'Liberado' },
        'disputed': { color: '#ef4444', icon: '⚠️', label: 'En Disputa' },
        'cancelled': { color: '#6b7280', icon: '❌', label: 'Cancelado' }
      };
      return statusMap[status] || { color: '#6b7280', icon: '📄', label: status || 'Desconocido' };
    };
    
    const statusDisplay = getStatusDisplay(paymentDetails.status);
    const eventIcon = getEventIcon(eventType);
    
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #2e7ef7 0%, #1d4ed8 100%);padding:32px 24px;text-align:center;">
          <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia" style="height:40px;margin-bottom:16px;filter:brightness(0) invert(1);" />
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">${eventIcon} ${subject}</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding:32px 24px;">
          <!-- Greeting -->
          <p style="font-size:16px;color:#374151;margin:0 0 24px 0;line-height:1.6;">${greeting},</p>
          
          <!-- Main Message -->
          <div style="background-color:#f8fafc;border-left:4px solid #2e7ef7;padding:20px;margin:24px 0;border-radius:0 8px 8px 0;">
            <p style="font-size:16px;color:#374151;margin:0;line-height:1.6;">${customMessage || getDefaultMessage(eventType, paymentDetails)}</p>
          </div>
          
          <!-- Payment Details Card -->
          <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color:#111827;margin:0 0 16px 0;font-size:18px;font-weight:600;">📋 Detalles del Pago</h3>
            
            <div style="display:flex;flex-wrap:wrap;gap:16px;">
              <div style="flex:1;min-width:200px;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">ID del Pago</span>
                  <div style="font-size:16px;color:#111827;font-weight:600;margin-top:4px;">#${paymentId}</div>
                </div>
                
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Monto</span>
                  <div style="font-size:20px;color:#059669;font-weight:700;margin-top:4px;">${paymentDetails.amount ? Number(paymentDetails.amount).toLocaleString('es-MX', { style: 'currency', currency: paymentDetails.currency || 'MXN' }) : '-'}</div>
                </div>
              </div>
              
              <div style="flex:1;min-width:200px;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Estado</span>
                  <div style="display:inline-flex;align-items:center;background-color:${statusDisplay.color}15;color:${statusDisplay.color};padding:6px 12px;border-radius:20px;font-size:14px;font-weight:600;margin-top:4px;">
                    <span style="margin-right:6px;">${statusDisplay.icon}</span>
                    ${statusDisplay.label}
                  </div>
                </div>
                
                ${paymentDetails.custodyAmount ? `
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">En Custodia</span>
                  <div style="font-size:16px;color:#3b82f6;font-weight:600;margin-top:4px;">${Number(paymentDetails.custodyAmount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                </div>` : ''}
              </div>
            </div>
            
            ${paymentDetails.escrowId ? `
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
              <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">ID de Custodia</span>
              <div style="font-family:monospace;font-size:14px;color:#374151;background-color:#f3f4f6;padding:8px 12px;border-radius:6px;margin-top:4px;">${paymentDetails.escrowId}</div>
            </div>` : ''}
            
            ${paymentDetails.arbiscanUrl ? `
            <div style="margin-top:16px;text-align:center;">
              <a href="${paymentDetails.arbiscanUrl}" target="_blank" style="display:inline-block;background-color:#2e7ef7;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;transition:background-color 0.2s;">🔗 Ver en Blockchain</a>
            </div>` : ''}
          </div>
          
          ${timeline && timeline.length ? renderModernTimeline(timeline) : ''}
          
          <!-- CTA Section -->
          <div style="text-align:center;margin:32px 0;">
            <a href="https://kustodia.mx/pagos/${paymentId}" target="_blank" style="display:inline-block;background-color:#2e7ef7;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;margin:8px;transition:background-color 0.2s;">📱 Ver Detalles Completos</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
          <div style="margin-bottom:16px;">
            <img src="https://kustodia.mx/kustodia-logo.png" alt="Kustodia" style="height:24px;opacity:0.7;" />
          </div>
          <p style="font-size:14px;color:#6b7280;margin:0 0 8px 0;">Equipo Kustodia</p>
          <p style="font-size:12px;color:#9ca3af;margin:0;">Pagos seguros y automatizados con tecnología blockchain</p>
          
          <!-- Social Links -->
          <div style="margin-top:16px;">
            <a href="https://x.com/Kustodia_mx" style="color:#6b7280;text-decoration:none;margin:0 8px;font-size:12px;">Twitter</a>
            <a href="https://www.instagram.com/kustodia.mx/" style="color:#6b7280;text-decoration:none;margin:0 8px;font-size:12px;">Instagram</a>
            <a href="https://www.linkedin.com/company/kustodia-mx" style="color:#6b7280;text-decoration:none;margin:0 8px;font-size:12px;">LinkedIn</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  for (const recipient of recipients) {
    const emailOptions: any = {
      to: recipient.email,
      subject,
      html: buildHtml(recipient)
    };

    // Add SPEI receipt attachment if available
    if (receiptAttachment) {
      emailOptions.attachments = [receiptAttachment];
    }

    await sendEmail(emailOptions);
  }

  // Clean up temporary receipt file
  if (receiptAttachment) {
    try {
      fs.unlinkSync(receiptAttachment.path);
      console.log(`[Notification] Cleaned up receipt file: ${receiptAttachment.path}`);
    } catch (error) {
      console.warn('[Notification] Failed to clean up receipt file:', error);
    }
  }
  // Notifica al beneficiario de comisión si aplica
  if (commissionBeneficiaryEmail) {
    await sendEmail({
      to: commissionBeneficiaryEmail,
      subject: 'Has recibido una comisión en Kustodia',
      html: `<div style="font-family:Montserrat,Arial,sans-serif;background:#fff;padding:2rem;max-width:520px;margin:2rem auto;border-radius:16px;box-shadow:0 2px 12px #0001;">
        <h2 style="color:#27ae60;">¡Comisión recibida!</h2>
        <p>Has recibido una comisión asociada al pago <b>${paymentId}</b>.</p>
        <div style="margin:1.5rem 0;">
          <b>Monto:</b> ${paymentDetails.commissionAmount ? Number(paymentDetails.commissionAmount).toLocaleString('es-MX', { style: 'currency', currency: paymentDetails.currency }) : '-'}
        </div>
        <p style="font-size:13px;color:#999;">Equipo Kustodia</p>
      </div>`
    });
  }
}

function getDefaultMessage(eventType: PaymentEventType, paymentDetails: any) {
  switch (eventType) {
    case 'payment_created':
      return 'Tu pago ha sido creado exitosamente.';
    case 'escrow_created':
      return `La custodia ha sido creada exitosamente en blockchain${paymentDetails.custodyAmount ? ` por ${Number(paymentDetails.custodyAmount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}` : ''}. Los fondos están seguros en el contrato inteligente hasta la fecha de liberación.`;
    case 'funds_received':
      return `Los fondos han sido recibidos exitosamente${paymentDetails.amount ? ` por ${Number(paymentDetails.amount).toLocaleString('es-MX', { style: 'currency', currency: paymentDetails.currency || 'MXN' })}` : ''}. El proceso de automatización ha iniciado y procederemos con la división de fondos según las condiciones del pago.`;
    case 'escrow_executing':
      return 'La custodia está en ejecución.';
    case 'escrow_finished':
      return 'La custodia ha finalizado.';
    case 'payment_released':
      return 'El pago ha sido liberado.';
    case 'dispute_started':
      return 'Se ha iniciado una disputa en este pago.';
    case 'bridge_withdrawal_success':
      return 'El retiro de fondos se completó exitosamente.';
    case 'payout_completed':
      return 'El pago ha sido completado y enviado al beneficiario.';
    case 'escrow_release_success':
      return 'La custodia ha sido liberada del contrato inteligente.';
    case 'payout_processing_error':
      return 'Ocurrió un error al procesar el pago.';
    case 'escrow_error':
      return 'Ocurrió un error con la custodia.';
    case 'spei_transfer_completed':
      return 'Tu transferencia SPEI ha sido completada exitosamente. Adjuntamos el comprobante oficial.';
    case 'spei_transfer_processing':
      return 'Tu transferencia SPEI está siendo procesada. Te notificaremos cuando esté completada.';
    default:
      return 'Hay una actualización en tu pago.';
  }
}

function getEventIcon(eventType: PaymentEventType): string {
  const iconMap: { [key: string]: string } = {
    'payment_created': '📝',
    'escrow_created': '🔒',
    'funds_received': '💰',
    'escrow_executing': '⚙️',
    'escrow_finished': '✅',
    'payment_released': '🎉',
    'dispute_started': '⚠️',
    'bridge_withdrawal_success': '🏦',
    'payout_completed': '✅',
    'escrow_release_success': '🔓',
    'payout_processing_error': '❌',
    'escrow_error': '⚠️',
    'spei_transfer_completed': '🏦',
    'spei_transfer_processing': '⏳'
  };
  return iconMap[eventType] || '📄';
}

function renderTimeline(timeline: Array<any>) {
  return `<div style="margin-top:1rem;">
    <b>Línea de tiempo:</b>
    <ul style="padding-left:1.2rem;">
      ${timeline.map(ev => `<li>${ev.label || ev.status || ''} - ${ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-MX') : ''}</li>`).join('')}
    </ul>
  </div>`;
}

function renderModernTimeline(timeline: Array<any>) {
  if (!timeline || timeline.length === 0) return '';
  
  return `
  <div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <h3 style="color:#111827;margin:0 0 20px 0;font-size:18px;font-weight:600;">📅 Línea de Tiempo</h3>
    <div style="position:relative;">
      ${timeline.map((ev, index) => {
        const isLast = index === timeline.length - 1;
        const timestamp = ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';
        
        return `
        <div style="display:flex;align-items:flex-start;margin-bottom:${isLast ? '0' : '20px'};position:relative;">
          <!-- Timeline dot -->
          <div style="width:12px;height:12px;background-color:#2e7ef7;border-radius:50%;margin-right:16px;margin-top:6px;flex-shrink:0;z-index:1;"></div>
          
          <!-- Timeline line -->
          ${!isLast ? '<div style="position:absolute;left:5px;top:18px;width:2px;height:calc(100% + 8px);background-color:#e5e7eb;"></div>' : ''}
          
          <!-- Content -->
          <div style="flex:1;">
            <div style="font-weight:600;color:#111827;font-size:14px;margin-bottom:4px;">${ev.label || ev.status || 'Evento'}</div>
            <div style="font-size:12px;color:#6b7280;">${timestamp}</div>
            ${ev.description ? `<div style="font-size:13px;color:#374151;margin-top:4px;">${ev.description}</div>` : ''}
          </div>
        </div>
        `;
      }).join('')}
    </div>
  </div>
  `;
}
