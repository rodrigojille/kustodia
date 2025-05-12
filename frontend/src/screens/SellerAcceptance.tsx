import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const SellerAcceptance: React.FC = () => (
  <ResponsiveLayout>
    <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Aceptar pago</h2>
    <p style={{ margin: '24px 0', color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>Revisa y acepta o rechaza el pago recibido.</p>
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', marginTop: 12, marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <strong>De:</strong> usuario@ejemplo.com
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Monto:</strong> $1,500.00 MXN
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Descripción:</strong> Pago de servicios
      </div>
    </div>
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
      <button
        type="button"
        style={{ background: '#1A73E8', color: '#fff', padding: '14px 32px', borderRadius: 24, fontSize: 18, border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600 }}
      >
        Aceptar
      </button>
      <button
        type="button"
        style={{ background: '#F44336', color: '#fff', padding: '14px 32px', borderRadius: 24, fontSize: 18, border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600 }}
      >
        Rechazar
      </button>
    </div>
  </ResponsiveLayout>
);

export default SellerAcceptance;
