import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ResponsiveLayout from '../components/ResponsiveLayout';

const PaymentRequestSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [payment, setPayment] = useState<any>((location.state && (location.state as any).payment) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permitir /payment-request-summary/:paymentId
  useEffect(() => {
    if (!payment && params.paymentId) {
      setLoading(true);
      fetch(`/api/payments/${params.paymentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('No se encontró el pago');
          const data = await res.json();
          setPayment(data.payment);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [params.paymentId, payment]);

  if (loading) {
    return (
      <ResponsiveLayout>
        <div style={{ textAlign: 'center', marginTop: 64 }}>Cargando resumen...</div>
      </ResponsiveLayout>
    );
  }
  if (error) {
    return (
      <ResponsiveLayout>
        <div style={{ textAlign: 'center', marginTop: 64, color: '#D32F2F' }}>{error}</div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 28px', fontWeight: 600, cursor: 'pointer' }}>Ir al dashboard</button>
        </div>
      </ResponsiveLayout>
    );
  }
  if (!payment) {
    return (
      <ResponsiveLayout>
        <div style={{ maxWidth: 420, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #E3EAFD', padding: '36px 32px', marginTop: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 22, color: '#222', marginBottom: 8 }}>Resumen de solicitud</div>
          </div>
          <div style={{ color: '#D32F2F', fontWeight: 600, textAlign: 'center' }}>
            No se pudo cargar la información de la solicitud.
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 28px', fontWeight: 600, cursor: 'pointer' }}>Ir al dashboard</button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div style={{ maxWidth: 420, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #E3EAFD', padding: '36px 32px', marginTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 64, height: 64, borderRadius: 16, margin: '0 auto', cursor: 'pointer', display: 'block' }} onClick={() => navigate('/dashboard')} />
            <div style={{ fontWeight: 600, fontSize: 24, color: '#222', marginTop: 16, marginBottom: 0, textAlign: 'center' }}>Solicitud de pago recibida</div>
          </div>
        </div>
        <div style={{ marginBottom: 18, fontSize: 16, color: '#222', fontWeight: 500 }}>
          <div><strong>Pagador:</strong> {payment.payer_email}</div>
          <div><strong>Monto:</strong> ${payment.amount} {payment.currency}</div>
          {payment.description && <div><strong>Descripción:</strong> {payment.description}</div>}
          {payment.commission_percent && <div><strong>Comisión:</strong> {payment.commission_percent}%</div>}
          {payment.commission_beneficiary_name && <div><strong>Beneficiario comisión:</strong> {payment.commission_beneficiary_name}</div>}
          <div><strong>Status:</strong> {payment.status}</div>
          <div><strong>Fecha de creación:</strong> {new Date(payment.created_at).toLocaleString()}</div>
        </div>
        {/* Approve/Reject actions for payer */}
{payment.status === 'requested' && (() => {
  let email = '';
  try {
    email = JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || ''))?.email;
  } catch {}
  return email === payment.payer_email;
})() && (
  <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <button
      onClick={async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch(`/api/request-payments/${payment.id}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setPayment(data.payment);
          } else {
            setError(data.error || 'No se pudo aprobar la solicitud.');
          }
        } catch {
          setError('Error de conexión al aprobar.');
        } finally {
          setLoading(false);
        }
      }}
      style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 16, padding: '12px 28px', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}
      disabled={loading}
    >
      {loading ? 'Aprobando...' : 'Aprobar solicitud'}
    </button>
    <button
      onClick={async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch(`/api/request-payments/${payment.id}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setPayment({ ...payment, status: 'rejected' });
          } else {
            setError(data.error || 'No se pudo rechazar la solicitud.');
          }
        } catch {
          setError('Error de conexión al rechazar.');
        } finally {
          setLoading(false);
        }
      }}
      style={{ background: '#D32F2F', color: '#fff', border: 'none', borderRadius: 16, padding: '12px 28px', fontWeight: 600, fontSize: 18, cursor: 'pointer' }}
      disabled={loading}
    >
      {loading ? 'Rechazando...' : 'Rechazar solicitud'}
    </button>
    {error && <div style={{ color: '#D32F2F', fontWeight: 600 }}>{error}</div>}
  </div>
)}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 16, padding: '10px 28px', fontWeight: 600, cursor: 'pointer' }}>Ir al dashboard</button>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default PaymentRequestSummary;
