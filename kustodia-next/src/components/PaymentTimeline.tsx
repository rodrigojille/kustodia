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
    case "initiated":
      return { color: "bg-blue-100 text-blue-800", icon: "🟦" };
    case "custody_created":
      return { color: "bg-green-100 text-green-800", icon: "🔒" };
    case "deposit_received":
      return { color: "bg-blue-100 text-blue-800", icon: "💰" };
    case "redemption_initiated":
      return { color: "bg-gray-300 text-gray-800", icon: "🔄" };
    case "redemption_failed":
      return { color: "bg-red-100 text-red-700", icon: "❌" };
    case "redemption_successful":
      return { color: "bg-green-100 text-green-800", icon: "✅" };
    case "completed":
      return { color: "bg-blue-100 text-blue-800", icon: "📦" };
    default:
      return { color: "bg-gray-200 text-gray-800", icon: "🔔" };
  }
}

export default function PaymentTimeline({ paymentId }: { paymentId: string }) {
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
      <h3 className="text-base font-bold text-gray-800 mb-2">Línea de tiempo:</h3>
      <div className="space-y-2">
        {events.map(ev => {
          const style = getEventStyle(ev.type);
          // Improve error message display
          let desc = ev.description || ev.type;
          let isError = ev.type === "redemption_failed" || desc.toLowerCase().includes("error") || desc.toLowerCase().includes("fail");
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
            <div key={ev.id} className={`flex items-start gap-2 ${isError ? 'bg-red-50' : ''} rounded p-1`}>
              <span className={`inline-block text-xl mt-1`}>{style.icon}</span>
              <div>
                <span className={`inline-block px-2 py-1 rounded font-semibold text-xs ${style.color}`}>{desc}</span>
                <div className="text-gray-400 text-xs ml-1">{new Date(ev.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
