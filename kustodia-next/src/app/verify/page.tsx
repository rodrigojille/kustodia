"use client";

export const dynamic = "force-dynamic";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2">Línea de tiempo</h3>
      <ul className="border-l-2 border-blue-400 pl-4">
        {events.map((e, idx) => (
          <li key={idx} className="mb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${e.status === 'completed' ? 'bg-green-500' : 'bg-blue-400'}`}></span>
              <span className="font-semibold">{e.label}</span>
            </div>
            <div className="text-xs text-gray-500 ml-5">{e.date ? new Date(e.date).toLocaleString() : null}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VerifyPage() {
  const params = useSearchParams();
  const paymentId = params.get("payment");
  const hmac = params.get("hmac");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!paymentId || !hmac) {
      setError("Faltan parámetros de verificación.");
      setLoading(false);
      return;
    }
    fetch(`/api/payments/${paymentId}?hmac=${hmac}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error || "No se pudo verificar el pago.");
        } else {
          setPayment(data.payment || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error de red. Intenta de nuevo.");
        setLoading(false);
      });
  }, [paymentId, hmac]);

  useEffect(() => {
    if (paymentId) {
      fetch(`/api/payments/${paymentId}/events`)
        .then(res => res.json())
        .then(data => setEvents(data || []));
    }
  }, [paymentId]);

  return (
    <Suspense fallback={<div className="text-center text-blue-600">Cargando información...</div>}>
      <div className="min-h-screen bg-blue-50 flex items-center justify-center py-8 px-2">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
          <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">Verificación de pago</h1>
          {loading ? (
            <div className="text-center text-blue-600">Cargando información...</div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded text-center mb-4">{error}</div>
          ) : payment ? (
            <>
              <div className="mb-4 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${payment.status === 'completed' ? 'bg-green-600' : payment.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'}`}>{payment.status === 'completed' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : payment.status}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">ID del pago:</span> {payment.id}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Pagador:</span> {payment.payer_email}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Monto:</span> {Number(payment.amount).toLocaleString('es-MX', { style: 'currency', currency: payment.currency })}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Descripción:</span> {payment.description}
              </div>
              <div className="mb-2">
                <span className="font-semibold">CLABE de depósito:</span> {payment.deposit_clabe}
              </div>
              <PaymentTimeline events={events} />
              <div className="mt-6 text-center text-xs text-gray-500">Esta página es pública y no requiere iniciar sesión.</div>
            </>
          ) : null}
        </div>
      </div>
    </Suspense>
  );
}
