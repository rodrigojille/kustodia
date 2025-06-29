import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../authFetch';
import ResponsiveLayout from '../components/ResponsiveLayout';

const SellerAcceptance: React.FC = () => {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      setError('No se proporcionó el ID de la solicitud de pago.');
      setLoading(false);
      return;
    }
    authFetch(`/api/payments/${id}`, {
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.payment) {
          setPayment(data.payment);
        } else {
          setError('Solicitud de pago no encontrada.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar la solicitud de pago.');
        setLoading(false);
      });
  }, []);

  const handleAccept = async () => {
    if (!payment?.id) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await authFetch(`/api/request-payments/${payment.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/payment/tracker?id=' + payment.id), 1500);
      } else {
        setError(data.error || 'Error al aceptar la solicitud de pago.');
      }
    } catch (err) {
      setError('Error al aceptar la solicitud de pago.');
    }
    setAccepting(false);
  };

  return (
    <ResponsiveLayout>
      <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Aceptar pago solicitado</h2>
      {loading ? (
        <div style={{ margin: '32px 0', color: '#888' }}>Cargando solicitud...</div>
      ) : error ? (
        <div style={{ margin: '32px 0', color: '#D32F2F', fontWeight: 600 }}>{error}</div>
      ) : !payment ? (
        <div style={{ margin: '32px 0', color: '#D32F2F', fontWeight: 600 }}>No se encontró la solicitud.</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', marginTop: 12, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>De:</strong> {payment.recipient_email || 'Desconocido'}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Monto:</strong> ${Number(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {payment.currency || 'MXN'}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Descripción:</strong> {payment.description || 'Sin descripción'}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Estado:</strong> {payment.status}
          </div>
          {success ? (
            <div style={{ color: '#27ae60', fontWeight: 600, marginTop: 16 }}>Solicitud aceptada. Redirigiendo...</div>
          ) : (
            <button
              type="button"
              style={{ background: '#1A73E8', color: '#fff', padding: '14px 32px', borderRadius: 24, fontSize: 18, border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600, marginTop: 8, width: '100%' }}
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? 'Aceptando...' : 'Aceptar solicitud y fondear'}
            </button>
          )}
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default SellerAcceptance;
