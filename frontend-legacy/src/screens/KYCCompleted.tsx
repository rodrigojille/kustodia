import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const KYCCompleted: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const params = new URLSearchParams(location.search);
  const processId = params.get('process_id');

  useEffect(() => {
    if (!processId) return;
    fetch(`/api/users/kyc-status?process_id=${processId}`)
      .then(res => res.json())
      .then(data => {
        setKycStatus(data.kyc_status);
        // Store in localStorage to notify Dashboard
        localStorage.setItem('kyc_status', data.kyc_status);
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      })
      .catch(() => {
        setKycStatus('error');
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      });
  }, [navigate, processId]);

  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', textAlign: 'center' }}>
      <h2>¡Verificación KYC completada!</h2>
      <p>Tu proceso de verificación ha finalizado.<br />Serás redirigido al panel principal en unos segundos.</p>
      <div style={{ marginTop: 32, color: '#2e7ef7' }}>
        <b>process_id:</b> <code>{processId}</code><br/>
        {kycStatus && <div style={{marginTop:12}}>Estado KYC: <b>{kycStatus}</b></div>}
      </div>
    </div>
  );
};

export default KYCCompleted;
