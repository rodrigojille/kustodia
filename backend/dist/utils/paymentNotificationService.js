"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentEventNotification = sendPaymentEventNotification;
const emailService_1 = require("./emailService");
const speiReceiptService_1 = require("../services/speiReceiptService");
const fs_1 = __importDefault(require("fs"));
// Flexible function for sending payment notifications
async function sendPaymentEventNotification({ eventType, paymentId, paymentDetails, recipients, timeline = [], customMessage, commissionBeneficiaryEmail, includeSPEIReceipt = false, speiReceiptData, junoTransactionId }) {
    const subjectMap = {
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
    let receiptAttachment;
    if (includeSPEIReceipt && speiReceiptData) {
        try {
            const receiptPath = await speiReceiptService_1.SPEIReceiptService.saveReceiptToFile(speiReceiptData, { format: 'pdf' });
            receiptAttachment = {
                filename: `Comprobante-SPEI-${paymentId}.pdf`,
                path: receiptPath
            };
            console.log(`[Notification] SPEI receipt generated: ${receiptPath}`);
        }
        catch (error) {
            console.error('[Notification] Failed to generate SPEI receipt:', error);
        }
    }
    // Simple HTML template (replace with your own)
    const buildHtml = (recipient) => `
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
        const emailOptions = {
            to: recipient.email,
            subject,
            html: buildHtml(recipient)
        };
        // Add SPEI receipt attachment if available
        if (receiptAttachment) {
            emailOptions.attachments = [receiptAttachment];
        }
        await (0, emailService_1.sendEmail)(emailOptions);
    }
    // Clean up temporary receipt file
    if (receiptAttachment) {
        try {
            fs_1.default.unlinkSync(receiptAttachment.path);
            console.log(`[Notification] Cleaned up receipt file: ${receiptAttachment.path}`);
        }
        catch (error) {
            console.warn('[Notification] Failed to clean up receipt file:', error);
        }
    }
    // Notifica al beneficiario de comisión si aplica
    if (commissionBeneficiaryEmail) {
        await (0, emailService_1.sendEmail)({
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
function getDefaultMessage(eventType, paymentDetails) {
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
        case 'spei_transfer_completed':
            return 'Tu transferencia SPEI ha sido completada exitosamente. Adjuntamos el comprobante oficial.';
        case 'spei_transfer_processing':
            return 'Tu transferencia SPEI está siendo procesada. Te notificaremos cuando esté completada.';
        default:
            return 'Hay una actualización en tu pago.';
    }
}
function renderTimeline(timeline) {
    return `<div style="margin-top:1rem;">
    <b>Línea de tiempo:</b>
    <ul style="padding-left:1.2rem;">
      ${timeline.map(ev => `<li>${ev.label || ev.status || ''} - ${ev.timestamp ? new Date(ev.timestamp).toLocaleString('es-MX') : ''}</li>`).join('')}
    </ul>
  </div>`;
}
