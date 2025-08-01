"use client";
import React, { useState, useEffect } from "react";
import { authFetch } from '../utils/authFetch';

export type PaymentEvent = {
  id: number;
  type: string;
  description?: string;
  created_at: string;
};

function getEventStyle(type: string) {
  switch (type) {
    // Payment initiation
    case "initiated":
    case "iniciado":
      return { color: "bg-blue-100 text-blue-800", icon: "🚀", label: "Pago iniciado" };
    
    // Deposit events
    case "deposit_received":
    case "deposito_detectado":
    case "deposito_procesado":
      return { color: "bg-green-100 text-green-800", icon: "💰", label: "Depósito detectado automáticamente" };
    
    // Escrow/Custody events
    case "custody_created":
    case "escrow_creado":
    case "escrow_created":
      return { color: "bg-purple-100 text-purple-800", icon: "🔐", label: "Custodia creada en blockchain" };
    case "starting_escrow_creation":
    case "escrow_creation_started":
      return { color: "bg-yellow-100 text-yellow-800", icon: "⚙️", label: "Creando escrow" };
    case "starting escrow creation":
    case "escrow_creation_initiated":
      return { color: "bg-indigo-100 text-indigo-800", icon: "⭐", label: "Creación de custodia" };
    case "custodia_activa":
      return { color: "bg-indigo-100 text-indigo-800", icon: "🛡️", label: "Custodia activa" };
    case "custodia_liberada":
    case "custody_released":
      return { color: "bg-green-100 text-green-800", icon: "🔓", label: "Custodia liberada" };
    
    // Redemption events
    case "redemption_initiated":
      return { color: "bg-yellow-100 text-yellow-800", icon: "🔄", label: "Redención iniciada" };
    case "redemption_successful":
    case "seller_redemption":
      return { color: "bg-green-100 text-green-800", icon: "✅", label: "Redención exitosa" };
    case "redemption_failed":
      return { color: "bg-red-100 text-red-700", icon: "❌", label: "Error en redención" };
    case "mxnb_redimido":
      return { color: "bg-orange-100 text-orange-800", icon: "🪙", label: "MXNB redimido a MXN" };
    
    // SPEI events
    case "spei_enviado":
    case "spei_sent":
    case "payout_processed":
    case "spei_redemption_initiated":
      return { color: "bg-cyan-100 text-cyan-800", icon: "💸", label: "Pago enviado" };
    case "spei_completado":
      return { color: "bg-green-100 text-green-800", icon: "✅", label: "SPEI completado" };
    
    // Completion events
    case "completed":
    case "pago_completado":
      return { color: "bg-emerald-100 text-emerald-800", icon: "🎉", label: "Pago completado" };
    
    // System events
    case "estado_sincronizado":
    case "blockchain_sync":
      return { color: "bg-gray-100 text-gray-800", icon: "🔄", label: "Estado sincronizado" };
    case "error_automatico":
      return { color: "bg-red-100 text-red-700", icon: "⚠️", label: "Error en procesamiento" };
    
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
    // Authentication is handled by authFetch utility via HTTP-only cookies
    // Load payment events
    authFetch(`payments/${paymentId}/events`)
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
    authFetch('automation/status')
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-800">Línea de tiempo:</h3>
        {automationActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Automatización activa</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {events
          .filter(ev => {
            // Filter out MXNB withdrawal events (internal control only)
            const desc = (ev.description || '').toLowerCase();
            return !desc.includes('mxnb withdrawal') && 
                   !desc.includes('withdrawal of') && 
                   !desc.includes('bridge wallet');
          })
          .map(ev => {
          const style = getEventStyle(ev.type);
          
          // Enhanced description handling with Spanish translations
          let desc = ev.description || style.label;
          
          // Translate common English phrases to Spanish
          desc = desc
            .replace(/SPEI redemption of/gi, 'Envío de')
            .replace(/Transaction ID:/gi, 'ID de Transacción:')
            .replace(/Escrow contract created with ID/gi, 'Contrato de custodia creado con ID')
            .replace(/Starting escrow creation for custody amount/gi, 'Iniciando creación de custodia por monto');
          
          let isError = ev.type === "redemption_failed" || ev.type === "error_automatico" || 
                       desc.toLowerCase().includes("error") || desc.toLowerCase().includes("fail");
          
          // Show automation badge for automated events - check both type and description
          const isAutomated = [
            'deposito_detectado', 'custodia_liberada', 'mxnb_redimido', 
            'spei_enviado', 'spei_completado', 'pago_completado', 'estado_sincronizado',
            'escrow_created', 'seller_redemption', 'payout_processed', 'spei_sent',
            'redemption_successful', 'custody_released', 'blockchain_sync',
            'spei_redemption_initiated', 'escrow_creation_initiated'
          ].includes(ev.type) || 
          desc.toLowerCase().includes('automáticamente') ||
          desc.toLowerCase().includes('automatically') ||
          desc.toLowerCase().includes('automatic') ||
          desc.toLowerCase().includes('spei redemption') ||
          desc.toLowerCase().includes('withdrawal of') ||
          desc.toLowerCase().includes('starting escrow');

          // Extract transaction hash for Arbiscan link
          let txHash = null;
          let arbiscanUrl = null;
          let escrowId = null;
          const txHashMatch = desc.match(/Tx: (0x[a-fA-F0-9]{64})/);
          if (txHashMatch) {
            txHash = txHashMatch[1];
            arbiscanUrl = `https://sepolia.arbiscan.io/tx/${txHash}`;
          }
          
          // Extract escrow ID
          const escrowIdMatch = desc.match(/Custodia ([A-Z0-9_]+) creada|ID de custodia: ([A-Z0-9_]+)/);
          if (escrowIdMatch) {
            escrowId = escrowIdMatch[1] || escrowIdMatch[2];
          }

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
            <div key={ev.id} className={`flex items-start gap-2 sm:gap-3 ${isError ? 'bg-red-50' : ''} rounded-lg p-2 sm:p-3 border ${isError ? 'border-red-200' : 'border-gray-100'}`}>
              <span className="inline-block text-xl sm:text-2xl mt-1 flex-shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-full font-semibold text-xs ${style.color} w-fit`}>
                    {style.label}
                  </span>
                  {isAutomated && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-medium w-fit">
                      🤖 <span className="hidden sm:inline">Automático</span><span className="sm:hidden">Auto</span>
                    </span>
                  )}
                </div>
                {desc !== style.label && (
                  <div className="text-xs sm:text-sm text-gray-600 mb-1 break-words">
                    {/* Clean up description by removing technical details we're showing separately */}
                    {desc
                      .replace(/Tx: 0x[a-fA-F0-9]{64}/, '')
                      .replace(/ID de custodia: [A-Z0-9_]+/, '')
                      .replace(/\. \.$/, '.')
                      .trim()}
                  </div>
                )}
                {escrowId && (
                  <div className="mb-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md font-mono">
                      🔐 ID: {escrowId}
                    </span>
                  </div>
                )}
                {arbiscanUrl && (
                  <div className="mb-1">
                    <a 
                      href={arbiscanUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs rounded-md transition-colors duration-200 font-medium"
                    >
                      🔗 Ver en blockchain
                    </a>
                  </div>
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
