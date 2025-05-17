import { useState } from 'react';
import { authFetch } from '../authFetch';
import { Helmet } from 'react-helmet';


import { FaShieldAlt, FaEye, FaHeadset, FaRocket, FaUser, FaLock, FaMoneyBillWave } from 'react-icons/fa';

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
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Acceso Anticipado a Kustodia | Pagos Seguros con MXNB</title>
        <meta name="description" content="Regístrate para acceso anticipado a Kustodia, la plataforma líder en pagos y custodia segura con MXNB y smart contracts. Protege tu dinero y disfruta de la máxima seguridad fintech." />
        <meta name="keywords" content="fintech, pagos seguros, MXNB, Kustodia, acceso anticipado, blockchain, custodia, smart contracts, LATAM" />
        <link rel="canonical" href="https://kustodia.com/early-access" />
        <meta property="og:title" content="Acceso Anticipado a Kustodia" />
        <meta property="og:description" content="Sé de los primeros en probar la plataforma de pagos y custodia más segura de LATAM. Únete al acceso anticipado de Kustodia." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.com/early-access" />
        <meta property="og:image" content="https://kustodia.com/og-image.jpg" />
      </Helmet>
      <div className="font-sans bg-gradient-to-br from-blue-50 via-indigo-100 to-indigo-200 min-h-screen flex flex-col justify-center items-center px-2">
        <div className="w-full max-w-xl flex flex-col items-center justify-center">
          <div className="w-full rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-indigo-100 p-10 flex flex-col items-center">
            <img src="/logo.svg" alt="Kustodia Logo" className="w-16 mb-5 drop-shadow-lg" />
            <h1 className="text-3xl font-extrabold text-center text-indigo-900 tracking-tight mb-2">Acceso Anticipado a Kustodia</h1>
            <p className="text-center text-indigo-700/90 font-medium mb-6">
              Sé de los primeros en probar la plataforma de pagos y custodia más segura de LATAM.
            </p>

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-2">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    className="peer w-full px-5 py-3 border border-indigo-200 rounded-full bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent text-base shadow"
                    placeholder="Nombre completo"
                    required
                  />
                  <label htmlFor="name" className="absolute left-5 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">Nombre completo</label>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    className="peer w-full px-5 py-3 border border-indigo-200 rounded-full bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent text-base shadow"
                    placeholder="Correo electrónico"
                    required
                  />
                  <label htmlFor="email" className="absolute left-5 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">Correo electrónico</label>
                </div>
                <div className="relative">
                  <textarea
                    name="message"
                    id="message"
                    value={form.message}
                    onChange={handleChange}
                    className="peer w-full px-5 py-3 border border-indigo-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent text-base shadow resize-none min-h-[60px]"
                    placeholder="¿Por qué te interesa Kustodia? (opcional)"
                    rows={3}
                  />
                  <label htmlFor="message" className="absolute left-5 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">¿Por qué te interesa Kustodia? (opcional)</label>
                </div>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-indigo-600 hover:to-blue-500 transition mt-2"
                >
                  Registrarme
                </button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center mt-8">
                <h2 className="text-xl font-semibold text-green-700 mb-2">¡Gracias por registrarte!</h2>
                <p className="text-gray-700">Te avisaremos cuando Kustodia esté disponible para early access.</p>
              </div>
            )}
          </div>

          {/* Quick Facts Section */}
          <section style={{ marginTop: 38, marginBottom: 12, width: '100%' }}>
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

          {/* ¿Qué es MXNB? Section */}
          <section className="max-w-xl mx-auto mt-10 bg-white/80 rounded-2xl shadow-lg p-7 w-full">
            <h2 className="text-indigo-700 font-bold text-2xl text-center mb-4">¿Qué es MXNB?</h2>
            <p className="text-gray-700 text-base text-center mb-3">
              <strong>MXNB</strong> es dinero digital que siempre vale lo mismo que un peso mexicano.<br/>
              Puedes enviar, recibir y guardar MXNB de forma rápida y segura usando la tecnología blockchain.
            </p>
            <p className="text-center mb-4">
              <a href="https://mxnb.mx/es-MX" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Más información sobre MXNB</a>
            </p>
            <div className="bg-indigo-50 rounded-xl p-4 mb-1">
              <h3 className="text-indigo-700 font-bold text-lg text-center mb-2">¿Por qué usamos smart contracts?</h3>
              <ul className="text-gray-700 text-base list-disc list-inside space-y-1 max-w-md mx-auto mb-2">
                <li>Tu dinero queda seguro en custodia.</li>
                <li>Las reglas se cumplen solas, sin personas de por medio.</li>
                <li>No hay trucos ni sorpresas: todo es automático y transparente.</li>
              </ul>
              {/* Payment Flow Diagram */}
              <div className="flex flex-row justify-center items-end gap-6 py-3 bg-indigo-100 rounded-lg max-w-md mx-auto mt-2">
                <div className="flex flex-col items-center min-w-0 min-w-[72px]">
                  <span className="bg-indigo-100 rounded-full p-2 mb-1"><FaUser size={28} className="text-indigo-600" /></span>
                  <span className="font-bold text-indigo-700 text-sm">Tú</span>
                </div>
                <span className="text-2xl text-indigo-600">→</span>
                <div className="flex flex-col items-center min-w-0 min-w-[92px]">
                  <a href="https://arbiscan.io/address/0xcee0890216d71e58ee97807857aa6b2b786075d9" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                    <span className="bg-indigo-100 rounded-full p-2 mb-1"><FaLock size={28} className="text-indigo-600" /></span>
                  </a>
                  <span className="font-bold text-indigo-700 text-sm">En custodia</span>
                  <span className="text-indigo-500 text-xs">(Smart Contract)</span>
                </div>
                <span className="text-2xl text-indigo-600">→</span>
                <div className="flex flex-col items-center min-w-0 min-w-[92px]">
                  <span className="bg-indigo-100 rounded-full p-2 mb-1"><FaMoneyBillWave size={28} className="text-indigo-600" /></span>
                  <span className="font-bold text-indigo-700 text-sm">Liberado</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-indigo-700 text-white text-center py-6 mt-10 rounded-none w-full">
            <div className="mb-2">
              <a href="/terminos" className="text-white underline mr-6">Términos y Condiciones</a>
              <a href="/privacidad" className="text-white underline">Aviso de Privacidad</a>
            </div>
            &copy; {new Date().getFullYear()} Kustodia. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </>
  );
}
