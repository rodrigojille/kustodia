"use client";
import { useEffect, useState } from "react";

function getDisplayAmount(amount: number | string) {
  return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function getStatusDisplay(status: string) {
  const statusMap: { [key: string]: { label: string; color: string; icon: string } } = {
    'pending': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    'processing': { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: '⚡' },
    'funded': { label: 'Financiado', color: 'bg-green-100 text-green-800', icon: '💰' },
    'paid': { label: 'Pagado', color: 'bg-indigo-100 text-indigo-800', icon: '✅' },
    'completed': { label: 'Completado', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
    'disputed': { label: 'En disputa', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    'cancelled': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: '❌' }
  };
  
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '🔔' };
}

import PaymentTimeline from "./PaymentTimeline";
import QRCode from "qrcode.react";
import ClabeSection from "./ClabeSection";
import DisputeModal from "./DisputeModal";

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
  escrow?: Escrow;
  hmac?: string; // <-- Para evitar error TS al acceder a payment.hmac
  payment_type?: string; // Add payment type for tracker routing
};

import './PaymentDetailClient.css';

export default function PaymentDetailClient({ id, onLoaded, showQrInPrintout = false }: { id: string, onLoaded?: () => void, showQrInPrintout?: boolean }) {
  const [showDispute, setShowDispute] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automationActive, setAutomationActive] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Load payment details
    fetch(`/api/payments/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
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

    // Check automation status
    fetch('http://localhost:4000/api/automation/status')
      .then(res => res.json())
      .then(data => {
        setAutomationActive(data.success && data.status === 'running');
      })
      .catch(() => {
        setAutomationActive(false);
      });
  }, [id]);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 w-full max-w-4xl mx-auto my-4 md:my-10 text-black px-2 sm:px-6 md:px-12 py-4 md:py-8" style={{ boxSizing: 'border-box', color: '#000' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Detalle del pago</h1>
        <div className="flex items-center gap-3">
          {/* Interactive Tracker Button for nuevo-flujo payments */}
          {payment?.payment_type === 'nuevo_flujo' && (
            <a
              href={`/dashboard/pagos/${payment.id}/tracker`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
              title="Ver seguimiento interactivo con aprobaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Tracker
            </a>
          )}
          
          {/* Automation Status */}
          {automationActive && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">🤖 Procesamiento automático activo</span>
            </div>
          )}
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
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-black">ID del pago:</span> 
              <span className="font-mono text-black bg-gray-100 px-2 py-1 rounded ml-2">{payment?.id ?? '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-black">Estado:</span> 
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusDisplay(payment?.status).color}`}>
                <span>{getStatusDisplay(payment?.status).icon}</span>
                {getStatusDisplay(payment?.status).label}
              </span>
            </div>
            <div>
              <span className="font-semibold text-black">Pagador:</span> 
              <span className="text-black ml-2">{payment?.payer_email && payment?.payer_email !== '-' ? payment.payer_email : (typeof window !== 'undefined' ? localStorage.getItem('email') : '-')}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Receptor:</span> 
              <span className="text-black ml-2">{payment?.recipient_email ?? '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Monto:</span> 
              <span className="text-black font-bold text-lg ml-2">{payment ? getDisplayAmount(payment.amount) : '-'}</span>
            </div>
            <div>
              <span className="font-semibold text-black">Descripción:</span> 
              <span className="text-black ml-2">{payment?.description ?? 'Sin descripción'}</span>
            </div>
          </div>
          {/* Condiciones de pago */}
          {payment.status !== 'completed' && (
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-base font-bold text-blue-900 mb-2">Condiciones de pago</h3>
            <div>
              <div className="mb-2 text-sm">
                <span className="font-semibold text-yellow-700">CLABE de depósito del vendedor:</span>
                <span className="ml-2 bg-yellow-100 px-2 py-1 rounded text-yellow-900 font-mono">{payment?.deposit_clabe || '-'}</span>
              </div>
              <div className="mb-2 text-sm">
                <span className="font-semibold text-black">Monto total del pago:</span>
                <span className="ml-2">{payment ? getDisplayAmount(payment.amount) : '-'}</span>
              </div>
              <div className="mb-2 text-sm">
                <span className="font-semibold text-black">Porcentaje en custodia:</span>
                <span className="ml-2">{payment?.escrow?.custody_percent !== undefined && payment?.escrow?.custody_percent !== null && !isNaN(Number(payment?.escrow?.custody_percent)) ? `${Number(payment.escrow.custody_percent).toFixed(2)}%` : '-'}</span>
              </div>
              <div className="mb-2 text-sm">
                <span className="font-semibold text-black">Días en custodia:</span>
                <span className="ml-2">{payment?.escrow?.custody_end && payment?.escrow?.created_at ? (() => {
                  const end = typeof payment.escrow?.custody_end === 'string' ? new Date(payment.escrow.custody_end) : null;
                  const start = typeof payment.escrow?.created_at === 'string' ? new Date(payment.escrow.created_at) : null;
                  if (end && start) {
                    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    return diff;
                  }
                  return '-';
                })() : '-'}</span>
              </div>
              {payment?.escrow?.custody_end && (
                <div className="mb-2 text-sm">
                  <span className="font-semibold text-black">Fin de custodia:</span>
                  <span className="ml-2">
                    {new Date(payment.escrow.custody_end).toLocaleString('es-MX')}
                  </span>
                </div>
              )}
              <div className="mb-2 text-sm">
                <span className="font-semibold text-black">Monto a mantener en custodia:</span>
                <span className="ml-2">{payment?.escrow?.custody_amount !== undefined && payment?.escrow?.custody_amount !== null ? getDisplayAmount(payment.escrow.custody_amount) : '-'}</span>
              </div>
              <div className="mb-2 text-sm">
                <span className="font-semibold text-black">Monto por pagar:</span>
                <span className="ml-2">{payment?.escrow?.custody_amount !== undefined && payment?.escrow?.release_amount !== undefined ? getDisplayAmount(Number(payment.escrow.custody_amount) - Number(payment.escrow.release_amount)) : '-'}</span>
              </div>
            </div>
          </div>
          )}
          {/* QR y Timeline solo en modo pantalla, no en printout */}
          {!showQrInPrintout && (
            <>
              {payment?.id && payment?.hmac && (
                <div className="flex flex-col items-center mt-8">
                  <QRCode value={`https://kustodia.mx/verify?payment=${payment.id}&hmac=${payment.hmac}`} size={120} />
                  <div className="mt-2 text-xs text-gray-500 text-center">Escanea para verificar la autenticidad y estado en tiempo real</div>
                </div>
              )}
              <div className="flex flex-col mt-4">
                <PaymentTimeline paymentId={payment?.id?.toString() ?? ''} />
              </div>
            </>
          )}
        </div>
      ) : null}
      <div className="flex justify-center mt-4 print:hidden">
        <button
          type="button"
          className="dispute-print-btn"
          onClick={() => window.print()}
        >
          Imprimir
        </button>
      </div>
      {/* Dispute Button and Modal */}
      {payment && payment.status !== 'completed' && payment.escrow && (() => {
        const now = new Date();
        const custodyEnd = payment.escrow.custody_end ? new Date(payment.escrow.custody_end) : null;
        const canRaise = payment.status === 'funded' &&
          ['pending', 'active', 'funded'].includes(payment.escrow.status ?? '') &&
          (payment.escrow.dispute_status === 'none' || payment.escrow.dispute_status === 'dismissed') &&
          (!custodyEnd || now < custodyEnd);
        const canReapply = payment.escrow.dispute_status === 'dismissed' && (!custodyEnd || now < custodyEnd);
        return (
          <>
            {canRaise && (
              <div className="flex justify-center mt-8 mb-0">
                <button
                  className="dispute-print-btn"
                  onClick={() => setShowDispute(true)}
                >
                  {payment.escrow.dispute_status === 'none' ? 'Levantar disputa' : 'Reaplicar disputa'}
                </button>
              </div>
            )}
            {showDispute && payment.escrow.id && (
              <DisputeModal
                escrowId={payment.escrow.id}
                onClose={() => setShowDispute(false)}
                canReapply={canReapply}
              />
            )}
          </>
        );
      })()}
    </div>
  );
}
