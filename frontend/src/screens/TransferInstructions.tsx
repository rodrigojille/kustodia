import React from 'react';
import { useLocation } from 'react-router-dom';
import ResponsiveLayout from '../components/ResponsiveLayout';

const TransferInstructions: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    clabe?: string;
    amount?: number;
    recipient?: string;
    description?: string;
    warrantyPercent?: number;
    custodyDays?: number;
    paymentPurpose?: string;
    paymentId?: number;
  };
  const clabe = state?.clabe || '710969000048904434';
  const amount = state?.amount || 1500;
  const recipient = state?.recipient || 'usuario@ejemplo.com';
  const description = state?.description || '';
  const warrantyPercent = state?.warrantyPercent;
  const custodyDays = state?.custodyDays;
  const paymentPurpose = state?.paymentPurpose || '';
  const paymentId = state?.paymentId || '';

  return (
    <ResponsiveLayout>
      <h2 style={{ color: '#1A73E8', textAlign: 'center', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Instrucciones de transferencia</h2>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #E3EAFD', fontFamily: 'Montserrat, Arial, sans-serif', color: '#222', margin: '24px 0' }}>
        <div style={{ marginBottom: 14 }}>
          <strong>Monto a transferir:</strong> ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
        </div>
        <div style={{ marginBottom: 14 }}>
          <strong>CLABE destino:</strong> <span style={{ fontFamily: 'monospace', fontSize: 18 }}>{clabe}</span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <strong>Beneficiario:</strong> {recipient || 'usuario@ejemplo.com'}
        </div>
        <div style={{ marginBottom: 14 }}>
          <strong>Referencia:</strong> {paymentId || 'N/A'}
        </div>
        {description && (
          <div style={{ marginBottom: 14 }}>
            <strong>Descripción:</strong> {description}
          </div>
        )}
        {typeof warrantyPercent === 'number' && !isNaN(warrantyPercent) && (
          <div style={{ marginBottom: 14 }}>
            <strong>% bajo garantía:</strong> {warrantyPercent}%
          </div>
        )}
        {typeof custodyDays === 'number' && !isNaN(custodyDays) && (
          <div style={{ marginBottom: 14 }}>
            <strong>Días en custodia:</strong> {custodyDays}
          </div>
        )}
        {paymentPurpose && (
          <div style={{ marginBottom: 14 }}>
            <strong>Propósito del pago:</strong> {paymentPurpose}
          </div>
        )}
        <div style={{ marginTop: 22, color: '#888', fontSize: 15 }}>
          Realiza la transferencia desde tu banca en línea o app bancaria. El pago será validado automáticamente en cuanto se reciba.
        </div>
      </div>
      <a href="/dashboard" style={{ display: 'block', background: '#1A73E8', color: '#fff', padding: '14px 0', borderRadius: 24, fontSize: 18, textDecoration: 'none', fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', width: '100%', maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>Ir al dashboard</a>
    </ResponsiveLayout>
  );
};

export default TransferInstructions;
