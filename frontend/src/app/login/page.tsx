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
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Iniciar sesión</h2>
          
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
          
          {resendSuccess && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-blue-700 text-sm font-medium">{resendSuccess}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
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
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
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
                {loading ? "Ingresando..." : "Ingresar"}
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
              Ingresar con Google
            </span>
          </button>

          {/* Additional Links */}
          <div className="flex flex-col items-center mt-6 space-y-3">
            <a href="/reset-password" className="text-blue-600 text-sm hover:text-blue-800 transition-colors duration-200 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
            
            {showResend && (
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline disabled:opacity-60"
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
            
            <div className="text-center text-sm text-gray-600 mt-4">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-semibold hover:underline">
                Regístrate aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
