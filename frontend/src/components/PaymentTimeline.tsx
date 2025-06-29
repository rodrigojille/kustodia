"use client";
import { useEffect, useState } from "react";

export type PaymentEvent = {
  id: number;
  type: string;
  description?: string;
  created_at: string;
};

function getEventStyle(type: string) {
  switch (type) {
    // Original English events
    case "initiated":
      return { color: "bg-blue-100 text-blue-800", icon: "🚀", label: "Pago iniciado" };
    case "custody_created":
      return { color: "bg-green-100 text-green-800", icon: "🔒", label: "Custodia creada" };
    case "deposit_received":
      return { color: "bg-blue-100 text-blue-800", icon: "💰", label: "Depósito recibido" };
    case "redemption_initiated":
      return { color: "bg-yellow-100 text-yellow-800", icon: "🔄", label: "Redención iniciada" };
    case "redemption_failed":
      return { color: "bg-red-100 text-red-700", icon: "❌", label: "Error en redención" };
    case "redemption_successful":
      return { color: "bg-green-100 text-green-800", icon: "✅", label: "Redención exitosa" };
    case "completed":
      return { color: "bg-blue-100 text-blue-800", icon: "🎉", label: "Pago completado" };
    
    // New Spanish automation events
    case "iniciado":
      return { color: "bg-blue-100 text-blue-800", icon: "🚀", label: "Pago iniciado" };
    case "deposito_detectado":
      return { color: "bg-green-100 text-green-800", icon: "💰", label: "Depósito detectado automáticamente" };
    case "deposito_procesado":
      return { color: "bg-blue-100 text-blue-800", icon: "⚡", label: "Depósito procesado" };
    case "escrow_creado":
      return { color: "bg-purple-100 text-purple-800", icon: "🔐", label: "Custodia creada en blockchain" };
    case "custodia_activa":
      return { color: "bg-indigo-100 text-indigo-800", icon: "🛡️", label: "Custodia activa" };
    case "custodia_liberada":
      return { color: "bg-green-100 text-green-800", icon: "🔓", label: "Custodia liberada automáticamente" };
    case "mxnb_redimido":
      return { color: "bg-orange-100 text-orange-800", icon: "🪙", label: "MXNB redimido a MXN" };
    case "spei_enviado":
      return { color: "bg-cyan-100 text-cyan-800", icon: "🏦", label: "SPEI enviado" };
    case "spei_completado":
      return { color: "bg-green-100 text-green-800", icon: "✅", label: "SPEI completado" };
    case "pago_completado":
      return { color: "bg-emerald-100 text-emerald-800", icon: "🎉", label: "Pago completado automáticamente" };
    case "estado_sincronizado":
      return { color: "bg-gray-100 text-gray-800", icon: "🔄", label: "Estado sincronizado con blockchain" };
    case "error_automatico":
      return { color: "bg-red-100 text-red-700", icon: "⚠️", label: "Error en procesamiento automático" };
    
    // Default case
    default:
      return { color: "bg-gray-200 text-gray-800", icon: "🔔", label: "Evento del sistema" };
  }
}

export default function PaymentTimeline({ paymentId }: { paymentId: string }) {
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automationActive, setAutomationActive] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Load payment events
    fetch(`http://localhost:4000/api/payments/${paymentId}/events`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    })
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(err => {
        setError("No se pudo cargar la línea de tiempo");
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
  }, [paymentId]);

  if (loading) {
    return <div className="text-gray-400 py-4 text-center">Cargando línea de tiempo...</div>;
  }
  if (error) {
    return <div className="text-red-600 font-semibold py-4 text-center">{error}</div>;
  }
  if (!events.length) {
    return <div className="text-gray-500 py-4 text-center">Sin eventos para este pago.</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">Línea de tiempo:</h3>
        {automationActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Automatización activa</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {events.map(ev => {
          const style = getEventStyle(ev.type);
          
          // Enhanced description handling
          let desc = ev.description || style.label;
          let isError = ev.type === "redemption_failed" || ev.type === "error_automatico" || 
                       desc.toLowerCase().includes("error") || desc.toLowerCase().includes("fail");
          
          // Show automation badge for automated events
          const isAutomated = [
            'deposito_detectado', 'custodia_liberada', 'mxnb_redimido', 
            'spei_enviado', 'spei_completado', 'pago_completado', 'estado_sincronizado'
          ].includes(ev.type);

          // Try to extract a user-friendly error message (JSON or text)
          if (isError && desc.length > 120) {
            try {
              const parsed = JSON.parse(desc);
              desc = parsed.message || parsed.error || desc.slice(0, 120) + '...';
            } catch {
              desc = desc.slice(0, 120) + '...';
            }
          }

          return (
            <div key={ev.id} className={`flex items-start gap-3 ${isError ? 'bg-red-50' : ''} rounded-lg p-3 border ${isError ? 'border-red-200' : 'border-gray-100'}`}>
              <span className={`inline-block text-2xl mt-1 ${isAutomated ? 'animate-pulse' : ''}`}>{style.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${style.color}`}>
                    {style.label}
                  </span>
                  {isAutomated && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium">
                      🤖 Automático
                    </span>
                  )}
                </div>
                {desc !== style.label && (
                  <div className="text-sm text-gray-600 mb-1">{desc}</div>
                )}
                <div className="text-gray-400 text-xs">
                  {new Date(ev.created_at).toLocaleString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
