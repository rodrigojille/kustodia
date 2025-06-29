import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const AuthChoice: React.FC = () => (
  <ResponsiveLayout>
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 72, marginBottom: 24 }} />
      <h2 style={{ color: '#1A73E8', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700 }}>Bienvenido a Kustodia</h2>
      <div style={{ color: '#222', fontSize: 20, fontWeight: 600, fontFamily: 'Montserrat, Arial, sans-serif', margin: '12px 0 24px', letterSpacing: '0.01em' }}>
        Paga seguro y como tú digas
      </div>
      <p style={{ color: '#444', margin: '16px 0 32px', fontFamily: 'Montserrat, Arial, sans-serif' }}>
        ¿Ya tienes cuenta? Inicia sesión, o regístrate para comenzar a proteger tus pagos.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 320, margin: '0 auto' }}>
        <a href="/login" style={buttonStyle}>Iniciar Sesión</a>
        <a href="/register" style={{ ...buttonStyle, background: '#27ae60' }}>Registrarse</a>
      </div>
    </div>
  </ResponsiveLayout>
);

const buttonStyle: React.CSSProperties = {
  background: '#1A73E8',
  color: '#fff',
  padding: '14px 0',
  borderRadius: 24,
  fontSize: 18,
  border: 'none',
  fontFamily: 'Montserrat, Arial, sans-serif',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'block',
  transition: 'background 0.2s',
};

export default AuthChoice;
