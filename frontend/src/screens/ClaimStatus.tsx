import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const ClaimStatus: React.FC = () => (
  <ResponsiveLayout>
    <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Estado de reclamación</h2>
    <p style={{ margin: '24px 0', color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>Aquí puedes ver el estado de tu reclamación.</p>
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', marginTop: 12 }}>
      <div style={{ marginBottom: 16 }}>
        <strong>Estado actual:</strong> <span style={{ color: '#1A73E8' }}>En revisión</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Motivo:</strong> Pago no recibido
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Descripción:</strong> El pago enviado el 28 de abril aún no se refleja en mi cuenta.
      </div>
      <div style={{ marginTop: 24 }}>
        <strong>Línea de tiempo:</strong>
        <ul style={{ margin: '12px 0 0 16px', padding: 0 }}>
          <li>28/04/2025 - Reclamación enviada</li>
          <li>29/04/2025 - En revisión por soporte</li>
          <li style={{ color: '#888' }}>Pendiente de resolución</li>
        </ul>
      </div>
    </div>
  </ResponsiveLayout>
);

export default ClaimStatus;
