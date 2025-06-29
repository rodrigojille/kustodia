import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';

const Registration: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'No se pudo registrar.');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo más tarde.');
    }
    setLoading(false);
  };

  return (
    <ResponsiveLayout>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <a href="/">
          <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 56, height: 56, margin: '0 auto', display: 'block' }} />
        </a>
      </div>
      <h2 style={{ color: '#1A73E8', marginTop: 0, fontFamily: 'Montserrat, Arial, sans-serif' }}>Registro</h2>
      <p style={{ margin: '24px 0', color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>Crea tu cuenta para comenzar a usar Kustodia.</p>
      {success ? (
        <div style={{ background: '#27ae60', color: '#fff', padding: 16, borderRadius: 8, textAlign: 'center', fontWeight: 600 }}>
          ¡Registro exitoso! Revisa tu correo para verificar tu cuenta.
        </div>
      ) : (
        <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre completo"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
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
          <input
            type="password"
            placeholder="Confirmar contraseña"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          {error && <div style={{ background: '#c0392b', color: '#fff', padding: 10, borderRadius: 8, marginTop: 10, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        </form>
      )}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <span style={{ color: '#444', fontFamily: 'Montserrat, Arial, sans-serif' }}>¿Ya tienes cuenta? </span>
        <a href="/login" style={{ color: '#1A73E8', textDecoration: 'underline', fontWeight: 500 }}>Inicia sesión</a>
      </div>
    </ResponsiveLayout>
  );
};

export default Registration;
