// PagoFormEscrow3.tsx
// Direct wallet-to-escrow contract interaction for KustodiaEscrow3_0
import { getPortalInstance } from '../utils/portalInstance';
import React, { useState } from "react";
import { ethers } from "ethers";

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS!;
const MXNBS_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS!;
const ARBITRUM_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL!;

const escrowAbi = [
  "function createEscrow(address seller, address commission, uint256 amount, uint256 custodyAmount, uint256 custodyPeriod) returns (uint256)",
  "event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed seller, uint256 amount, uint256 custodyAmount, address commission)",
  "event EscrowReleased(uint256 indexed escrowId, address indexed to)",
  "event CustodyReleased(uint256 indexed escrowId, address indexed to)",
  "event EscrowDisputed(uint256 indexed escrowId, address indexed by)",
  "event EscrowResolved(uint256 indexed escrowId, address indexed winner)"
];

const erc20Abi = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

export default function PagoFormEscrow3() {
  const [seller, setSeller] = useState("");
  const [commission, setCommission] = useState("");
  const [amount, setAmount] = useState("");
  const [custodyPercent, setCustodyPercent] = useState("");
  const [custodyDays, setCustodyDays] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [escrowId, setEscrowId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateEscrow(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setEvents([]);
    setLoading(true);
    try {
      // PortalHQ SDK integration
      const portal = await getPortalInstance();
    if (!portal) throw new Error("Portal SDK is only available in the browser");
    await portal.onReady(() => {});
      const address = await portal.getEip155Address();
      // Ethers.js for encoding
      const erc20Interface = new ethers.Interface(erc20Abi);
      const escrowInterface = new ethers.Interface(escrowAbi);
      // Get decimals (simulate call via Portal)
      // MXNBS has 6 decimals
      const decimals = 6;
      const totalAmount = ethers.parseUnits(amount, decimals);
      const custodyAmount = ethers.parseUnits((parseFloat(amount) * (parseFloat(custodyPercent) / 100)).toFixed(2), decimals);
      // Always approve before creating escrow (PortalHQ SDK does not support allowance read)
      setStatus("Aprobando MXNBS...");
      const approveData = erc20Interface.encodeFunctionData("approve", [ESCROW_CONTRACT_ADDRESS, totalAmount]);
      const approveTxHash = await portal.ethSendTransaction(address, {
        from: address,
        to: MXNBS_CONTRACT_ADDRESS,
        data: approveData
      });
      setTxHash(approveTxHash);
      // Optionally wait for confirmation
      setStatus("Creando escrow...");
      const createEscrowData = escrowInterface.encodeFunctionData("createEscrow", [
        seller,
        commission || ethers.ZeroAddress,
        totalAmount,
        custodyAmount,
        custodyDays
      ]);
      const escrowTxHash = await portal.ethSendTransaction(address, {
        from: address,
        to: ESCROW_CONTRACT_ADDRESS,
        data: createEscrowData
      });
      setTxHash(escrowTxHash);
      // Optionally, fetch receipt and parse logs for EscrowCreated
      setStatus("Esperando confirmación de la transacción...");
      // Optionally poll for receipt and parse EscrowCreated event
      setStatus("Escrow creado exitosamente");
      // Optionally parse escrowId from logs if needed
    } catch (err: any) {
      setError(err.message || String(err));
    }
    setLoading(false);
  }

  // Listen for events (optional, for live UI updates)
  // You can poll or use websockets for production

  return (
    <form className="space-y-4" onSubmit={handleCreateEscrow}>
      <input className="border p-2 w-full" placeholder="Seller Wallet" value={seller} onChange={e => setSeller(e.target.value)} required />
      <input className="border p-2 w-full" placeholder="Commission Wallet (opcional)" value={commission} onChange={e => setCommission(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Monto MXNBS" value={amount} onChange={e => setAmount(e.target.value)} required />
      <input className="border p-2 w-full" placeholder="% Custodia" value={custodyPercent} onChange={e => setCustodyPercent(e.target.value)} required />
      <input className="border p-2 w-full" placeholder="Días de Custodia" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} required />
      <button className="bg-blue-600 text-white rounded px-4 py-2" type="submit" disabled={loading}>Crear Escrow Directo</button>
      {status && <div className="text-green-700 mt-2">{status}</div>}
      {escrowId && <div className="text-blue-700 mt-2">Escrow ID: {escrowId}</div>}
      {txHash && <div className="text-xs mt-2">Tx: <a href={`https://sepolia.arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.slice(0, 10)}…</a></div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </form>
  );
}
