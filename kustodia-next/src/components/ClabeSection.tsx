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
  walletAddress?: string;
  ethBalance?: string | null;
  mxnbsBalance?: string | null;
}

const ClabeSection: React.FC<ClabeSectionProps> = ({ payoutClabe = '', depositClabe = '', walletAddress = '', ethBalance = null, mxnbsBalance = null }) => {
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
      <div className="text-base font-bold text-gray-800 mb-3 text-left">CLABE y cuentas</div>
      <div className="mb-2">Wallet address: {walletAddress ? (
        <a
          href={`https://sepolia.arbiscan.io/address/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-blue-700 underline break-all hover:text-blue-900"
          title="View on Arbiscan (Arbitrum Sepolia)"
        >
          {walletAddress}
        </a>
      ) : <span className="font-mono text-black break-all">-</span>}
      </div>
      <div className="mb-2">MXNBS (Arbitrum Sepolia): <span className="font-mono text-green-700">{mxnbsBalance !== null ? `${mxnbsBalance} MXNBS` : "-"}</span></div>
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
        <button
          onClick={() => { setInput(currentPayoutClabe); setEditing(true); }}
          className="w-full flex items-center justify-center gap-2 mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
          style={{ minHeight: 32, maxWidth: 220, marginLeft: 'auto', marginRight: 'auto' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L13 17H9v-4z" />
          </svg>
          Editar CLABE de retiro
        </button>
      )}
      {feedback && (
        <div className={`mt-2 rounded p-2 ${feedback.startsWith("CLABE") ? "bg-green-100 text-black" : "bg-red-100 text-black"}`}>{feedback}</div>
      )}
    </div>
  );
};

export default ClabeSection;
