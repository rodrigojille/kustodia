"use client";
import { useState } from "react";

interface Payment {
  id: string;
  payer_email: string;
  recipient_email: string;
  payer_approval?: boolean;
  payee_approval?: boolean;
  payer_approval_timestamp?: string;
  payee_approval_timestamp?: string;
}

interface DualApprovalSystemProps {
  payment: Payment;
  currentUser: string | null;
  isPayee: boolean;
  isPayer: boolean;
  onApprovalChange: (type: 'payer' | 'payee', approved: boolean) => void;
}

export default function DualApprovalSystem({ 
  payment, 
  currentUser, 
  isPayee, 
  isPayer, 
  onApprovalChange 
}: DualApprovalSystemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprovalToggle = async (type: 'payer' | 'payee') => {
    setIsUpdating(true);
    try {
      const currentApproval = type === 'payer' ? payment.payer_approval : payment.payee_approval;
      await onApprovalChange(type, !currentApproval);
    } finally {
      setIsUpdating(false);
    }
  };

  const PayerApprovalCard = () => (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      payment.payer_approval 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
            payment.payer_approval 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {payment.payer_approval ? '✓' : '1'}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Confirmación del Pagador</h4>
            <p className="text-sm text-gray-600">
              Confirma que las condiciones han sido cumplidas
            </p>
            {payment.payer_approval && payment.payer_approval_timestamp && (
              <p className="text-xs text-green-600 mt-1">
                Confirmado el {new Date(payment.payer_approval_timestamp).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
        
        {isPayer && (
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={payment.payer_approval || false}
                onChange={() => handleApprovalToggle('payer')}
                disabled={isUpdating}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                payment.payer_approval ? 'bg-green-500' : 'bg-gray-300'
              } ${isUpdating ? 'opacity-50' : ''}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  payment.payer_approval ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {payment.payer_approval ? 'Aprobado' : 'Pendiente'}
              </span>
            </label>
          </div>
        )}
      </div>
      
      {isPayer && !payment.payer_approval && (
        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            ⚠️ Al marcar esta casilla confirmas que las condiciones de liberación han sido cumplidas por el beneficiario.
          </p>
        </div>
      )}
    </div>
  );

  const PayeeApprovalCard = () => (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      payment.payee_approval 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
            payment.payee_approval 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {payment.payee_approval ? '✓' : '2'}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Confirmación del Beneficiario</h4>
            <p className="text-sm text-gray-600">
              Confirma que ha cumplido todas las condiciones
            </p>
            {payment.payee_approval && payment.payee_approval_timestamp && (
              <p className="text-xs text-green-600 mt-1">
                Confirmado el {new Date(payment.payee_approval_timestamp).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
        
        {isPayee && (
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={payment.payee_approval || false}
                onChange={() => handleApprovalToggle('payee')}
                disabled={isUpdating}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                payment.payee_approval ? 'bg-green-500' : 'bg-gray-300'
              } ${isUpdating ? 'opacity-50' : ''}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  payment.payee_approval ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {payment.payee_approval ? 'Aprobado' : 'Pendiente'}
              </span>
            </label>
          </div>
        )}
      </div>
      
      {isPayee && !payment.payee_approval && (
        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            ⚠️ Al marcar esta casilla confirmas que has cumplido todas las condiciones acordadas para la liberación del pago.
          </p>
        </div>
      )}
    </div>
  );

  const bothApproved = payment.payer_approval && payment.payee_approval;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          ✅ Sistema de Aprobación Dual
        </h3>
        {bothApproved && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <span className="mr-2">🎉</span>
            ¡Ambas partes aprobaron!
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Para liberar los fondos de custodia, ambas partes deben confirmar que las condiciones han sido cumplidas.
      </p>

      <div className="space-y-4">
        <PayerApprovalCard />
        <PayeeApprovalCard />
      </div>

      {bothApproved && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚡</span>
            <div>
              <h4 className="font-semibold text-green-800">Auto-liberación activada</h4>
              <p className="text-green-700 text-sm mt-1">
                Ambas partes han confirmado el cumplimiento. Los fondos se liberarán automáticamente del contrato inteligente en custodia.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isPayer && !isPayee && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Nota:</span> Solo el pagador ({payment.payer_email}) y el beneficiario ({payment.recipient_email}) pueden aprobar la liberación del pago.
          </p>
        </div>
      )}

      {isUpdating && (
        <div className="mt-4 flex items-center justify-center p-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-sm text-gray-600">Actualizando aprobación...</span>
        </div>
      )}
    </div>
  );
}
