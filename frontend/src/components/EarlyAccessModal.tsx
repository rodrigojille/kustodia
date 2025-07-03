import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '@/lib/api';

interface EarlyAccessModalProps {
  open: boolean;
  onClose: () => void;
}

const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({ open, onClose }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [step, setStep] = useState<'form'|'success'>('form');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [slots, setSlots] = useState<number | null>(null);
  const [zeroFee, setZeroFee] = useState<boolean>(false);
  useEffect(() => {
    if (open) {
      
      fetch(`${API_BASE}/api/early-access-counter/slots`)
        .then(res => res.json())
        .then(data => setSlots(data.slots))
        .catch(() => setSlots(null));
    }
  }, [open]);
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
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      setStep('success');
      if (typeof result.slots === 'number') setSlots(result.slots);
      if (result.zeroFee) setZeroFee(true);
      if (window && (window as any).gtag) {
        (window as any).gtag('event', 'early_access_form_submit', {
          event_category: 'lead',
          event_label: form.email,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar lead');
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Acceso Anticipado a Kustodia</h2>
        <p className="text-gray-700 mb-4">Únete a la lista de espera y sé de los primeros en probar Kustodia.</p>
        {slots !== null && (
          <div className="mb-4 text-blue-700 font-semibold">Ya se han registrado <span className="font-bold text-2xl">{slots}</span> personas.</div>
        )}
        {step === 'form' ? (
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <button type="submit" className="bg-blue-700 text-white font-bold rounded-lg px-6 py-3 mt-2 hover:bg-blue-800 transition">Solicitar Acceso Anticipado</button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-green-700 font-bold text-xl">¡Gracias por registrarte!</div>
            <div className="text-gray-700">Te avisaremos por correo cuando tengas acceso.</div>
            {zeroFee && <div className="bg-yellow-100 text-yellow-800 rounded p-2 font-semibold">¡Obtendrás comisión cero de por vida!</div>}
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarlyAccessModal;
