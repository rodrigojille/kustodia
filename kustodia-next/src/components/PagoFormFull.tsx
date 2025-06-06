"use client";
import React, { useState } from "react";

// Utility for fetch with auth
type FetchOptions = RequestInit & { headers?: Record<string, string> };
async function authFetch(input: RequestInfo, init: FetchOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { ...(init.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(input, { ...init, headers });
}

export default function PagoFormFull() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [warrantyPercent, setWarrantyPercent] = useState("");
  const [custodyDays, setCustodyDays] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [commissionBeneficiaryName, setCommissionBeneficiaryName] = useState("");
  const [commissionBeneficiaryEmail, setCommissionBeneficiaryEmail] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("N/A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Recipient validation
  const [recipientValid, setRecipientValid] = useState<boolean | undefined>(undefined);
  const [recipientVerified, setRecipientVerified] = useState<boolean | undefined>(undefined);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // Commission beneficiary validation
  const [commissionerValid, setCommissionerValid] = useState<boolean | undefined>(undefined);
  const [commissionerVerified, setCommissionerVerified] = useState<boolean | undefined>(undefined);
  const [commissionerLoading, setCommissionerLoading] = useState(false);
  const [commissionerError, setCommissionerError] = useState<string | null>(null);

  const validateRecipient = async (email: string) => {
    setRecipientLoading(true);
    setRecipientError(null);
    setRecipientValid(undefined);
    setRecipientVerified(undefined);
    try {
      const res = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setRecipientValid(data.exists);
      setRecipientVerified(data.verified);
      if (!data.exists) setRecipientError('El destinatario no está registrado en Kustodia.');
      else if (!data.verified) setRecipientError('El destinatario no ha verificado su correo.');
      else setRecipientError(null);
    } catch {
      setRecipientError('Error validando destinatario. Intenta de nuevo.');
      setRecipientValid(undefined);
      setRecipientVerified(undefined);
    }
    setRecipientLoading(false);
  };

  const handleRecipientBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (recipient) validateRecipient(recipient);
  };

  const validateCommissioner = async (email: string) => {
    setCommissionerLoading(true);
    setCommissionerError(null);
    setCommissionerValid(undefined);
    setCommissionerVerified(undefined);
    try {
      const res = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setCommissionerValid(data.exists);
      setCommissionerVerified(data.verified);
      if (!data.exists) setCommissionerError('El beneficiario no está registrado en Kustodia.');
      else if (!data.verified) setCommissionerError('El beneficiario no ha verificado su correo.');
      else setCommissionerError(null);
    } catch {
      setCommissionerError('Error validando beneficiario. Intenta de nuevo.');
      setCommissionerValid(undefined);
      setCommissionerVerified(undefined);
    }
    setCommissionerLoading(false);
  };

  const handleCommissionerBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (commissionBeneficiaryEmail) validateCommissioner(commissionBeneficiaryEmail);
  };

  // Duplicate state declarations removed below this line

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
      const res = await authFetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          amount: Number(amount),
          description,
          warranty_percent: warrantyPercent ? Number(warrantyPercent) : undefined,
          custody_days: custodyDays ? Number(custodyDays) : undefined,
          commission_percent: commissionPercent ? Number(commissionPercent) : undefined,
          commission_beneficiary_name: commissionBeneficiaryName || undefined,
          commission_beneficiary_email: commissionBeneficiaryEmail || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Redirect to instructions page for the new payment
        if (data.payment && data.payment.id) {
          window.location.href = `/dashboard/pagos/${data.payment.id}/instrucciones`;
        } else if (data.id) {
          window.location.href = `/dashboard/pagos/${data.id}/instrucciones`;
        } else {
          setSuccess(true);
        }
      } else {
        setError(data.error || "No se pudo crear el pago.");
      }
    } catch (err: any) {
      setError("Error de red o servidor.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 md:p-8 mx-auto">
      <h2 className="text-xl font-bold text-center mb-4 text-black">Iniciar pago</h2>
      <input
        type="email"
        className="input w-full text-black placeholder-black"
        placeholder="Destinatario (correo o usuario)"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        onBlur={handleRecipientBlur}
        required
      />
      {recipientLoading && <div className="text-gray-500 text-sm mt-1">Validando destinatario...</div>}
      {recipient && recipientValid && recipientVerified && !recipientError && (
        <div className="text-green-700 font-semibold text-sm mt-1">Destinatario válido y verificado.</div>
      )}
      {recipient && recipientError && <div className="text-red-600 text-sm mt-1 font-semibold">{recipientError}</div>} 
      <input type="number" className="input w-full text-black placeholder-black" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} required min={1} />
      <input type="text" className="input w-full text-black placeholder-black" placeholder="Descripción o propósito del pago (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="% bajo garantía (0-100)" value={warrantyPercent} onChange={e => setWarrantyPercent(e.target.value)} min={0} max={100} />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="Días en custodia (mínimo 1)" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} min={1} />
      <div className="mt-4 mb-2 font-semibold text-black">Comisión (opcional)</div>
      <input type="number" className="input w-full text-black placeholder-black" placeholder="% de comisión (ej. 5)" value={commissionPercent} onChange={e => setCommissionPercent(e.target.value)} min={0} max={100} />
      <input type="text" className="input w-full text-black placeholder-black" placeholder="Nombre del beneficiario de la comisión" value={commissionBeneficiaryName} onChange={e => setCommissionBeneficiaryName(e.target.value)} />
      <input
        type="email"
        className="input w-full text-black placeholder-black"
        placeholder="Email del beneficiario de la comisión"
        value={commissionBeneficiaryEmail}
        onChange={e => setCommissionBeneficiaryEmail(e.target.value)}
        onBlur={handleCommissionerBlur}
        autoComplete="off"
      />
      {commissionBeneficiaryEmail && commissionerLoading && <div className="text-gray-500 text-sm mt-1">Validando beneficiario...</div>}
      {commissionBeneficiaryEmail && commissionerValid && commissionerVerified && !commissionerError && (
        <div className="text-green-700 font-semibold text-sm mt-1">Beneficiario válido y verificado.</div>
      )}
      {commissionBeneficiaryEmail && commissionerError && <div className="text-red-600 text-sm mt-1 font-semibold">{commissionerError}</div>} 
      <div className="text-sm mt-1 text-black">Monto comisión: <b>{commissionAmount !== "N/A" ? `$${commissionAmount}` : "N/A"}</b></div>
      <button
        type="submit"
        className={`w-full mt-4 text-white rounded-2xl py-3 px-2 text-lg font-semibold shadow transition-all ${
          (recipientValid && recipientVerified && recipient && amount && warrantyPercent !== '' && custodyDays !== '' && !recipientLoading && (!commissionBeneficiaryEmail || (commissionerValid && commissionerVerified)))
            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
        style={{ boxShadow: '0 2px 8px #E3EAFD' }}
        disabled={
          !!loading ||
          !!recipientLoading ||
          !Boolean(recipient) ||
          !Boolean(amount) ||
          !Boolean(warrantyPercent) ||
          !Boolean(custodyDays) ||
          !Boolean(recipientValid) ||
          !Boolean(recipientVerified) ||
          (Boolean(commissionBeneficiaryEmail) && (!Boolean(commissionerValid) || !Boolean(commissionerVerified)))
        }
        aria-label="Enviar pago"
      >
        {loading ? 'Enviando...' : 'Enviar pago'}
      </button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

    </form>
  );
}
