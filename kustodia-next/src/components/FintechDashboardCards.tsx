"use client";
import React, { useEffect, useState } from 'react';
import { PAYMENT_STATUSES, CARD_ORDER, hasAutomationBadge } from '../config/paymentStatuses';

interface PaymentData {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

// SVG Icons for each status
const getStatusIcon = (statusKey: string) => {
  const iconProps = "w-6 h-6 fill-none stroke-current stroke-1.5";
  
  switch (statusKey) {
    case 'requested':
      return (
        <svg className={`${iconProps} text-indigo-500`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'pending':
      return (
        <svg className={`${iconProps} text-yellow-500`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'paid':
      return (
        <svg className={`${iconProps} text-emerald-500`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'completed':
      return (
        <svg className={`${iconProps} text-green-500`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 011.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      );
    case 'in_dispute':
      return (
        <svg className={`${iconProps} text-red-500`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'cancelled':
      return (
        <svg className={`${iconProps} text-gray-400`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    default:
      return (
        <svg className={`${iconProps} text-gray-400`} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default function FintechDashboardCards() {
  const [paymentsData, setPaymentsData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [automationActive, setAutomationActive] = useState(false);

  useEffect(() => {
    // Fetch payments data
    fetch('http://localhost:4000/api/payments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPaymentsData(data);
        } else {
          throw new Error('Invalid data format');
        }
      })
      .catch(err => {
        console.error('Error fetching payments:', err);
        setError('Error loading payment data');
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch automation status
    fetch('http://localhost:4000/api/automation/status')
      .then(res => res.json())
      .then(data => {
        setAutomationActive(data.success && data.status === 'running');
      })
      .catch(() => {
        setAutomationActive(false);
      });
  }, []);

  // Group payments by status and calculate totals
  const statusGroups = paymentsData.reduce((acc, payment) => {
    const status = payment.status;
    if (!acc[status]) {
      acc[status] = { count: 0, amount: 0 };
    }
    acc[status].count += 1;
    acc[status].amount += Number(payment.amount || 0);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  // Create cards in specified order
  const cards = CARD_ORDER.map(statusKey => {
    const config = PAYMENT_STATUSES[statusKey];
    const data = statusGroups[statusKey] || { count: 0, amount: 0 };
    
    return {
      ...config,
      count: data.count,
      amount: data.amount
    };
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`relative bg-white rounded-lg border-2 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 ${card.bgClass}`}
        >
          {/* Automation Badge */}
          {automationActive && hasAutomationBadge(card.key) && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-50 text-green-600 border border-green-200 font-medium">
                <span className="text-xs">🤖</span>
                Auto
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{card.spanish}</p>
              <p className="text-3xl font-bold text-gray-900">{card.count}</p>
              <p className="text-sm text-gray-500 mt-1">
                {card.amount.toLocaleString('es-MX', { 
                  style: 'currency', 
                  currency: 'MXN' 
                })}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              {getStatusIcon(card.key)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
