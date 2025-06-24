import React, { useState } from 'react';

export default function EarlyAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [zeroFee, setZeroFee] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!form.name || !form.email) {
      setError('Nombre y correo son obligatorios.');
      setLoading(false);
      return;
    }
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://kustodia-backend-f991a7cb1824.herokuapp.com";
      const response = await fetch(`${API_BASE}/api/early-access-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      setSuccess(true);
      if (typeof result.slots === 'number' && result.slots <= 100) setZeroFee(true);
      setLoading(false);
    } catch (err: any) {
      setError('Error al registrar lead');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-green-700 font-bold text-xl">¡Gracias por registrarte!</div>
        <div className="text-gray-700">Te avisaremos por correo cuando tengas acceso.</div>
        {zeroFee && <div className="bg-yellow-100 text-yellow-800 rounded p-2 font-semibold">¡Obtendrás comisión cero de por vida!</div>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <input
        type="text"
        name="name"
        placeholder="Nombre completo"
        value={form.name}
        onChange={handleChange}
        className="border rounded-lg px-4 py-2"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={handleChange}
        className="border rounded-lg px-4 py-2"
        required
      />
      <textarea
        name="message"
        placeholder="¿En qué te gustaría usar Kustodia? (opcional)"
        value={form.message}
        onChange={handleChange}
        className="border rounded-lg px-4 py-2"
        rows={3}
      />
      {error && <div className="text-red-600 font-semibold text-sm">{error}</div>}
      <button type="submit" className="bg-blue-700 text-white font-bold rounded-lg px-6 py-3 mt-2 hover:bg-blue-800 transition" disabled={loading}>
        {loading ? 'Enviando...' : 'Conseguir 0% comisión de por vida'}
      </button>
    </form>
  );
}
