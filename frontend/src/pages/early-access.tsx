// This page has been removed. Please use screens/EarlyAccess.tsx for Early Access functionality.

export default function EarlyAccess() {
  return (
    <div style={{padding:40, textAlign:'center', color:'#444'}}>
      Esta página ha sido eliminada.<br/>
      Por favor usa <b>screens/EarlyAccess.tsx</b> para el acceso anticipado.
    </div>
  );
}


  const [step, setStep] = useState<'password'|'form'|'success'>('password');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  const checkPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PAGE_PASSWORD) {
      setStep('form');
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

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
    // Send to backend or service (for now, just simulate)
    setStep('success');
  };

  return (
    <>
      
        <title>Regístrate para Early Access | Kustodia</title>
        <meta name="description" content="Regístrate para acceso anticipado a Kustodia: la plataforma de pagos y custodia más segura de LATAM." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Kustodia Early Access" />
        <meta property="og:description" content="Regístrate para acceso anticipado a Kustodia: pagos seguros, sin fraudes." />
        <meta property="og:image" content="https://kustodia.mx/kustodia-og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/early-access" />
        <link rel="canonical" href="https://kustodia.mx/early-access" />
      
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Acceso Anticipado a Kustodia",
          "description": "Regístrate para acceso anticipado a Kustodia: la plataforma de pagos y custodia más segura de LATAM.",
          "url": "https://kustodia.mx/early-access",
          "publisher": {
            "@type": "Organization",
            "name": "Kustodia",
            "logo": {
              "@type": "ImageObject",
              "url": "https://kustodia.mx/kustodia-logo.svg"
            }
          }
        }
        `}
      </script>
      <main className="min-h-screen bg-gradient-to-br from-blue-100/70 via-indigo-100/80 to-indigo-200/90 flex items-center justify-center py-12 px-4">
  <section className="w-full max-w-md md:max-w-xl rounded-2xl shadow-2xl bg-white/70 backdrop-blur-lg border border-indigo-100 p-10 flex flex-col items-center">
    <img src="/kustodia-logo.svg" alt="Logo de Kustodia, plataforma de pagos y custodia blockchain" className="mx-auto h-14 mb-4 drop-shadow-lg" />
    <h1 className="text-3xl font-extrabold text-center text-indigo-900 tracking-tight mb-2">Acceso Anticipado a Kustodia</h1>
    <p className="text-center text-indigo-700/90 font-medium mb-6">Sé de los primeros en probar la plataforma de pagos y custodia más segura de LATAM.</p>

    {step === 'password' && (
      <form onSubmit={checkPassword} className="space-y-5 w-full">
        <div className="relative">
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="peer w-full px-4 py-3 border border-indigo-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent"
            placeholder="Contraseña de acceso"
            autoFocus
            required
          />
          <label htmlFor="password" className="absolute left-4 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">Contraseña de acceso</label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white py-3 rounded-lg font-semibold text-lg shadow hover:from-indigo-600 hover:to-blue-500 transition"
        >Entrar</button>
      </form>
    )}

    {step === 'form' && (
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full mt-2">
        <div className="relative">
          <input
            type="text"
            name="name"
            id="name"
            value={form.name}
            onChange={handleChange}
            className="peer w-full px-4 py-3 border border-indigo-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent"
            placeholder="Nombre completo"
            required
          />
          <label htmlFor="name" className="absolute left-4 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">Nombre completo</label>
        </div>
        <div className="relative">
          <input
            type="email"
            name="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            className="peer w-full px-4 py-3 border border-indigo-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent"
            placeholder="Correo electrónico"
            required
          />
          <label htmlFor="email" className="absolute left-4 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">Correo electrónico</label>
        </div>
        <div className="relative">
          <textarea
            name="message"
            id="message"
            value={form.message}
            onChange={handleChange}
            className="peer w-full px-4 py-3 border border-indigo-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-indigo-900 placeholder-transparent resize-none min-h-[60px]"
            placeholder="¿Por qué te interesa Kustodia? (opcional)"
            rows={3}
          />
          <label htmlFor="message" className="absolute left-4 top-3 text-indigo-400 text-base transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-4 peer-focus:text-xs peer-focus:text-indigo-700 bg-white/80 px-1 pointer-events-none">¿Por qué te interesa Kustodia? (opcional)</label>
        </div>
        {error && <p className="text-red-500 text-sm mb-2" role="alert">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white py-3 rounded-lg font-semibold text-lg shadow hover:from-indigo-600 hover:to-blue-500 transition mt-2"
        >
          Registrarme
        </button>
      </form>
    )}

    {step === 'success' && (
      <div className="text-center space-y-4 mt-4" role="alert">
        <h2 className="text-xl font-semibold text-green-700">¡Gracias por registrarte!</h2>
        <p className="text-gray-600">Te avisaremos cuando Kustodia esté disponible para early access.</p>
      </div>
    )}
    {/* Privacy Statement */}
    <p className="text-xs text-gray-500 mt-6 text-center" style={{maxWidth:'350px'}}>
      Al registrarte, aceptas nuestra <a href="/privacidad" className="underline text-indigo-700 hover:text-indigo-900" tabIndex={0}>Política de Privacidad</a>. Tus datos serán usados únicamente para notificarte sobre el acceso anticipado y novedades de Kustodia.
    </p>
    {/* Social Icons */}
    <div className="flex flex-row justify-center gap-6 mt-6 mb-2" aria-label="Redes sociales de Kustodia">
      <a href="https://twitter.com/kustodia_mx" target="_blank" rel="noopener noreferrer" aria-label="Twitter Kustodia" className="text-indigo-400 hover:text-indigo-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full">
        <FaTwitter />
      </a>
      <a href="https://www.linkedin.com/company/kustodia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Kustodia" className="text-indigo-400 hover:text-indigo-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full">
        <FaLinkedin />
      </a>
      <a href="https://wa.me/5215530950165" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Kustodia" className="text-indigo-400 hover:text-indigo-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full">
        <FaWhatsapp />
      </a>
    </div>
  </section>
</main>

<footer className="bg-indigo-700 text-white text-center py-6 mt-10 rounded-none w-full">
  <div className="mb-2">
    <a href="/terminos" className="text-white underline mr-6">Términos y Condiciones</a>
    <a href="/privacidad" className="text-white underline">Aviso de Privacidad</a>
  </div>
  2025 Tecnologías Avanzadas Centrales SAPI de CV. Todos los derechos reservados.
</footer>

    </> 
  );
}
