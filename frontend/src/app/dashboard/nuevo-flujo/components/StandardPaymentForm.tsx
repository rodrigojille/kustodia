"use client";
import React, { useState } from "react";
import { authFetch } from '@/utils/authFetch';
import PaymentLoadingModal from '@/components/PaymentLoadingModal';
import useAnalytics from '@/hooks/useAnalytics';

interface StandardPaymentFormProps {
  onBack: () => void;
}

export default function StandardPaymentForm({ onBack }: StandardPaymentFormProps) {
  // 🔥 ANALYTICS: Initialize comprehensive tracking
  const { paymentFlow, formTracking, fraudPrevention } = useAnalytics();
  
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
  const [success, setSuccess] = useState<string | null>(null);

  // 🔥 Track form initialization (customer journey: payment creation start)
  React.useEffect(() => {
    formTracking.trackFormStart('standard_payment_form', 'standard_payment');
    paymentFlow.trackPaymentStep('start', {
      transaction_type: 'standard_payment',
      source_form: 'standard'
    });
  }, []);

  // 🔥 Fraud category detection based on Reddit scraper insights
  const determineFraudCategory = (text: string): string | null => {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    // Based on enhanced scraper results - top fraud categories:
    const categories = {
      'real_estate': ['inmobiliaria', 'bienes raices', 'casa', 'departamento', 'renta', 'venta casa', 'anticipo renta', 'propiedad'],
      'service_contracts': ['trabajo remoto', 'freelance', 'proyecto', 'servicios', 'contrato', 'desarrollo', 'diseño'],
      'spei_banking': ['banco', 'spei', 'transferencia', 'deposito', 'cuenta bancaria', 'bbva', 'banamex', 'santander'],
      'automotive': ['auto', 'coche', 'carro', 'vehiculo', 'moto', 'motocicleta', 'venta auto', 'usado'],
      'online_marketplace': ['mercadolibre', 'facebook marketplace', 'olx', 'segundamano', 'compra venta online'],
      'employment': ['trabajo', 'empleo', 'sueldo', 'nomina', 'empresa', 'puesto'],
      'investment': ['inversion', 'negocio', 'piramide', 'multinivel', 'forex', 'bitcoin', 'cripto'],
      'payment_platform': ['mercadopago', 'paypal', 'oxxo', 'oxxo pay', 'transferencia digital']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };

  const [recipientValid, setRecipientValid] = useState<boolean | undefined>(undefined);
  const [recipientVerified, setRecipientVerified] = useState<boolean | undefined>(undefined);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

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
    setSuccess(null);
    
    // 🔥 ANALYTICS: Track payment submission start
    const trackingData = {
      amount: parseFloat(amount || '0'),
      warranty_percentage: parseFloat(warrantyPercent || '0'),
      custody_days: parseInt(custodyDays || '0'),
      has_commission: !!commissionPercent,
      commission_percentage: parseFloat(commissionPercent || '0'),
      transaction_type: 'standard_payment'
    };
    
    paymentFlow.trackPaymentStep('payment_method', {
      method: 'standard',
      ...trackingData
    });
    
    // Determine fraud category from description (based on scraper insights)
    const fraudCategory = determineFraudCategory(description);
    if (fraudCategory) {
      fraudPrevention.trackFraudPrevention(fraudCategory, 'payment_creation', {
        user_intent: 'seeking_solutions',
        transaction_amount: parseFloat(amount || '0')
      });
    }
    
    try {
      const commissionFields = commissionPercent
        ? {
            commission_percent: Number(commissionPercent),
            commission_amount: commissionAmount !== '' && commissionAmount !== 'N/A' ? Number(commissionAmount) : undefined,
            commission_beneficiary_name: commissionBeneficiaryName || undefined,
            commission_beneficiary_email: commissionBeneficiaryEmail || undefined,
          }
        : {};

      const resUser = await authFetch('/api/users/me');
      const userData = await resUser.json();
      if (!resUser.ok || !userData.user) {
        setError("No se pudo obtener el usuario actual. Por favor, inicia sesión de nuevo.");
        setLoading(false);
        return;
      }
      const { id: user_id, email: payer_email } = userData.user;

      const payload = {
        user_id,
        payer_email,
        recipient_email: recipient,
        amount: Number(amount),
        currency: 'MXN',
        description,
        custody_percent: warrantyPercent ? Number(warrantyPercent) : null,
        custody_period: custodyDays ? Number(custodyDays) : null,
        ...commissionFields,
      };

      const res = await authFetch(`/api/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`¡Pago creado con éxito! ID del pago: ${data.payment?.id || data.id}`);
        
        // 🔥 ANALYTICS: Track successful payment completion
        paymentFlow.trackPaymentStep('completion', {
          amount: parseFloat(amount || '0'),
          method: 'standard',
          warranty_percentage: parseFloat(warrantyPercent || '0'),
          custody_days: parseInt(custodyDays || '0'),
          has_commission: !!commissionPercent,
          payment_id: data.payment?.id || data.id,
          transaction_type: 'standard_payment'
        });
        
        formTracking.trackFormCompletion('standard_payment_form', true);
        
        // Track specific fraud category success
        const fraudCategory = determineFraudCategory(description);
        if (fraudCategory) {
          fraudPrevention.trackFraudPrevention(fraudCategory, 'escrow_created', {
            transaction_amount: parseFloat(amount || '0'),
            user_intent: 'solution_implemented'
          });
        }
        
      } else {
        setError(data.error || "No se pudo crear el pago.");
        
        // 🔥 ANALYTICS: Track payment failure
        formTracking.trackFormCompletion('standard_payment_form', false, [data.error || 'Payment creation failed']);
      }
    } catch (err: any) {
      setError("Error de red o servidor. Por favor, intenta de nuevo.");
      
      // 🔥 ANALYTICS: Track payment error
      formTracking.trackFormCompletion('standard_payment_form', false, [err.message || 'Network error']);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Volver a seleccionar tipo de pago
      </button>

      <form onSubmit={handleSubmit} className="space-y-3 w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Crear Pago Estándar</h2>
        
        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md">{success}</div>}
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">{error}</div>}

        <input
          type="email"
          className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Correo del destinatario"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          onBlur={handleRecipientBlur}
          required
        />
        {recipientLoading && <div className="text-gray-500 text-sm mt-1">Validando...</div>}
        {recipient && recipientValid && recipientVerified && !recipientError && (
          <div className="text-green-600 font-semibold text-sm mt-1">✅ Destinatario válido y verificado.</div>
        )}
        {recipient && recipientError && <div className="text-red-600 text-sm mt-1 font-semibold">❌ {recipientError}</div>} 

        <input type="number" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} required min={1} />
        <input type="text" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Descripción del pago (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="number" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="% en garantía (0-100)" value={warrantyPercent} onChange={e => setWarrantyPercent(e.target.value)} min={0} max={100} />
        <input type="number" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Días en custodia (mínimo 1)" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} min={1} />

        <div className="mt-4 mb-2 font-semibold text-black">
          <button
            type="button"
            className="w-full flex items-center justify-between py-2 px-4 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors font-semibold"
            onClick={() => {
              const newValue = !showCommission;
              setShowCommission(newValue);
              
              // 🔥 ANALYTICS: Track commission feature usage
              formTracking.trackFieldInteraction('standard_payment_form', 'commission_toggle', 'change');
              
              // Track additional commission data
              if (newValue) {
                paymentFlow.trackPaymentStep('custody_settings', {
                  commission_enabled: true,
                  transaction_amount: parseFloat(amount || '0')
                });
              }
            }}
          >
            Añadir Comisión (opcional)
            <span>{showCommission ? '▲' : '▼'}</span>
          </button>
        </div>

        {showCommission && (
          <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input
              type="number"
              className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="% de comisión (ej. 5)"
              value={commissionPercent}
              onChange={e => setCommissionPercent(e.target.value)}
              min={0}
              max={100}
            />
            <input
              type="text"
              className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del beneficiario de la comisión"
              value={commissionBeneficiaryName}
              onChange={e => setCommissionBeneficiaryName(e.target.value)}
              disabled={!commissionPercent}
            />
            <input
              type="email"
              className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email del beneficiario de la comisión"
              value={commissionBeneficiaryEmail}
              onChange={e => setCommissionBeneficiaryEmail(e.target.value)}
              onBlur={handleCommissionerBlur}
              autoComplete="off"
              disabled={!commissionPercent}
            />
            {commissionPercent && commissionBeneficiaryEmail && commissionerLoading && (
              <div className="text-gray-500 text-sm mt-1">Validando...</div>
            )}
            {commissionPercent && commissionBeneficiaryEmail && commissionerValid && commissionerVerified && !commissionerError && (
              <div className="text-green-600 font-semibold text-sm mt-1">✅ Beneficiario válido y verificado.</div>
            )}
            {commissionPercent && commissionBeneficiaryEmail && commissionerError && (
              <div className="text-red-600 text-sm mt-1 font-semibold">❌ {commissionerError}</div>
            )}
            <div className="text-sm mt-1 text-gray-800">Monto de la comisión: <b>{commissionAmount !== "N/A" ? `$${commissionAmount}` : "N/A"}</b></div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full mt-6 text-white rounded-lg py-3 px-4 text-lg font-semibold shadow-md transition-all ${!loading && recipientValid && recipientVerified ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={loading || !recipientValid || !recipientVerified}
        >
          {loading ? 'Creando Pago...' : 'Crear Pago'}
        </button>
      </form>
      
      {/* Payment Loading Modal */}
      <PaymentLoadingModal 
        isOpen={loading} 
        message="Creando tu pago seguro..." 
      />
    </div>
  );
}
