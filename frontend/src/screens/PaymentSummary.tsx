import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const PaymentSummary: React.FC = () => (
  <ResponsiveLayout>
    <h2 style={{ color: '#1A73E8', textAlign: 'center', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Resumen de pago</h2>
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', marginTop: 12, marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <strong>Destinatario:</strong> usuario@ejemplo.com
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Monto:</strong> $1,500.00 MXN
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Descripción:</strong> Pago de servicios
      </div>
    </div>
    <button
      type="button"
      style={{ background: '#1A73E8', color: '#fff', padding: '14px 0', borderRadius: 24, fontSize: 18, border: 'none', marginTop: 0, cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600, width: '100%' }}
    >
      Confirmar pago
    </button>
  </ResponsiveLayout>
);

export default PaymentSummary;
