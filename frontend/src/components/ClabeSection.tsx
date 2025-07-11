"use client";
import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

export interface ClabeSectionProps {
  payoutClabe?: string;
  depositClabe?: string;
  walletAddress?: string;
  ethBalance?: string | null;
  mxnbsBalance?: string | null;
}

import DepositModal from './DepositModal';

const ClabeSection: React.FC<ClabeSectionProps> = ({ payoutClabe = '', depositClabe = '', walletAddress = '', ethBalance = null, mxnbsBalance = null }) => {
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [currentPayoutClabe, setCurrentPayoutClabe] = useState(payoutClabe);
  const [currentDepositClabe] = useState(depositClabe);
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('deposit');

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
    <>
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        depositClabe={depositClabe}
      />
      <div>
        <h3 className="font-semibold text-xl mb-4">Billetera</h3>
        
        {/* Segmented Control */}
        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1 mb-4">
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`px-6 py-2 text-sm font-medium rounded-md ${activeTab === 'deposit' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Depositar
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`px-6 py-2 text-sm font-medium rounded-md ${activeTab === 'withdraw' ? 'bg-white text-blue-700 shadow' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Retirar
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'deposit' && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Usa esta CLABE para agregar fondos a tu cuenta Kustodia vía SPEI.</p>
              <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                <div>
                  <span className="text-xs text-gray-500">CLABE de depósito</span>
                  <p className="font-mono text-gray-900 text-lg">{currentDepositClabe || "-"}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(depositClabe)}>
                  Copiar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="text-sm bg-white p-3 rounded-md border">
                <p>Wallet: <a href={`https://sepolia.arbiscan.io/address/${walletAddress}`} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-700 underline break-all hover:text-blue-900">{walletAddress || '-'}</a></p>
                <p>Balance: <span className="font-mono text-green-700">{mxnbsBalance !== null ? `${mxnbsBalance} MXNBS` : "-"}</span></p>
              </div>
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                  <input
                    className="input w-full"
                    type="text"
                    maxLength={18}
                    minLength={18}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nueva CLABE de retiro de 18 dígitos"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="btn btn-primary">
                      {loading ? "Guardando..." : "Guardar CLABE"}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-white p-3 rounded-md border">
                  <div>
                    <span className="text-xs text-gray-500">CLABE de retiro</span>
                    <p className="font-mono text-gray-900">{currentPayoutClabe || "No establecida"}</p>
                  </div>
                  <button onClick={() => { setInput(currentPayoutClabe); setEditing(true); }} className="btn btn-secondary text-sm">Editar</button>
                </div>
              )}
              {feedback && (
                <div className={`mt-2 rounded p-2 text-sm ${feedback.startsWith("CLABE") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{feedback}</div>
              )}
              <button
                className="btn btn-primary w-full mt-4"
                onClick={() => alert('La función de retiro estará disponible próximamente.')}
              >
                Retirar Fondos
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClabeSection;
