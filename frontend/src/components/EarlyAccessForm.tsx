import React, { useState } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

// Helper function to categorize customer segments for GA
const getCustomerSegment = (vertical: string): string => {
  const segmentMap: { [key: string]: string } = {
    'general': 'general_consumer',
    'main_landing': 'early_adopter'
  };
  return segmentMap[vertical] || 'unknown';
};

// Helper function to assess lead quality for GA
const getLeadQuality = (formData: any): string => {
  let score = 0;
  if (formData.company && formData.company.length > 0) score += 2;
  if (formData.phone && formData.phone.length > 0) score += 1;
  if (formData.message && formData.message.length > 20) score += 1;
  if (formData.name && formData.name.length > 10) score += 1;
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'basic';
};

// Helper function to calculate form completion rate
const calculateFormCompletion = (formData: any): number => {
  const totalFields = 5; // name, email, company, phone, message
  let completedFields = 0;
  
  if (formData.name && formData.name.length > 0) completedFields++;
  if (formData.email && formData.email.length > 0) completedFields++;
  if (formData.company && formData.company.length > 0) completedFields++;
  if (formData.phone && formData.phone.length > 0) completedFields++;
  if (formData.message && formData.message.length > 0) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};

export default function EarlyAccessForm() {
  const analytics = useAnalyticsContext();
  const { trackUserAction } = useAnalyticsContext();
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
  const [formStarted, setFormStarted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Track form field interaction for GA
    analytics.trackEvent('early_access_form_field_interaction', {
      field: name,
      source: 'main_landing_early_access',
      vertical: 'general',
      form_type: 'early_access',
      field_completed: value.length > 0,
      engagement_level: 'medium'
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    // Track form start on first focus
    if (!formStarted) {
      setFormStarted(true);
      analytics.trackEvent('early_access_form_started', {
        source: 'main_landing_early_access',
        vertical: 'general',
        form_type: 'early_access',
        first_field: name,
        engagement_level: 'high'
      });
    }
    
    // Track field focus
    analytics.trackEvent('early_access_form_field_focus', {
      field: name,
      source: 'main_landing_early_access',
      vertical: 'general',
      form_type: 'early_access'
    });
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
      // Track form submission attempt with comprehensive GA data
      analytics.trackEvent('early_access_form_submission_attempt', {
        source: 'main_landing_early_access',
        vertical: 'general',
        has_message: !!form.message,
        has_company: !!form.company,
        has_phone: !!form.phone,
        // Enhanced GA tracking
        business_vertical: 'general',
        customer_segment: getCustomerSegment('general'),
        lead_quality: getLeadQuality(form),
        conversion_funnel_stage: 'early_access_request',
        engagement_level: 'very_high',
        form_completion_rate: calculateFormCompletion(form)
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
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Error al registrar interés');
      }
      
      // Track successful submission with both analytics systems
      analytics.trackEvent('early_access_form_submission_success', {
        source: 'main_landing_early_access',
        vertical: 'general',
        conversion_type: 'early_access_lead'
      });
      
      trackUserAction('early_access_form_success', {
        zero_fee_eligible: typeof result.slots === 'number' && result.slots <= 100,
        user_slot: result.slots,
        conversion_stage: 'purchase',
        engagement_level: 'high'
      });
      
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      // Track submission error with both analytics systems
      analytics.trackEvent('early_access_form_submission_error', {
        source: 'main_landing_early_access',
        vertical: 'general',
        error: err.message
      });
      
      trackUserAction('early_access_form_error', {
        error_type: 'api',
        error_message: err.message
      });
      
      setError('Error al registrar tu interés. Por favor intenta de nuevo.');
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
        onFocus={handleFocus}
        className="border rounded-lg px-4 py-2"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={handleChange}
        onFocus={handleFocus}
        className="border rounded-lg px-4 py-2"
        required
      />
      <input
        type="text"
        name="company"
        placeholder="Empresa (opcional)"
        value={form.company}
        onChange={handleChange}
        onFocus={handleFocus}
        className="border rounded-lg px-4 py-2"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Teléfono (opcional)"
        value={form.phone}
        onChange={handleChange}
        onFocus={handleFocus}
        className="border rounded-lg px-4 py-2"
      />
      <textarea
        name="message"
        placeholder="¿En qué te gustaría usar Kustodia? (opcional)"
        value={form.message}
        onChange={handleChange}
        onFocus={handleFocus}
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
