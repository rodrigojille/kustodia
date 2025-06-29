import React, { useState } from 'react';

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



  // Styles for the modern login card
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(120deg, #f6f9fc 0%, #e9f0fb 100%)',
  };
  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 420,
    minWidth: 340,
    padding: '40px 32px 32px 32px',
    borderRadius: 24,
    background: '#fff',
    boxShadow: '0 8px 32px 0 rgba(60, 80, 180, 0.10), 0 1.5px 8px 0 rgba(60, 80, 180, 0.07)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1.5px solid #e0e7ef',
  };
  const logoStyle: React.CSSProperties = {
    width: 72,
    height: 72,
    marginBottom: 18,
    display: 'block',
    borderRadius: 16,
    boxShadow: '0 2px 8px 0 rgba(26, 115, 232, 0.10)',
    background: '#f2f7fd',
    objectFit: 'contain',
  };
  const titleStyle: React.CSSProperties = {
    color: '#1A73E8',
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontWeight: 800,
    fontSize: 28,
    margin: '0 0 22px 0',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  };
  const inputStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 10,
    border: '1.5px solid #d3d9e2',
    fontSize: 17,
    background: '#fafdff',
    color: '#222',
    marginBottom: 14,
    fontFamily: 'Montserrat, Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  };
  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #1A73E8 60%, #4285F4 100%)',
    color: '#fff',
    padding: '16px 0',
    borderRadius: 22,
    fontSize: 18,
    border: 'none',
    marginTop: 12,
    marginBottom: 6,
    cursor: 'pointer',
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontWeight: 700,
    boxShadow: '0 1.5px 8px 0 rgba(60, 80, 180, 0.07)',
    width: '100%',
    letterSpacing: '0.5px',
  };
  const errorStyle: React.CSSProperties = {
    background: '#e74c3c',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '0.2px',
  };
  const resendMsgStyle: React.CSSProperties = {
    marginTop: 8,
    color: resendMsg && resendMsg.startsWith('Correo') ? '#27ae60' : '#fff',
    background: resendMsg && resendMsg.startsWith('Correo') ? '#d4f7e2' : '#e74c3c',
    padding: 10,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    width: '100%',
    textAlign: 'center',
  };
  const linkStyle: React.CSSProperties = {
    color: '#1A73E8',
    textDecoration: 'underline',
    fontWeight: 600,
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: 15,
  };
  const secondaryText: React.CSSProperties = {
    color: '#444',
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontSize: 15,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <a href="/">
          <img src="/logo.svg" alt="Kustodia Logo" style={logoStyle} />
        </a>
        <div style={titleStyle}>Iniciar Sesión</div>
        <form style={{ width: '100%' }} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
          {error && <div style={errorStyle}>{error}</div>}
          {showResend && (
            <div style={{ marginTop: 16, width: '100%', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                style={{ ...buttonStyle, background: '#1A73E8', marginTop: 0, fontSize: 16, padding: '12px 0', borderRadius: 16 }}
              >
                {resendLoading ? 'Reenviando...' : 'Reenviar correo de verificación'}
              </button>
              {resendMsg && <div style={resendMsgStyle}>{resendMsg}</div>}
            </div>
          )}
        </form>
        <div style={{ marginTop: 18, width: '100%', textAlign: 'center' }}>
          <a href="/reset-password" style={linkStyle}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div style={{ marginTop: 12, width: '100%', textAlign: 'center' }}>
          <span style={secondaryText}>¿No tienes cuenta? </span>
          <a href="/register" style={linkStyle}>Regístrate</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
