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
  const [recipientValid, setRecipientValid] = useState<null | boolean>(null);
  const [recipientVerified, setRecipientVerified] = useState<null | boolean>(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || warrantyPercent === '' || custodyDays === '') return;
    await validateRecipient(recipient);
    if (!recipientValid || !recipientVerified) return;

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
          custody_period: Number(custodyDays)
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

        <button
          type="submit"
          style={{ background: '#1A73E8', color: '#fff', padding: '14px 0', borderRadius: 24, fontSize: 18, border: 'none', marginTop: 18, cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600 }}
        >
          Enviar pago
        </button>
      </form>
    </ResponsiveLayout>
  );
};

export default PaymentInitiate;
