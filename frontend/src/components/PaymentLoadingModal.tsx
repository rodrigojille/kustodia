'use client';
import React from 'react';

interface PaymentLoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function PaymentLoadingModal({ isOpen, message = "Creando tu pago..." }: PaymentLoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white bg-opacity-95" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Loading spinner */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
        
        {/* Message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-gray-600 mb-6">
          Estamos procesando tu solicitud. Esto puede tomar unos segundos...
        </p>
        
        {/* Progress steps */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
              </svg>
            </div>
            Validando información
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            Creando pago seguro
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
            Generando instrucciones
          </div>
        </div>
        
        {/* Note */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Tu pago estará protegido hasta que se cumplan las condiciones acordadas
          </p>
        </div>
      </div>
    </div>
  );
}
