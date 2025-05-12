import { useState } from 'react';
import { authFetch } from '../authFetch';


const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  boxShadow: '0 4px 24px rgba(26,115,232,0.12)',
  maxWidth: 420,
  margin: '0 auto',
  padding: '32px 18px 28px 18px',
  color: '#222',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #cfd8dc',
  borderRadius: 8,
  fontSize: 16,
  marginBottom: 12,
  fontFamily: 'Montserrat, Arial, sans-serif',
  outline: 'none',
  background: '#fff',
  color: '#222',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  background: 'linear-gradient(90deg, #1A73E8 0%, #1976D2 100%)',
  color: '#fff',
  padding: '12px 0',
  border: 'none',
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 17,
  cursor: 'pointer',
  marginTop: 6,
  boxShadow: '0 2px 8px #E3EAFD',
  transition: 'background 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  color: '#1A73E8',
  fontSize: 15,
  marginBottom: 2,
};

import { FaShieldAlt, FaEye, FaHeadset, FaRocket } from 'react-icons/fa';

const benefits = [
  {
    title: 'Protege tus pagos',
    description: 'Kustodia asegura que tu dinero esté protegido hasta que el servicio o producto sea entregado. Sin riesgos, sin fraudes.',
    icon: <FaShieldAlt size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Escrow inteligente',
    description: 'El dinero se libera solo después del periodo de custodia y si no hay disputas.',
    icon: <FaEye size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Soporte experto',
    description: 'Nuestro equipo de soporte está disponible para ayudarte en cada paso del proceso.',
    icon: <FaHeadset size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Rápido y sencillo',
    description: 'Regístrate y disfruta de una experiencia segura en minutos.',
    icon: <FaRocket size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  }
];

export default function EarlyAccess() {
  const [step, setStep] = useState<'form'|'success'>('form');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email) {
      setError('Nombre y correo son obligatorios.');
      return;
    }
    try {
      await authFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Error al registrar lead');
    }
  };



  return (
    <div style={{ fontFamily: 'Montserrat, Arial, sans-serif', background: '#F8FAFB', minHeight: '100vh', padding: '32px 0' }}>
      <div style={cardStyle}>
        <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 64, marginBottom: 18, filter: 'drop-shadow(0 2px 8px #E3EAFD)' }} />
        <h1 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 27, textAlign: 'center', marginBottom: 8 }}>Acceso Anticipado a Kustodia</h1>
        <p style={{ color: '#222', textAlign: 'center', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          Sé de los primeros en probar la plataforma de pagos y custodia más segura de LATAM.
        </p>

        {step === 'form' && (
          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 8 }}>
            <label style={labelStyle} htmlFor="name">Nombre completo</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <label style={labelStyle} htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <label style={labelStyle} htmlFor="message">¿Por qué te interesa Kustodia? (opcional)</label>
            <textarea
              name="message"
              id="message"
              placeholder="¿Por qué te interesa Kustodia? (opcional)"
              value={form.message}
              onChange={handleChange}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60, marginBottom: 8 }}
              rows={3}
            />
            {error && <p style={{ color: '#e53935', fontSize: 14, marginTop: 0 }}>{error}</p>}
            <button type="submit" style={buttonStyle}>Registrarme</button>
          </form>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <h2 style={{ color: '#43A047', fontWeight: 600, fontSize: 22, marginBottom: 8 }}>¡Gracias por registrarte!</h2>
            <p style={{ color: '#222', fontSize: 15 }}>Te avisaremos cuando Kustodia esté disponible para early access.</p>
          </div>
        )}
      </div>
      {/* Quick Facts Section */}
      <section style={{ marginTop: 38, marginBottom: 12 }}>
        <h2 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 18 }}>
          ¿Por qué elegir Kustodia?
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #E3EAFD', padding: 18, margin: 8, minWidth: 180, maxWidth: 220, flex: '1 1 180px', textAlign: 'center' }}>
              {b.icon}
              <h4 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 17, margin: '8px 0' }}>{b.title}</h4>
              <p style={{ color: '#333', fontSize: 15, margin: 0 }}>{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1A73E8', color: '#fff', textAlign: 'center', padding: 24, marginTop: 36, fontSize: 15, borderRadius: 0 }}>
        <div style={{ marginBottom: 8 }}>
          <a href="/terminos" style={{ color: '#fff', textDecoration: 'underline', marginRight: 16 }}>Términos y Condiciones</a>
          <a href="/privacidad" style={{ color: '#fff', textDecoration: 'underline' }}>Aviso de Privacidad</a>
        </div>
        &copy; {new Date().getFullYear()} Kustodia. Todos los derechos reservados.
      </footer>
    </div>
  );
}
