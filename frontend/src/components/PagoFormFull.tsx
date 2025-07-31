"use client";
import React, { useState } from "react";
import PaymentLoadingModal from './PaymentLoadingModal';

// Utility for fetch with auth
type FetchOptions = RequestInit & { headers?: Record<string, string> };
import { authFetch } from '../utils/authFetch';

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
  const [showCommission, setShowCommission] = useState(false);
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
      // Solo incluir campos de comisión si hay porcentaje de comisión
      const commissionFields = commissionPercent
        ? {
            commission_percent: Number(commissionPercent),
            commission_amount: commissionAmount !== '' && commissionAmount !== 'N/A' ? Number(commissionAmount) : undefined,
            commission_beneficiary_name: commissionBeneficiaryName || undefined,
            commission_beneficiary_email: commissionBeneficiaryEmail || undefined,
          }
        : {};
      // Obtener user_id antes de enviar el pago
      let user_id = null;
      let payer_email = null;
      try {
        const resUser = await authFetch('/api/users/me');
        const userData = await resUser.json();
        if (resUser.ok && userData.user && userData.user.id && userData.user.email) {
          user_id = userData.user.id;
          payer_email = userData.user.email;
        } else {
          setError("No se pudo obtener el usuario actual.");
          setLoading(false);
          return;
        }
      } catch {
        setError("Error de conexión al obtener usuario actual.");
        setLoading(false);
        return;
      }
      const payload = {
        user_id,
        payer_email,
        recipient_email: recipient,
        amount: Number(amount),
        currency: 'MXN',
        description,
        custody_percent: warrantyPercent ? Number(warrantyPercent) : null,
        custody_period: custodyDays ? Number(custodyDays) : null, // Send days directly (backend expects days)
        ...commissionFields,
      };

      console.log('Payload enviado a /api/payments/initiate:', payload);
      const res = await authFetch('/api/payments/initiate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Iniciar pago</h2>
      
      {/* Recipient Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Destinatario</label>
        <input
          type="email"
          className="input-standard"
          placeholder="Correo electrónico del destinatario"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          onBlur={handleRecipientBlur}
          required
        />
      </div>
      {/* Validation Messages */}
      {recipientLoading && <div className="text-gray-500 text-sm">Validando destinatario...</div>}
      {recipient && recipientValid && recipientVerified && !recipientError && (
        <div className="text-green-700 font-semibold text-sm">✓ Destinatario válido y verificado</div>
      )}
      {recipient && recipientError && <div className="text-red-600 text-sm font-semibold">{recipientError}</div>}
      
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Monto</label>
        <input 
          type="number" 
          className="input-standard" 
          placeholder="Monto en MXN" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          required 
          min={1} 
        />
      </div>
      
      {/* Description Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
        <input 
          type="text" 
          className="input-standard" 
          placeholder="Propósito del pago" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
        />
      </div>
      
      {/* Warranty Percentage */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Porcentaje bajo garantía</label>
        <input 
          type="number" 
          className="input-standard" 
          placeholder="% bajo garantía (0-100)" 
          value={warrantyPercent} 
          onChange={e => setWarrantyPercent(e.target.value)} 
          min={0} 
          max={100} 
        />
      </div>
      
      {/* Custody Days */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Días en custodia</label>
        <input 
          type="number" 
          className="input-standard" 
          placeholder="Días en custodia (mínimo 1)" 
          value={custodyDays} 
          onChange={e => setCustodyDays(e.target.value)} 
          min={1} 
        />
      </div>
      <div className="mt-4 mb-2 font-semibold text-black">
        <button
          type="button"
          className="w-full flex items-center justify-between py-2 px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors font-semibold"
          onClick={() => setShowCommission(v => !v)}
        >
          Comisión (opcional)
          <span>{showCommission ? '▲' : '▼'}</span>
        </button>
      </div>
      {showCommission && (
        <div className="space-y-2">
          <input
            type="number"
            className="input w-full text-black placeholder-black"
            placeholder="% de comisión (ej. 5)"
            value={commissionPercent}
            onChange={e => setCommissionPercent(e.target.value)}
            min={0}
            max={100}
          />
          <input
            type="text"
            className="input w-full text-black placeholder-black"
            placeholder="Nombre del beneficiario de la comisión"
            value={commissionBeneficiaryName}
            onChange={e => setCommissionBeneficiaryName(e.target.value)}
            disabled={!commissionPercent}
          />
          <input
            type="email"
            className="input w-full text-black placeholder-black"
            placeholder="Email del beneficiario de la comisión"
            value={commissionBeneficiaryEmail}
            onChange={e => setCommissionBeneficiaryEmail(e.target.value)}
            onBlur={handleCommissionerBlur}
            autoComplete="off"
            disabled={!commissionPercent}
          />
          {commissionPercent && commissionBeneficiaryEmail && commissionerLoading && (
            <div className="text-gray-500 text-sm mt-1">Validando beneficiario...</div>
          )}
          {commissionPercent && commissionBeneficiaryEmail && commissionerValid && commissionerVerified && !commissionerError && (
            <div className="text-green-700 font-semibold text-sm mt-1">Beneficiario válido y verificado.</div>
          )}
          {commissionPercent && commissionBeneficiaryEmail && commissionerError && (
            <div className="text-red-600 text-sm mt-1 font-semibold">{commissionerError}</div>
          )}
          <div className="text-sm mt-1 text-black">Monto comisión: <b>{commissionAmount !== "N/A" ? `$${commissionAmount}` : "N/A"}</b></div>
        </div>
      )}
      <button
        type="submit"
        className={`btn-primary w-full mt-6 ${
          (recipientValid && recipientVerified && recipient && amount && warrantyPercent !== '' && custodyDays !== '' && !recipientLoading && (
            !commissionPercent || (
              commissionBeneficiaryEmail && commissionerValid && commissionerVerified
            )
          ))
            ? ''
            : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={
          !!loading ||
          !!recipientLoading ||
          !Boolean(recipient) ||
          !Boolean(amount) ||
          !Boolean(warrantyPercent) ||
          !Boolean(custodyDays) ||
          !Boolean(recipientValid) ||
          !Boolean(recipientVerified) ||
          (Boolean(commissionPercent) && (!Boolean(commissionBeneficiaryEmail) || !Boolean(commissionerValid) || !Boolean(commissionerVerified)))
        }
        aria-label="Crear pago"
      >
        {loading ? 'Creando...' : 'Crear pago'}
      </button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

      {/* Payment Loading Modal */}
      <PaymentLoadingModal 
        isOpen={loading} 
        message="Creando tu pago seguro..." 
      />
    </form>
  );
}
