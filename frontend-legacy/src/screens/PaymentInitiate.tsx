import React, { useState } from 'react';
import { authFetch } from '../authFetch';
import { useNavigate } from 'react-router-dom';
import ResponsiveLayout from '../components/ResponsiveLayout';

const PaymentInitiate: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [warrantyPercent, setWarrantyPercent] = useState<number | ''>('');
  const [custodyDays, setCustodyDays] = useState<number | ''>('');
  const [commissionPercent, setCommissionPercent] = useState<number | ''>('');
  const [commissionBeneficiaryName, setCommissionBeneficiaryName] = useState('');
  const [commissionBeneficiaryEmail, setCommissionBeneficiaryEmail] = useState('');
  const [commissionerValid, setCommissionerValid] = useState<null | boolean>(null);
  const [commissionerVerified, setCommissionerVerified] = useState<null | boolean>(null);
  const [commissionerLoading, setCommissionerLoading] = useState(false);
  const [commissionerError, setCommissionerError] = useState<string | null>(null);

  const [recipientValid, setRecipientValid] = useState<null | boolean>(null);
  const [recipientVerified, setRecipientVerified] = useState<null | boolean>(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Calculate commission amount
  const commissionAmount = amount && commissionPercent !== ''
    ? Number(((Number(amount) * Number(commissionPercent)) / 100).toFixed(2))
    : '';

  const validateRecipient = async (email: string) => {
    setRecipientLoading(true);
    setRecipientError(null);
    setRecipientValid(null);
    setRecipientVerified(null);
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
      setRecipientValid(null);
      setRecipientVerified(null);
    }
    setRecipientLoading(false);
  };

  const handleRecipientBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (recipient) validateRecipient(recipient);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || warrantyPercent === '' || custodyDays === '') return;
    await validateRecipient(recipient);
    if (!recipientValid || !recipientVerified) return;
    if (commissionBeneficiaryEmail) {
      await validateCommissioner(commissionBeneficiaryEmail);
      if (!commissionerValid || !commissionerVerified) return;
    }

    // Get current user info (for user_id)
    let user_id: number | null = null;
    try {
      const token = localStorage.getItem('token');
      const resUser = await authFetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}` || ''
        }
      });
      const userData = await resUser.json();
      if (resUser.ok && userData.user && userData.user.id) {
        user_id = userData.user.id;
      } else {
        alert('No se pudo obtener el usuario actual.');
        return;
      }
    } catch {
      alert('Error de conexión al obtener usuario.');
      return;
    }

    // Initiate payment via backend
    let payment, escrow;
    try {
      const token = localStorage.getItem('token');
      const res = await authFetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` || ''
        },
        body: JSON.stringify({
          user_id,
          recipient_email: recipient,
          amount: Number(amount),
          currency: 'MXN',
          description,
          custody_percent: Number(warrantyPercent),
          custody_period: Number(custodyDays),
          commission_percent: commissionPercent === '' ? null : Number(commissionPercent),
          commission_amount: commissionAmount === '' ? null : Number(commissionAmount),
          commission_beneficiary_name: commissionBeneficiaryName || null,
          commission_beneficiary_email: commissionBeneficiaryEmail || null
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.payment) {
        payment = data.payment;
        escrow = data.escrow;
      } else {
        alert(data.error || 'No se pudo iniciar el pago.');
        return;
      }
    } catch {
      alert('Error de conexión al iniciar pago.');
      return;
    }

    // Fetch recipient's deposit_clabe
    let depositClabe = '';
    try {
      const token = localStorage.getItem('token');
      const resClabe = await authFetch('/api/users/recipient-clabe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` || ''
        },
        body: JSON.stringify({ email: recipient })
      });
      const clabeData = await resClabe.json();
      if (resClabe.ok && clabeData.deposit_clabe) {
        depositClabe = clabeData.deposit_clabe;
      } else {
        alert(clabeData.error || 'No se pudo obtener la CLABE de depósito del destinatario.');
        return;
      }
    } catch {
      alert('Error de conexión al obtener la CLABE de depósito.');
      return;
    }

    // Navigate to transfer instructions, passing payment info
    navigate('/transfer-instructions', {
      state: {
        clabe: depositClabe,
        amount: Number(amount),
        recipient,
        description,
        warrantyPercent: Number(warrantyPercent),
        custodyDays: Number(custodyDays),
        paymentId: payment.id,
        escrowId: escrow?.id
      },
    });
  };

  return (
    <ResponsiveLayout>
      <a href="/dashboard" style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 64, height: 64, borderRadius: 16, boxShadow: '0 2px 8px #E3EAFD', background: '#fff' }} />
      </a>
      <h2 style={{ color: '#1A73E8', textAlign: 'center', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Iniciar pago</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Destinatario (correo o usuario)"
          value={recipient}
          onChange={e => {
            setRecipient(e.target.value);
            setRecipientValid(null);
            setRecipientVerified(null);
            setRecipientError(null);
          }}
          required
          style={{
            padding: 14,
            borderRadius: 8,
            border: recipientError ? '1.5px solid #D32F2F' : '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = '#1A73E8')}
          onBlur={e => { e.target.style.borderColor = '#ddd'; handleRecipientBlur(e); }}
        />
        {recipientLoading && <div style={{ color: '#1A73E8', marginTop: 3, fontWeight: 500 }}>Validando destinatario...</div>}
        {recipientError && <div style={{ color: '#D32F2F', marginTop: 3, fontWeight: 500 }}>{recipientError}</div>}
        {recipientValid && recipientVerified && <div style={{ color: '#27ae60', marginTop: 3, fontWeight: 500 }}>Destinatario válido y verificado.</div>}
        <input
          type="number"
          placeholder="Monto (MXN)"
          min={1}
          value={amount}
          onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          required
          style={{
            padding: 14,
            borderRadius: 8,
            border: '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
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
            padding: 14,
            borderRadius: 8,
            border: '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
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
            padding: 14,
            borderRadius: 8,
            border: '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
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
            padding: 14,
            borderRadius: 8,
            border: '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = '#1A73E8')}
          onBlur={e => (e.target.style.borderColor = '#ddd')}
        />

        {/* Commission Section */}
        <div style={{ margin: '18px 0 0 0', padding: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Comisión (opcional)</div>
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
          aria-label="Enviar pago"
          disabled={
            recipientLoading ||
            !recipient ||
            !amount ||
            warrantyPercent === '' ||
            custodyDays === '' ||
            recipientValid !== true ||
            recipientVerified !== true
          }
          style={{
            background: (recipientValid && recipientVerified && recipient && amount && warrantyPercent !== '' && custodyDays !== '' && !recipientLoading) ? '#1A73E8' : '#ccc',
            color: '#fff',
            padding: '14px 0',
            borderRadius: 24,
            fontSize: 18,
            border: 'none',
            marginTop: 18,
            cursor: (recipientValid && recipientVerified && recipient && amount && warrantyPercent !== '' && custodyDays !== '' && !recipientLoading) ? 'pointer' : 'not-allowed',
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontWeight: 600,
            width: '100%',
            transition: 'background 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px #E3EAFD',
          }}
        >
          {recipientLoading ? 'Validando destinatario...' : 'Enviar pago'}
        </button>
        {recipientError && <div style={{ color: '#D32F2F', marginTop: 10, fontWeight: 600, textAlign: 'center' }}>{recipientError}</div>}
        {/* Success message placeholder */}
        {/* You can add a state like 'success' and show a message here after payment is sent */}

      </form>
    </ResponsiveLayout>
  );
};

export default PaymentInitiate;
