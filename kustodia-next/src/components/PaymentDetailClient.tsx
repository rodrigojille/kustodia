"use client";
import { useEffect, useState } from "react";

import PaymentTimeline from "./PaymentTimeline";
import ClabeSection from "./ClabeSection";

type Escrow = {
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
};

export default function PaymentDetailClient({ id }: { id: string }) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(`/api/payments/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el pago');
        return res.json();
      })
      .then(data => {
        setPayment(data.payment || null);
        setLoading(false);
      })
      .catch(err => {
        setError('No se pudo cargar el pago');
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 w-full max-w-4xl mx-auto my-4 md:my-10 text-black px-2 sm:px-6 md:px-12 py-4 md:py-8" style={{ boxSizing: 'border-box', color: '#000' }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-black text-center">Detalle del pago</h1>
      {loading ? (
        <div className="text-black py-8 text-center">Cargando información...</div>
      ) : error ? (
        <div className="text-red-600 font-semibold py-8 text-center">{error}</div>
      ) : payment ? (
        <div className="space-y-4">
          <div>
            {/* Payment info and conditions */}
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-black">ID del pago:</span> <span className="font-mono text-black bg-gray-100 px-2 py-1 rounded">{payment?.id ?? '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-black">Estado:</span> <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800">{payment?.status === 'pending' ? 'Pendiente' : payment?.status ?? '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-black">Pagador:</span> <span className="text-black">{payment?.payer_email ?? '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-black">Receptor:</span> <span className="text-black">{payment?.recipient_email ?? '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-black">Monto:</span> <span className="text-black font-bold">{payment ? `$${Number(payment.amount).toLocaleString('es-MX', { style: 'currency', currency: payment.currency })}` : '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-black">Descripción:</span> <span className="text-black">{payment?.description ?? '-'}</span>
              </div>
              {/* Condiciones de pago */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-base font-bold text-blue-900 mb-2">Condiciones de pago</h3>
                <div>
                  <div className="mb-2 text-sm">
                    <span className="font-semibold text-yellow-700">CLABE de depósito del vendedor:</span>
                    <span className="ml-2 bg-yellow-100 px-2 py-1 rounded text-yellow-900 font-mono">{payment?.deposit_clabe || '-'}</span>
                  </div>
                  <div className="mb-2 text-sm">
                    <span className="font-semibold text-green-900">CLABE de retiro del vendedor:</span>
                    <span className="ml-2 bg-green-100 px-2 py-1 rounded text-green-900 font-mono">{payment?.payout_clabe || '-'}</span>
                  </div>
                  <div className="mb-2 text-sm">
                    <span className="font-semibold text-blue-900">Correo del destinatario:</span>
                    <span className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-900">{payment?.recipient_email || '-'}</span>
                  </div>
                  <div className="mb-2 text-sm">
                    <span className="font-semibold text-black">Monto total del pago:</span>
                    <span className="ml-2">{payment ? `$${Number(payment.amount).toLocaleString('es-MX', { style: 'currency', currency: payment.currency })}` : '-'}</span>
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
                  <div className="mb-2 text-sm">
                    <span className="font-semibold text-black">Monto a mantener en custodia:</span>
                    <span className="ml-2">{payment?.escrow?.custody_amount !== undefined && payment?.escrow?.custody_amount !== null ? Number(payment.escrow.custody_amount).toLocaleString('es-MX', { style: 'currency', currency: payment.currency }) : '-'}</span>
                  </div>
                  <div className="mb-2 text-sm">
                    <span className="font-semibold text-black">Monto por pagar:</span>
                    <span className="ml-2">{payment?.escrow?.release_amount !== undefined && payment?.escrow?.release_amount !== null ? Number(payment.escrow.release_amount).toLocaleString('es-MX', { style: 'currency', currency: payment.currency }) : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Timeline */}
            <div className="flex flex-col">
              <span className="font-semibold text-black mb-2">Línea de tiempo:</span>
              <PaymentTimeline paymentId={payment?.id?.toString() ?? ''} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
