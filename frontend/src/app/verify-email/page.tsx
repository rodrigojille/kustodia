"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params?.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Token inválido o faltante.");
        return;
      }
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        console.log('Verification response:', { status: res.status, data });
        
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "¡Correo verificado! Ya puedes iniciar sesión.");
        } else {
          setStatus("error");
          setMessage(data.error || data.message || "No se pudo verificar el correo.");
        }
      } catch {
        setStatus("error");
        setMessage("Error de red. Intenta más tarde.");
      }
    }
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-blue-100 text-center">
        <h1 className="text-2xl font-bold mb-6 text-black">Verificación de correo</h1>
        {status === "pending" && <div className="text-blue-600 mb-4">Verificando...</div>}
        {status === "success" && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
        {status === "error" && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{message}</div>}
        <Link href="/login" className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition mt-4">Iniciar sesión</Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
