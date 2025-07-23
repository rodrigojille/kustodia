import React, { useState } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

export default function EarlyAccessForm() {
  const analytics = useAnalyticsContext();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    company: '', 
    phone: '', 
    message: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      // Track form submission attempt
      analytics.trackEvent('early_access_form_submission_attempt', {
        source: 'main_landing_early_access',
        vertical: 'general',
        has_message: !!form.message,
        has_company: !!form.company,
        has_phone: !!form.phone
      });
      
      const response = await fetch('/api/interest-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          source: 'main_landing_early_access',
          vertical: 'general',
          message: form.message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al registrar interés');
      }
      
      // Track successful submission
      analytics.trackEvent('early_access_form_submission_success', {
        source: 'main_landing_early_access',
        vertical: 'general',
        conversion_type: 'early_access_lead'
      });
      
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError('Error al registrar tu interés. Por favor intenta de nuevo.');
      
      // Track submission error
      analytics.trackEvent('early_access_form_submission_error', {
        source: 'main_landing_early_access',
        vertical: 'general',
        error: err.message
      });
      
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-green-700 font-bold text-xl">¡Gracias por registrarte!</div>
        <div className="text-gray-700">Te contactaremos pronto con tu acceso prioritario a Kustodia.</div>
        <div className="bg-blue-100 text-blue-800 rounded-lg p-3 font-semibold">
          ¡Tendrás acceso prioritario exclusivo!
        </div>
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
      <input
        type="text"
        name="company"
        placeholder="Empresa (opcional)"
        value={form.company}
        onChange={handleChange}
        className="border rounded-lg px-4 py-2"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Teléfono (opcional)"
        value={form.phone}
        onChange={handleChange}
        className="border rounded-lg px-4 py-2"
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
        {loading ? 'Enviando...' : 'Obtener acceso prioritario'}
      </button>
    </form>
  );
}
