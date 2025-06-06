"use client";
import React, { useEffect, useState } from "react";

async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(input, { ...init, headers });
}

export interface KYCStatusProps {
  kycStatus?: string;
  userId?: number;
  userEmail?: string;
}

const KYCStatus: React.FC<KYCStatusProps> = ({ kycStatus = 'No verificado', userId, userEmail }) => {
  const [currentKycStatus, setCurrentKycStatus] = useState<string | null>(kycStatus);
  const [loading, setLoading] = useState(false);
  // userId and userEmail are now props
  const [currentUser] = useState<{ id?: number; email?: string }>({ id: userId, email: userEmail });

  const handleStartKYC = async () => {
    if (!currentUser) {
      alert("Usuario no autenticado.");
      return;
    }
    try {
      const res = await authFetch("/api/truora/start-kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, email: currentUser.email })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "No se pudo iniciar el proceso de KYC");
      }
    } catch {
      alert("Error de conexión al iniciar KYC");
    }
  };

  return (
    <div className="my-4">
      <div className="mb-2 text-black">Estatus KYC: <span className="font-semibold text-black">{loading ? "Cargando..." : kycStatus}</span></div>
      {kycStatus !== "approved" && (
        <button onClick={handleStartKYC} className="btn btn-primary mt-2">Iniciar KYC</button>
      )}
      {kycStatus === "approved" && (
        <div className="mt-2 text-green-700 font-semibold text-black">KYC aprobado</div>
      )}
    </div>
  );
};

export default KYCStatus;
