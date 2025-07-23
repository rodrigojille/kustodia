'use client';
import React, { useState } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';
import { FaEnvelope, FaUser, FaBuilding, FaSpinner, FaCheckCircle } from 'react-icons/fa';

interface InterestRegistrationFormProps {
  source: string; // Track which landing page the form is on
  vertical: string; // Track which vertical (desarrolladores, brokers, etc.)
  title?: string;
  subtitle?: string;
  buttonText?: string;
  compactMode?: boolean; // For smaller forms
}

// Helper function to categorize customer segments for GA
const getCustomerSegment = (vertical: string): string => {
  const segmentMap: { [key: string]: string } = {
    'desarrolladores': 'real_estate_developer',
    'brokers': 'real_estate_broker', 
    'compradores': 'real_estate_buyer',
    'compra-venta': 'p2p_marketplace',
    'marketplaces': 'marketplace_operator',
    'freelancer': 'freelancer_professional',
    'general': 'general_consumer'
  };
  return segmentMap[vertical] || 'unknown';
};

// Helper function to assess lead quality for GA
const getLeadQuality = (formData: any): string => {
  let score = 0;
  if (formData.company && formData.company.length > 0) score += 2;
  if (formData.phone && formData.phone.length > 0) score += 1;
  if (formData.name && formData.name.length > 10) score += 1;
  
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'basic';
};

export default function InterestRegistrationForm({
  source,
  vertical,
  title = "¿Te interesa Kustodia?",
  subtitle = "Regístrate para acceso temprano y actualizaciones exclusivas",
  buttonText = "Registrar Interés",
  compactMode = false
}: InterestRegistrationFormProps) {
  const analytics = useAnalyticsContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formStarted, setFormStarted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Track form interaction
    analytics.trackEvent('interest_form_interaction', {
      field: name,
      source,
      vertical,
      form_type: 'interest_registration'
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    // Track form start on first focus
    if (!formStarted) {
      setFormStarted(true);
      analytics.trackEvent('interest_form_started', {
        source,
        vertical,
        form_type: 'interest_registration',
        first_field: name,
        engagement_level: 'high'
      });
    }
    
    // Track field focus
    analytics.trackEvent('interest_form_field_focus', {
      field: name,
      source,
      vertical,
      form_type: 'interest_registration'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Track form submission attempt with comprehensive GA data
      analytics.trackEvent('interest_form_submission_attempt', {
        source,
        vertical,
        has_company: !!formData.company,
        has_phone: !!formData.phone,
        form_type: 'interest_registration',
        // GA-specific vertical categorization
        business_vertical: vertical,
        customer_segment: getCustomerSegment(vertical),
        lead_quality: getLeadQuality(formData),
        conversion_funnel_stage: 'form_submission',
        engagement_level: 'high'
      });

      const response = await fetch('/api/interest-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source,
          vertical,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar interés');
      }

      // Track successful submission
      analytics.trackEvent('interest_form_submission_success', {
        source,
        vertical,
        conversion_type: 'lead_generated',
        form_type: 'interest_registration',
        // Enhanced GA tracking
        business_vertical: vertical,
        customer_segment: getCustomerSegment(vertical),
        lead_quality: getLeadQuality(formData),
        conversion_funnel_stage: 'lead_captured',
        has_company_data: !!formData.company,
        has_phone_data: !!formData.phone,
        engagement_level: 'very_high'
      });

      setIsSubmitted(true);
    } catch (err) {
      setError('Error al enviar el formulario. Por favor intenta de nuevo.');
      
      // Track submission error
      analytics.trackEvent('interest_form_submission_error', {
        source,
        vertical,
        error: err instanceof Error ? err.message : 'Unknown error',
        form_type: 'interest_registration'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-6 text-center ${compactMode ? 'max-w-md' : 'max-w-lg'} mx-auto`}>
        <FaCheckCircle className="text-green-600 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">¡Gracias por tu interés!</h3>
        <p className="text-green-700">
          Te contactaremos pronto con actualizaciones sobre Kustodia y acceso temprano a la plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-lg p-6 ${compactMode ? 'max-w-md' : 'max-w-lg'} mx-auto`}>
      <div className="text-center mb-6">
        <h3 className={`font-bold text-gray-900 mb-2 ${compactMode ? 'text-lg' : 'text-xl'}`}>
          {title}
        </h3>
        <p className={`text-gray-600 ${compactMode ? 'text-sm' : 'text-base'}`}>
          {subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="name"
            placeholder="Nombre completo *"
            value={formData.name}
            onChange={handleInputChange}
            onFocus={handleFocus}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico *"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={handleFocus}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {!compactMode && (
          <>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="company"
                placeholder="Empresa (opcional)"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono (opcional)"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              Enviando...
            </>
          ) : (
            buttonText
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Al registrarte, aceptas nuestros{' '}
          <a href="/terminos" className="text-blue-600 hover:underline">
            términos y condiciones
          </a>{' '}
          y{' '}
          <a href="/privacidad" className="text-blue-600 hover:underline">
            política de privacidad
          </a>
          .
        </p>
      </form>
    </div>
  );
}
