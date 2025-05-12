import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Welcome: React.FC = () => (
  <ResponsiveLayout>
  <div style={{ textAlign: 'center' }}>
    <h1 style={{ color: '#1A73E8', marginTop: 40 }}>Bienvenido a Kustodia</h1>
    <img src="/figma_starter/brand/logo_placeholder.svg" alt="Kustodia Logo" style={{ width: 120, margin: '32px auto' }} />
    <p style={{ fontSize: 18, color: '#444', margin: '24px 0' }}>La forma segura y fácil de enviar y recibir pagos P2P en Kustodia.</p>
    <a href="/register" style={{ display: 'inline-block', background: '#1A73E8', color: '#fff', padding: '14px 36px', borderRadius: 24, fontSize: 18, textDecoration: 'none', margin: '24px 0', width: '100%', maxWidth: 250 }}>Comenzar</a>

  </div>
</ResponsiveLayout>
);

export default Welcome;
