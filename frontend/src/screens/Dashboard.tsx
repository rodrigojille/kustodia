import React, { useEffect, useState } from 'react';
import { authFetch } from '../authFetch';
import ResponsiveLayout from '../components/ResponsiveLayout';

const ClabeSection: React.FC = () => {
  const [payoutClabe, setPayoutClabe] = useState('');
  const [depositClabe, setDepositClabe] = useState('');
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user's current payout and deposit CLABE
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await authFetch('/api/users/me', {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          if (data.user.payout_clabe) {
            setPayoutClabe(data.user.payout_clabe);
            setInput(data.user.payout_clabe);
          }
          if (data.user.deposit_clabe) {
            setDepositClabe(data.user.deposit_clabe);
          }
        }
      } catch {}
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const res = await authFetch('/api/users/update-payout-clabe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ payout_clabe: input })
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutClabe(input);
        setEditing(false);
        setFeedback('CLABE guardada correctamente.');
      } else {
        setFeedback(data.error || 'No se pudo guardar la CLABE.');
      }
    } catch {
      setFeedback('Error de conexión. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Deposit CLABE (not editable) */}
      {depositClabe && (
        <div style={{ background: '#e8fbe8', color: '#27ae60', padding: 12, borderRadius: 8, marginBottom: 10, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span>CLABE para depósitos: <span style={{ color: '#222' }}>{depositClabe}</span></span>
            <div style={{ fontWeight: 400, fontSize: 13, color: '#27ae60', marginTop: 2 }}>Mi CLABE para depósitos seguros</div>
          </div>
        </div>
      )}
      {/* Payout CLABE (editable) */}
      {payoutClabe && !editing ? (
        <div style={{ background: '#e8f0fe', color: '#1A73E8', padding: 12, borderRadius: 8, marginBottom: 10, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>CLABE para recibir pagos: <span style={{ color: '#222' }}>{payoutClabe}</span></span>
          <button onClick={() => setEditing(true)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 16px', marginLeft: 8, cursor: 'pointer', fontWeight: 600 }}>Editar</button>
        </div>
      ) : (
        <div style={{ background: '#ffeaea', color: '#D32F2F', padding: 12, borderRadius: 8, marginBottom: 10, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif' }}>
          CLABE bancaria pendiente. Ingresa tu CLABE para poder enviar o recibir pagos.
          <form style={{ marginTop: 8, display: 'flex', gap: 8 }} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="CLABE (18 dígitos)"
              required
              maxLength={18}
              value={input}
              onChange={e => setInput(e.target.value.replace(/[^0-9]/g, ''))}
              style={{
                padding: 10,
                borderRadius: 8,
                border: '1.5px solid #ddd',
                fontSize: 16,
                fontFamily: 'Montserrat, Arial, sans-serif',
                width: 180,
                background: '#fff',
                color: '#222',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#1A73E8')}
              onBlur={e => (e.target.style.borderColor = '#ddd')}
            />
            <button type="submit" disabled={loading} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </form>
          {feedback && <div style={{ marginTop: 8, color: feedback.startsWith('CLABE') ? '#27ae60' : '#D32F2F', background: feedback.startsWith('CLABE') ? '#e8fbe8' : '#fff', padding: 8, borderRadius: 8, fontWeight: 600 }}>{feedback}</div>}
        </div>
      )}
    </>
  );
};

const Dashboard: React.FC = () => {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; full_name?: string } | null>(null);
  const [clabe, setClabe] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);

  // Always fetch latest user info (including kyc_status and clabe) when Dashboard mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    authFetch('/api/users/me', {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser({ id: data.user.id, email: data.user.email, full_name: data.user.full_name });
          setKycStatus(data.user.kyc_status);
          setClabe(data.user.payout_clabe || null);
        }
      });
  }, []);

  // Fetch user payments when currentUser is loaded
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem('token');
    setLoadingPayments(true);
    authFetch('/api/payments/user-payments', {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        setPayments(Array.isArray(data.payments) ? data.payments : []);
        setLoadingPayments(false);
      })
      .catch(() => setLoadingPayments(false));
  }, [currentUser]);

  // Listen for storage events (e.g. after KYC update in another tab)
  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem('token');
      authFetch('/api/users/me', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      })
        .then(res => res.json())
        .then(data => setKycStatus(data.user.kyc_status));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleStartKYC = async () => {
    if (!currentUser) {
      alert('Usuario no autenticado.');
      return;
    }
    try {
      const res = await authFetch('/api/truora/start-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, email: currentUser.email })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'No se pudo iniciar el proceso de KYC');
      }
    } catch (err) {
      alert('Error de conexión al iniciar KYC');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <ResponsiveLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, width: '100%' }}>
          <button onClick={handleLogout} style={{ background: '#D32F2F', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif' }}>
            Cerrar sesión
          </button>
        </div>
        <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: 26, marginBottom: 0, color: '#1A73E8', textAlign: 'center' }}>Dashboard</h2>
        <div style={{ marginBottom: 18, fontSize: 18, color: '#222', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600, textAlign: 'center' }}>
          Bienvenido{currentUser?.full_name ? `, ${currentUser.full_name}` : ''} a tu panel de Kustodia.
        </div>
        {/* KYC and CLABE checks */}
        <div style={{ marginBottom: 18, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Dynamic KYC status check */}
          {kycStatus !== "approved" && (
            <div style={{ background: '#fff8e1', color: '#FFC107', padding: 12, borderRadius: 8, marginBottom: 10, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', textAlign: 'center' }}>
              Verificación de identidad pendiente.
              <button onClick={handleStartKYC} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 24px', marginLeft: 16, cursor: 'pointer', fontWeight: 600 }}>
                Iniciar KYC
              </button>
            </div>
          )}
          {/* CLABE logic */}
          <ClabeSection />
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '32px 28px', boxShadow: '0 4px 18px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', marginTop: 24, marginBottom: 24, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', transition: 'box-shadow 0.2s', width: '100%' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px #B3C7F9'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 18px #E3EAFD'}>
          {/* Pending Payment Requests to Approve */}
          <div style={{ background: '#fffbe8', border: '1.5px solid #ffe082', borderRadius: 12, padding: 18, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#c49000', marginBottom: 8 }}>Solicitudes de cobro pendientes</div>
      {payments && currentUser && payments.filter(p => p.payer_email === currentUser.email && p.status === 'requested').length > 0 ? (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {payments.filter(p => p.payer_email === currentUser.email && p.status === 'requested').map(p => (
            <li key={p.id} style={{ marginBottom: 10, padding: 10, background: '#fffde7', borderRadius: 8, border: '1px solid #ffe082', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div><strong>Solicitante:</strong> {p.recipient_email}</div>
              <div><strong>Monto:</strong> ${p.amount} {p.currency}</div>
              {p.description && <div><strong>Descripción:</strong> {p.description}</div>}
              <div><strong>Fecha:</strong> {new Date(p.created_at).toLocaleString()}</div>
              <div style={{ marginTop: 8 }}>
                <a href={`/payment-request-summary/${p.id}`} style={{ background: '#43a047', color: '#fff', padding: '7px 18px', borderRadius: 16, fontWeight: 600, textDecoration: 'none', marginRight: 8 }}>Ver y aprobar</a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: '#bfa900', fontWeight: 500 }}>No tienes solicitudes de cobro pendientes.</div>
      )}
    </div>
    <div style={{ marginBottom: 16, display: 'flex', gap: 32 }}>
      <div>
        <strong>Pagos enviados:</strong> <span style={{ color: '#D32F2F', fontWeight: 600 }}>
          ${payments && currentUser ? payments.filter(p => p.user?.email === currentUser.email).reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString('es-MX', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} MXN
        </span>
        </div>
      </div>
      {/* Payment status sections */}
      <div style={{ marginBottom: 16 }}>
         <strong>Pagos por recibir fondos:</strong>
         {loadingPayments ? (
           <div style={{ margin: '8px 0', color: '#888' }}>Cargando pagos...</div>
         ) : (
           <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
             {payments.filter(p => (p.status === 'pending' || p.status === 'funded') && p.user?.email === currentUser?.email).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).length === 0 && (
               <li style={{ color: '#888' }}>No hay pagos enviados en proceso.</li>
             )}
             {payments.filter(p => (p.status === 'pending' || p.status === 'funded') && p.user?.email === currentUser?.email).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(p => (
               <li key={p.id} style={{ marginBottom: 4 }}>
                 <>Pago enviado a <b>{p.recipient_email}</b> - {p.escrow ? (
  <>
  {['released', 'completed', 'paid'].includes(p.escrow.status) ? (
    <>
      <span style={{ color: '#27ae60' }}>Enviado: ${Number(p.escrow.release_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
      <span style={{ color: '#1A73E8', marginLeft: 8 }}>En custodia: ${Number(p.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
    </>
  ) : ['funded', 'in_custody'].includes(p.escrow.status) ? (
    <span style={{ color: '#1A73E8' }}>En custodia: ${Number(p.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
  ) : null}
</>
) : (`$${p.amount} ${p.currency?.toUpperCase?.() || ''}`)}</>
                 {' '}
                 <a href={`/payment/tracker?id=${p.id}`} style={{ color: '#1A73E8', marginLeft: 8, textDecoration: 'underline', fontWeight: 500 }}>Ver seguimiento</a>
                 <span style={{ marginLeft: 8, color: '#FFC107', fontWeight: 600, fontSize: 13 }}>[{p.status === 'pending' ? 'En proceso' : 'Fondos recibidos'}]</span>
               </li>
             ))}
           </ul>
         )}

         <strong>Pagos fondeados:</strong>
         {loadingPayments ? (
           <div style={{ margin: '8px 0', color: '#888' }}>Cargando pagos...</div>
         ) : (
           <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
             {payments.filter(p => (p.status === 'pending' || p.status === 'funded') && p.recipient_email === currentUser?.email).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).length === 0 && (
               <li style={{ color: '#888' }}>No hay pagos recibidos en proceso.</li>
             )}
             {payments.filter(p => (p.status === 'pending' || p.status === 'funded') && p.recipient_email === currentUser?.email).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(p => (
               <li key={p.id} style={{ marginBottom: 4 }}>
                 <>Pago recibido de <b>{p.user?.email}</b> - {p.escrow ? (
  <>
  {['released', 'completed', 'paid'].includes(p.escrow.status) ? (
    <>
      <span style={{ color: '#27ae60' }}>Enviado: ${Number(p.escrow.release_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
      <span style={{ color: '#1A73E8', marginLeft: 8 }}>Monto recibido: ${Number(p.escrow.release_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
    </>
  ) : ['funded', 'in_custody'].includes(p.escrow.status) ? (
    <span style={{ color: '#1A73E8' }}>En custodia: ${Number(p.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
  ) : null}
</>
) : (`$${p.amount} ${p.currency?.toUpperCase?.() || ''}`)}</>
                 {' '}
                 <a href={`/payment/tracker?id=${p.id}`} style={{ color: '#1A73E8', marginLeft: 8, textDecoration: 'underline', fontWeight: 500 }}>Ver seguimiento</a>
                 <span style={{ marginLeft: 8, color: '#FFC107', fontWeight: 600, fontSize: 13 }}>[{p.status === 'pending' ? 'En proceso' : 'Fondos recibidos'}]</span>
               </li>
             ))}
           </ul>
         )}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <strong>Pagos finalizados enviados:</strong>
        {loadingPayments ? (
          <div style={{ margin: '8px 0', color: '#888' }}>Cargando pagos...</div>
        ) : (
          (() => {
            const finalizedSent = payments.filter(p => (p.status === 'completed' || p.status === 'paid') && p.user?.email === currentUser?.email).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            if (finalizedSent.length === 0) return <ul style={{ margin: '8px 0 0 18px', padding: 0 }}><li style={{ color: '#888' }}>No hay pagos enviados finalizados.</li></ul>;
            return <>
              <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                {finalizedSent.slice(0, 3).map(p => (
                  <li key={p.id} style={{ marginBottom: 4 }}>
  <>Pago enviado a <b>{p.recipient_email}</b> - {p.escrow ? (
    <>
      {['released', 'completed', 'paid'].includes(p.escrow.status) ? (
                    <>
                      <span style={{ color: '#27ae60' }}>Enviado: ${Number(p.escrow.release_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                      <span style={{ color: '#1A73E8', marginLeft: 8 }}>Monto pagado: ${Number(p.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </>
                  ) : ['funded', 'in_custody'].includes(p.escrow.status) ? (
                    <span style={{ color: '#1A73E8' }}>En custodia: ${Number(p.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  ) : null}
      {/* Show seller's CLABE if payment is pending */}
      
    </>
  ) : (`$${p.amount} ${p.currency?.toUpperCase?.() || ''}`)}
  </>
                    {' '}
                    <a href={`/payment/tracker?id=${p.id}`} style={{ color: '#1A73E8', marginLeft: 8, textDecoration: 'underline', fontWeight: 500 }}>Ver seguimiento</a>
                    <span style={{ marginLeft: 8, color: '#27ae60', fontWeight: 600, fontSize: 13 }}>[Terminado]</span>
                  </li>
                ))}
              </ul>
              {finalizedSent.length > 3 && (
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <a href="/payments/finalized?type=sent" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}>Ver todos</a>
                </div>
              )}
            </>;
          })()
        )}

        <strong>Pagos finalizados recibidos:</strong>
        {loadingPayments ? (
          <div style={{ margin: '8px 0', color: '#888' }}>Cargando pagos...</div>
        ) : (
          (() => {
            const finalizedReceived = payments.filter(p => (p.status === 'completed' || p.status === 'paid') && p.recipient_email === currentUser?.email).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            if (finalizedReceived.length === 0) return <ul style={{ margin: '8px 0 0 18px', padding: 0 }}><li style={{ color: '#888' }}>No hay pagos recibidos finalizados.</li></ul>;
            return <>
              <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                {finalizedReceived.slice(0, 3).map(p => (
                  <li key={p.id} style={{ marginBottom: 4 }}>
                    <>Pago recibido de <b>{p.user?.email}</b> - {p.escrow ? (
  <>
  {['released', 'completed', 'paid'].includes(p.escrow.status) ? (
    <>
      <span style={{ color: '#27ae60' }}>Enviado: ${Number(p.escrow.release_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
      <span style={{ color: '#1A73E8', marginLeft: 8 }}>Monto recibido: ${Number(p.escrow.release_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
    </>
  ) : ['funded', 'in_custody'].includes(p.escrow.status) ? (
    <span style={{ color: '#1A73E8' }}>En custodia: ${Number(p.escrow.custody_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
  ) : null}
</>
) : (`$${p.amount} ${p.currency?.toUpperCase?.() || ''}`)}</>
                    {' '}
                    <a href={`/payment/tracker?id=${p.id}`} style={{ color: '#1A73E8', marginLeft: 8, textDecoration: 'underline', fontWeight: 500 }}>Ver seguimiento</a>
                    <span style={{ marginLeft: 8, color: '#27ae60', fontWeight: 600, fontSize: 13 }}>[Terminado]</span>
                  </li>
                ))}
              </ul>
              {finalizedReceived.length > 3 && (
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <a href="/payments/finalized?type=received" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 600, fontSize: 14 }}>Ver todos</a>
                </div>
              )}
            </>;
          })()
        )}
      </div>
    </div>
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 8 }}>
      {(kycStatus === "approved" && clabe) ? (
        <>
          <a href="/payment/initiate" style={{ background: '#1A73E8', color: '#fff', padding: '16px 32px', borderRadius: 28, fontSize: 18, textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Arial, sans-serif', boxShadow: '0 2px 8px #E3EAFD', cursor: 'pointer', opacity: 1, transition: 'box-shadow 0.2s, background 0.2s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 18px #B3C7F9'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px #E3EAFD'}>Iniciar pago</a>
          <a href="/payment/request" style={{ background: '#43a047', color: '#fff', padding: '16px 32px', borderRadius: 28, fontSize: 18, textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Arial, sans-serif', boxShadow: '0 2px 8px #E3EAFD', cursor: 'pointer', opacity: 1, transition: 'box-shadow 0.2s, background 0.2s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 18px #B3F9B3'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px #E3EAFD'}>Iniciar cobro</a>
        </>
      ) : (
        <>
          <a href="#" style={{ background: '#ccc', color: '#fff', padding: '14px 28px', borderRadius: 24, fontSize: 16, textDecoration: 'none', fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', boxShadow: '0 1px 4px #E3EAFD', pointerEvents: 'none', opacity: 0.6 }}>Iniciar pago</a>
          <a href="#" style={{ background: '#ccc', color: '#fff', padding: '14px 28px', borderRadius: 24, fontSize: 16, textDecoration: 'none', fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', boxShadow: '0 1px 4px #E3EAFD', pointerEvents: 'none', opacity: 0.6 }}>Iniciar cobro</a>
        </>
      )}
    </div>
  </div>
</ResponsiveLayout>
);
};

export default Dashboard;
