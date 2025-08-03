"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NuevoFlujoTracker from "@/components/NuevoFlujoTracker";
import WalletPaymentTracker from "@/components/WalletPaymentTracker";
import { authFetch } from "@/utils/authFetch";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  recipient_email: string;
  payer_email: string;
  status: string;
  payment_type?: string;
  vertical_type?: string;
  release_conditions?: string;
  commission_beneficiary_email?: string;
  payer_approval?: boolean;
  payee_approval?: boolean;
  payer_approval_timestamp?: string;
  payee_approval_timestamp?: string;
  created_at: string;
  updated_at: string;
  events?: Array<{
    type: string;
    description?: string;
    created_at: string;
  }>;
  escrow?: {
    custody_amount: number;
    custody_percent: number;
    release_amount: number;
    status: string;
    smart_contract_escrow_id?: string;
    blockchain_tx_hash?: string;
    custody_end?: string;
  };
}

export default function NuevoFlujoTrackerPage({ params }: { params: { id: string } }) {
  const paymentId = params.id;
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authFetch('users/me');
        if (response.ok) {
          const userData = await response.json();
          // Try different possible email properties
          const userEmail = userData.email || userData.user_email || userData.username || userData.user?.email;
          setCurrentUser(userEmail);
        } else {
          console.error('Failed to fetch current user:', response.status);
          // Fallback to localStorage if API fails
          const userEmail = localStorage.getItem("userEmail");
          setCurrentUser(userEmail);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Fallback to localStorage if API fails
        const userEmail = localStorage.getItem("userEmail");
        setCurrentUser(userEmail);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch payment details
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`payments/${paymentId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error loading payment');
        }

        const paymentData = data.payment || data;
        

        // For this page, we only handle 'nuevo_flujo' and 'cobro_inteligente' types.
        // The traditional tracker is at a different route.
        if (paymentData.payment_type !== 'nuevo_flujo' && paymentData.payment_type !== 'cobro_inteligente') {
          // Redirect to the traditional tracker page if it's not a supported type
          router.push(`/pagos/${paymentId}`);
          return;
        }

        setPayment(paymentData);
      } catch (err) {
        console.error('Error fetching payment:', err);
        setError(err instanceof Error ? err.message : 'Error loading payment');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId, router]);

  // Handle approval changes
  const handleApprovalChange = async (type: 'payer' | 'payee', approved: boolean, txHash?: string) => {
    if (!payment || !currentUser) return;

    setIsApproving(true);
    try {
      const response = await authFetch(`payments/${paymentId}/approve/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_hash: txHash // Include txHash if it exists
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating approval');
      }

      const result = await response.json();
      console.log('Approval response:', result);
      
      // Refresh payment data from server to get latest state
      const refreshResponse = await authFetch(`payments/${paymentId}`);
      const refreshData = await refreshResponse.json();
      const refreshedPayment = refreshData.payment || refreshData;
      
      setPayment(refreshedPayment);

      // Check if both approvals are now true - backend handles auto-release
      if (refreshedPayment.payer_approval && refreshedPayment.payee_approval) {
        // Show success message - backend already triggered release
        alert('¡Ambas partes han aprobado! El pago se está procesando automáticamente.');
      }

    } catch (err) {
      console.error('Error updating approval:', err);
      alert('Error updating approval: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  // Handle auto-release when both parties approve
  const handleAutoRelease = async () => {
    if (!payment) return;

    try {
      const response = await authFetch(`payments/${paymentId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          release_type: 'auto',
          reason: 'Both parties confirmed conditions are met'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error releasing payment');
      }

      const releasedPayment = await response.json();
      setPayment(releasedPayment.payment || releasedPayment);
      
      // Show success notification
      alert('¡Pago liberado exitosamente! Los fondos han sido transferidos.');

    } catch (err) {
      console.error('Error releasing payment:', err);
      alert('Error releasing payment: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando seguimiento del pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/pagos')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a pagos
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold mb-2">Pago no encontrado</h2>
          <p className="text-yellow-600">No se pudo encontrar el pago solicitado.</p>
          <button 
            onClick={() => router.push('/dashboard/pagos')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Volver a pagos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/dashboard/pagos')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Volver a pagos
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Seguimiento de Pago #{payment.id}
        </h1>
        <p className="text-gray-600 mt-1">
          Sistema de liberación por aprobación dual
        </p>
      </div>

      {currentUser && payment.payment_type === 'web3' && (
        <WalletPaymentTracker 
          payment={payment}
          currentUser={currentUser}
          onApprovalChange={handleApprovalChange}
          isApproving={isApproving}
        />
      )}

      {currentUser && (payment.payment_type === 'nuevo_flujo' || payment.payment_type === 'cobro_inteligente') && (
        <NuevoFlujoTracker 
          payment={payment}
          currentUser={currentUser}
          onApprovalChange={handleApprovalChange}
          isApproving={isApproving}
        />
      )}
    </div>
  );
}
