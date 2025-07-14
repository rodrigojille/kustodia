"use client";
import { useEffect, useState } from "react";
import { authFetch } from '../utils/authFetch';

function getDisplayAmount(amount: number | string) {
  return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function getStatusDisplay(status: string) {
  const statusMap: { [key: string]: { label: string; color: string; icon: string } } = {
    'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    'processing': { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: '⚡' }, // Deprecated - payments skip this status
    'in_progress': { label: 'En progreso', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    'funded': { label: 'Financiado', color: 'bg-green-100 text-green-800', icon: '💰' },
    'escrowed': { label: 'En custodia', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    'en_custodia': { label: 'En custodia', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
    'paid': { label: 'Pagado', color: 'bg-indigo-100 text-indigo-800', icon: '✅' },
    'completed': { label: 'Completado', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
    'disputed': { label: 'En disputa', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    'cancelled': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: '❌' }
  };
  
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '🔔' };
}

function calculateMontoPorPagar(payment: Payment | null, events: any[]) {
  if (!payment || !payment.escrow) return 0;
  
  const custodyAmount = Number(payment.escrow.custody_amount || 0);
  const releaseAmount = Number(payment.escrow.release_amount || 0);
  const custodyEnd = payment.escrow.custody_end ? new Date(payment.escrow.custody_end) : null;
  const now = new Date();
  
  // Check if immediate SPEI was already sent
  const immediateSPEISent = events.some(event => 
    event.type === 'spei_sent' && event.description?.includes('immediate')
  );
  
  // Check if final SPEI was sent (custody release)
  const finalSPEISent = events.some(event => 
    event.type === 'spei_sent' && event.description?.includes('custody')
  );
  
  // Phase 1: Before funding or immediate payout not sent yet
  if (payment.status === 'pending' || (!immediateSPEISent && releaseAmount > 0)) {
    return releaseAmount; // Show immediate payout amount
  }
  
  // Phase 2: Immediate payout sent, custody still active
  if (immediateSPEISent && custodyEnd && now < custodyEnd) {
    return 0; // Nothing to pay yet
  }
  
  // Phase 3: Custody period ended, final payout not sent yet
  if (custodyEnd && now >= custodyEnd && !finalSPEISent) {
    return custodyAmount; // Show custody amount available to pay
  }
  
  // Phase 4: All payouts completed
  return 0;
}

function calculatePaymentBreakdown(payment: Payment | null, events: any[]) {
  if (!payment) return { totalAmount: 0, paidAmount: 0, custodyAmount: 0 };
  
  const totalAmount = Number(payment.amount || 0);
  const releaseAmount = Number(payment.escrow?.release_amount || 0);
  const custodyAmount = Number(payment.escrow?.custody_amount || 0);
  
  // Check if seller redemption/payout has been processed - look for multiple patterns
  const sellerPaid = events.some(event => {
    const desc = event.description?.toLowerCase() || '';
    const type = event.type?.toLowerCase() || '';
    
    return (
      // Event types that indicate seller payment
      type === 'seller_redemption' || 
      type === 'payout_processed' ||
      type === 'spei_sent' ||
      type === 'redemption_successful' ||
      // Description patterns that indicate seller payment
      desc.includes('redención') ||
      desc.includes('spei procesado') ||
      desc.includes('spei redemption') ||
      desc.includes('redemption of') ||
      desc.includes('mxn to') ||
      desc.includes('envío spei') ||
      // Transaction ID patterns
      desc.includes('transaction id') ||
      desc.includes('583b86b6') // Pattern from the screenshot
    );
  });
  
  // Check if custody has been released
  const custodyReleased = events.some(event => {
    const desc = event.description?.toLowerCase() || '';
    const type = event.type?.toLowerCase() || '';
    
    return (
      type === 'custody_released' ||
      type === 'custodia_liberada' ||
      desc.includes('custody released') ||
      desc.includes('custodia liberada')
    );
  });
  
  let paidAmount = 0;
  let remainingCustody = custodyAmount;
  
  // If payment is completed, all has been paid
  if (payment.status === 'completed') {
    paidAmount = totalAmount;
    remainingCustody = 0;
  } else {
    // If seller was paid, count the release amount as paid
    if (sellerPaid && releaseAmount > 0) {
      paidAmount = releaseAmount;
    }
    
    // If custody was released, that amount is also paid
    if (custodyReleased) {
      paidAmount = totalAmount; // Full amount paid when custody is released
      remainingCustody = 0;
    }
  }
  
  return {
    totalAmount,
    paidAmount,
    custodyAmount: remainingCustody
  };
}

import PaymentTimeline from "./PaymentTimeline";
import QRCode from "qrcode.react";
import ClabeSection from "./ClabeSection";
import DisputeModal from "./DisputeModal";
import DisputeMessagingModal from "./DisputeMessagingModal";
import PaymentPrintDocument from "./PaymentPrintDocument";

type Escrow = {
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
};

type Payment = {
  id: string;
  status: string;
  payer_email: string;
  recipient_email: string;
  amount: number;
  currency: string;
  description?: string;
  deposit_clabe?: string;
  payout_clabe?: string;
  payer_approval?: boolean;
  payee_approval?: boolean;
  escrow?: Escrow;
  hmac?: string; // <-- Para evitar error TS al acceder a payment.hmac
  payment_type?: string; // Add payment type for tracker routing
};

import './PaymentDetailClient.css';

// Print styles are now in PaymentDetailClient.css

export default function PaymentDetailClient({ id, onLoaded, showQrInPrintout = false, showPrintButton = true }: { id: string, onLoaded?: () => void, showQrInPrintout?: boolean, showPrintButton?: boolean }) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showDispute, setShowDispute] = useState(false);
  const [showDisputeMessages, setShowDisputeMessages] = useState(false);

  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    
    // Load payment details using authFetch
    authFetch(`payments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el pago');
        return res.json();
      })
      .then(data => {
        setPayment(data.payment);
        setLoading(false);
        if (onLoaded) onLoaded();
      })
      .catch(err => {
        setError('No se pudo cargar el pago');
        setLoading(false);
      });

    // Load payment events to check SPEI status
    authFetch(`payments/${id}/events`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setPaymentEvents(data.events || []);
        setEvents(data.events || []);
      })
      .catch(() => {
        setPaymentEvents([]);
      });

    // Check automation status
    authFetch('automation/status')
      .then(res => res.json())
      .then(data => {
        // setAutomationActive(data.success && data.status === 'running');
      })
      .catch(() => {
        // setAutomationActive(false);
      });
  }, [id]);

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; icon: string } } = {
      'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'processing': { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
      'in_progress': { label: 'En progreso', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
      'funded': { label: 'Financiado', color: 'bg-green-100 text-green-800', icon: '✅' },
      'escrowed': { label: 'En custodia', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
      'en_custodia': { label: 'En custodia', color: 'bg-purple-100 text-purple-800', icon: '🔒' },
      'paid': { label: 'Pagado', color: 'bg-green-100 text-green-800', icon: '💰' },
      'completed': { label: 'Completado', color: 'bg-green-100 text-green-800', icon: '✅' },
      'disputed': { label: 'En disputa', color: 'bg-red-100 text-red-800', icon: '⚠️' },
      'cancelled': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: '❌' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
  };

  const getDisplayAmount = (amount: number | string) => {
    return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    if (!payment) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante de Pago - ${payment.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12pt;
            line-height: 1.4;
          }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo { font-size: 24pt; font-weight: bold; }
          .title { font-size: 18pt; font-weight: bold; text-align: center; flex-grow: 1; }
          .date { font-size: 10pt; color: #666; }
          .section {
            margin-bottom: 20px;
            break-inside: avoid;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 5px;
            vertical-align: top;
          }
          .label { font-weight: bold; }
          .amount { font-size: 14pt; font-weight: bold; }
          .timeline-item {
            margin-bottom: 10px;
            padding: 5px;
            border-left: 3px solid #ccc;
            padding-left: 10px;
          }
          .timeline-date { font-size: 10pt; color: #666; }
          .timeline-title { font-weight: bold; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Kustodia</div>
          <div class="title">COMPROBANTE DE PAGO</div>
          <div class="date">Generado: ${new Date().toLocaleString('es-MX')}</div>
        </div>
        
        <div class="section">
          <div class="section-title">📋 Resumen del Pago</div>
          <table>
            <tr><td class="label">ID del Pago:</td><td>${payment.id}</td></tr>
            <tr><td class="label">Estado:</td><td>${getStatusDisplay(payment.status).label}</td></tr>
            <tr><td class="label">Monto Total:</td><td class="amount">${getDisplayAmount(payment.amount)}</td></tr>
            <tr><td class="label">Moneda:</td><td>${payment.currency || 'MXN'}</td></tr>
            ${payment.description ? `<tr><td class="label">Descripción:</td><td>${payment.description}</td></tr>` : ''}
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">👥 Participantes</div>
          <table>
            <tr><td class="label">Pagador:</td><td>${payment.payer_email}</td></tr>
            <tr><td class="label">Receptor:</td><td>${payment.recipient_email}</td></tr>
          </table>
        </div>
        
        ${payment.deposit_clabe || payment.payout_clabe ? `
        <div class="section">
          <div class="section-title">🏦 Detalles Bancarios</div>
          <table>
            ${payment.deposit_clabe ? `<tr><td class="label">CLABE de Depósito:</td><td>${payment.deposit_clabe}</td></tr>` : ''}
            ${payment.payout_clabe ? `<tr><td class="label">CLABE de Pago:</td><td>${payment.payout_clabe}</td></tr>` : ''}
          </table>
        </div>` : ''}
        
        ${paymentEvents.length > 0 ? `
        <div class="section">
          <div class="section-title">🕰️ Cronología del Pago</div>
          ${paymentEvents.slice(0, 10).map(event => `
            <div class="timeline-item">
              <div class="timeline-date">${formatDate(event.created_at)}</div>
              <div class="timeline-title">${event.type}</div>
              <div>${event.description || ''}</div>
            </div>
          `).join('')}
        </div>` : ''}
        
        <div class="section" style="text-align: center; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
          <strong>Kustodia</strong> - Plataforma de Pagos Seguros<br>
          Documento generado el ${new Date().toLocaleString('es-MX')}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="payment-detail-container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Detalle del pago</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          {/* Interactive Tracker Button for nuevo-flujo payments */}
          {payment?.payment_type === 'nuevo_flujo' && (
            <a
              href={`/dashboard/pagos/${payment.id}/tracker`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-xs sm:text-sm w-full sm:w-auto justify-center"
              title="Ver seguimiento interactivo con aprobaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Ver Tracker</span>
              <span className="sm:hidden">Tracker</span>
            </a>
          )}
          
          {/* Automation Status */}
          {/* automationActive && (
            <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-2 rounded-lg border border-green-200 w-full sm:w-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-700 font-medium">🤖 <span className="hidden sm:inline">Procesamiento automático activo</span><span className="sm:hidden">Auto activo</span></span>
            </div>
          ) */}
        </div>
      </div>
      
      {loading ? (
        <div className="text-black py-8 text-center">Cargando información...</div>
      ) : error ? (
        <div className="text-red-600 font-semibold py-8 text-center">{error}</div>
      ) : payment ? (
        <div className="space-y-6">
          {/* Payment Status Alert */}
          {payment.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-xl">🎉</span>
                <div>
                  <h3 className="text-green-800 font-semibold">¡Pago completado automáticamente!</h3>
                  <p className="text-green-700 text-sm">Este pago fue procesado completamente por el sistema de automatización.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-black text-sm sm:text-base">ID del pago:</span> 
              <span className="font-mono text-black bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm break-all">{payment?.id ?? '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-semibold text-black text-sm sm:text-base">Estado:</span> 
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${getStatusDisplay(payment?.status).color}`}>
                <span>{getStatusDisplay(payment?.status).icon}</span>
                {getStatusDisplay(payment?.status).label}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <span className="font-semibold text-black text-sm sm:text-base">Pagador:</span> 
              <span className="text-black text-sm sm:text-base break-all">{payment?.payer_email && payment?.payer_email !== '-' ? payment.payer_email : (typeof window !== 'undefined' ? localStorage.getItem('email') : '-')}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <span className="font-semibold text-black text-sm sm:text-base">Receptor:</span> 
              <span className="text-black text-sm sm:text-base break-all">{payment?.recipient_email ?? '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-black text-sm sm:text-base">Monto:</span> 
              <span className="text-black font-bold text-lg sm:text-xl">{payment ? getDisplayAmount(payment.amount) : '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <span className="font-semibold text-black text-sm sm:text-base">Descripción:</span> 
              <span className="text-black text-sm sm:text-base">{payment?.description ?? 'Sin descripción'}</span>
            </div>
          </div>
          {/* Condiciones de pago */}
          {payment.status !== 'completed' && (
          <div className="mt-4 sm:mt-6 bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-100">
            <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-3">Condiciones de pago</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-yellow-700 text-xs sm:text-sm">CLABE de depósito del vendedor:</span>
                <span className="bg-yellow-100 px-2 py-1 rounded text-yellow-900 font-mono text-xs sm:text-sm break-all">{payment?.deposit_clabe || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-semibold text-black text-xs sm:text-sm">Monto total del pago:</span>
                <span className="text-xs sm:text-sm">{payment ? getDisplayAmount(payment.amount) : '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-semibold text-black text-xs sm:text-sm">Porcentaje en custodia:</span>
                <span className="text-xs sm:text-sm">{payment?.escrow?.custody_percent !== undefined && payment?.escrow?.custody_percent !== null && !isNaN(Number(payment?.escrow?.custody_percent)) ? `${Number(payment.escrow.custody_percent).toFixed(2)}%` : '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-semibold text-black text-xs sm:text-sm">Días en custodia:</span>
                <span className="text-xs sm:text-sm">{payment?.escrow?.custody_end && payment?.escrow?.created_at ? (() => {
                  const end = typeof payment.escrow?.custody_end === 'string' ? new Date(payment.escrow.custody_end) : null;
                  const start = typeof payment.escrow?.created_at === 'string' ? new Date(payment.escrow.created_at) : null;
                  if (end && start) {
                    // Calculate difference in milliseconds, then convert to days
                    const diffMs = end.getTime() - start.getTime();
                    const diffDays = diffMs / (1000 * 60 * 60 * 24);
                    // Use Math.ceil to ensure we never show 0 for periods >= 1 day
                    // and Math.max to ensure minimum of 1 day is shown
                    return Math.max(1, Math.ceil(diffDays));
                  }
                  return '-';
                })() : '-'}</span>
              </div>
              {payment?.escrow?.custody_end && (
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <span className="font-semibold text-black text-xs sm:text-sm">Fin de custodia:</span>
                  <span className="text-xs sm:text-sm">
                    {new Date(payment.escrow.custody_end).toLocaleString('es-MX')}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-semibold text-black text-xs sm:text-sm">Monto a mantener en custodia:</span>
                <span className="text-xs sm:text-sm">{payment?.escrow?.custody_amount !== undefined && payment?.escrow?.custody_amount !== null ? getDisplayAmount(payment.escrow.custody_amount) : '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-semibold text-black text-xs sm:text-sm">Monto por pagar:</span>
                <span className="text-xs sm:text-sm">{getDisplayAmount(calculateMontoPorPagar(payment, paymentEvents))}</span>
              </div>
            </div>
          </div>
          )}
          
          {/* Payment Breakdown */}
          {payment && payment.escrow && (() => {
            const breakdown = calculatePaymentBreakdown(payment, paymentEvents);
            return (
              <div className="mt-4 sm:mt-6 bg-green-50 rounded-xl p-3 sm:p-4 border border-green-100">
                <h3 className="text-sm sm:text-base font-bold text-green-900 mb-3">Desglose de Pagos</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="font-semibold text-black text-xs sm:text-sm">Monto Total:</span>
                    <span className="font-bold text-base sm:text-lg text-black">{getDisplayAmount(breakdown.totalAmount)}</span>
                  </div>
                  <div className="h-px bg-green-200 my-2"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Ya pagado al vendedor:</span>
                    <span className={`font-semibold text-sm sm:text-base ${breakdown.paidAmount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {getDisplayAmount(breakdown.paidAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">En custodia:</span>
                    <span className={`font-semibold text-sm sm:text-base ${breakdown.custodyAmount > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                      {getDisplayAmount(breakdown.custodyAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Pendiente por pagar:</span>
                    <span className={`font-semibold text-sm sm:text-base ${breakdown.totalAmount - breakdown.paidAmount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                      {getDisplayAmount(breakdown.totalAmount - breakdown.paidAmount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* QR y Timeline solo en modo pantalla, no en printout */}
          {!showQrInPrintout && (
            <>
              {payment?.id && payment?.hmac && (
                <div className="flex flex-col items-center mt-6 sm:mt-8">
                  <QRCode value={`https://kustodia.mx/verify?payment=${payment.id}&hmac=${payment.hmac}`} size={100} className="sm:w-[120px] sm:h-[120px]" />
                  <div className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-4">Escanea para verificar la autenticidad y estado en tiempo real</div>
                </div>
              )}
              <div className="flex flex-col mt-4 sm:mt-6">
                <PaymentTimeline paymentId={payment?.id?.toString() ?? ''} />
              </div>
            </>
          )}
        </div>
      ) : null}
      {showPrintButton && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="dispute-print-btn print-button"
            onClick={() => handlePrint()}
          >
            Imprimir
          </button>
        </div>
      )}
      {/* Dispute Button and Modal */}
      {payment && payment.status !== 'completed' && payment.escrow && (() => {
        const now = new Date();
        const custodyEnd = payment.escrow.custody_end ? new Date(payment.escrow.custody_end) : null;
        const hasNoDualApproval = !payment.payer_approval || !payment.payee_approval;
        const custodyExpired = custodyEnd && now > custodyEnd;
        
        // Allow disputes if:
        // 1. Before custody end, OR
        // 2. After custody end but no dual approval occurred (likely disagreement)
        const canRaise = ['funded', 'in_progress', 'en_custodia', 'escrowed'].includes(payment.status) &&
          ['pending', 'active', 'funded'].includes(payment.escrow.status ?? '') &&
          (payment.escrow.dispute_status === 'none' || payment.escrow.dispute_status === 'dismissed') &&
          (!custodyEnd || now < custodyEnd || (custodyExpired && hasNoDualApproval));
        const canReapply = payment.escrow.dispute_status === 'dismissed' && (!custodyEnd || now < custodyEnd);
        const hasActiveDispute = payment.escrow.dispute_status && ['pending', 'approved', 'rejected'].includes(payment.escrow.dispute_status);
        
        return (
          <>
            <div className="flex justify-center mt-8 mb-0 gap-3">
              {canRaise && (
                <button
                  className="dispute-print-btn"
                  onClick={() => setShowDispute(true)}
                >
                  {payment.escrow.dispute_status === 'none' ? 'Levantar disputa' : 'Reaplicar disputa'}
                </button>
              )}
              {hasActiveDispute && (
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  onClick={() => setShowDisputeMessages(true)}
                >
                  💬 Ver mensajes de disputa
                </button>
              )}
            </div>
            {showDispute && payment.escrow.id && (
              <DisputeModal
                escrowId={payment.escrow.id}
                onClose={() => setShowDispute(false)}
                canReapply={canReapply}
              />
            )}
            {showDisputeMessages && payment.escrow.id && (
              <DisputeMessagingModal
                escrowId={payment.escrow.id}
                isOpen={showDisputeMessages}
                onClose={() => setShowDisputeMessages(false)}
              />
            )}
          </>
        );
      })()}
    </div>
  );
}
