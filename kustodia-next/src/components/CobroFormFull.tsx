"use client";
import React, { useState } from "react";

type FetchOptions = RequestInit & { headers?: Record<string, string> };
async function authFetch(input: RequestInfo, init: FetchOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { ...(init.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(input, { ...init, headers });
}

export default function CobroFormFull() {
  const [payerEmail, setPayerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [warrantyPercent, setWarrantyPercent] = useState("");
  const [custodyDays, setCustodyDays] = useState("");
  const [description, setDescription] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [commissionBeneficiaryName, setCommissionBeneficiaryName] = useState("");
  const [commissionBeneficiaryEmail, setCommissionBeneficiaryEmail] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("N/A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (amount && commissionPercent) {
      const calc = Number(amount) * Number(commissionPercent) / 100;
      setCommissionAmount(calc.toFixed(2));
    } else {
      setCommissionAmount("N/A");
    }
  }, [amount, commissionPercent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await authFetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_email: payerEmail,
          amount: Number(amount),
          warranty_percent: warrantyPercent ? Number(warrantyPercent) : undefined,
          custody_days: custodyDays ? Number(custodyDays) : undefined,
          description,
          commission_percent: commissionPercent ? Number(commissionPercent) : undefined,
          commission_beneficiary_name: commissionBeneficiaryName || undefined,
          commission_beneficiary_email: commissionBeneficiaryEmail || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "No se pudo solicitar el cobro.");
      }
    } catch (err: any) {
      setError("Error de red o servidor.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 md:p-8 mx-auto">
      <h2 className="text-xl font-bold text-center mb-4 text-black">Solicitar pago</h2>
      <input type="email" className="input w-full text-black placeholder-black" placeholder="Email del pagador" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} required />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} required min={1} />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="% bajo garantía (0-100)" value={warrantyPercent} onChange={e => setWarrantyPercent(e.target.value)} min={0} max={100} />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="Días en custodia (mínimo 1)" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} min={1} />
      <input type="text" className="input w-full text-black placeholder-black" placeholder="Descripción o propósito del pago (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="mt-4 mb-2 font-semibold text-black">Comisión (opcional)</div>
      <input type="number" className="input w-full text-black placeholder-black" placeholder="% de comisión (ej. 5)" value={commissionPercent} onChange={e => setCommissionPercent(e.target.value)} min={0} max={100} />
      <input type="text" className="input w-full text-black placeholder-black" placeholder="Nombre del beneficiario de la comisión" value={commissionBeneficiaryName} onChange={e => setCommissionBeneficiaryName(e.target.value)} />
      <input type="email" className="input w-full text-black placeholder-black" placeholder="Email del beneficiario de la comisión" value={commissionBeneficiaryEmail} onChange={e => setCommissionBeneficiaryEmail(e.target.value)} />
      <div className="text-sm mt-1 text-black">Monto comisión: <b>{commissionAmount !== "N/A" ? `$${commissionAmount}` : "N/A"}</b></div>
      <button type="submit" className="btn btn-success w-full mt-4 text-white" disabled={loading}>{loading ? "Enviando..." : "Solicitar pago"}</button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mt-2">Cobro solicitado correctamente.</div>}
    </form>
  );
}
