"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ethers, Interface, ZeroAddress } from 'ethers';
import { authFetch } from '@/utils/authFetch';
import ERC20_ABI from '@/abis/ERC20.json';
import { getPortalInstance } from '@/utils/portalInstance';
import useAnalytics from '@/hooks/useAnalytics';

interface Web3PaymentFormProps {
  onBack: () => void;
}

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS;
const MXNB_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS;

export default function Web3PaymentForm({ onBack }: Web3PaymentFormProps) {
  // Analytics integration
  const { paymentFlow, formTracking } = useAnalytics();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [warrantyPercent, setWarrantyPercent] = useState("");
  const [custodyDays, setCustodyDays] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [recipientValid, setRecipientValid] = useState<boolean | undefined>(undefined);
  const [recipientWallet, setRecipientWallet] = useState<string | null>(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authFetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const checkBalance = useCallback(async (user: any) => {
    if (!user || !user.wallet_address) return;
    try {
      const arbProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL);
      const mxnb = new ethers.Contract(MXNB_CONTRACT_ADDRESS!, ERC20_ABI, arbProvider);
      const bal = await mxnb.balanceOf(user.wallet_address);
      const decimals = await mxnb.decimals();
      setBalance(ethers.formatUnits(bal, decimals));
    } catch (e) {
      console.error('Error checking balance:', e);
      setError('Error al cargar saldo MXNB.');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      checkBalance(currentUser);
    }
  }, [currentUser, checkBalance]);

  const validateRecipient = async (email: string) => {
    setRecipientLoading(true);
    setRecipientError(null);
    setRecipientValid(undefined);
    setRecipientWallet(null);
    try {
      const res = await authFetch('/api/users/verify-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, checkWallet: true })
      });
      const data = await res.json();
      setRecipientValid(data.exists && data.verified && data.wallet_address);
      setRecipientWallet(data.wallet_address || null);
      if (!data.exists) setRecipientError('El destinatario no está registrado.');
      else if (!data.verified) setRecipientError('El destinatario no ha verificado su correo.');
      else if (!data.wallet_address) setRecipientError('El destinatario no tiene una wallet configurada.');
      else setRecipientError(null);
    } catch {
      setRecipientError('Error validando destinatario.');
    }
    setRecipientLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    setStatusMessage('Iniciando proceso de pago Web3...');

    // 🔥 ANALYTICS: Track payment flow start
    formTracking.trackFormStart('web3_payment_form', 'web3_payment');
    paymentFlow.trackPaymentStep('start', {
      transaction_type: 'web3_payment',
      amount: parseFloat(amount || '0')
    });

    try {
      if (!recipientWallet) throw new Error("La wallet del destinatario no es válida.");
      if (parseFloat(balance || '0') < parseFloat(amount)) throw new Error('Saldo MXNB insuficiente.');

      const portal = await getPortalInstance();
      if (!portal) throw new Error("El SDK de Portal no está disponible.");

      // 1. Approve Tokens
      setStatusMessage('Aprobando tokens MXNB para el contrato de escrow...');
      const approvalAmount = ethers.parseUnits(amount, 18);
      const erc20Iface = new Interface(ERC20_ABI);
      const approveCalldata = erc20Iface.encodeFunctionData("approve", [ESCROW_CONTRACT_ADDRESS, approvalAmount]);
      
      const approveTx = await portal.ethSendTransaction({
        to: MXNB_CONTRACT_ADDRESS!,
        data: approveCalldata,
        chainId: 'eip155:421614',
      });
      const approvalTxHash = approveTx.hash;

      // 🔥 ANALYTICS: Track payment method selection
      paymentFlow.trackPaymentStep('payment_method', {
        method: 'crypto',
        transaction_type: 'web3_payment',
        amount: parseFloat(amount || '0')
      });

      // 2. Create Escrow
      setStatusMessage('Creando el escrow en la blockchain...');
      const custodyAmount = (parseFloat(amount) * parseFloat(warrantyPercent)) / 100;
      const releaseAmount = parseFloat(amount) - custodyAmount;
      const custodyDaysInt = parseInt(custodyDays);

      // 🔥 ANALYTICS: Track custody settings
      paymentFlow.trackPaymentStep('custody_settings', {
        percentage: parseFloat(warrantyPercent || '0'),
        timeline: `${custodyDaysInt} days`,
        transaction_type: 'web3_payment'
      });

      const escrowInterface = new Interface(["function createEscrow(address payer, address seller, uint256 amount, uint256 custodyAmount, uint256 custodyPeriod, uint256 releaseAmount, address token, string memory description) returns (uint256)"]);
      const escrowCalldata = escrowInterface.encodeFunctionData('createEscrow', [
        currentUser.wallet_address,
        recipientWallet,
        ethers.parseUnits(amount.toString(), 18),
        ethers.parseUnits(custodyAmount.toString(), 18),
        custodyDaysInt,
        ethers.parseUnits(releaseAmount.toString(), 18),
        MXNB_CONTRACT_ADDRESS!,
        description
      ]);

      const escrowTx = await portal.ethSendTransaction({
        to: ESCROW_CONTRACT_ADDRESS!,
        data: escrowCalldata,
        chainId: 'eip155:421614',
      });
      const escrowTxHash = escrowTx.hash;

      // 3. Notify Backend
      setStatusMessage('Actualizando registros del backend...');
      const response = await authFetch('/api/payments/initiate-web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient,
          amount,
          custodyDays,
          description,
          warrantyPercent,
          approvalTxHash,
          escrowTxHash
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'El servidor rechazó la creación del pago Web3.');
      }
      const result = await response.json();
      setSuccess(`¡Pago Web3 creado con éxito! ID del pago: ${result.payment.id}`);
      setStatusMessage(null);

      // 🔥 ANALYTICS: Track successful payment completion
      paymentFlow.trackPaymentStep('completion', {
        amount: parseFloat(amount || '0'),
        method: 'crypto',
        transaction_type: 'web3_payment',
        percentage: parseFloat(warrantyPercent || '0')
      });
      
      formTracking.trackFormCompletion('web3_payment_form', true);

    } catch (err: any) {
      console.error('Error during Web3 payment flow:', err);
      setError(err.message || 'Ocurrió un error inesperado.');
      setStatusMessage(null);
      
      // 🔥 ANALYTICS: Track payment failure
      formTracking.trackFormCompletion('web3_payment_form', false, [err.message]);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Volver a seleccionar tipo de pago
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 w-full bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">Crear Pago Web3 (Wallet-to-Wallet)</h2>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="font-semibold text-blue-800">Tu Saldo: {balance ? `${parseFloat(balance).toFixed(2)} MXNB` : 'Cargando...'}</p>
        </div>

        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">{success}</div>}
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">{error}</div>}
        {statusMessage && <div className="bg-indigo-100 text-indigo-700 p-4 rounded-md animate-pulse">{statusMessage}</div>}

        <input
          type="email"
          className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Correo del destinatario"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          onBlur={() => validateRecipient(recipient)}
          required
        />
        {recipientLoading && <div className="text-gray-500 text-sm">Validando...</div>}
        {recipientValid && recipientWallet && <div className="text-green-600 font-semibold text-sm">✅ Destinatario válido. Wallet: {`${recipientWallet.substring(0, 6)}...${recipientWallet.substring(recipientWallet.length - 4)}`}</div>}
        {recipientError && <div className="text-red-600 font-semibold text-sm">❌ {recipientError}</div>}

        <input type="number" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Monto (MXNB)" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" />
        <input type="text" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Descripción del pago" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="number" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="% en garantía (0-100)" value={warrantyPercent} onChange={e => setWarrantyPercent(e.target.value)} required min="0" max="100" />
        <input type="number" className="input w-full text-black placeholder-gray-500 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Días en custodia (mínimo 1)" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} required min="1" />

        <button
          type="submit"
          className={`w-full mt-6 text-white rounded-lg py-3 px-4 text-lg font-semibold shadow-md transition-all ${!loading && recipientValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={loading || !recipientValid || !amount || !warrantyPercent || !custodyDays}
        >
          {loading ? 'Procesando...' : 'Crear y Enviar Pago Web3'}
        </button>
      </form>
    </div>
  );
}
