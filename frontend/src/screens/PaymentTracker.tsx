import React, { useEffect, useState } from 'react';
import { authFetch } from '../authFetch';
import ResponsiveLayout from '../components/ResponsiveLayout';
import DisputeModal from '../components/DisputeModal';

// Import logo from public folder
const logoUrl = '/logo.svg';

const PaymentTracker: React.FC = () => {
  const [payment, setPayment] = useState<any>(null);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      setError('No se proporcionó el ID de pago.');
      setLoading(false);
      return;
    }
    authFetch(`http://localhost:4000/api/payments/${id}`, {
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.payment) {
          setPayment(data.payment);
        } else {
          setError('Pago no encontrado.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error al cargar el pago.');
        setLoading(false);
        console.error('Error fetching payment:', err);
      });
    // Fetch payment events
    authFetch(`http://localhost:4000/api/payments/${id}/events`, {
      headers: {
        Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.events)) {
          setPaymentEvents(data.events);
        }
      })
      .catch((err) => {
        console.error('Error fetching payment events:', err);
      });
  }, []);

  return (
    <ResponsiveLayout>
      <a href="/dashboard" style={{ display: 'block', margin: '0 auto 24px auto', width: 64 }}>
        <img src={logoUrl} alt="Kustodia Logo" style={{ width: 64, height: 64, display: 'block', margin: '0 auto', borderRadius: 12, boxShadow: '0 2px 8px #E3EAFD' }} />
      </a>
      <h2 style={{ color: '#1A73E8', marginTop: 0, marginBottom: 28, fontFamily: 'Montserrat, Arial, sans-serif', textAlign: 'center', fontWeight: 800, fontSize: 28, letterSpacing: 0.5 }}>Seguimiento de pago</h2>
      {loading ? (
        <div style={{ margin: '32px 0', color: '#888' }}>Cargando información del pago...</div>
      ) : error ? (
        <div style={{ margin: '32px 0', color: '#D32F2F', fontWeight: 600 }}>{error}</div>
      ) : !payment ? (
        <div style={{ margin: '32px 0', color: '#D32F2F', fontWeight: 600 }}>Error: No se pudo cargar el pago.</div>
      ) : !payment.escrow ? (
        <div style={{ margin: '32px 0', color: '#D32F2F', fontWeight: 600 }}>Error: No se pudo cargar la información de la custodia.</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 18, padding: '32px 28px', boxShadow: '0 4px 18px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', marginTop: 24, marginBottom: 24, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', transition: 'box-shadow 0.2s' }}>

          <div style={{ marginBottom: 10 }}>
            <strong>ID de pago:</strong> <span style={{ fontFamily: 'monospace', color: '#222', background: '#e8f0fe', padding: '2px 8px', borderRadius: 6 }}>{payment.id}</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <strong>Correo del remitente:</strong> <span style={{ color: '#1A73E8', fontWeight: 600 }}>{payment.user?.email || 'Desconocido'}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Estado actual:</strong>{' '}
            <span style={{ color: '#1A73E8' }}>
              {payment.status === 'pending' ? 'Por recibir fondos' :
                payment.status === 'funded' ? 'Fondos recibidos' :
                payment.status === 'paid' ? 'Proceso finalizado' :
                payment.status === 'in_custody' ? 'En custodia' :
                payment.status === 'completed' ? 'Pagado' :
                payment.status}
            </span>
          </div>
          {payment.transaction_id && (
            <div style={{ marginBottom: 16 }}>
              <strong>ID de transacción Juno:</strong>{' '}
              <span style={{ fontFamily: 'monospace', color: '#222', background: '#e8f0fe', padding: '2px 8px', borderRadius: 6 }}>{payment.transaction_id}</span>
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <strong>Línea de tiempo:</strong>
            <ul style={{ margin: '12px 0 0 16px', padding: 0 }}>
              {paymentEvents.length === 0 && (
                <li style={{ color: '#888' }}>Sin eventos registrados.</li>
              )}
              {paymentEvents.map(event => {
  // Mapeo de tipos a español, estilos y emoji
  const typeMap: Record<string, { label: string; color: string; icon: string }> = {
    initiated: { label: 'Pago iniciado', color: '#1976d2', icon: '💸' },
    escrow_created: { label: 'Custodia creada', color: '#388e3c', icon: '🔒' },
    deposit_received: { label: 'Depósito recibido', color: '#0288d1', icon: '🏦' },
    payout_released: { label: 'Monto liberado al vendedor', color: '#6d4c41', icon: '✅' },
    redemption_initiated: { label: 'Redención iniciada', color: '#757575', icon: '🔄' },
    redemption_success: { label: 'Redención exitosa', color: '#388e3c', icon: '💱' },
    redemption_failed: { label: 'Redención fallida', color: '#d32f2f', icon: '❌' },
    payout_completed: { label: 'Pago completado', color: '#1976d2', icon: '💵' },
    payout_initiated: { label: 'Pago iniciado', color: '#1e88e5', icon: '🏁' },
    dispute_opened: { label: 'Disputa abierta', color: '#fbc02d', icon: '⚠️' },
    dispute_resolved: { label: 'Disputa resuelta', color: '#388e3c', icon: '🤝' },
    // Agrega aquí otros tipos de eventos según sea necesario
  };
  const typeInfo = typeMap[event.type] || { label: event.type, color: '#888', icon: '📝' };

  return (
    <li key={event.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
      <span style={{ color: '#222', fontWeight: 600, minWidth: 90 }}>{new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', background: typeInfo.color,
        color: '#fff', borderRadius: 6, padding: '2px 10px', marginLeft: 10,
        fontWeight: 700, fontSize: 14, fontFamily: 'Montserrat, Arial, sans-serif', letterSpacing: 0.3
      }}>
        <span style={{ marginRight: 7 }}>{typeInfo.icon}</span>{typeInfo.label}
      </span>

    </li>
  );
})}
            </ul>
          </div>
          {/* Dispute Button at the bottom */}
          {(() => {
            if (!payment || !payment.escrow) return null;
            const now = new Date();
            const custodyEnd = payment.escrow.custody_end ? new Date(payment.escrow.custody_end) : null;
            const canRaise = payment.status === 'funded' &&
              (payment.escrow.status === 'active' || payment.escrow.status === 'funded') &&
              (payment.escrow.dispute_status === 'none' || payment.escrow.dispute_status === 'dismissed') &&
              (!custodyEnd || now < custodyEnd);
            const canReapply = payment.escrow.dispute_status === 'dismissed' && (!custodyEnd || now < custodyEnd);
            return (
              <>
                {canRaise && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 0 }}>
                    <button
                      style={{ width: '100%', maxWidth: 320, background: '#D32F2F', color: '#fff', border: 'none', borderRadius: 24, padding: '14px 0', fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 18, boxShadow: '0 1px 4px #E3EAFD', cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => setShowDispute(true)}
                    >
                      {payment.escrow.dispute_status === 'none' ? 'Levantar disputa' : 'Reaplicar disputa'}
                    </button>
                  </div>
                )}
                {showDispute && (
                  <React.Suspense fallback={<div>Cargando disputa...</div>}>
                    <DisputeModal
                      escrowId={payment.escrow.id}
                      onClose={() => setShowDispute(false)}
                      canReapply={canReapply}
                    />
                  </React.Suspense>
                )}
              </>
            );
          })()}
          {payment.escrow && (
            <React.Fragment>
              <div style={{ marginTop: 32, background: '#f8fafd', borderRadius: 10, padding: 20, boxShadow: '0 1px 4px #E3EAFD' }}>
                <h3 style={{ color: '#1A73E8', margin: '0 0 10px 0', fontSize: 20, textAlign: 'center', fontWeight: 700 }}>Condiciones de pago</h3>

                {/* CLABE de depósito del vendedor */}
                {(payment.recipient_deposit_clabe || payment.recipient?.deposit_clabe) ? (
                  <div style={{ marginBottom: 8, background: '#fffbe6', color: '#FFC107', padding: '8px 12px', borderRadius: 8, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 15 }}>
                    CLABE de depósito del vendedor: <span style={{ color: '#222', letterSpacing: 1 }}>{payment.recipient_deposit_clabe || payment.recipient?.deposit_clabe}</span>
                  </div>
                ) : (
                  <div style={{ marginBottom: 8, background: '#fffbe6', color: '#FFC107', padding: '8px 12px', borderRadius: 8, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 15 }}>
                    CLABE de depósito del vendedor: <span style={{ color: '#D32F2F' }}>No disponible</span>
                  </div>
                )}
                {payment.recipient_email && (
                  <div style={{ marginBottom: 8, background: '#e8f0fe', color: '#1A73E8', padding: '8px 12px', borderRadius: 8, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 15 }}>
                    Correo del destinatario: <span style={{ color: '#222' }}>{payment.recipient_email}</span>
                  </div>
                )}
                {/* Concepto del pago */}
                {(payment.concept || payment.escrow?.concept) && (
                  <div style={{ marginBottom: 8, background: '#f0f4ff', color: '#1A73E8', padding: '8px 12px', borderRadius: 8, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 15 }}>
                    Concepto: <span style={{ color: '#222' }}>{payment.concept || payment.escrow?.concept}</span>
                  </div>
                )}
                {/* Monto total del pago */}
                <div style={{ marginBottom: 12 }}>
                  <strong>Monto total del pago:</strong> ${Number(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
                {/* Porcentaje en custodia */}
                <div style={{ marginBottom: 12 }}>
                  <strong>Porcentaje en custodia:</strong> {payment.escrow?.custody_percent ? payment.escrow.custody_percent + '%' : 'N/A'}
                </div>
                {/* Días en custodia */}
                <div style={{ marginBottom: 12 }}>
                  <strong>Días en custodia:</strong> {payment.escrow?.custody_end && payment.escrow?.created_at ? Math.round((new Date(payment.escrow.custody_end).getTime() - new Date(payment.escrow.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                </div>
                {/* Monto en custodia */}
                <div style={{ marginBottom: 12 }}>
                  <strong>Monto a mantener en custodia:</strong> ${['released', 'completed', 'paid'].includes(payment.escrow.status) ? '0.00' : Number(payment.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
                {/* Monto pagado / por pagar / liberado al vendedor */}
                {['released', 'completed', 'paid'].includes(payment.escrow.status) ? (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Monto liberado al vendedor:</strong> ${Number(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Monto por pagar:</strong> ${
                      payment.escrow.paid_amount !== undefined
                        ? Number(payment.escrow.paid_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                        : Array.isArray(payment.escrow.payouts)
                          ? payment.escrow.payouts.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                          : '0.00'
                    } MXN
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default PaymentTracker;
