'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';

interface PaymentData {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_type?: string;
}

interface StatusCardData {
  title: string;
  count: number;
  amount: number;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function RevolutStatusCards() {
  const [paymentsData, setPaymentsData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[RevolutStatusCards] Starting data fetch...');
    // Use the EXACT same pattern as FintechDashboardCards
    authFetch('payments')
      .then(res => {
        console.log('[RevolutStatusCards] Response received:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[RevolutStatusCards] Raw payment data received:', data);
        // Handle both {payments: [...]} and direct array formats
        const payments = Array.isArray(data) ? data : (data.payments || []);
        console.log('[RevolutStatusCards] Processed payments array:', payments);
        console.log('[RevolutStatusCards] Sample payment:', payments[0]);
        
        if (Array.isArray(payments)) {
          setPaymentsData(payments);
        } else {
          console.error('[RevolutStatusCards] Invalid data format:', typeof data);
          throw new Error('Invalid data format');
        }
      })
      .catch(err => {
        console.error('[RevolutStatusCards] Error fetching payments:', err);
        setError('Error loading payment data');
      })
      .finally(() => {
        console.log('[RevolutStatusCards] Data fetch completed');
        setLoading(false);
      });
  }, []);

  // Calculate status-based metrics - Fixed mapping
  const getStatusMetrics = () => {
    console.log('[RevolutStatusCards] Calculating metrics from payments:', paymentsData.length);
    console.log('[RevolutStatusCards] Sample payment statuses:', paymentsData.slice(0, 5).map(p => p.status));
    
    // PENDIENTES: pending, requested, funded (waiting or in progress)
    const pendingPayments = paymentsData.filter(p => 
      ['pending', 'requested', 'funded'].includes(p.status)
    );
    
    // EN CUSTODIA: escrowed, active, disputes, pending_multisig_approval (all funds in custody/escrow)
    const custodyPayments = paymentsData.filter(p => 
      ['escrowed', 'active', 'in_dispute', 'disputed', 'pending_multisig_approval'].includes(p.status)
    );
    
    // FINALIZADOS: completed, cancelled, paid (finished states)
    const finalizedPayments = paymentsData.filter(p => 
      ['completed', 'cancelled', 'paid'].includes(p.status)
    );
    
    console.log('[RevolutStatusCards] Pending:', pendingPayments.length, 'Custody (includes disputes):', custodyPayments.length, 'Finalized:', finalizedPayments.length);

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const calculateTotal = (payments: PaymentData[]) => {
      return payments.reduce((sum, payment) => {
        // Ensure amount is a valid number
        const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
        return sum + (isNaN(amount) || amount == null ? 0 : amount);
      }, 0);
    };

    return {
      pending: {
        count: pendingPayments.length,
        amount: calculateTotal(pendingPayments),
        formatted: formatAmount(calculateTotal(pendingPayments))
      },
      custody: {
        count: custodyPayments.length,
        amount: calculateTotal(custodyPayments),
        formatted: formatAmount(calculateTotal(custodyPayments))
      },
      finalized: {
        count: finalizedPayments.length,
        amount: calculateTotal(finalizedPayments),
        formatted: formatAmount(calculateTotal(finalizedPayments))
      }
    };
  };

  const metrics = getStatusMetrics();

  const statusGroups = {
    pending: ['pending', 'requested', 'funded'],
    custody: ['escrowed', 'active', 'in_dispute', 'disputed'],
    finalized: ['completed', 'cancelled', 'paid'],
  };

  const buildUrl = (statuses: string[]) => {
    const params = new URLSearchParams();
    statuses.forEach(s => params.append('status', s));
    return `/dashboard/pagos?${params.toString()}`;
  };

  const statusCards: StatusCardData[] = [
    {
      title: 'PAGOS PENDIENTES',
      count: metrics.pending.count,
      amount: metrics.pending.amount,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100 hover:bg-amber-100',
      icon: '💰',
      description: metrics.pending.formatted,
      buttonText: 'Ver detalles →',
      onButtonClick: () => window.location.href = buildUrl(statusGroups.pending)
    },
    {
      title: 'EN CUSTODIA',
      count: metrics.custody.count,
      amount: metrics.custody.amount,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100 hover:bg-blue-100',
      icon: '🔒',
      description: metrics.custody.formatted,
      buttonText: 'Ver detalles →',
      onButtonClick: () => window.location.href = buildUrl(statusGroups.custody)
    },
    {
      title: 'FINALIZADOS',
      count: metrics.finalized.count,
      amount: metrics.finalized.amount,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-100 hover:bg-green-100',
      icon: '✅',
      description: metrics.finalized.formatted,
      buttonText: 'Ver detalles →',
      onButtonClick: () => window.location.href = buildUrl(statusGroups.finalized)
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div className="text-red-600 font-semibold">Error</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statusCards.map((card, index) => (
        <div
          key={index}
          className={`
            ${card.bgColor} 
            rounded-2xl border-2 p-6 
            transition-all duration-200 ease-in-out
            hover:shadow-lg hover:scale-[1.02] cursor-pointer
            group
          `}
          onClick={card.onButtonClick}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`text-sm font-bold ${card.color} tracking-wide`}>
              {card.title}
            </div>
            <div className="text-2xl">{card.icon}</div>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.count} {card.count === 1 ? 'pago' : 'pagos'}
            </div>
            <div className={`text-lg font-semibold ${card.color}`}>
              {card.description}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <div className={`
              text-sm font-medium ${card.color} 
              group-hover:underline transition-all duration-200
              flex items-center gap-1
            `}>
              {card.buttonText}
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
