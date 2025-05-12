import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResend(false);
    setResendMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'No se pudo iniciar sesión.');
        if (data.unverified) setShowResend(true);
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo más tarde.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg(null);
    console.log('handleResend called');
    try {
      const res = await fetch('/api/users/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      console.log('fetch finished', res.status);
      alert('fetch finished');
      const data = await res.json();
      if (res.ok) {
        setResendMsg('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
        // Hide the green message after 4 seconds and reset resend state
        setTimeout(() => {
          setResendMsg(null);
          setShowResend(false);
        }, 4000);
      } else {
        setResendMsg(data.error || 'No se pudo reenviar el correo.');
      }
    } catch {
      setResendMsg('Error de conexión. Intenta de nuevo más tarde.');
    }
    setResendLoading(false);
  };



  return (
    <ResponsiveLayout>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <a href="/">
          <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 56, height: 56, margin: '0 auto', display: 'block' }} />
        </a>
      </div>
      <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Iniciar Sesión</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 8,
            border: '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = '#1A73E8')}
          onBlur={e => (e.target.style.borderColor = '#ddd')}
        />
        <input
          type="password"
          placeholder="Contraseña"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            padding: 14,
            borderRadius: 8,
            border: '1.5px solid #ddd',
            fontSize: 16,
            background: '#fff',
            color: '#222',
            fontFamily: 'Montserrat, Arial, sans-serif',
            transition: 'border-color 0.2s',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = '#1A73E8')}
          onBlur={e => (e.target.style.borderColor = '#ddd')}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#1A73E8', color: '#fff', padding: '14px 0', borderRadius: 24, fontSize: 18, border: 'none', marginTop: 18, cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 600 }}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
        {error && <div style={{ background: '#c0392b', color: '#fff', padding: 10, borderRadius: 8, marginTop: 10, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        {showResend && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: '#1A73E8', color: '#fff', padding: '10px 18px', borderRadius: 16, border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 16 }}
            >
              {resendLoading ? 'Reenviando...' : 'Reenviar correo de verificación'}
            </button>
            {resendMsg && <div style={{ marginTop: 8, color: resendMsg.startsWith('Correo') ? '#27ae60' : '#fff', background: resendMsg.startsWith('Correo') ? '#27ae60' : '#c0392b', padding: 8, borderRadius: 8, fontWeight: 600 }}>{resendMsg}</div>}
          </div>
        )}
      </form>
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <a href="/reset-password" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <span style={{ color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>¿No tienes cuenta? </span>
        <a href="/register" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>Regístrate</a>
      </div>
    </ResponsiveLayout>
  );
};

export default Login;
