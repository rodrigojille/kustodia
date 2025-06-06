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
  const [pending, setPending] = useState(0);
  const [dispute, setDispute] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [requested, setRequested] = useState(0);
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    fetchPayments().then((payments: Payment[]) => {
      let pend = 0, disp = 0, comp = 0, req = 0, curr = '';
      payments.forEach((p: Payment) => {
        const amt = Number(p.amount) || 0;
        if (!curr && p.currency) curr = p.currency;
        if (p.status === 'requested') req += amt;
        if (['pending'].includes(p.status)) pend += amt;
        else if (['funded'].includes(p.status)) disp += amt;
        else if (['paid'].includes(p.status)) comp += amt;
      });
      setPending(pend);
      setRequested(req);
      setDispute(disp);
      setCompleted(comp);
      setCurrency(curr || 'MXN');
    });
  }, []);

  const cards = [
    {
      label: "Pagos solicitados",
      value: requested > 0 ? `${requested.toLocaleString()} ${currency}` : '—',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      bg: "bg-blue-50 border-blue-200"
    },
    {
      label: "Pagos pendientes",
      value: pending > 0 ? `${pending.toLocaleString()} ${currency}` : '—',
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      bg: "bg-yellow-50 border-yellow-200"
    },
    {
      label: "Pagos en disputa",
      value: dispute > 0 ? `${dispute.toLocaleString()} ${currency}` : '—',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      bg: "bg-red-50 border-red-200"
    },
    {
      label: "Pagos completados",
      value: completed > 0 ? `${completed.toLocaleString()} ${currency}` : '—',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      bg: "bg-green-50 border-green-200"
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-8 w-full">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl shadow-lg p-5 border flex flex-col min-w-[180px] sm:min-w-0 transition-transform hover:scale-[1.025] ${card.bg || 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center mb-2">
            {card.icon}
            <span className="text-base font-medium text-black ml-2">{card.label}</span>
          </div>
          <div className="text-2xl md:text-3xl text-black font-extrabold tracking-tight">{card.value}</div>
        </div>
      ))}
    </section>
  );
}
