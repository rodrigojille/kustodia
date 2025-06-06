"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [step, setStep] = useState(token ? 2 : 1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Te enviamos un enlace para restablecer tu contraseña.");
        setStep(2);
      } else {
        setError(data.message || "No se pudo enviar el correo.");
      }
    } catch {
      setError("Error de red. Intenta más tarde.");
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirm) {
      setError("Completa ambos campos.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("¡Contraseña restablecida! Ya puedes iniciar sesión.");
      } else {
        setError(data.message || "No se pudo restablecer la contraseña.");
      }
    } catch {
      setError("Error de red. Intenta más tarde.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={step === 1 ? handleRequest : handleReset}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-blue-100"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Recuperar contraseña</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 underline">Inicia sesión</Link>
            </div>
          </>
        )}
        {step === 2 && token && (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </button>
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 underline">Inicia sesión</Link>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
