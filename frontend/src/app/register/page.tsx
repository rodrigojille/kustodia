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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (res.ok) {
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
        setError(data.message || "Error al registrar. Intenta de nuevo.");
        
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <a href="/" className="mb-6 flex justify-center">
        <img src="/kustodia-logo.png" alt="Kustodia Logo" className="h-14 w-14 rounded-full shadow hover:scale-105 transition" />
      </a>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-blue-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Crea tu cuenta</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}
        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          disabled={loading}
        />
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            id="acceptTerms"
            className="mt-1 mr-2"
            checked={form.acceptTerms || false}
            onChange={e => setForm(f => ({ ...f, acceptTerms: e.target.checked }))}
            disabled={loading}
            required
          />
          <label htmlFor="acceptTerms" className="text-xs text-gray-700 select-none">
            Acepto los <Link href="/terminos" className="underline text-blue-700" target="_blank">Términos y Condiciones</Link> y el <Link href="/privacidad" className="underline text-blue-700" target="_blank">Aviso de Privacidad</Link>.
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-900 px-2 text-gray-400">o</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            // 🔥 ANALYTICS: Track Google OAuth registration attempt
            trackUserAction('google_registration_clicked', {
              registration_method: 'google_oauth',
              journey_stage: 'acquisition'
            });
            
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            window.location.href = `${apiUrl}/api/auth/google`;
          }}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Registrarse con Google
        </button>
        <div className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 underline">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}
