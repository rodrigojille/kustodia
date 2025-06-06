"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Completa todos los campos.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
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
        setForm({ name: "", email: "", password: "", confirm: "" });
      } else {
        setError(data.message || "Error al registrar. Intenta de nuevo.");
      }
    } catch {
      setError("Error de red. Intenta más tarde.");
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
        <div className="text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 underline">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}
