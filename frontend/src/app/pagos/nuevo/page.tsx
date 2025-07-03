"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevoMovimientoPage() {
  const [showCommission, setShowCommission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handler para 'Pagar' (initiatePayment)
  async function handlePagarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data: any = {
      recipient_email: form.recipient_email.value,
      amount: Number(form.amount.value),
      currency: form.currency.value,
      description: form.description.value,
      custody_percent: Number(form.custody_percent.value),
      custody_period: Number(form.custody_period.value),
    };
    if (showCommission) {
      data.commission_percent = form.commission_percent.value;
      data.commission_beneficiary_name = form.commission_beneficiary_name.value;
      data.commission_beneficiary_email = form.commission_beneficiary_email.value;
    }
    try {
      const res = await fetch('http://localhost:4000/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al iniciar pago');
      router.push('/pagos');
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow border border-gray-200 p-8 mt-8">
        <h1 className="text-2xl font-bold text-black mb-6">Nuevo Pago</h1>
        {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4">{error}</div>}
        <form className="space-y-4 animate-fade-in" onSubmit={handlePagarSubmit}>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Correo del destinatario *</label>
            <input type="email" name="recipient_email" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="usuario@ejemplo.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Monto *</label>
            <input type="number" name="amount" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="Ej: 1500" min="1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Moneda *</label>
            <select name="currency" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" defaultValue="MXN">
              <option value="MXN">MXN (Peso Mexicano)</option>
              {/* <option value="USD">USD (Dólar)</option> */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Descripción o propósito del pago *</label>
            <input type="text" name="description" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="Ej: Pago de anticipo" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">% bajo garantía *</label>
            <input type="number" name="custody_percent" min="0" max="100" step="0.01" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="Ej: 100" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Días en custodia *</label>
            <input type="number" name="custody_period" min="1" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="Ej: 7" required />
          </div>
          <div>
            <button
              type="button"
              className="text-blue-700 font-semibold underline text-sm mt-2"
              onClick={() => setShowCommission((v) => !v)}
            >
              {showCommission ? 'Ocultar comisión' : 'Agregar comisión (opcional)'}
            </button>
          </div>
          {showCommission && (
            <div className="bg-blue-100 rounded p-4 space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-black mb-1">Porcentaje de comisión (%)</label>
                <input type="number" name="commission_percent" min="0" max="100" step="0.01" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="Ej: 2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">Nombre del beneficiario de comisión</label>
                <input type="text" name="commission_beneficiary_name" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="Nombre completo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-black mb-1">Correo del beneficiario de comisión</label>
                <input type="email" name="commission_beneficiary_email" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400" placeholder="beneficiario@ejemplo.com" />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Link href="/pagos" className="px-4 py-2 rounded bg-gray-100 text-black font-semibold hover:bg-gray-200">Cancelar</Link>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" disabled={loading}>
              {loading ? 'Procesando...' : 'Iniciar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}