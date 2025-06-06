"use client";
import React, { useState } from "react";

const MOCK_SOPORTE = [
  { id: "t1", fecha: "2025-06-01", estado: "abierto", asunto: "No puedo iniciar sesión" },
  { id: "t2", fecha: "2025-06-02", estado: "cerrado", asunto: "Error en pago" },
  { id: "t3", fecha: "2025-06-03", estado: "en proceso", asunto: "Consulta sobre comisión" },
];

export default function SoporteTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filtered = MOCK_SOPORTE.filter(t =>
    (!search || t.asunto.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search)) &&
    (!status || t.estado === status)
  );
  function exportCSV() {
    const headers = ["Fecha", "ID", "Estado", "Asunto"];
    const rows = filtered.map(t => [t.fecha, t.id, t.estado, t.asunto]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soporte.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap gap-2 mb-3">
        <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-2 py-1 text-sm w-40 focus:ring-2 focus:ring-blue-300" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 text-sm w-32 focus:ring-2 focus:ring-blue-300">
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="en proceso">En proceso</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button onClick={exportCSV} className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:bg-blue-700 transition">Exportar CSV</button>
      </div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left bg-accent text-primary-dark">
            <th className="py-2 px-2">Fecha</th>
            <th className="py-2 px-2">ID</th>
            <th className="py-2 px-2">Estado</th>
            <th className="py-2 px-2">Asunto</th>
            <th className="py-2 px-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id} className="border-t hover:bg-accent-light/50">
              <td className="py-2 px-2 whitespace-nowrap">{t.fecha}</td>
              <td className="py-2 px-2 whitespace-nowrap">{t.id}</td>
              <td className="py-2 px-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${t.estado === 'cerrado' ? 'bg-green-100 text-green-700' : t.estado === 'en proceso' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{t.estado}</span>
              </td>
              <td className="py-2 px-2 max-w-[160px] truncate" title={t.asunto}>{t.asunto}</td>
              <td className="py-2 px-2">
                <button className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 text-blue-700 font-medium text-xs" title="Ver detalle">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
