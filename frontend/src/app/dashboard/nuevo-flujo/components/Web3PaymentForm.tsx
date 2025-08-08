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
      const arbProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL);
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

    // Enhanced debugging logs
    console.log('🚀 [Web3Payment] Starting payment flow with data:', {
      recipient,
      amount,
      description,
      warrantyPercent,
      custodyDays,
      recipientWallet,
      currentUserWallet: currentUser?.wallet_address,
      balance
    });

    // 🔥 ANALYTICS: Track payment flow start
    formTracking.trackFormStart('web3_payment_form', 'web3_payment');
    paymentFlow.trackPaymentStep('start', {
      transaction_type: 'web3_payment',
      amount: parseFloat(amount || '0')
    });

    try {
      // Enhanced validation with detailed error messages
      if (!recipientWallet) {
        const errorMsg = "La wallet del destinatario no es válida. Verifica que el destinatario tenga una wallet configurada.";
        console.error('❌ [Web3Payment] Recipient wallet validation failed:', { recipient, recipientWallet });
        throw new Error(errorMsg);
      }
      
      const userBalance = parseFloat(balance || '0');
      const paymentAmount = parseFloat(amount);
      if (userBalance < paymentAmount) {
        const errorMsg = `Saldo MXNB insuficiente. Tienes ${userBalance} MXNB pero necesitas ${paymentAmount} MXNB.`;
        console.error('❌ [Web3Payment] Insufficient balance:', { userBalance, paymentAmount });
        throw new Error(errorMsg);
      }

      console.log('✅ [Web3Payment] Validation passed, initializing Portal SDK...');
      const portal = await getPortalInstance();
      if (!portal) {
        const errorMsg = "El SDK de Portal no está disponible. Asegúrate de estar en un navegador compatible.";
        console.error('❌ [Web3Payment] Portal SDK initialization failed');
        throw new Error(errorMsg);
      }
      
      console.log('✅ [Web3Payment] Portal SDK initialized successfully');
      
      // Verify wallet exists
      const walletExists = await portal.doesWalletExist();
      if (!walletExists) {
        const errorMsg = "No se encontró una wallet de Portal. Por favor, crea una wallet primero.";
        console.error('❌ [Web3Payment] Portal wallet does not exist');
        throw new Error(errorMsg);
      }
      
      console.log('✅ [Web3Payment] Portal wallet verified, proceeding with transactions...');

      // 1. Approve Tokens
      setStatusMessage('Aprobando tokens MXNB para el contrato de escrow...');
      const approvalAmount = ethers.parseUnits(amount, 18);
      
      console.log('💰 [Web3Payment] Preparing token approval:', {
        amount,
        approvalAmount: approvalAmount.toString(),
        escrowContract: ESCROW_CONTRACT_ADDRESS,
        mxnbContract: MXNB_CONTRACT_ADDRESS
      });
      
      const erc20Iface = new Interface(ERC20_ABI);
      const approveCalldata = erc20Iface.encodeFunctionData("approve", [ESCROW_CONTRACT_ADDRESS, approvalAmount]);
      
      console.log('📝 [Web3Payment] Sending approval transaction via backend Portal API...');
      
      // Use backend Portal API instead of problematic Web SDK
      const approvalResponse = await authFetch('/api/portal/send-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: MXNB_CONTRACT_ADDRESS!,
          data: approveCalldata,
          description: `Token approval for escrow payment: ${description}`
        })
      });
      
      if (!approvalResponse.ok) {
        const errorData = await approvalResponse.json();
        throw new Error(`Token approval failed: ${errorData.error || 'Unknown error'}`);
      }
      
      const approvalResult = await approvalResponse.json();
      const approvalTxHash = approvalResult.transactionHash;
      
      console.log('✅ [Web3Payment] Approval transaction sent:', {
        hash: approvalTxHash,
        to: MXNB_CONTRACT_ADDRESS,
        amount: approvalAmount.toString()
      });

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
      
      console.log('🔒 [Web3Payment] Preparing escrow creation:', {
        payer: currentUser.wallet_address,
        seller: recipientWallet,
        totalAmount: amount,
        custodyAmount,
        releaseAmount,
        custodyDays: custodyDaysInt,
        warrantyPercent,
        description
      });

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
      
      console.log('📝 [Web3Payment] Sending escrow creation transaction via backend Portal API...');
      
      // Use backend Portal Custodian API instead of problematic Web SDK
      const portalResponse = await authFetch('/api/portal/send-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: ESCROW_CONTRACT_ADDRESS!,
          data: escrowCalldata,
          description: `Escrow payment: ${description}`
        })
      });
      
      if (!portalResponse.ok) {
        const errorData = await portalResponse.json();
        throw new Error(`Portal transaction failed: ${errorData.error || 'Unknown error'}`);
      }
      
      const portalResult = await portalResponse.json();
      const escrowTxHash = portalResult.transactionHash;
      
      console.log('✅ [Web3Payment] Escrow transaction sent:', {
        hash: escrowTxHash,
        to: ESCROW_CONTRACT_ADDRESS,
        custodyAmount,
        releaseAmount
      });

      // 3. Notify Backend
      setStatusMessage('Actualizando registros del backend...');
      
      const backendPayload = {
        recipientEmail: recipient,
        amount,
        custodyDays,
        description,
        warrantyPercent,
        approvalTxHash,
        escrowTxHash
      };
      
      console.log('💾 [Web3Payment] Notifying backend with payload:', backendPayload);
      
      const response = await authFetch('/api/payments/initiate-web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [Web3Payment] Backend rejected payment:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.message || `El servidor rechazó la creación del pago Web3 (HTTP ${response.status}).`);
      }
      
      const result = await response.json();
      console.log('✅ [Web3Payment] Backend payment created successfully:', result);
      
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
      console.error('❌ [Web3Payment] Payment flow failed:', {
        error: err,
        message: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code,
        recipient,
        amount,
        currentUserWallet: currentUser?.wallet_address
      });
      
      // Enhanced error messages based on error type
      let userFriendlyMessage = err.message || 'Ocurrió un error inesperado.';
      
      if (err.message?.includes('insufficient funds')) {
        userFriendlyMessage = 'Fondos insuficientes para completar la transacción. Verifica tu saldo de ETH y MXNB.';
      } else if (err.message?.includes('user rejected')) {
        userFriendlyMessage = 'Transacción cancelada por el usuario.';
      } else if (err.message?.includes('network')) {
        userFriendlyMessage = 'Error de red. Verifica tu conexión a internet y vuelve a intentar.';
      } else if (err.message?.includes('Portal')) {
        userFriendlyMessage = 'Error con la wallet de Portal. Asegúrate de que tu wallet esté configurada correctamente.';
      }
      
      setError(userFriendlyMessage);
      setStatusMessage(null);
      
      // 🔥 ANALYTICS: Track payment failure
      formTracking.trackFormCompletion('web3_payment_form', false, [err.message]);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto" style={{ maxWidth: '600px', padding: '0 1rem' }}>
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Volver a seleccionar tipo de pago
      </button>

      <form onSubmit={handleSubmit} className="space-y-3 w-full bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 md:p-8 mx-auto">
        <h2 className="text-xl font-bold text-center mb-4 text-black">Crear pago Web3</h2>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="font-semibold text-blue-800">Tu Saldo: {balance ? `${parseFloat(balance).toFixed(2)} MXNB` : 'Cargando...'}</p>
        </div>

        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">{success}</div>}
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">{error}</div>}
        {statusMessage && <div className="bg-indigo-100 text-indigo-700 p-4 rounded-md animate-pulse">{statusMessage}</div>}

        <input
          type="email"
          className="input w-full text-black placeholder-black"
          placeholder="Correo del destinatario"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          onBlur={() => validateRecipient(recipient)}
          required
        />
        {recipientLoading && <div className="text-gray-500 text-sm">Validando...</div>}
        {recipientValid && recipientWallet && <div className="text-green-600 font-semibold text-sm">✅ Destinatario válido. Wallet: {`${recipientWallet.substring(0, 6)}...${recipientWallet.substring(recipientWallet.length - 4)}`}</div>}
        {recipientError && <div className="text-red-600 font-semibold text-sm">❌ {recipientError}</div>}

        <input type="number" className="input w-full text-black placeholder-black" placeholder="Monto (MXNB)" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" />
        <input type="text" className="input w-full text-black placeholder-black" placeholder="Descripción del pago" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="number" className="input w-full text-black placeholder-black" placeholder="% en garantía (0-100)" value={warrantyPercent} onChange={e => setWarrantyPercent(e.target.value)} required min="0" max="100" />
        <input type="number" className="input w-full text-black placeholder-black" placeholder="Días en custodia (mínimo 1)" value={custodyDays} onChange={e => setCustodyDays(e.target.value)} required min="1" />

        <button
          type="submit"
          className="btn btn-success w-full mt-4 text-white"
          disabled={loading || !recipientValid || !amount || !warrantyPercent || !custodyDays}
        >
          {loading ? 'Procesando...' : 'Crear pago Web3'}
        </button>
      </form>
    </div>
  );
}
