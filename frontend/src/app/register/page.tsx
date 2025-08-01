"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAnalyticsContext } from '../../components/AnalyticsProvider';
import analytics from '../../lib/analytics';

export default function RegisterPage() {
  // 🔥 ANALYTICS: Initialize registration funnel tracking
  const { trackEvent, trackUserAction } = useAnalyticsContext();
  
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", acceptTerms: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 🔥 Track registration page load - key acquisition metric
  useEffect(() => {
    trackEvent('registration_page_loaded', {
      journey_stage: 'acquisition',
      referrer: document.referrer || 'direct',
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
    });
    
    // Track registration form start using available method
    analytics.track({
      event_name: 'registration_form_start',
      category: 'user_acquisition',
      properties: {
        form_type: 'registration',
        conversion_stage: 'awareness'
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Completa todos los campos.");
      
      // 🔥 ANALYTICS: Track validation errors
      analytics.track({
        event_name: 'registration_form_error',
        category: 'user_acquisition',
        properties: {
          error_type: 'incomplete_fields',
          form_completed: false
        }
      });
      return;
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      
      // 🔥 ANALYTICS: Track password mismatch
      analytics.track({
        event_name: 'registration_form_error',
        category: 'user_acquisition',
        properties: {
          error_type: 'password_mismatch',
          form_completed: false
        }
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: form.name, email: form.email, password: form.password })
      });
      
      console.log('Registration response status:', res.status);
      const data = await res.json();
      console.log('Registration response data:', data);
      
      if (res.ok || res.status === 201) {
        setSuccess("¡Registro exitoso! Revisa tu correo para verificar tu cuenta.");
        setForm({ name: "", email: "", password: "", confirm: "", acceptTerms: false });
        
        // 🔥 ANALYTICS: Track successful registration - KEY CONVERSION
        analytics.trackUserRegistration({
          source: 'registration_form',
          mexican_market: true
        });
        trackEvent('user_registered', {
          registration_method: 'email',
          journey_stage: 'acquisition',
          conversion_type: 'registration_success',
          user_email_domain: form.email.split('@')[1] || 'unknown'
        });
        
        // Track the user acquisition success
        trackUserAction('registration_completed', {
          method: 'standard_form',
          has_name: !!form.name,
          email_domain: form.email.split('@')[1] || 'unknown'
        });
        
      } else {
        // Handle specific error cases
        let errorMessage = "Error al registrar. Intenta de nuevo.";
        
        if (res.status === 409) {
          errorMessage = "Este email ya está registrado. ¿Ya tienes cuenta?";
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setError(errorMessage);
        
        // 🔥 ANALYTICS: Track registration failure
        analytics.track({
          event_name: 'registration_form_error',
          category: 'user_acquisition',
          properties: {
            error_type: data.message || 'registration_failed',
            form_completed: false
          }
        });
        trackUserAction('registration_failed', {
          error_type: data.message || 'unknown_error',
          method: 'standard_form'
        });
      }
    } catch (err: any) {
      setError("Error de red. Intenta más tarde.");
      
      // 🔥 ANALYTICS: Track network errors
      analytics.track({
        event_name: 'registration_form_error',
        category: 'user_acquisition',
        properties: {
          error_type: 'network_error',
          form_completed: false
        }
      });
      trackUserAction('registration_error', {
        error_type: 'network_error',
        method: 'standard_form'
      });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img 
              src="/kustodia-logo.png" 
              alt="Kustodia Logo" 
              className="h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 mx-auto" 
            />
          </a>
        </div>

        {/* Main Form Card */}
        <div className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-2xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Crea tu cuenta</h1>
          
          {/* Enhanced Error States */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced Name Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  placeholder="Tu nombre completo"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Enhanced Email Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  placeholder="tu@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Enhanced Password Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Enhanced Confirm Password Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  placeholder="Confirma tu contraseña"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Enhanced Terms Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                checked={form.acceptTerms || false}
                onChange={e => setForm(f => ({ ...f, acceptTerms: e.target.checked }))}
                disabled={loading}
                required
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
                Acepto los{" "}
                <Link href="/terminos" className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200" target="_blank">
                  Términos y Condiciones
                </Link>
                {" "}y el{" "}
                <Link href="/privacidad" className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200" target="_blank">
                  Aviso de Privacidad
                </Link>
                .
              </label>
            </div>

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              className="relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              <div className="flex items-center justify-center">
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? "Creando cuenta..." : "Registrarme"}
              </div>
            </button>
          </form>

          {/* Enhanced Divider */}
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium bg-white px-2">O continúa con</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Enhanced Google OAuth Button */}
          <button
            type="button"
            onClick={() => {
              // 🔥 ANALYTICS: Track Google OAuth registration attempt
              trackUserAction('google_registration_clicked', {
                registration_method: 'google_oauth',
                journey_stage: 'acquisition'
              });
              
              // Use production API URL or fallback to localhost for development
              const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://kustodia-backend-f991a7cb1824.herokuapp.com';
              window.location.href = `${apiUrl}/api/auth/google`;
            }}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-lg group transform hover:scale-[1.02]"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              Registrarse con Google
            </span>
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
