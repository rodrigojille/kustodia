import React from 'react';

interface UrgencyNoticeProps {
  className?: string;
  size?: 'sm' | 'md';
}

// Always use 'sm' for a compact, consistent look
export default function UrgencyNotice({ className = '', size = 'sm' }: UrgencyNoticeProps) {
  // Responsive and size-based styles
  const base =
    'flex flex-col sm:flex-col items-center justify-center px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-yellow-200 border border-yellow-400 text-yellow-900 font-bold shadow-md animate-pulse uppercase tracking-wide mx-auto';
  const sizeStyles = 'text-xs sm:text-base py-1 px-2 sm:py-1 sm:px-4';
  const iconSize = 'text-lg sm:text-2xl';
  const zeroSize = 'text-base sm:text-xl';
  const commissionSize = 'text-xs sm:text-base';

  return (
    <div className={`${base} ${sizeStyles} ${className} w-full max-w-md sm:max-w-screen-xl px-1 sm:px-6`} style={{ maxWidth: '100%' }}>
      <div className="flex items-center justify-center w-full gap-2 flex-wrap">
        <span role="img" aria-label="alert" className={`${iconSize}`}>🚨</span>
        <span className="text-center whitespace-pre-line leading-tight">
          <span className="block sm:inline">¡Oferta limitada! Solo los primeros 100 registrados tendrán</span>
          <span className="block sm:inline font-extrabold text-yellow-900 leading-tight"> 0% <span className={`font-bold text-yellow-900 ${commissionSize}`}>de comisión de por vida</span></span>
        </span>
      </div>
    </div>
  );
}
