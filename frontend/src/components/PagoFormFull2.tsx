"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { authFetch } from '../utils/authFetch';
import { parseUnits, Interface, ZeroAddress } from 'ethers';
import KustodiaEscrow3_0 from '../abis/KustodiaEscrow3_0.json';
import ERC20_ABI from "../abis/ERC20.json";
import { getPortalInstance } from '../utils/portalInstance';

// Contract addresses from environment variables
const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS || '0xeD766f75738C77179448A5BB98850358801B16e3'; // Arbitrum Sepolia
const MXNB_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS || '0x82B9e52b26A2954E113F94Ff26647754d5a4247D'; // Arbitrum Sepolia

// Validate required contract addresses
if (!ESCROW_CONTRACT_ADDRESS || !MXNB_CONTRACT_ADDRESS) {
  console.error('Missing required contract addresses in environment variables');
}

// Fetch user profile and wallet by email
async function fetchUserProfile(email: string) {
  const res = await authFetch(`/api/users/profile?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("No se pudo obtener el usuario");
  return res.json();
}

function PagoFormFull2() {
  // Direct balance management (like dashboard - no Portal SDK dependency)
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [escrowTxHash, setEscrowTxHash] = useState<string | null>(null);
  
  // Direct balance check function (same as dashboard)
  const checkBalance = useCallback(async () => {
    if (!currentUser || !currentUser.wallet_address) {
      setBalance(null);
      return;
    }
    
    try {
      setBalanceLoading(true);
      setBalanceError(null);
      
      // MXNB Arbitrum Sepolia (ERC20) - same as dashboard
      const arbProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL);
      const mxnbAddress = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS;
      if (!mxnbAddress) {
        setBalance(null);
        return;
      }
      
      const erc20Abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
      const mxnb = new ethers.Contract(mxnbAddress, erc20Abi, arbProvider);
      const bal = await mxnb.balanceOf(currentUser.wallet_address);
      let decimals = 18;
      try { decimals = await mxnb.decimals(); } catch {}
      setBalance(ethers.formatUnits(bal, decimals));
    } catch (e) {
      console.error('Error checking balance:', e);
      setBalanceError('Error al cargar saldo');
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [currentUser]);
  
  // Load user on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authFetch('users/me');
        if (res.ok) {
          const data = await res.json();
          console.log('[PagoFormFull2] User data received:', data);
          setCurrentUser(data.user); // API returns user data wrapped in { user: ... }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    
    loadUser();
  }, []);
  
  // Check balance when user loads
  useEffect(() => {
    if (currentUser) {
      checkBalance();
    }
  }, [currentUser, checkBalance]);
  
  // Recipient state and validation
  const [warrantyPercent, setWarrantyPercent] = useState("");
  const [custodyDays, setCustodyDays] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientValid, setRecipientValid] = useState<boolean | undefined>(undefined);
  const [recipientVerified, setRecipientVerified] = useState<boolean | undefined>(undefined);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [recipientWallet, setRecipientWallet] = useState<string | null>(null);

  // Commission beneficiary state and validation
  const [commissionBeneficiaryEmail, setCommissionBeneficiaryEmail] = useState("");
  const [commissionerValid, setCommissionerValid] = useState<boolean | undefined>(undefined);
  const [commissionerVerified, setCommissionerVerified] = useState<boolean | undefined>(undefined);
  const [commissionerLoading, setCommissionerLoading] = useState(false);
  const [commissionerError, setCommissionerError] = useState<string | null>(null);
  const [commissionWallet, setCommissionWallet] = useState<string | null>(null);

  // Other fields
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [commissionBeneficiaryName, setCommissionBeneficiaryName] = useState("");
  const [showCommission, setShowCommission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form submit (escrow creation)
  const [step, setStep] = useState<null | number>(null);
  const [txHashes, setTxHashes] = useState<{ direct?: string; custody?: string }>({});
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [trackerUrl, setTrackerUrl] = useState<string | null>(null);

  // Check Portal balance on component mount
  useEffect(() => {
    checkBalance();
  }, [checkBalance]);

  // Flow 3.0: Web3 payment initiation
  const handleSubmitWeb3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || !description) {
      setError("Por favor, completa todos los campos requeridos: Email del vendedor, Monto y Descripción.");
      return;
    }
    
    // Check Portal balance before payment (frontend SDK approach)
    setError(null);
    setLoading(true);
    setBackendStatus("Verificando saldo MXNB...");
    
    try {
      // Refresh balance before payment
      await checkBalance();
      
      // Validate sufficient balance
      const requiredAmount = parseFloat(amount);
      const currentBalance = parseFloat(balance || '0');
      
      if (currentBalance < requiredAmount) {
        throw new Error(`Saldo insuficiente. Tienes ${balance} MXNB pero necesitas ${amount} MXNB para este pago.`);
      }
      
      console.log('[Payment] Balance check passed:', { currentBalance, requiredAmount });
      
    } catch (balanceErr: any) {
      setError(balanceErr.message || 'Error al verificar saldo MXNB');
      setLoading(false);
      setBackendStatus(null);
      return;
    }
    
    // WEB3 PAYMENT FLOW: Use new unified backend endpoint
    try {
      setBackendStatus("Procesando pago Web3 completo...");
      
      // Call the new Web3 payment endpoint that handles everything
      const paymentResponse = await authFetch('/api/web3-payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_email: recipient,
          amount: parseFloat(amount),
          description: description,
          warranty_percent: parseFloat(warrantyPercent),
          custody_days: parseInt(custodyDays)
        })
      });
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(`Web3 payment failed: ${errorData.error || 'Unknown error'}`);
      }
      
      const paymentResult = await paymentResponse.json();
      
      // Extract transaction hashes from the response
      const approvalTxHash = paymentResult.payment.approval_tx_hash;
      const escrowTxHash = paymentResult.payment.escrow_tx_hash;
      
      setApprovalTxHash(approvalTxHash);
      setEscrowTxHash(escrowTxHash);
      
      // Set tracker URL from payment ID
      setTrackerUrl(`/dashboard/pagos/${paymentResult.payment.id}`);
      setBackendStatus("🎉 ¡Pago Web3 creado y fondeado exitosamente!");

    } catch (err: any) {
      console.error('Error during secure Web3 payment flow:', err);
      setError(err.message || 'Ocurrió un error inesperado durante el proceso de pago Web3.');
      setBackendStatus("Error en el proceso de pago.");
    } finally {
      setLoading(false);
    }
  };

  // Flow 2.0: Wallet-based escrow payment flow using /api/payments/initiate-wallet
  const handleSubmit2 = async (e: React.FormEvent) => {
    console.log('[DEBUG] handleSubmit2 called');
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep(1);
    setTxHashes({});
    setBackendStatus(null);
    setTrackerUrl(null);
    try {
      // 1. Preflight: get contract/token info, do NOT create payment
      const preflightPayload = {
        recipient_email: recipient,
        amount,
        custody_percent: warrantyPercent,
        timeline: custodyDays,
        commission_percent: commissionPercent || undefined,
        commission_beneficiary_email: commissionBeneficiaryEmail || undefined,
        description: description || undefined,
      };
      const preflightRes = await authFetch('/api/payments/preflight-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preflightPayload),
      });
      const preflight = await preflightRes.json();
      if (!preflightRes.ok) throw new Error(preflight.error || "Error preparando la transacción");

      // 2. Backend Portal API flow (approve and createEscrow)
      setBackendStatus("Aprobando MXNB via Backend Portal API...");
      const erc20Iface = new Interface(ERC20_ABI);
      const approveData = erc20Iface.encodeFunctionData("approve", [preflight.contract.address, preflight.backendAmount]);
      let approveTxHash = "";
      try {
        const approvalResponse = await authFetch('/api/portal/send-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: preflight.token.address,
            data: approveData,
            description: `Token approval for wallet payment: ${description}`
          })
        });
        
        if (!approvalResponse.ok) {
          const errorData = await approvalResponse.json();
          throw new Error(`Token approval failed: ${errorData.error || 'Unknown error'}`);
        }
        
        const approvalResult = await approvalResponse.json();
        approveTxHash = approvalResult.transactionHash;
        setTxHashes(h => ({ ...h, approve: approveTxHash }));
      } catch (err: any) {
        setError(`Firma rechazada o fallida en aprobación: ${err.message}. El pago no se creó.`);
        setLoading(false);
        return;
      }
      setBackendStatus("Creando escrow en blockchain via Backend Portal API...");
      const escrowIface = new Interface(preflight.contract.abi);
      const createEscrowData = escrowIface.encodeFunctionData("createEscrow", [
        preflight.recipient_wallet,
        preflight.commission_wallet || ZeroAddress,
        preflight.backendAmount,
        preflight.custody_amount,
        preflight.timeline
      ]);
      let escrowTxHash = "";
      try {
        const escrowResponse = await authFetch('/api/portal/send-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: preflight.contract.address,
            data: createEscrowData,
            description: `Escrow creation for wallet payment: ${description}`
          })
        });
        
        if (!escrowResponse.ok) {
          const errorData = await escrowResponse.json();
          throw new Error(`Escrow creation failed: ${errorData.error || 'Unknown error'}`);
        }
        
        const escrowResult = await escrowResponse.json();
        escrowTxHash = escrowResult.transactionHash;
        setTxHashes(h => ({ ...h, escrow: escrowTxHash }));
      } catch (err: any) {
        setError(`Firma rechazada o fallida al crear el escrow: ${err.message}. El pago no se creó.`);
        setLoading(false);
        return;
      }
      setStep(3);

      // 3. Only now: create the payment in backend
      setBackendStatus("Notificando hashes a backend...");
      const createRes = await authFetch('/api/payments/initiate-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preflightPayload,
          approveTxHash,
          escrowTxHash
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Error creando el pago");
      setStep(4);
      setBackendStatus("¡Pago completado!");
      // --- Remove all legacy or duplicate Portal/payment logic below this line. Only the new flow should remain. ---

      // 6. Optionally notify backend of tx hashes
      setBackendStatus("Notificando hashes a backend...");
      await authFetch('/api/payments/update-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: preflight.id,
          escrowTxHash,
          approveTxHash,
        }),
      });

      setStep(4);
      setBackendStatus("¡Pago completado!");
    } catch (err: any) {
      console.error('[ERROR] handleSubmit2', err);
      if (typeof err?.message === 'string' && (err.message.includes('portal_signingRequested') || err.message.toLowerCase().includes('signing'))) {
        setError('No se pudo firmar la transacción en tu wallet. Por favor verifica tu conexión y vuelve a intentar. Si el problema persiste, recarga la página o contacta soporte.');
      } else {
        setError(err.message || String(err));
      }
    }
    setLoading(false);
  };

  // Recipient validation (reuse PagoFormFull logic, but add wallet visibility)
  const validateRecipient = async (email: string) => {
    setRecipientLoading(true);
    setRecipientError(null);
    setRecipientValid(undefined);
    setRecipientVerified(undefined);
    setRecipientWallet(null);
    try {
      const res = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setRecipientValid(data.exists);
      setRecipientVerified(data.verified);
      setRecipientWallet(data.wallet_address || null);
      if (!data.exists) {
        setRecipientError('El destinatario no está registrado en Kustodia.');
      } else if (!data.verified) {
        setRecipientError('El destinatario no ha verificado su correo.');
      } else if (!data.wallet_address) {
        setRecipientError('El destinatario no tiene wallet configurada.');
      } else {
        // This is the success case
        setRecipientError(null);
      }
    } catch {
      setRecipientError('Error validando destinatario. Intenta de nuevo.');
      setRecipientValid(undefined);
      setRecipientVerified(undefined);
      setRecipientWallet(null);
    }
    setRecipientLoading(false);
  };

  // Recipient input blur handler
  const handleRecipientBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (recipient) validateRecipient(recipient);
  };

  // Commission beneficiary validation (reuse PagoFormFull logic, but add wallet visibility)
  const validateCommissioner = async (email: string) => {
    setCommissionerLoading(true);
    setCommissionerError(null);
    setCommissionerValid(undefined);
    setCommissionerVerified(undefined);
    setCommissionWallet(null);
    try {
      const res = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setCommissionerValid(data.exists);
      setCommissionerVerified(data.verified);
      setCommissionWallet(data.wallet_address || null);
      if (!data.exists) setCommissionerError('El beneficiario no está registrado en Kustodia.');
      else if (!data.verified) setCommissionerError('El beneficiario no ha verificado su correo.');
      else if (!data.wallet_address) setCommissionerError('El beneficiario no tiene wallet configurada.');
      else setCommissionerError(null);
    } catch {
      setCommissionerError('Error validando beneficiario. Intenta de nuevo.');
      setCommissionerValid(undefined);
      setCommissionerVerified(undefined);
      setCommissionWallet(null);
    }
    setCommissionerLoading(false);
  };

  const handleCommissionerBlur = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (commissionBeneficiaryEmail) validateCommissioner(commissionBeneficiaryEmail);
  };

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmitWeb3}
    >
      <div>
        <label className="block font-semibold mb-1">Email del vendedor</label>
        <input
          type="email"
          className="input w-full"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          onBlur={handleRecipientBlur}
          placeholder="ejemplo@kustodia.mx"
          required
        />
        {recipientLoading && <div className="text-gray-500 text-sm">Buscando usuario...</div>}
        {recipientValid && recipientVerified && recipientWallet && !recipientError && (
          <div className="text-green-700 text-sm mt-1">Wallet vendedor: <b>{recipientWallet}</b></div>
        )}

        {recipientError && <div className="text-red-600 text-sm mt-1">{recipientError}</div>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Monto (MXNBs)</label>
        <input
          type="number"
          className="input w-full"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          step="0.01"
          min="0.01"
          max={balance || undefined}
          required
          placeholder="Monto en MXNBs (ej. 1000)"
          disabled={loading}
        />
        
        {/* Portal Balance Display */}
        <div className="mt-2 p-3 bg-blue-50 rounded border">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-blue-900">
              Tu saldo MXNB:
              {balanceLoading ? (
                <span className="ml-2 text-blue-600">Verificando...</span>
              ) : balanceError ? (
                <span className="ml-2 text-red-600">Error al cargar</span>
              ) : (
                <span className="ml-2 text-blue-700 font-bold">{balance || '0.00'} MXNB</span>
              )}
            </div>
            <button
              type="button"
              onClick={checkBalance}
              disabled={balanceLoading}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded disabled:opacity-50"
            >
              {balanceLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
          {balanceError && (
            <div className="text-red-600 text-xs mt-1">{balanceError}</div>
          )}
          {amount && balance && parseFloat(amount) > parseFloat(balance) && (
            <div className="text-red-600 text-xs mt-1 font-medium">
              ⚠️ Saldo insuficiente para este pago
            </div>
          )}
          {balance && parseFloat(balance) > 0 && (
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Disponible: {balance} MXNB</span>
              <button
                type="button"
                className="text-blue-600 hover:underline disabled:opacity-50"
                onClick={() => setAmount(balance)}
                disabled={loading || !balance}
              >
                Max
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Porcentaje bajo garantía (%)</label>
        <input
          type="number"
          className="input w-full"
          value={warrantyPercent}
          onChange={e => setWarrantyPercent(e.target.value)}
          min={0}
          max={100}
          placeholder="% bajo garantía (0-100)"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Días en custodia</label>
        <input
          type="number"
          className="input w-full"
          value={custodyDays}
          onChange={e => setCustodyDays(e.target.value)}
          min={1}
          placeholder="Días en custodia (mínimo 1)"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Descripción</label>
        <input
          type="text"
          className="input w-full"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción del servicio o producto"
        />
      </div>
      {/* Comisión Section (collapsible) */}
      <div>
        {!showCommission ? (
          <button
            type="button"
            className="text-blue-600 underline mb-2"
            onClick={() => setShowCommission(true)}
          >
            Agregar beneficiario de comisión
          </button>
        ) : (
          <div className="border rounded p-3 bg-gray-50 mb-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block font-semibold">% Comisión</label>
              <button
                type="button"
                className="text-red-500 text-xs ml-2"
                onClick={() => {
                  setShowCommission(false);
                  setCommissionPercent("");
                  setCommissionBeneficiaryEmail("");
                  setCommissionerValid(undefined);
                  setCommissionerVerified(undefined);
                  setCommissionerError(null);
                  setCommissionWallet(null);
                }}
              >
                Quitar
              </button>
            </div>
            <input
              type="number"
              className="input w-full mb-2"
              value={commissionPercent}
              onChange={e => setCommissionPercent(e.target.value)}
              min={0}
              max={100}
              placeholder="Porcentaje de comisión"
            />
            <label className="block font-semibold mb-1">Email beneficiario comisión</label>
            <input
              type="email"
              className="input w-full"
              value={commissionBeneficiaryEmail}
              onChange={e => setCommissionBeneficiaryEmail(e.target.value)}
              onBlur={handleCommissionerBlur}
              required={!!commissionPercent}
            />
            {commissionerLoading && <div className="text-gray-500 text-sm">Buscando beneficiario...</div>}
            {commissionerValid && commissionerVerified && commissionWallet && !commissionerError && (
              <div className="text-green-700 text-sm mt-1">Wallet comisión: <b>{commissionWallet}</b></div>
            )}
            {commissionerValid && commissionerVerified && !commissionWallet && (
              <div className="text-red-600 text-sm mt-1">El beneficiario no tiene wallet configurada.</div>
            )}
            {commissionerError && <div className="text-red-600 text-sm mt-1">{commissionerError}</div>}
          </div>
        )}
      </div>
      {step && (
        <div className="my-4">
          <div className="font-bold mb-2">Progreso del pago:</div>
          <ol className="list-decimal ml-5 text-blue-700 space-y-1">
            <li className={step >= 1 ? "font-semibold" : ""}>
              Pago directo al vendedor {txHashes.direct && (<span className="text-xs text-gray-500">Tx: <a href={`https://sepolia.arbiscan.io/tx/${txHashes.direct}`} target="_blank" rel="noopener noreferrer">{txHashes.direct.slice(0, 10)}…</a></span>)}
            </li>
            <li className={step >= 2 ? "font-semibold" : ""}>
              Pago bajo custodia a la plataforma {txHashes.custody && (<span className="text-xs text-gray-500">Tx: <a href={`https://sepolia.arbiscan.io/tx/${txHashes.custody}`} target="_blank" rel="noopener noreferrer">{txHashes.custody.slice(0, 10)}…</a></span>)}
            </li>
            <li className={step >= 3 ? "font-semibold" : ""}>
              Notificación a la plataforma para crear custodia
            </li>
            <li className={step === 4 ? "font-semibold text-green-700" : ""}>
              ¡Pago completado!
            </li>
          </ol>
          {backendStatus && <div className="mt-2 text-blue-900">{backendStatus}</div>}
          {trackerUrl && <div className="mt-2"><a href={trackerUrl} className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">Rastrear pago</a></div>}
        </div>
      )}
      {error && <div className="text-red-600 font-bold mt-4">{error}</div>}
      <button
        type="submit"
        className="w-full mt-4 text-white rounded-2xl py-3 px-2 text-lg font-semibold shadow bg-blue-600 hover:bg-blue-700"
        disabled={loading}
      >
        Iniciar Pago Web3
      </button>
      </form>
    );
}
export default PagoFormFull2;