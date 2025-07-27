import React, { useState } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

export default function EarlyAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [zeroFee, setZeroFee] = useState(false);
  const [loading, setLoading] = useState(false);
  const { trackUserAction } = useAnalyticsContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Track form submission attempt
    trackUserAction('early_access_form_submit', {
      button_text: 'Conseguir 0% comisión de por vida',
      form_data: {
        has_name: !!form.name,
        has_email: !!form.email,
        has_message: !!form.message,
        message_length: form.message.length
      },
      conversion_stage: 'trial',
      engagement_level: 'high'
    });
    
    if (!form.name || !form.email) {
      setError('Nombre y correo son obligatorios.');
      setLoading(false);
      
      trackUserAction('early_access_form_error', {
        error_type: 'validation',
        missing_fields: [!form.name && 'name', !form.email && 'email'].filter(Boolean)
      });
      return;
    }
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://kustodia-backend-f991a7cb1824.herokuapp.com";
      const response = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      
      trackUserAction('early_access_form_success', {
        zero_fee_eligible: typeof result.slots === 'number' && result.slots <= 100,
        user_slot: result.slots,
        conversion_stage: 'purchase',
        engagement_level: 'high'
      });
      
      setSuccess(true);
      if (typeof result.slots === 'number' && result.slots <= 100) setZeroFee(true);
      setLoading(false);
    } catch (err: any) {
      trackUserAction('early_access_form_error', {
        error_type: 'api',
        error_message: err.message
      });
      
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
      <button 
        type="submit" 
        className="bg-blue-700 text-white font-bold rounded-lg px-6 py-3 mt-2 hover:bg-blue-800 transition" 
        disabled={loading}
        onClick={() => {
          if (!loading) {
            trackUserAction('early_access_button_click', {
              button_text: loading ? 'Enviando...' : 'Conseguir 0% comisión de por vida',
              form_completion: {
                name_filled: !!form.name,
                email_filled: !!form.email,
                message_filled: !!form.message
              },
              engagement_level: 'high'
            });
          }
        }}
      >
        {loading ? 'Enviando...' : 'Conseguir 0% comisión de por vida'}
      </button>
    </form>
  );
}
