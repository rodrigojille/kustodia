"use client";
import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";

interface NFTAsset {
  tokenId: string;
  contractAddress: string;
  blockchain: string;
  verificationUrl: string;
  kustodiaCertified: boolean;
}

export default function CobroFormFull() {
  const [payerEmail, setPayerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [warrantyPercent, setWarrantyPercent] = useState("");
  const [custodyDays, setCustodyDays] = useState("");
  const [description, setDescription] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [commissionBeneficiaryName, setCommissionBeneficiaryName] = useState("");
  const [commissionBeneficiaryEmail, setCommissionBeneficiaryEmail] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("N/A");
  const [selectedNFT, setSelectedNFT] = useState("");
  const [userNFTs, setUserNFTs] = useState<NFTAsset[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user NFTs on component mount
  useEffect(() => {
    loadUserNFTs();
  }, []);

  React.useEffect(() => {
    if (amount && commissionPercent) {
      const calc = Number(amount) * Number(commissionPercent) / 100;
      setCommissionAmount(calc.toFixed(2));
    } else {
      setCommissionAmount("N/A");
    }
  }, [amount, commissionPercent]);

  const loadUserNFTs = async () => {
    try {
      setLoadingNFTs(true);
      const response = await authFetch('/api/assets/user/assets');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.assets)) {
          setUserNFTs(data.assets);
        }
      }
    } catch (err) {
      console.error('Error loading user NFTs:', err);
    } finally {
      setLoadingNFTs(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await authFetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_email: payerEmail,
          amount: Number(amount),
          warranty_percent: warrantyPercent ? Number(warrantyPercent) : undefined,
          timeline: custodyDays ? Number(custodyDays) : undefined,
          description,
          commission_percent: commissionPercent ? Number(commissionPercent) : undefined,
          commission_beneficiary_name: commissionBeneficiaryName || undefined,
          commission_beneficiary_email: commissionBeneficiaryEmail || undefined,
          nft_token_id: selectedNFT || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "No se pudo solicitar el cobro.");
      }
    } catch (err: any) {
      setError("Error de red o servidor.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 md:p-8 mx-auto">
      <h2 className="text-xl font-bold text-center mb-4 text-black">Solicitar pago</h2>
      <input type="email" className="input w-full text-black placeholder-black" placeholder="Email del pagador" value={payerEmail} onChange={e => setPayerEmail(e.target.value)} required />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} required min={1} />
      
      {/* NFT Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-black">🎨 Gemelo Digital (opcional)</label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md text-black bg-white"
          value={selectedNFT}
          onChange={e => setSelectedNFT(e.target.value)}
          disabled={loadingNFTs}
        >
          <option value="">Seleccionar gemelo digital (opcional)</option>
          {userNFTs.map((nft) => (
            <option key={nft.tokenId} value={nft.tokenId}>
              🎨 Token #{nft.tokenId} - {nft.blockchain} {nft.kustodiaCertified ? '✅' : ''}
            </option>
          ))}
        </select>
        {loadingNFTs && <p className="text-sm text-gray-500">Cargando gemelos digitales...</p>}
        {selectedNFT && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            💎 Este cobro estará respaldado por tu Gemelo Digital Token #{selectedNFT}
          </div>
        )}
      </div>
      <input type="number" className="input w-full text-black placeholder-black" placeholder="% bajo garantía (0-100)" value={warrantyPercent} onChange={e => setWarrantyPercent(e.target.value)} min={0} max={100} />
      <input type="number" className="input w-full text-black placeholder-black" placeholder="Días en custodia (mínimo 1)" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} min={1} />
      <input type="text" className="input w-full text-black placeholder-black" placeholder="Descripción o propósito del pago (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="mt-4 mb-2 font-semibold text-black">Comisión (opcional)</div>
      <input type="number" className="input w-full text-black placeholder-black" placeholder="% de comisión (ej. 5)" value={commissionPercent} onChange={e => setCommissionPercent(e.target.value)} min={0} max={100} />
      <input type="text" className="input w-full text-black placeholder-black" placeholder="Nombre del beneficiario de la comisión" value={commissionBeneficiaryName} onChange={e => setCommissionBeneficiaryName(e.target.value)} />
      <input type="email" className="input w-full text-black placeholder-black" placeholder="Email del beneficiario de la comisión" value={commissionBeneficiaryEmail} onChange={e => setCommissionBeneficiaryEmail(e.target.value)} />
      <div className="text-sm mt-1 text-black">Monto comisión: <b>{commissionAmount !== "N/A" ? `$${commissionAmount}` : "N/A"}</b></div>
      <button type="submit" className="btn btn-success w-full mt-4 text-white" disabled={loading}>{loading ? "Enviando..." : "Solicitar pago"}</button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mt-2">Cobro solicitado correctamente.</div>}
    </form>
  );
}
