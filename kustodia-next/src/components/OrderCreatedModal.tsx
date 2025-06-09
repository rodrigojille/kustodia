import React from "react";

export default function OrderCreatedModal({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center gap-4 min-w-[280px]">
        <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <h2 className="text-lg font-bold text-gray-900">¡Orden de pago creada!</h2>
        <p className="text-gray-600 text-center">Estamos generando tus instrucciones y QR.<br />Por favor espera unos segundos…</p>
        <div className="loader mt-2" />
      </div>
      <style jsx>{`
        .loader {
          border: 4px solid #e3eafd;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
