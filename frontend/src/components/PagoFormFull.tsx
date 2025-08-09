"use client";
import React, { useState } from "react";
import PaymentLoadingModal from './PaymentLoadingModal';

// Utility for fetch with auth
type FetchOptions = RequestInit & { headers?: Record<string, string> };
import { authFetch } from '../utils/authFetch';
import { calculatePlatformCommission, formatCurrency } from '../utils/platformCommissionConfig';

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
  
  // Platform commission state
  const [platformCommission, setPlatformCommission] = useState({ percent: 0, amount: 0, totalAmountToPay: 0 });

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

  // Calculate platform commission when amount changes
  React.useEffect(() => {
    if (amount) {
      const baseAmount = parseFloat(amount);
      if (!isNaN(baseAmount) && baseAmount > 0) {
        const commission = calculatePlatformCommission(baseAmount, 'traditional');
        setPlatformCommission(commission);
      } else {
        setPlatformCommission({ percent: 0, amount: 0, totalAmountToPay: 0 });
      }
    } else {
      setPlatformCommission({ percent: 0, amount: 0, totalAmountToPay: 0 });
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
        // Close loading modal first, then redirect
        setLoading(false);
        
        // Small delay to ensure modal closes before redirect
        setTimeout(() => {
          if (data.payment && data.payment.id) {
            window.location.href = `/dashboard/pagos/${data.payment.id}/instrucciones`;
          } else if (data.id) {
            window.location.href = `/dashboard/pagos/${data.id}/instrucciones`;
          } else {
            setSuccess(true);
          }
        }, 100);
      } else {
        setError(data.error || "No se pudo crear el pago.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Error de red o servidor.");
      setLoading(false);
    }
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
        <p className="text-xs text-gray-500">El destinatario debe estar registrado y verificado en Kustodia</p>
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
        <p className="text-xs text-gray-500">Ingresa el monto base de la transacción en pesos mexicanos</p>
        
        {/* Platform Commission Breakdown */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">💰 Desglose de Pago Transparente</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Monto base:</span>
                <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Comisión plataforma ({platformCommission.percent}%):</span>
                <span className="font-medium">{formatCurrency(platformCommission.amount)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-300 pt-1 mt-2">
                <span className="font-semibold text-blue-800">Total a pagar:</span>
                <span className="font-bold text-blue-800">{formatCurrency(platformCommission.totalAmountToPay)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ℹ️ Comisión por servicio de custodia digital.
            </p>
          </div>
        )}
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
        <p className="text-xs text-gray-500">Describe brevemente el propósito de esta transacción</p>
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
        <p className="text-xs text-gray-500">Porcentaje del monto que permanecerá en garantía hasta completar las condiciones (0-100%)</p>
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
        <p className="text-xs text-gray-500">Número de días que los fondos permanecerán en custodia antes de liberarse automáticamente</p>
      </div>
      {/* Commission Section */}
      <div className="space-y-2">
        <button
          type="button"
          className="w-full flex items-center justify-between py-3 px-4 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
          onClick={() => setShowCommission(v => !v)}
        >
          Comisión (opcional)
          <span className="text-gray-500">{showCommission ? '▲' : '▼'}</span>
        </button>
        <p className="text-xs text-gray-500">Configura una comisión adicional para un tercero (opcional)</p>
        
        {showCommission && (
          <div className="space-y-3 mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">% de comisión (ej. 5)</label>
              <input
                type="number"
                className="input-standard"
                placeholder="% de comisión (ej. 5)"
                value={commissionPercent}
                onChange={e => setCommissionPercent(e.target.value)}
                min={0}
                max={100}
              />
              <p className="text-xs text-gray-500">Porcentaje de comisión que se descontará del monto base</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre del beneficiario de la comisión</label>
              <input
                type="text"
                className="input-standard"
                placeholder="Nombre del beneficiario de la comisión"
                value={commissionBeneficiaryName}
                onChange={e => setCommissionBeneficiaryName(e.target.value)}
                disabled={!commissionPercent}
              />
              <p className="text-xs text-gray-500">Nombre completo de quien recibirá la comisión</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email del beneficiario de la comisión</label>
              <input
                type="email"
                className="input-standard"
                placeholder="Email del beneficiario de la comisión"
                value={commissionBeneficiaryEmail}
                onChange={e => setCommissionBeneficiaryEmail(e.target.value)}
                onBlur={handleCommissionerBlur}
                autoComplete="off"
                disabled={!commissionPercent}
              />
              <p className="text-xs text-gray-500">El beneficiario debe estar registrado y verificado en Kustodia</p>
            </div>
            
            {/* Commission Validation Messages */}
            {commissionPercent && commissionBeneficiaryEmail && commissionerLoading && (
              <div className="text-gray-500 text-sm">Validando beneficiario...</div>
            )}
            {commissionPercent && commissionBeneficiaryEmail && commissionerValid && commissionerVerified && !commissionerError && (
              <div className="text-green-700 font-semibold text-sm">✓ Beneficiario válido y verificado</div>
            )}
            {commissionPercent && commissionBeneficiaryEmail && commissionerError && (
              <div className="text-red-600 text-sm font-semibold">{commissionerError}</div>
            )}
            
            {/* Commission Amount Display */}
            {commissionAmount !== "N/A" && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <span className="text-gray-700">Monto comisión: </span>
                <span className="font-semibold text-blue-800">${commissionAmount}</span>
              </div>
            )}
          </div>
        )}
      </div>
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
