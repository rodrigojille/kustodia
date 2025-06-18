"use client";
import { useEffect, useState } from "react";
import { fetchPayments } from "../fetchPayments";

function getDisplayAmount(amount: number | string, currency: string | undefined) {
  // Siempre mostrar como pesos mexicanos, sin importar el token
  return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

type Payment = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  payer_email?: string;
  recipient_email?: string;
  description?: string;
};


export default function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchPayments()
      .then(setPayments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtro avanzado
  const filtered = payments.filter((p) => {
    const matchesSearch =
      !search ||
      (p.payer_email && p.payer_email.toLowerCase().includes(search.toLowerCase())) ||
      (p.recipient_email && p.recipient_email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !status || p.status === status;
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
      p.status === 'funded' ? 'En progreso' : p.status === 'dispute' ? 'En disputa' : p.status,
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <h3 className="text-lg font-bold text-black mb-2">Últimos pagos</h3>
        <button
          onClick={exportCSV}
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:bg-blue-700 transition"
        >
          Exportar CSV
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar email..."
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
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
          <option value="requested">Solicitado</option>
          <option value="funded">Fondeado</option>
          <option value="in_dispute">En disputa</option>
          <option value="cancelled">Cancelado</option>
          <option value="refunded">Reembolsado</option>
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
                    <span className={
                      `inline-block px-2 py-1 rounded text-xs font-bold ` +
                      (p.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : p.status === 'requested'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'funded'
                        ? 'bg-blue-100 text-blue-700'
                        : p.status === 'in_dispute'
                        ? 'bg-red-100 text-red-700'
                        : p.status === 'cancelled'
                        ? 'bg-gray-100 text-gray-600'
                        : p.status === 'refunded'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600')
                    }>
                      {p.status === 'paid' ? 'Pagado' :
                       p.status === 'pending' ? 'Pendiente' :
                       p.status === 'requested' ? 'Solicitado' :
                       p.status === 'funded' ? 'Fondeado' :
                       p.status === 'in_dispute' ? 'En disputa' :
                       p.status === 'cancelled' ? 'Cancelado' :
                       p.status === 'refunded' ? 'Reembolsado' :
                       p.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-black max-w-[160px] truncate" title={p.description || ''}>{p.description || '-'}</td>
                  <td className="py-2 px-2 text-black">
                    <a
                      href={`/pagos/${p.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 text-blue-700 font-medium text-xs"
                      title="Ver detalle"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Detalle
                    </a>
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
    </div>
  );
}
