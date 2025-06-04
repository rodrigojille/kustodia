declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

import { useState, useRef } from 'react';
import { ArcadeEmbed } from '../components/ArcadeEmbed';
import { authFetch } from '../authFetch';
import { Helmet } from 'react-helmet';
import KustodiaUseCases from './KustodiaUseCases';


import { FaShieldAlt, FaHeadset, FaRocket, FaLock, FaUser, FaMoneyBillWave, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const benefits = [
  {
    title: 'Fácil y rápido',
    description: 'Envía o recibe pagos solo dando instrucciones, como en una transferencia SPEI.',
    icon: <FaRocket size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Control total',
    description: 'Tú decides cuándo se libera el dinero. Protege cada paso de tu operación.',
    icon: <FaShieldAlt size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Seguridad real',
    description: 'Tu dinero queda en custodia y solo se libera si todo sale bien.',
    icon: <FaLock size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Soporte humano',
    description: 'Te acompañamos en cada paso. Cualquier duda, estamos aquí.',
    icon: <FaHeadset size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  }
];

import { useEffect } from 'react';

export default function EarlyAccess() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  const [step, setStep] = useState<'form'|'success'>('form');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [slots, setSlots] = useState<number | null>(null);
  const [zeroFee, setZeroFee] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/early-access-counter/slots')
      .then(res => res.json())
      .then(data => setSlots(data.slots))
      .catch(() => setSlots(null));
  }, []);

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
      const response = await authFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      setStep('success');
      if (typeof result.slots === 'number') setSlots(result.slots);
      if (result.zeroFee) setZeroFee(true);
      if (window.gtag) {
        window.gtag('event', 'early_access_form_submit', {
          event_category: 'lead',
          event_label: form.email,
        });
      }
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
        <link rel="canonical" href="https://kustodia.mx/early-access" />
        <meta property="og:title" content="Acceso Anticipado a Kustodia" />
        <meta property="og:description" content="Sé de los primeros en probar la plataforma de pagos y custodia más segura de LATAM. Únete al acceso anticipado de Kustodia." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/early-access" />
        <meta property="og:image" content="https://kustodia.mx/og-image.jpg" />
        {/* Google Analytics gtag.js */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5X4H87YHLT"></script>
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5X4H87YHLT');
        `}</script>
      </Helmet>
      <div className="font-sans bg-gradient-to-br from-blue-50 via-indigo-100 to-indigo-200 min-h-screen flex flex-col justify-center items-center px-0 overflow-x-hidden">
        <div className="max-w-screen-xl w-full mx-auto flex flex-col gap-10 px-2 sm:px-6">
          <div className="flex-1 flex flex-col justify-center bg-white/70 rounded-3xl shadow-2xl border border-indigo-100 p-10 mb-10 lg:mb-0">
            {/* Main message */}
            <div className="w-full bg-indigo-800 text-white text-center rounded-xl py-4 px-5 mb-6 font-semibold text-lg shadow">
  Kustodia automatiza el escrow y pagos condicionales usando blockchain + SPEI. Integramos la tecnología directamente sobre el sistema bancario tradicional, sin fricción para el usuario. Es una capa de confianza para cualquier transacción.
</div>
            {/* Counter banner */}
            <div className="w-full bg-indigo-100 text-indigo-900 text-center rounded-xl py-2 px-4 mb-4 font-bold text-lg flex flex-col items-center shadow">
  <span>Quedan <span className="inline-block bg-white text-indigo-900 font-extrabold px-3 py-1 rounded-lg text-xl mx-1 border border-indigo-300">{slots !== null ? slots : '--'}</span> lugares de acceso anticipado.</span>
  <span className="text-xs mt-1 text-indigo-800">Los primeros 100 registros tendrán <b>0% comisión de por vida</b>.</span>
</div>
            
            <img src="/logo.svg" alt="Kustodia Logo" className="w-16 h-16 mb-3 mx-auto drop-shadow-lg" style={{ display: 'block' }} />
<h1 className="text-3xl font-extrabold text-center text-indigo-900 tracking-tight mb-2">
  Pagos SPEI inteligentes y seguros
</h1>
<p className="text-center text-indigo-700/90 font-medium mb-6">
  Haz tus pagos y cobros tan fácil como enviar una transferencia SPEI.<br />
  Solo das instrucciones, nosotros protegemos tu dinero.
</p>

            {/* Urgency Banner */}
            <div className="w-full bg-red-100 text-red-800 text-center rounded-xl py-2 px-4 mb-4 font-semibold text-lg animate-pulse shadow">
              ¡Cupos limitados! Regístrate ahora para asegurar tu acceso anticipado.
            </div>

            {/* Use Cases Cards */}
            <KustodiaUseCases />

            {step === 'form' && (
              <>
                {slots === 0 && (
                  <div className="w-full bg-red-200 text-red-800 text-center rounded-xl py-2 px-4 mb-4 font-bold text-lg shadow">
                    ¡Todos los lugares de acceso anticipado han sido tomados!
                  </div>
                )}
                <form ref={formRef} onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-2 max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl border border-indigo-100 p-8">
                  <div className="flex flex-col items-center mb-4">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-400 text-white px-6 py-3 rounded-full text-base font-bold">
                      <FaLock className="text-yellow-300" />
                      Pagos y cobros 100% controlados
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
  <label htmlFor="name" className="block text-indigo-700 font-semibold mb-1">Nombre completo</label>
  <input
    type="text"
    name="name"
    id="name"
    value={form.name}
    onChange={handleChange}
    className="w-full px-5 py-3 border border-indigo-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 text-base shadow"
    placeholder="Nombre completo"
    required
  />
</div>
                  <div className="flex flex-col gap-1">
  <label htmlFor="email" className="block text-indigo-700 font-semibold mb-1">Correo electrónico</label>
  <input
    type="email"
    name="email"
    id="email"
    value={form.email}
    onChange={handleChange}
    className="w-full px-5 py-3 border border-indigo-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 text-base shadow"
    placeholder="Correo electrónico"
    required
  />
</div>
                  <div className="flex flex-col gap-1">
  <label htmlFor="message" className="block text-indigo-700 font-semibold mb-1">¿Por qué te interesa Kustodia? (opcional)</label>
  <textarea
    name="message"
    id="message"
    value={form.message}
    onChange={handleChange}
    className="w-full px-5 py-3 border border-indigo-200 rounded-2xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 text-base shadow resize-none min-h-[60px]"
    placeholder="¿Por qué te interesa Kustodia? (opcional)"
    rows={3}
  />
</div>
                  {error && <p className="text-red-500 text-base font-semibold mb-2 text-center bg-red-50 border border-red-200 rounded-lg p-2 animate-pulse">{error}</p>}

                  {slots !== 0 && (
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-indigo-600 hover:to-blue-500 transition mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      Registrarme
                    </button>
                  )}
                </form>
              </>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4 mt-4">
                <h2 className="text-xl font-semibold text-green-700">¡Gracias por registrarte!</h2>
                <p className="text-gray-600">Te avisaremos cuando Kustodia esté disponible para early access.</p>
                {zeroFee && (
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-lg shadow mt-4">
                    ¡Tienes 0% comisión de por vida!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Facts Section */}
          <section className="w-full mt-10 mb-3">
            <h2 className="text-indigo-700 font-bold text-2xl text-center mb-6">¿Por qué elegir Kustodia?</h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
                  {b.icon}
                  <h4 className="text-indigo-700 font-bold mt-2">{b.title}</h4>
                  <p className="text-gray-600 text-sm">{b.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Info & Features Section */}
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 mt-16">
            {/* Left: MXNB Info */}
            <section className="flex-1 bg-white/80 rounded-2xl shadow-lg p-8 mb-8 lg:mb-0">
              <h2 className="text-indigo-700 font-bold text-2xl mb-4">¿Qué es MXNB?</h2>
              <p className="text-gray-700 mb-3"><strong>MXNB</strong> es dinero digital que siempre vale lo mismo que un peso mexicano.<br/>Puedes enviar, recibir y guardar MXNB de forma rápida y segura usando la tecnología blockchain.</p>
              <a href="https://mxnb.mx/es-MX" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">Más información sobre MXNB</a>
            </section>
            {/* Right: Why Smart Contracts */}
            <section className="flex-1 bg-white/80 rounded-2xl shadow-lg p-8">
              <h3 className="text-indigo-700 font-bold text-xl mb-2">¿Por qué usamos smart contracts?</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                <li>Tu dinero queda seguro en custodia.</li>
                <li>Las reglas se cumplen solas, sin personas de por medio.</li>
                <li>No hay trucos ni sorpresas: todo es automático y transparente.</li>
              </ul>
              {/* Payment flow diagram here */}
              <div className="flex flex-row justify-center items-end gap-2 sm:gap-6 py-3 bg-indigo-100 rounded-lg max-w-md mx-auto mt-2 overflow-x-auto">
                <div className="flex flex-col items-center min-w-0 min-w-[72px]">
                  <span className="bg-indigo-100 rounded-full p-2 mb-1"><FaUser size={28} className="text-indigo-600" /></span>
                  <span className="font-bold text-indigo-700 text-sm">Tú</span>
                </div>
                <span className="text-2xl text-indigo-600">→</span>
                <div className="flex flex-col items-center min-w-0 sm:min-w-[92px]">
                  <a
  href="https://sepolia.arbiscan.io/token/0x82b9e52b26a2954e113f94ff26647754d5a4247d?a=0xc09b02ddb3bbcc78fc47446d8d74e677ba8db3e8"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Ver contrato en Arbiscan"
  className="inline-flex items-center justify-center bg-blue-200 hover:bg-blue-300 border-2 border-indigo-400 shadow-lg rounded-full w-10 h-10 mb-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300"
  title="Ver contrato en Arbitrum"
>
  <FaLock size={20} className="text-indigo-700" />
</a>
                  <span className="font-bold text-indigo-700 text-sm">En custodia</span>
                  <span className="text-indigo-500 text-xs">(Smart Contract)</span>
                </div>
                <span className="text-2xl text-indigo-600">→</span>
                <div className="flex flex-col items-center min-w-0 sm:min-w-[92px]">
                  <span className="bg-indigo-100 rounded-full p-2 mb-1"><FaMoneyBillWave size={28} className="text-indigo-600" /></span>
                  <span className="font-bold text-indigo-700 text-sm">Liberado</span>
                </div>
              </div>
            </section>
          </div>

          {/* Demo Video Section */}
          <section className="w-full max-w-3xl mx-auto my-12">
            <h2 className="text-2xl font-bold text-center text-indigo-800 mb-4">Así de fácil es usar Kustodia</h2>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-indigo-200 bg-white">
              <ArcadeEmbed />
            </div>
            <p className="text-center text-indigo-700 my-4 text-lg">
              Descubre cómo puedes pagar o cobrar solo dando instrucciones, como en un SPEI, pero con protección y control total.<br />
              ¡Olvídate de complicaciones y fraudes!
            </p>
            <div className="w-full bg-yellow-100 text-yellow-900 text-center rounded-xl py-2 px-4 mt-6 mb-4 font-semibold text-lg shadow animate-pulse">
              ¡Regístrate hoy! Es tan fácil como enviar un SPEI y tu dinero siempre está protegido.
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={scrollToForm}
                className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Solicitar Acceso Anticipado
              </button>
            </div>
          </section>

          {/* Sneak Peek API Section */}
          <section className="w-full max-w-2xl mx-auto my-12 rounded-2xl shadow-xl border border-indigo-200 bg-white p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-indigo-800 mb-2">Sneak peek: integra Kustodia vía API</h2>
            <p className="text-indigo-700 mb-4 text-center">¿Tienes un marketplace o plataforma? Pronto podrás automatizar pagos protegidos y comisiones para brokers/intermediarios con nuestra API REST.</p>
            <pre className="bg-gray-100 rounded-md p-4 text-xs text-left w-full overflow-x-auto mb-2">
              <code>{`POST /api/payment-requests
{
  "amount": 1500.00,
  "currency": "MXN",
  "payer": { "email": "cliente@email.com" },
  "payee": { "email": "inmobiliaria@email.com" },
  "broker": { "email": "broker@email.com", "commission": 100.00 },
  "callback_url": "https://tuapp.com/webhook/kustodia"
}`}</code>
            </pre>
            <ul className="text-sm text-indigo-800 mb-2 list-disc list-inside">
              <li>Pagos protegidos tipo escrow</li>
              <li>Notificaciones en tiempo real (webhooks)</li>
              <li>Comisiones automáticas para brokers/intermediarios</li>
              <li>Fácil integración vía REST</li>
            </ul>
            <span className="inline-block bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold mt-2">Muy pronto en Kustodia</span>
          </section>

          {/* Social Section Title */}
          <div className="w-full flex flex-col items-center mt-12 mb-2">
            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-500 to-indigo-400 text-center mb-2 tracking-tight drop-shadow-sm">Conoce más aquí</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 via-blue-300 to-indigo-200 rounded-full mb-4"></div>
          </div>

          {/* Social Icons */}
          <div className="flex flex-row justify-center gap-6 mb-4" aria-label="Redes sociales de Kustodia">
            <a href="https://x.com/Kustodia_mx" target="_blank" rel="noopener noreferrer" aria-label="Twitter Kustodia" className="text-indigo-400 hover:text-indigo-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full">
              <FaTwitter />
            </a>
            <a href="https://www.linkedin.com/company/kustodia-mx" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Kustodia" className="text-indigo-400 hover:text-indigo-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full">
              <FaLinkedin />
            </a>
            <a href="https://www.instagram.com/kustodia.mx/#" target="_blank" rel="noopener noreferrer" aria-label="Instagram Kustodia" className="text-indigo-400 hover:text-indigo-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full">
              <FaInstagram />
            </a>
          </div>

          {/* Footer */}
          <footer className="bg-indigo-700 text-white text-center py-6 mt-10 rounded-none w-full">
            <div className="mb-2">
              <a href="/terminos" className="text-white underline mr-6">Términos y Condiciones</a>
              <a href="/privacidad" className="text-white underline">Aviso de Privacidad</a>
            </div>
            &copy; {new Date().getFullYear()} Tecnologías Avanzadas Centrales SAPI de CV. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    </>
  );
}
