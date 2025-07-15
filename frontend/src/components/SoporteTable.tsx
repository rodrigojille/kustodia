"use client";
import React, { useState, useEffect } from "react";
import authFetch from '../utils/authFetch';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface SoporteTableProps {
  onViewTicketDetails?: (ticketId: string) => void;
}

const SoporteTable: React.FC<SoporteTableProps> = ({ onViewTicketDetails }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets from admin API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log('[SOPORTE] Fetching admin tickets...');
      
      const response = await authFetch('admin/tickets');
      
      if (response.ok) {
        const data = await response.json();
        console.log('[SOPORTE] Tickets fetched:', data);
        setTickets(data);
        setError(null);
      } else {
        console.error('[SOPORTE] Failed to fetch tickets:', response.status);
        setError(`Error ${response.status}: No se pudieron cargar los tickets`);
      }
    } catch (err) {
      console.error('[SOPORTE] Error fetching tickets:', err);
      setError('Error de conexión al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Map status to Spanish
  const getStatusInSpanish = (status: string) => {
    const statusMap: Record<string, string> = {
      'OPEN': 'abierto',
      'CLOSED': 'cerrado',
      'IN_PROGRESS': 'en proceso'
    };
    return statusMap[status] || status.toLowerCase();
  };

  const filtered = tickets.filter(t => {
    const statusSpanish = getStatusInSpanish(t.status);
    return (
      (!search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search)) &&
      (!status || statusSpanish === status)
    );
  });
  function exportCSV() {
    const headers = ["Fecha", "ID", "Estado", "Asunto", "Usuario"];
    const rows = filtered.map(t => [
      formatDate(t.createdAt), 
      t.id, 
      getStatusInSpanish(t.status), 
      t.subject,
      t.user.email
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soporte.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar tickets</h3>
            <div className="mt-1 text-sm text-red-700">{error}</div>
            <div className="mt-3">
              <button 
                onClick={fetchTickets}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-semibold transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap gap-2 mb-3">
        <input 
          type="text" 
          placeholder="Buscar..." 
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
          <option value="abierto">Abierto</option>
          <option value="en proceso">En proceso</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button 
          onClick={exportCSV} 
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:bg-blue-700 transition"
          disabled={filtered.length === 0}
        >
          Exportar CSV ({filtered.length})
        </button>
        <button 
          onClick={fetchTickets} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold transition"
          title="Recargar tickets"
        >
          🔄 Recargar
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {tickets.length === 0 ? '📭 No hay tickets de soporte' : '🔍 No se encontraron tickets con los filtros aplicados'}
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-accent text-primary-dark">
              <th className="py-2 px-2">Fecha</th>
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Usuario</th>
              <th className="py-2 px-2">Estado</th>
              <th className="py-2 px-2">Asunto</th>
              <th className="py-2 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const statusSpanish = getStatusInSpanish(t.status);
              return (
                <tr key={t.id} className="border-t hover:bg-accent-light/50">
                  <td className="py-2 px-2 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                  <td className="py-2 px-2 whitespace-nowrap font-mono text-xs">{t.id.substring(0, 8)}...</td>
                  <td className="py-2 px-2">
                    <div className="max-w-[120px] truncate" title={t.user.email}>
                      {t.user.name || t.user.email}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      statusSpanish === 'cerrado' ? 'bg-green-100 text-green-700' : 
                      statusSpanish === 'en proceso' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {statusSpanish}
                    </span>
                  </td>
                  <td className="py-2 px-2 max-w-[200px] truncate" title={t.subject}>{t.subject}</td>
                  <td className="py-2 px-2">
                    <button 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 text-blue-700 font-medium text-xs" 
                      title="Ver detalle"
                      onClick={() => {
                        if (onViewTicketDetails) {
                          onViewTicketDetails(t.id);
                        } else {
                          console.log('Ver ticket:', t.id);
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SoporteTable;
