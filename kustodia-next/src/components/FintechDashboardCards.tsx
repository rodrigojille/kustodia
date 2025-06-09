"use client";
import React, { useEffect, useState } from "react";
import { fetchPayments } from "../fetchPayments";

type Payment = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  payer_email?: string;
  recipient_email?: string;
  description?: string;
};

export default function FintechDashboardCards() {
  const [statusTotals, setStatusTotals] = useState<Record<string, number>>({});
  const [currency, setCurrency] = useState('MXN');

  // Map each payment status to a card config
  const STATUS_CARD_MAP: Record<string, { label: string; bg: string; icon: JSX.Element }> = {
    requested: {
      label: 'Pagos solicitados',
      bg: 'bg-blue-50 border-blue-200',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    },
    pending: {
      label: 'Pagos pendientes',
      bg: 'bg-yellow-50 border-yellow-200',
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    },
    funded: {
      label: 'Pagos fondeados',
      bg: 'bg-purple-50 border-purple-200',
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l3-3m-3 3l-3-3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    },
    in_dispute: {
      label: 'Pagos en disputa',
      bg: 'bg-red-50 border-red-200',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    },
    paid: {
      label: 'Pagos completados',
      bg: 'bg-green-50 border-green-200',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    },
    cancelled: {
      label: 'Pagos cancelados',
      bg: 'bg-gray-50 border-gray-200',
      icon: (
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    },
    refunded: {
      label: 'Pagos reembolsados',
      bg: 'bg-indigo-50 border-indigo-200',
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.418 2A8.001 8.001 0 104.582 9" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    }
    // Add more statuses as needed
  };

  useEffect(() => {
    fetchPayments().then((payments: Payment[]) => {
      const totals: Record<string, number> = {};
      let curr = '';
      payments.forEach((p: Payment) => {
        const amt = Number(p.amount) || 0;
        if (!curr && p.currency) curr = p.currency;
        if (!totals[p.status]) totals[p.status] = 0;
        totals[p.status] += amt;
      });
      setStatusTotals(totals);
      setCurrency(curr || 'MXN');
    });
  }, []);

  // Only show cards for statuses present in STATUS_CARD_MAP and present in data
  const cards = Object.entries(STATUS_CARD_MAP)
    .filter(([status]) => statusTotals[status] !== undefined)
    .map(([status, meta]) => ({
      ...meta,
      value: statusTotals[status] > 0 ? `${statusTotals[status].toLocaleString()} ${currency}` : '—'
    }));

  return (
    <section className="w-full flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8 xl:gap-12 mt-8 md:mt-14 w-full max-w-full mx-auto px-2 md:px-4 xl:px-0">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl shadow-lg p-5 md:p-8 border flex flex-col min-w-[220px] w-full transition-transform hover:scale-[1.03] ${card.bg || 'bg-white border-gray-200'}`}
          >
            <div className="flex flex-col items-center mb-2">
              {card.icon}
              <span className="text-base font-medium text-black mt-2 text-center">{card.label}</span>
            </div>
            <div className="text-2xl md:text-3xl text-black font-extrabold tracking-tight text-center">{card.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
