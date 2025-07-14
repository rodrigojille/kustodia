"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import fetchPayments from "../fetchPayments";
import AutomationStatus from "./AutomationStatus";
import { getStatusConfig, PAYMENT_STATUSES } from '../config/paymentStatuses';
import { authFetch } from '../utils/authFetch';
import DisputeModal from './DisputeModal';

function getDisplayAmount(amount: number | string, currency: string | undefined) {
  return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function getStatusDisplay(status: string) {
  const config = getStatusConfig(status);
  return { label: config.spanish, color: config.textClass, icon: config.icon };
}

type Payment = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  payer_email?: string;
  recipient_email?: string;
  seller_email?: string; 
  description?: string;
  payment_type?: string;
  payer_approval?: boolean;
  payee_approval?: boolean;
  escrow?: {
    id: number;
    status: string;
    dispute_status: string;
    custody_end?: string;
  };
};

function PaymentsTableContent() {
  const searchParams = useSearchParams();
  const statusFilters = searchParams.getAll('status');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [automationActive, setAutomationActive] = useState(false);
  const [activeDisputePayment, setActiveDisputePayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments()
      .then(setPayments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Check automation status
    authFetch('automation/status')
      .then(res => res.json())
      .then(data => {
        setAutomationActive(data.success && data.status === 'running');
      })
      .catch(() => {
        setAutomationActive(false);
      });
  }, []);

  // Filtro avanzado
  const filtered = payments.filter((p) => {
    const matchesSearch =
      !search ||
      (p.payer_email && p.payer_email.toLowerCase().includes(search.toLowerCase())) ||
      (p.recipient_email && p.recipient_email.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);

    const created = new Date(p.created_at);
    const matchesFrom = !dateFrom || created >= new Date(dateFrom);
    const matchesTo = !dateTo || created <= new Date(dateTo);
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  // Exportar CSV
  function exportCSV() {
    const headers = [
      'Fecha', 'Pagador', 'Receptor', 'Monto', 'Estado', 'Descripción'
    ];
    const rows = filtered.map((p) => [
      new Date(p.created_at).toLocaleDateString(),
      p.payer_email || '-',
      p.recipient_email || '-',
      Number(p.amount).toLocaleString('es-MX', { style: 'currency', currency: p.currency || 'MXN' }),
      getStatusDisplay(p.status).label,
      p.description || '-'
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pagos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-lg shadow p-2 sm:p-4 overflow-x-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="text-lg font-bold text-black">Últimos pagos</h3>
          <AutomationStatus compact={true} />
        </div>
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:bg-blue-700 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Automation Status Alert */}
      {!automationActive && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-600">⚠️</span>
            <div>
              <p className="text-orange-800 font-medium text-sm">Sistema de automatización inactivo</p>
              <p className="text-orange-700 text-xs">Los pagos pueden requerir procesamiento manual.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar email, descripción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-40 focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-32 focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Todos los estados</option>
          {Object.values(PAYMENT_STATUSES).map(config => (
            <option key={config.key} value={config.key}>
              {config.spanish}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-36 focus:ring-2 focus:ring-blue-300"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-36 focus:ring-2 focus:ring-blue-300"
        />
      </div>
      {loading ? (
        <div className="text-sm text-black">Cargando...</div>
      ) : error ? (
        <div className="text-sm text-red-500">Error: {error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-black">No hay pagos.</div>
      ) : (
        <div className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-accent text-primary-dark">
                <th className="py-2 px-2 text-black">Fecha</th>
                <th className="py-2 px-2 text-black">Pagador</th>
                <th className="py-2 px-2 text-black">Receptor</th>
                <th className="py-2 px-2 text-black">Monto</th>
                <th className="py-2 px-2 text-black">Estado</th>
                <th className="py-2 px-2 text-black">Descripción</th>
                <th className="py-2 px-2 text-black">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-accent-light/50 text-black">
                  <td className="py-2 px-2 text-black whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-2 text-black whitespace-nowrap">{p.payer_email || '-'}</td>
                  <td className="py-2 px-2 text-black whitespace-nowrap">{p.recipient_email || '-'}</td>
                  <td className="py-2 px-2 text-black whitespace-nowrap">
                    {getDisplayAmount(p.amount, p.currency)}
                  </td>
                  <td className="py-2 px-2 text-black">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getStatusDisplay(p.status).color}`}>
                      <span>{getStatusDisplay(p.status).icon}</span>
                      {getStatusDisplay(p.status).label}
                    </span>
                    {automationActive && ['funded', 'escrowed', 'completed'].includes(p.status) && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-50 text-green-600 border border-green-200">
                          <span className="text-xs">🤖</span>
                          Auto
                        </span>
                      </div>
                    )}
                    {/* Custody Expiration Warning */}
                    {(() => {
                      if (!p.escrow || p.status === 'completed') return null;
                      const now = new Date();
                      const custodyEnd = p.escrow.custody_end ? new Date(p.escrow.custody_end) : null;
                      const hasNoDualApproval = !p.payer_approval || !p.payee_approval;
                      const custodyExpired = custodyEnd && now > custodyEnd;
                      
                      if (!custodyExpired || !hasNoDualApproval) return null;
                      
                      return (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-orange-50 text-orange-700 border border-orange-200" title="El plazo de custodia ha expirado sin aprobación dual">
                            <span className="text-xs">⚠️</span>
                            Custodia expirada
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="py-2 px-2 text-black max-w-[160px] truncate" title={p.description || ''}>{p.description || '-'}</td>
                  <td className="py-2 px-2 text-black">
                    <div className="flex items-center gap-1">
                      {/* Traditional Payment Detail Link */}
                      <a
                        href={`/pagos/${p.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 text-blue-700 font-medium text-xs"
                        title="Ver detalle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Detalle
                      </a>
                      
                      {/* Interactive Tracker for nuevo-flujo payments only */}
                      {p.payment_type === 'nuevo_flujo' && (
                        <a
                          href={`/dashboard/pagos/${p.id}/tracker`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-green-100 text-green-700 font-medium text-xs"
                          title="Seguimiento interactivo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Tracker
                        </a>
                      )}
                      
                      {/* Dispute button for escrowed payments */}
                      {(() => {
                        if (!p.escrow) return null;
                        const now = new Date();
                        const custodyEnd = p.escrow.custody_end ? new Date(p.escrow.custody_end) : null;
                        const hasNoDualApproval = !p.payer_approval || !p.payee_approval;
                        const custodyExpired = custodyEnd && now > custodyEnd;
                        
                        // Allow disputes if:
                        // 1. Before custody end, OR
                        // 2. After custody end but no dual approval occurred (likely disagreement)
                        const canRaise = ['funded', 'in_progress', 'en_custodia', 'escrowed'].includes(p.status) &&
                          ['pending', 'active', 'funded'].includes(p.escrow.status ?? '') &&
                          (p.escrow.dispute_status === 'none' || p.escrow.dispute_status === 'dismissed') &&
                          (!custodyEnd || now < custodyEnd || (custodyExpired && hasNoDualApproval));
                        
                        if (!canRaise) return null;
                        
                        return (
                          <button
                            onClick={() => setActiveDisputePayment(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-100 text-orange-700 font-medium text-xs"
                            title="Levantar disputa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.054 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                            Disputa
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="border-t bg-gray-50 font-bold">
                <td className="py-2 px-2 text-right" colSpan={3}>Total:</td>
                <td className="py-2 px-2 text-black">
                  {getDisplayAmount(filtered.reduce((sum, p) => sum + Number(p.amount), 0), filtered[0]?.currency)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {/* Dispute Modal */}
      {activeDisputePayment && activeDisputePayment.escrow && (
        <DisputeModal
          escrowId={activeDisputePayment.escrow.id}
          onClose={() => setActiveDisputePayment(null)}
          canReapply={activeDisputePayment.escrow.dispute_status === 'dismissed'}
        />
      )}
    </div>
  );
}

// Wrap the component in Suspense to use useSearchParams
export default function PaymentsTable() {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <PaymentsTableContent />
    </Suspense>
  );
}
