"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalyticsContext } from '../../components/AnalyticsProvider';
import useAnalytics from '../../hooks/useAnalytics';

export default function LoginPage() {
  // 🔥 ANALYTICS: Initialize authentication journey tracking
  const { trackEvent, trackUserAction } = useAnalyticsContext();
  const analytics = useAnalytics();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const router = useRouter();
  
  // 🔥 Track login page load
  useEffect(() => {
    trackEvent('login_page_loaded', {
      journey_stage: 'authentication',
      referrer: document.referrer || 'direct'
    });
    
    analytics.formTracking.trackFormStart('login_form', 'authentication');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("=== LOGIN STARTED ===");
    
    try {
      // Use Next.js proxy route for consistent authentication
      const loginUrl = '/api/users/login';
      console.log("Calling login API via proxy:", loginUrl);
      
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Backend response status:", res.status);
      const data = await res.json();
      console.log("Backend response data:", data);

      if (!res.ok) {
        // Handle unverified email case
        if (res.status === 403 && data.unverified) {
          setError(data.message || "Tu correo no ha sido verificado.");
          setShowResend(true);
          console.log("Email not verified for:", data.email);
        } else {
          setError(data.error || "Error en el inicio de sesión");
          console.log("Login failed:", data.error);
        }
        
        // 🔥 ANALYTICS: Track login failure
        analytics.formTracking.trackFormCompletion('login_form', false, [data.error || 'Login failed']);
        trackUserAction('login_failed', {
          error_type: data.error || 'unknown_error',
          journey_stage: 'authentication',
          unverified_email: data.unverified || false
        });
        
        setLoading(false);
        return;
      }
      
      if (data.message === "Login successful") {
        console.log("Login successful, processing authentication");
        
        // In development mode, store the token from response body
        if (data.token) {
          console.log("[LOGIN] Development mode - storing token in localStorage");
          localStorage.setItem('auth_token', data.token);
        } else {
          console.log("[LOGIN] Production mode - relying on HTTP-only cookie");
        }
        
        // Store user email for UI purposes only (not for auth)
        localStorage.setItem("userEmail", email);
        
        console.log("=== FETCHING USER DATA ===");
        // Fetch user data to populate frontend state
        try {
          const userRes = await fetch('/api/users/me', {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
            headers: {
              'Content-Type': 'application/json',
              // Add Authorization header if we have a token (for development)
              ...(data.token ? { 'Authorization': `Bearer ${data.token}` } : {})
            }
          });
          
          console.log("User data fetch status:", userRes.status);
          
          if (userRes.ok) {
            const userData = await userRes.json();
            console.log("User data fetched successfully:", userData);
            
            // Store user data for frontend use
            if (userData.user) {
              localStorage.setItem('userData', JSON.stringify(userData.user));
            }
          } else {
            console.error("Failed to fetch user data:", userRes.status);
            // Continue with redirect even if user data fetch fails
          }
        } catch (userFetchError) {
          console.error("Error fetching user data:", userFetchError);
          // Continue with redirect even if user data fetch fails
        }
        
        console.log("=== WALLET CHECK STARTED ===");
        // Skip wallet complexity for now, just redirect
        console.log("Skipping wallet check, proceeding to dashboard");
        
        setSuccess("¡Ingreso exitoso! Redirigiendo...");
        console.log("About to redirect to dashboard");
        setTimeout(() => {
          console.log("Executing redirect now");
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Error desconocido");
    } finally {
      console.log("=== LOGIN FINISHED ===");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResendSuccess("Email de verificación enviado. Revisa tu bandeja de entrada.");
        setError(null);
        
        // Track successful resend
        trackUserAction('verification_email_resent', {
          email_domain: email.split('@')[1] || 'unknown',
          journey_stage: 'authentication'
        });
      } else {
        setError(data.error || "Error al enviar email de verificación");
      }
    } catch (err) {
      setError("Error al enviar email de verificación");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <a href="/" className="mb-6 flex justify-center">
        <img src="/kustodia-logo.png" alt="Kustodia Logo" className="h-14 w-14 rounded-full shadow hover:scale-105 transition" />
      </a>
      <form
        onSubmit={handleLogin}
        className="bg-white border border-gray-200 rounded-xl shadow p-8 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Iniciar sesión</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm text-center">{success}</div>}
        {resendSuccess && <div className="mb-4 text-green-700 text-sm text-center">{resendSuccess}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1">Correo electrónico</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-black bg-white placeholder-gray-400"
            placeholder="Tu contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">O</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={() => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            window.location.href = `${apiUrl}/api/auth/google`;
          }}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white border border-gray-300"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Ingresar con Google
        </button>
        <div className="flex flex-col items-center mt-2">
          <a href="/reset-password" className="text-blue-600 text-sm underline hover:text-blue-800 mb-2">¿Olvidaste tu contraseña?</a>
          {showResend && (
            <button
              type="button"
              className="text-xs text-blue-600 underline hover:text-blue-800 disabled:opacity-60"
              disabled={resendLoading}
              onClick={async () => {
                setResendLoading(true);
                setResendSuccess(null);
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/resend-verification`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setResendSuccess("Correo de verificación reenviado. Revisa tu bandeja de entrada.");
                  } else {
                    setError(data.message || "No se pudo reenviar el correo.");
                  }
                } catch {
                  setError("Error al reenviar correo. Intenta más tarde.");
                }
                setResendLoading(false);
              }}
            >
              {resendLoading ? "Enviando..." : "Reenviar correo de verificación"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
