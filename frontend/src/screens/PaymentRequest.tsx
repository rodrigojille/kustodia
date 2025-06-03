import React, { useState } from 'react';
import { authFetch } from '../authFetch';
import ResponsiveLayout from '../components/ResponsiveLayout';

const PaymentRequest: React.FC = () => {
  const [payerEmail, setPayerEmail] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [commissionPercent, setCommissionPercent] = useState<number | ''>('');
  const [commissionBeneficiaryName, setCommissionBeneficiaryName] = useState('');
  const [commissionBeneficiaryEmail, setCommissionBeneficiaryEmail] = useState('');
  const [commissionerValid, setCommissionerValid] = useState<null | boolean>(null);
  const [commissionerVerified, setCommissionerVerified] = useState<null | boolean>(null);
  const [commissionerLoading, setCommissionerLoading] = useState(false);
  const [commissionerError, setCommissionerError] = useState<string | null>(null);
  const [payerValid, setPayerValid] = useState<null | boolean>(null);
  const [payerVerified, setPayerVerified] = useState<null | boolean>(null);
  const [payerLoading, setPayerLoading] = useState(false);
  const [payerError, setPayerError] = useState<string | null>(null);
  const [warrantyPercent, setWarrantyPercent] = useState<number | ''>('');
  const [custodyDays, setCustodyDays] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate commission beneficiary (commissioner)
  const validateCommissioner = async (email: string) => {
    setCommissionerLoading(true);
    setCommissionerError(null);
    setCommissionerValid(null);
    setCommissionerVerified(null);
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
      setCommissionerValid(null);
      setCommissionerVerified(null);
    }
    setCommissionerLoading(false);
  };

  const handleCommissionerBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (commissionBeneficiaryEmail) validateCommissioner(commissionBeneficiaryEmail);
  };


  // Validate payer (like recipient in PaymentInitiate)
  const validatePayer = async (email: string) => {
    setPayerLoading(true);
    setPayerError(null);
    setPayerValid(null);
    setPayerVerified(null);
    try {
      const res = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setPayerValid(data.exists);
      setPayerVerified(data.verified);
      if (!data.exists) setPayerError('El pagador no está registrado en Kustodia.');
      else if (!data.verified) setPayerError('El pagador no ha verificado su correo.');
      else setPayerError(null);
    } catch {
      setPayerError('Error validando pagador. Intenta de nuevo.');
      setPayerValid(null);
      setPayerVerified(null);
    }
    setPayerLoading(false);
  };

  const handlePayerBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (payerEmail) validatePayer(payerEmail);
  };


  // Commission calculation
  const commissionAmount = amount && commissionPercent !== ''
    ? Number(((Number(amount) * Number(commissionPercent)) / 100).toFixed(2))
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerEmail || !amount || warrantyPercent === '' || custodyDays === '') return;
    await validatePayer(payerEmail);
    if (!payerValid || !payerVerified) return;
    if (commissionBeneficiaryEmail) {
      await validateCommissioner(commissionBeneficiaryEmail);
      if (!commissionerValid || !commissionerVerified) return;
    }
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await authFetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` || ''
        },
        body: JSON.stringify({
          payer_email: payerEmail,
          amount: Number(amount),
          description,
          commission_percent: commissionPercent === '' ? null : Number(commissionPercent),
          commission_amount: commissionAmount === '' ? null : Number(commissionAmount),
          commission_beneficiary_name: commissionBeneficiaryName || null,
          commission_beneficiary_email: commissionBeneficiaryEmail || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setPayerEmail('');
        setAmount('');
        setDescription('');
        setCommissionPercent('');
        setCommissionBeneficiaryName('');
        setCommissionBeneficiaryEmail('');
      } else {
        setError(data.error || 'No se pudo solicitar el pago.');
      }
    } catch {
      setError('Error de conexión al solicitar el pago.');
    }
    setLoading(false);
  };

  return (
    <ResponsiveLayout>
      <div style={{ maxWidth: 420, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #E3EAFD', padding: '36px 32px', marginTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <a href="/dashboard" style={{ display: 'inline-block' }}>
            <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12, cursor: 'pointer' }} />
          </a>
          <div style={{ fontWeight: 600, fontSize: 22, margin: 0, color: '#222', fontFamily: 'Montserrat, Arial, sans-serif', marginBottom: 2, textAlign: 'center' }}>Solicitar pago</div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email del pagador"
            value={payerEmail}
            onChange={e => setPayerEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 8,
              border: '1.5px solid #ddd',
              fontSize: 16,
              background: '#fff',
              color: '#222',
              fontFamily: 'Montserrat, Arial, sans-serif',
              transition: 'border-color 0.2s',
              outline: 'none',
              marginBottom: 8
            }}
            onFocus={e => (e.target.style.borderColor = '#1A73E8')}
            onBlur={e => { e.target.style.borderColor = '#ddd'; handlePayerBlur(e); }}
            autoComplete="off"
          />
          {payerLoading && <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>Validando pagador...</div>}
          {payerValid && payerVerified && !payerError && (
            <div style={{ color: '#2e7d32', fontWeight: 500, fontSize: 17, marginBottom: 8 }}>
              Pagador válido y verificado.
            </div>
          )}
          {payerError && <div style={{ color: '#D32F2F', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{payerError}</div>}
          <input
            type="number"
            placeholder="Monto (MXN)"
            min={1}
            value={amount}
            onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            required
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 8,
              border: '1.5px solid #ddd',
              fontSize: 16,
              background: '#fff',
              color: '#222',
              fontFamily: 'Montserrat, Arial, sans-serif',
              transition: 'border-color 0.2s',
              outline: 'none',
              marginBottom: 16
            }}
            onFocus={e => (e.target.style.borderColor = '#1A73E8')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          <input
            type="number"
            placeholder="% bajo garantía (0-100)"
            min={0}
            max={100}
            value={warrantyPercent}
            onChange={e => setWarrantyPercent(e.target.value === '' ? '' : Number(e.target.value))}
            required
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 8,
              border: '1.5px solid #ddd',
              fontSize: 16,
              background: '#fff',
              color: '#222',
              fontFamily: 'Montserrat, Arial, sans-serif',
              transition: 'border-color 0.2s',
              outline: 'none',
              marginBottom: 16
            }}
            onFocus={e => (e.target.style.borderColor = '#1A73E8')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          <input
            type="number"
            placeholder="Días en custodia (mínimo 1)"
            min={1}
            value={custodyDays}
            onChange={e => setCustodyDays(e.target.value === '' ? '' : Number(e.target.value))}
            required
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 8,
              border: '1.5px solid #ddd',
              fontSize: 16,
              background: '#fff',
              color: '#222',
              fontFamily: 'Montserrat, Arial, sans-serif',
              transition: 'border-color 0.2s',
              outline: 'none',
              marginBottom: 16
            }}
            onFocus={e => (e.target.style.borderColor = '#1A73E8')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          <input
            type="text"
            placeholder="Descripción o propósito del pago (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 8,
              border: '1.5px solid #ddd',
              fontSize: 16,
              background: '#fff',
              color: '#222',
              fontFamily: 'Montserrat, Arial, sans-serif',
              transition: 'border-color 0.2s',
              outline: 'none',
              marginBottom: 16
            }}
            onFocus={e => (e.target.style.borderColor = '#1A73E8')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          {/* Commission Section */}
          <div style={{ margin: '18px 0 0 0', padding: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, marginTop: 18 }}>Comisión (opcional)</div>
            <input
              type="number"
              placeholder="% de comisión (ej. 5)"
              min={0}
              max={100}
              value={commissionPercent}
              onChange={e => setCommissionPercent(e.target.value === '' ? '' : Number(e.target.value))}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: '1.5px solid #ddd',
                fontSize: 16,
                background: '#fff',
                color: '#222',
                fontFamily: 'Montserrat, Arial, sans-serif',
                transition: 'border-color 0.2s',
                outline: 'none',
                marginBottom: 8
              }}
              onFocus={e => (e.target.style.borderColor = '#1A73E8')}
              onBlur={e => (e.target.style.borderColor = '#ddd')}
            />
            <input
              type="text"
              placeholder="Nombre del beneficiario de la comisión"
              value={commissionBeneficiaryName}
              onChange={e => setCommissionBeneficiaryName(e.target.value)}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: '1.5px solid #ddd',
                fontSize: 16,
                background: '#fff',
                color: '#222',
                fontFamily: 'Montserrat, Arial, sans-serif',
                transition: 'border-color 0.2s',
                outline: 'none',
                marginBottom: 8
              }}
              onFocus={e => (e.target.style.borderColor = '#1A73E8')}
              onBlur={e => (e.target.style.borderColor = '#ddd')}
            />
            <input
              type="email"
              placeholder="Email del beneficiario de la comisión"
              value={commissionBeneficiaryEmail}
              onChange={e => setCommissionBeneficiaryEmail(e.target.value)}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: '1.5px solid #ddd',
                fontSize: 16,
                background: '#fff',
                color: '#222',
                fontFamily: 'Montserrat, Arial, sans-serif',
                transition: 'border-color 0.2s',
                outline: 'none',
                marginBottom: 8
              }}
              onFocus={e => (e.target.style.borderColor = '#1A73E8')}
              onBlur={e => { e.target.style.borderColor = '#ddd'; handleCommissionerBlur(e); }}
              autoComplete="off"
            />
            {commissionBeneficiaryEmail && commissionerLoading && <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>Validando beneficiario...</div>}
            {commissionBeneficiaryEmail && commissionerValid && commissionerVerified && !commissionerError && (
              <div style={{ color: '#2e7d32', fontWeight: 500, fontSize: 17, marginBottom: 8 }}>
                Beneficiario válido y verificado.
              </div>
            )}
            {commissionBeneficiaryEmail && commissionerError && <div style={{ color: '#D32F2F', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{commissionerError}</div>}
            <div style={{ marginTop: 4, color: '#555', fontWeight: 500 }}>
              Monto comisión: <strong>{commissionAmount !== '' ? `$${commissionAmount}` : 'N/A'}</strong>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#43a047',
              color: '#fff',
              padding: '14px 0',
              borderRadius: 24,
              fontSize: 18,
              border: 'none',
              marginTop: 18,
              cursor: 'pointer',
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 600,
              display: 'block',
              textAlign: 'center'
            }}
          >
            {loading ? 'Solicitando...' : 'Solicitar pago'}
          </button>
          {success && <div style={{ color: '#27ae60', marginTop: 12, fontWeight: 600, textAlign: 'center' }}>Solicitud de pago enviada correctamente.</div>}
          {error && <div style={{ color: '#D32F2F', marginTop: 12, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
        </form>
      </div>
    </ResponsiveLayout>
  );
};

export default PaymentRequest;
