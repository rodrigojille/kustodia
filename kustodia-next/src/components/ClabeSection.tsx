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

export interface ClabeSectionProps {
  payoutClabe?: string;
  depositClabe?: string;
}

const ClabeSection: React.FC<ClabeSectionProps> = ({ payoutClabe = '', depositClabe = '' }) => {
  const [currentPayoutClabe, setCurrentPayoutClabe] = useState(payoutClabe);
  const [currentDepositClabe] = useState(depositClabe);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await authFetch("/api/users/update-payout-clabe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payout_clabe: input }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPayoutClabe(input);
        setEditing(false);
        setFeedback("CLABE guardada correctamente.");
      } else {
        setFeedback(data.error || "No se pudo guardar la CLABE.");
      }
    } catch {
      setFeedback("Error de conexión. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="my-4">
      <div className="mb-2">CLABE de depósito: <span className="font-mono text-black">{currentDepositClabe || "-"}</span></div>
      <div className="mb-2">CLABE de retiro: <span className="font-mono text-black">{currentPayoutClabe || "-"}</span></div>
      {editing ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
          <input
            className="input"
            type="text"
            maxLength={18}
            minLength={18}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Nueva CLABE de retiro"
            style={{ borderColor: "#1A73E8", borderWidth: 2 }}
            autoFocus
          />
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancelar</button>
        </form>
      ) : (
        <button onClick={() => { setInput(currentPayoutClabe); setEditing(true); }} className="btn btn-outline-primary mt-2">Editar CLABE de retiro</button>
      )}
      {feedback && (
        <div className={`mt-2 rounded p-2 ${feedback.startsWith("CLABE") ? "bg-green-100 text-black" : "bg-red-100 text-black"}`}>{feedback}</div>
      )}
    </div>
  );
};

export default ClabeSection;
