"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes("verifica")) {
          setError("Tu correo no ha sido verificado. ");
          setShowResend(true);
        } else {
          setError(data.error || "Error de autenticación");
        }
        setLoading(false);
        return;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setSuccess("¡Ingreso exitoso! Redirigiendo...");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

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
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition disabled:opacity-60 mb-2"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
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
                  const res = await fetch("/api/auth/resend-verification", {
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
