import { sendEmail } from './emailService';

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
  | 'escrow_error';

interface NotificationRecipient {
  email: string;
  role: 'payer' | 'seller' | 'commission_beneficiary' | 'admin' | 'support' | string;
}

interface PaymentEventNotification {
  eventType: PaymentEventType;
  paymentId: string;
  paymentDetails: any; // Use a more specific type if you have one
  recipients: NotificationRecipient[];
  timeline?: Array<any>;
  customMessage?: string;
  commissionBeneficiaryEmail?: string;
}

// Flexible function for sending payment notifications
export async function sendPaymentEventNotification({
  eventType,
  paymentId,
  paymentDetails,
  recipients,
  timeline = [],
  customMessage,
  commissionBeneficiaryEmail
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
    escrow_error: 'Error en custodia'
  };

  const subject = subjectMap[eventType] || 'Notificación de evento de pago';

  // Simple HTML template (replace with your own)
  const buildHtml = (recipient: NotificationRecipient) => `
    <div style="font-family:Montserrat,Arial,sans-serif;background:#fff;padding:2rem;max-width:520px;margin:2rem auto;border-radius:16px;box-shadow:0 2px 12px #0001;">
      <h2 style="color:#2e7ef7;">${subject}</h2>
      <p>Hola${recipient.role ? ` (${recipient.role})` : ''},</p>
      <p>${customMessage || getDefaultMessage(eventType, paymentDetails)}</p>
      <div style="margin:1.5rem 0;">
        <b>ID del pago:</b> ${paymentId}<br/>
        <b>Monto:</b> ${paymentDetails.amount ? Number(paymentDetails.amount).toLocaleString('es-MX', { style: 'currency', currency: paymentDetails.currency }) : '-'}<br/>
        <b>Estado actual:</b> ${paymentDetails.status || '-'}
      </div>
      ${timeline && timeline.length ? renderTimeline(timeline) : ''}
      <p style="font-size:13px;color:#999;">Equipo Kustodia</p>
    </div>
  `;

  for (const recipient of recipients) {
    await sendEmail({
      to: recipient.email,
      subject,
      html: buildHtml(recipient)
    });
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
      return 'La custodia ha sido creada y está activa.';
    case 'funds_received':
      return 'Los fondos han sido recibidos en la custodia.';
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
    default:
      return 'Hay una actualización en tu pago.';
  }
}

function renderTimeline(timeline: Array<any>) {
  return `<div style="margin-top:1rem;">
    <b>Línea de tiempo:</b>
    <ul style="padding-left:1.2rem;">
      ${timeline.map(ev => `<li>${ev.label || ev.status || ''} - ${ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-MX') : ''}</li>`).join('')}
    </ul>
  </div>`;
}
