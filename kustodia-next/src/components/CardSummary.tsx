import React from 'react';

interface CardSummaryProps {
  title: string;
  amount: React.ReactNode;
  icon: React.ReactNode;
  accentColor?: string;
}

const CardSummary: React.FC<CardSummaryProps> = ({ title, amount, icon, accentColor }) => {
  return (
    <div
      className="flex items-center gap-4 bg-white rounded-xl shadow-md border-l-4 p-5 hover:shadow-lg transition group min-w-[220px] max-w-xs"
      style={{ borderColor: accentColor }}
    >
      <div className="flex-shrink-0 bg-blue-50 rounded-lg p-2 group-hover:bg-blue-100 transition">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-black mb-1 uppercase tracking-wide">{title}</div>
        <div className="text-2xl font-bold" style={{ color: accentColor }}>{amount}</div>
      </div>
    </div>
  );
};

export default CardSummary;
