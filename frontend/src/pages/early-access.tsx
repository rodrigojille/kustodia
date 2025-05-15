import { useState } from 'react';

const PAGE_PASSWORD = 'kustodia2025'; // Change this for production!

export default function EarlyAccess() {
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
        <meta property="og:image" content="/kustodia-og.png" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://kustodia.mx/early-access" />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <section className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
          <img src="/kustodia-logo.svg" alt="Kustodia logo" className="mx-auto h-12" />
          <h1 className="text-2xl font-bold text-center text-indigo-900">Acceso Anticipado a Kustodia</h1>
          <p className="text-center text-gray-600">Sé de los primeros en probar la plataforma de pagos y custodia más segura de LATAM.</p>

          {step === 'password' && (
            <form onSubmit={checkPassword} className="space-y-4">
              <input
                type="password"
                name="password"
                placeholder="Contraseña de acceso"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200"
                autoFocus
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              >Entrar</button>
            </form>
          )}

          {step === 'form' && (
  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    <input
      type="text"
      name="name"
      placeholder="Nombre completo"
      value={form.name}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-2"
      required
    />
    <input
      type="email"
      name="email"
      placeholder="Correo electrónico"
      value={form.email}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-2"
      required
    />
    <textarea
      name="message"
      placeholder="¿Por qué te interesa Kustodia? (opcional)"
      value={form.message}
      onChange={handleChange}
      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 mb-2"
      rows={3}
    />
    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
    <button
      type="submit"
      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition mt-2 font-semibold text-lg shadow"
    >
      Registrarme
    </button>
  </form>
)}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-green-700">¡Gracias por registrarte!</h2>
              <p className="text-gray-600">Te avisaremos cuando Kustodia esté disponible para early access.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
