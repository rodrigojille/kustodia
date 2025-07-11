"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

// Types (matching the existing types from PaymentDetailClient.tsx)
interface Escrow {
  id: number;
  custody_percent?: number | string;
  custody_amount?: number | string;
  release_amount?: number | string;
  custody_end?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  dispute_status?: string;
  smart_contract_escrow_id?: string;
  blockchain_tx_hash?: string;
  release_tx_hash?: string;
  dispute_reason?: string;
  dispute_details?: string;
  dispute_evidence?: string;
  dispute_history?: Array<any>;
}

interface Payment {
  id: string;
  status: string;
  payer_email: string;
  recipient_email: string;
  amount: number;
  currency: string;
  description?: string;
  deposit_clabe?: string;
  payout_clabe?: string;
  escrow?: Escrow;
  hmac?: string;
  payment_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface PaymentEvent {
  id: number;
  type: string;
  description: string;
  created_at: string;
  metadata?: any;
}



function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function getStatusDisplay(status: string) {
  const statusMap: Record<string, { label: string; bgColor: string; color: string }> = {
    'pending': { label: 'Pendiente', bgColor: '#FEF3C7', color: '#92400E' },
    'funded': { label: 'Fondos Recibidos', bgColor: '#D1FAE5', color: '#065F46' },
    'completed': { label: 'Completado', bgColor: '#D1FAE5', color: '#065F46' },
    'cancelled': { label: 'Cancelado', bgColor: '#FEE2E2', color: '#991B1B' },
    'disputed': { label: 'En Disputa', bgColor: '#FED7AA', color: '#C2410C' },
    'expired': { label: 'Expirado', bgColor: '#F3F4F6', color: '#374151' }
  };
  return statusMap[status] || { label: status, bgColor: '#F3F4F6', color: '#374151' };
}

function getDisplayAmount(amount: number | string) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount || 0);
}

interface PaymentPrintDocumentProps {
  payment: Payment;
  events: PaymentEvent[];
}

export default function PaymentPrintDocument({ payment, events }: PaymentPrintDocumentProps) {
  const [breakdown, setBreakdown] = useState({ totalAmount: 0, paidAmount: 0, custodyAmount: 0 });
  const [printDate] = useState(new Date().toLocaleString('es-MX'));

  useEffect(() => {
    if (!payment) return;
    
    const totalAmount = Number(payment.amount || 0);
    const releaseAmount = Number(payment.escrow?.release_amount || 0);
    const custodyAmount = Number(payment.escrow?.custody_amount || 0);
    
    // Check if seller redemption/payout has been processed
    const sellerPaid = events.some(event => {
      const desc = event.description?.toLowerCase() || '';
      const type = event.type?.toLowerCase() || '';
      
      return (
        type === 'seller_redemption' || 
        type === 'payout_processed' ||
        type === 'spei_sent' ||
        type === 'redemption_successful' ||
        desc.includes('redención') ||
        desc.includes('spei procesado') ||
        desc.includes('spei redemption') ||
        desc.includes('redemption of') ||
        desc.includes('mxn to') ||
        desc.includes('envío spei') ||
        desc.includes('transaction id')
      );
    });
    
    const custodyReleased = events.some(event => 
      event.type === 'custody_released' || 
      event.description?.toLowerCase().includes('custody released')
    );
    
    let paidAmount = 0;
    if (sellerPaid) paidAmount += releaseAmount;
    if (custodyReleased) paidAmount += custodyAmount;
    
    setBreakdown({ totalAmount, paidAmount, custodyAmount });
  }, [payment, events]);

  if (!payment) return null;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12pt' }}>
      {/* Print Header */}
      <div style={{ borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24pt', fontWeight: 'bold' }}>Kustodia</div>
        <div style={{ fontSize: '18pt', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>COMPROBANTE DE PAGO</div>
        <div style={{ fontSize: '10pt', color: '#666' }}>
          Generado: {printDate}
        </div>
      </div>

      {/* Payment Summary Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>📋 Resumen del Pago</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>ID del Pago:</td>
            <td style={{ padding: '5px' }}>{payment.id}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>Estado:</td>
            <td style={{ padding: '5px' }}>{getStatusDisplay(payment.status).label}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>Monto Total:</td>
            <td style={{ padding: '5px', fontSize: '14pt', fontWeight: 'bold' }}>{getDisplayAmount(payment.amount)}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>Moneda:</td>
            <td style={{ padding: '5px' }}>{payment.currency || 'MXN'}</td>
          </tr>
          {payment.description && (
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>Descripción:</td>
              <td style={{ padding: '5px' }}>{payment.description}</td>
            </tr>
          )}
        </table>
      </div>

      {/* Participants Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>👥 Participantes</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>Pagador:</td>
            <td style={{ padding: '5px' }}>{payment.payer_email}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>Receptor:</td>
            <td style={{ padding: '5px' }}>{payment.recipient_email}</td>
          </tr>
        </table>
      </div>

      {/* Banking Details Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>🏦 Detalles Bancarios</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {payment.deposit_clabe && (
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>CLABE de Depósito:</td>
              <td style={{ padding: '5px' }}>{payment.deposit_clabe}</td>
            </tr>
          )}
          {payment.payout_clabe && (
            <tr>
              <td style={{ padding: '5px', fontWeight: 'bold' }}>CLABE de Pago:</td>
              <td style={{ padding: '5px' }}>{payment.payout_clabe}</td>
            </tr>
          )}
        </table>
      </div>

      {/* Timeline Section */}
      {events.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px' }}>🕰️ Cronología del Pago</div>
          {events.slice(0, 5).map((event, index) => (
            <div key={event.id || index} style={{ marginBottom: '10px', padding: '5px', borderLeft: '3px solid #ccc', paddingLeft: '10px' }}>
              <div style={{ fontSize: '10pt', color: '#666' }}>
                {formatDate(event.created_at)}
              </div>
              <div style={{ fontWeight: 'bold' }}>{event.type}</div>
              <div>{event.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Section */}
      <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '10px' }}>📱 Verificación</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
          <QRCode 
            value={`https://kustodia.com/pagos/${payment.id}/verificar`}
            size={80}
            level="M"
            includeMargin={true}
          />
          <div>
            <div>Escanea para verificar</div>
            <div style={{ fontSize: '10pt', color: '#666' }}>kustodia.com/pagos/{payment.id}/verificar</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10pt', color: '#666', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <strong>Kustodia</strong> - Plataforma de Pagos Seguros | Documento generado el {printDate}
      </div>
    </div>
  );
}
