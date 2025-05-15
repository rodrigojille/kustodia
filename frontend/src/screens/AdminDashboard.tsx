import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import axios from 'axios';

const tabStyle = {
  display: 'inline-block',
  padding: '10px 32px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 16,
  border: 'none',
  borderBottom: '2.5px solid transparent',
  background: 'none',
  color: '#1A73E8',
  outline: 'none',
  marginRight: 12,
};

const activeTabStyle = {
  ...tabStyle,
  borderBottom: '2.5px solid #1A73E8',
  color: '#D32F2F',
};

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'disputes' | 'users' | 'transactions'>('disputes');

  // Disputes state
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  // Removed unused setTransactionsError

  const [transactionSearch, setTransactionSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Data fetching for each tab
  React.useEffect(() => {
    if (tab === 'disputes') {
      setDisputesLoading(true);
      setDisputesError(null);
      fetch('/api/admin/disputes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setDisputes(data.disputes || []);
          setDisputesLoading(false);
        })
        .catch(() => {
          setDisputesError('Error al cargar disputas');
          setDisputesLoading(false);
        });
    }
    if (tab === 'users') {
      setUsersLoading(true);
      setUsersError(null);
      fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setUsers(data.users || []);
          setUsersLoading(false);
        })
        .catch(() => {
          setUsersError('Error al cargar usuarios');
          setUsersLoading(false);
        });
    }
    if (tab === 'transactions') {
      const fetchPayments = async () => {
        setTransactionsLoading(true);
        try {
          const response = await axios.get("/api/admin/payments", {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const data = response.data as { payments: any[] };
setTransactions(data.payments || []);
        } catch (err) {
          setTransactions([]);
        }
        setTransactionsLoading(false);
      };
      fetchPayments();
    }
  }, [tab]);

  return (
    <ResponsiveLayout>
      <div style={{
        maxWidth: 1000,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Montserrat, Arial, sans-serif',
      }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: 12 }}>
          <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 56, height: 56, borderRadius: 12, boxShadow: '0 2px 8px #E3EAFD', background: '#fff' }} />
        </a>
        <h2 style={{ color: '#1A73E8', marginTop: 0 }}>Panel de administración de Kustodia</h2>
        <div style={{ marginBottom: 24 }}>
          <button style={tab === 'disputes' ? activeTabStyle : tabStyle} onClick={() => setTab('disputes')}>Disputas</button>
          <button style={tab === 'users' ? activeTabStyle : tabStyle} onClick={() => setTab('users')}>Usuarios</button>
          <button style={tab === 'transactions' ? activeTabStyle : tabStyle} onClick={() => setTab('transactions')}>Transacciones</button>
        </div>
        {tab === 'disputes' && (
          <div>
            <input
              type="text"
              placeholder="Buscar disputa..."
              style={{ padding: 14, borderRadius: 8, border: '1.5px solid #ddd', fontSize: 16, width: '100%', marginBottom: 18 }}
            />
            {disputesLoading && <div>Cargando disputas...</div>}
            {disputesError && <div style={{ color: 'red' }}>{disputesError}</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <thead>
                <tr style={{ background: '#E3EAFD' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Usuario</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Motivo</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d: any) => (
                  <tr key={d.id}>
                    <td style={{ padding: '10px 8px', color: '#222' }}>#{d.id}</td>
                    <td style={{ padding: '10px 8px', color: '#222' }}>{d.raisedBy?.email || 'N/A'}</td>
                    <td style={{ padding: '10px 8px', color: '#222' }}>{d.reason}</td>
                    <td style={{ padding: '10px 8px', color: d.status === 'pending' ? '#F44336' : '#27ae60', fontWeight: 600 }}>{d.status}</td>
                    <td style={{ padding: '10px 8px', color: '#222' }}>
                      <button style={{ color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setSelectedDispute(d); setShowDisputeModal(true); }}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Dispute Detail Modal Scaffold */}
            {showDisputeModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }} onClick={() => setShowDisputeModal(false)}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 400, margin: '10vh auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <h3>Detalle de Disputa</h3>
                  <div>ID: {selectedDispute?.id}</div>
                  <div>Usuario: {selectedDispute?.raisedBy?.email}</div>
                  <div>Motivo: {selectedDispute?.reason}</div>
                  <div>Detalles: {selectedDispute?.details}</div>
                  <div>Estado: {selectedDispute?.status}</div>
                  <div>Prueba: {selectedDispute?.evidence_url ? <a href={selectedDispute.evidence_url} target="_blank" rel="noopener noreferrer">Ver evidencia</a> : '—'}</div>
                  {/* TODO: Timeline, admin actions */}
                  <button onClick={() => setShowDisputeModal(false)} style={{ marginTop: 24 }}>Cerrar</button>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'users' && (
          <div>
            <input
              type="text"
              placeholder="Buscar usuario..."
              style={{ padding: 14, borderRadius: 8, border: '1.5px solid #ddd', fontSize: 16, width: '100%', marginBottom: 18 }}
            />
            {usersLoading && <div>Cargando usuarios...</div>}
            {usersError && <div style={{ color: 'red' }}>{usersError}</div>}
            <div style={{ width: '100%', overflowX: 'auto', maxWidth: '100vw', marginBottom: 12 }}>
              <table style={{ minWidth: 600, width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#E3EAFD' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#222' }}>Usuario</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#222' }}>Correo</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#222' }}>CLABE</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#222' }}>Balance</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#222' }}>KYC</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#222' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{u.full_name || u.email}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{u.email}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{[u.deposit_clabe, u.payout_clabe].filter(Boolean).join(', ') || '—'}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{u.balance !== undefined ? `$${u.balance}` : '—'}</td>
                      <td style={{ padding: '10px 8px', color: u.kyc_status === 'approved' ? '#27ae60' : '#F44336', fontWeight: 600 }}>{u.kyc_status || '—'}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>
                        <button style={{ color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setSelectedUser(u); setShowUserModal(true); }}>Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* User Detail Modal Scaffold */}
            {showUserModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }} onClick={() => setShowUserModal(false)}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 400, margin: '10vh auto', position: 'relative', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222' }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ color: '#1A73E8', marginTop: 0, marginBottom: 24 }}>Detalle de Usuario</h3>
                  {selectedUser ? (
                    <>
                      <div style={{ marginBottom: 8 }}><strong>ID:</strong> {selectedUser.id}</div>
                      <div style={{ marginBottom: 8 }}><strong>Nombre:</strong> {selectedUser.full_name || '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>Email:</strong> {selectedUser.email}</div>
                      <div style={{ marginBottom: 8 }}><strong>CLABE(s):</strong> {[selectedUser.deposit_clabe, selectedUser.payout_clabe].filter(Boolean).join(', ') || '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>Balance:</strong> {selectedUser.balance !== undefined ? `$${selectedUser.balance}` : '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>KYC:</strong> <span style={{ color: selectedUser.kyc_status === 'approved' ? '#27ae60' : '#F44336', fontWeight: 600 }}>{selectedUser.kyc_status || '—'}</span></div>
                      {/* You can add more fields here if needed */}
                    </>
                  ) : (
                    <div>Cargando datos del usuario...</div>
                  )}
                  <button onClick={() => setShowUserModal(false)} style={{ marginTop: 24, background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'transactions' && (
          <div>
            <input
              type="text"
              placeholder="Buscar transacción..."
              value={transactionSearch}
              onChange={e => setTransactionSearch(e.target.value)}
              style={{ padding: 14, borderRadius: 8, border: '1.5px solid #ddd', fontSize: 16, width: '100%', marginBottom: 18 }}
            />
            {transactionsLoading && <div>Cargando transacciones...</div>}
            {transactions && <div style={{ color: 'red' }}>{transactions}</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <thead>
                <tr style={{ background: '#E3EAFD' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Payer (Usuario)</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Recipient</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Monto</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 600, color: '#1A73E8' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((p: any) => {
                    const q = transactionSearch.toLowerCase();
                    return (
                      !q ||
                      p.id?.toString().includes(q) ||
                      p.user?.email?.toLowerCase().includes(q) ||
                      (p.recipient_email?.toLowerCase().includes(q)) ||
                      (p.amount !== undefined && p.amount.toString().includes(q)) ||
                      (p.status && p.status.toLowerCase().includes(q))
                    );
                  })
                  .map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ padding: '10px 8px', color: '#222' }}>#{p.id}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{p.user?.email || 'N/A'}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{p.recipient_email || 'N/A'}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>{p.amount !== undefined ? `$${p.amount}` : '—'}</td>
                      <td style={{ padding: '10px 8px', color: p.status === 'completed' ? '#1A73E8' : '#F44336', fontWeight: 600 }}>{p.status}</td>
                      <td style={{ padding: '10px 8px', color: '#222' }}>
                        <button style={{ color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setSelectedTransaction(p); setShowTransactionModal(true); }}>Ver</button>
                      </td>
                    </tr>
                  ))} 
              </tbody>
            </table>
            {/* Transaction Detail Modal Scaffold */}
            {showTransactionModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000 }} onClick={() => setShowTransactionModal(false)}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: 500, margin: '10vh auto', position: 'relative', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222' }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ color: '#1A73E8', marginTop: 0, marginBottom: 24 }}>Detalle de Pago</h3>
                  {selectedTransaction ? (
                    <>
                      <div style={{ marginBottom: 8 }}><strong>ID:</strong> #{selectedTransaction.id}</div>
                      <div style={{ marginBottom: 8 }}><strong>Payer:</strong> {selectedTransaction.user?.full_name || selectedTransaction.user?.email || '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>Recipient:</strong> {selectedTransaction.recipient_email || '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>Monto:</strong> {selectedTransaction.amount !== undefined ? `$${selectedTransaction.amount}` : '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>Estado:</strong> <span style={{ color: selectedTransaction.status === 'completed' ? '#1A73E8' : '#F44336', fontWeight: 600 }}>{selectedTransaction.status || '—'}</span></div>
                      <div style={{ marginBottom: 8 }}><strong>Descripción:</strong> {selectedTransaction.description || '—'}</div>
                      <div style={{ marginBottom: 8 }}><strong>Fecha de creación:</strong> {selectedTransaction.created_at ? new Date(selectedTransaction.created_at).toLocaleString() : '—'}</div>
                    </>
                  ) : (
                    <div>Cargando datos del pago...</div>
                  )}
                  <button onClick={() => setShowTransactionModal(false)} style={{ marginTop: 24, background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default AdminDashboard;
