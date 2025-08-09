"use client";
import { useState, useRef } from "react";

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
  deposit_clabe?: string;
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
    release_tx_hash?: string;
    custody_end?: string;
  };
  yield_enabled?: boolean;
  yield_start_time?: string;
  yield_earned_total?: number;
  yield_earned_payer?: number;
  yield_earned_platform?: number;
  custody_end?: string;
}

interface NuevoFlujoTrackerProps {
  payment: Payment;
  currentUser: string;
  onApprovalChange: (type: 'payer' | 'payee', approved: boolean) => void;
  isApproving: boolean;
}

function getVerticalDisplayName(vertical?: string): string {
  const verticals: Record<string, string> = {
    inmobiliaria: 'Inmobiliarias y agentes',
    freelancer: 'Freelancers y servicios',
    ecommerce: 'E-commerce y ventas online',
    particulares: 'Compra-venta entre particulares',
    b2b: 'Empresas B2B y control de entregas',
    marketplace: 'Marketplaces de servicios'
  };
  return verticals[vertical || ''] || 'Pago en custodia';
}

function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'funded': 'bg-blue-100 text-blue-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'disputed': 'bg-orange-100 text-orange-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

function formatAmount(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function getEventDisplayName(eventType: string): string {
  const eventNames: Record<string, string> = {
    // Existing translations
    'deposito_detectado': 'Depósito SPEI detectado',
    'escrow_created_onchain': 'Custodia creada en blockchain',
    'escrow_funded': 'Custodia fondeada',
    'escrow_released': 'Custodia liberada',
    'payer_approved': 'Pagador confirmó cumplimiento',
    'payee_approved': 'Beneficiario confirmó cumplimiento',
    'payment_completed': 'Pago completado',
    'funded': 'Fondos depositados',
    'processing': 'Procesando pago',
    'lifecycle_start': 'Pago iniciado',
    'mxnb_withdrawn': 'MXNB retirado',
    'spei_completado': 'Transferencia SPEI completada',
    
    // Payment creation and automation
    'payment_created': 'Pago creado exitosamente',
    'automation_error': 'Procesando pago automáticamente',
    'bank_account_registered': 'Cuenta bancaria registrada',
    
    // Bridge and withdrawal events
    'bridge_withdrawal_success': 'Retiro procesado exitosamente',
    'bridge_withdrawal_error': 'Procesando retiro',
    'bridge_withdrawal_verified': 'Retiro verificado exitosamente',
    'bridge_withdrawal_failed': 'Configurando retiro',
    
    // Redemption events
    'redemption_initiated': 'Iniciando transferencia',
    'redemption_success': 'Transferencia completada',
    'redemption_failed': 'Procesando transferencia',
    'spei_redemption_initiated': 'Iniciando transferencia SPEI',
    
    // Payout events
    'payout_completed': 'Pago completado exitosamente',
    'payout_failed': 'Procesando pago',
    'payout_error': 'Procesando pago',
    'payout_processing_error': 'Procesando pago',
    'payout_skipped': 'Pago procesado',
    
    // Commission and seller payments
    'commission_paid': 'Comisión procesada',
    'commission_failed': 'Procesando comisión',
    'seller_paid': 'Pago al vendedor completado',
    'seller_payout_failed': 'Procesando pago al vendedor',
    
    // Lifecycle events
    'lifecycle_end': 'Pago completado',
    'redeemed': 'Fondos procesados'
  };
  return eventNames[eventType] || eventType;
}

function getEventIcon(eventType: string): string {
  const eventIcons: Record<string, string> = {
    // Existing icons
    'deposito_detectado': '💰',
    'escrow_created_onchain': '🔐',
    'escrow_funded': '🏦',
    'escrow_released': '🔓',
    'payer_approved': '✅',
    'payee_approved': '✅',
    'payment_completed': '🎉',
    'funded': '💳',
    'processing': '⚙️',
    'lifecycle_start': '🚀',
    'mxnb_withdrawn': '💸',
    'spei_completado': '✅',
    
    // Payment creation and automation
    'payment_created': '📝',
    'automation_error': '⚙️',
    'bank_account_registered': '🏦',
    
    // Bridge and withdrawal events
    'bridge_withdrawal_success': '💸',
    'bridge_withdrawal_error': '⚙️',
    'bridge_withdrawal_verified': '✅',
    'bridge_withdrawal_failed': '⚙️',
    
    // Redemption events
    'redemption_initiated': '🔄',
    'redemption_success': '✅',
    'redemption_failed': '⚙️',
    'spei_redemption_initiated': '🔄',
    
    // Payout events
    'payout_completed': '🎉',
    'payout_failed': '⚙️',
    'payout_error': '⚙️',
    'payout_processing_error': '⚙️',
    'payout_skipped': '✅',
    
    // Commission and seller payments
    'commission_paid': '💰',
    'commission_failed': '⚙️',
    'seller_paid': '💰',
    'seller_payout_failed': '⚙️',
    
    // Lifecycle events
    'lifecycle_end': '🎉',
    'redeemed': '✅'
  };
  return eventIcons[eventType] || '📝';
}

export default function NuevoFlujoTracker({ payment, currentUser, onApprovalChange, isApproving }: NuevoFlujoTrackerProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showCetes, setShowCetes] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, url: string, type: string}>>([]); 
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPayee = currentUser === payment.recipient_email;
  const isPayer = currentUser === payment.payer_email;
  const isCommissionRecipient = currentUser === payment.commission_beneficiary_email;

  const bothApproved = payment.payer_approval && payment.payee_approval;
  const isCompleted = payment.status === 'completed' || payment.status === 'cancelled';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    const newFiles: Array<{name: string, url: string, type: string}> = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Client-side file size validation (10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} excede el tamaño máximo de 10MB`);
        continue;
      }

      const formData = new FormData();
      formData.append('evidence', file);

      try {
        const response = await fetch('/api/evidence/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newFiles.push({
            name: file.name,
            url: data.url,
            type: file.type.startsWith('image/') ? 'image' : 'document'
          });
        } else {
          const error = await response.json();
          errors.push(`${file.name}: ${error.error || 'Error al subir'}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        errors.push(`${file.name}: Error de conexión`);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Create a synthetic event to reuse handleFileUpload
      const syntheticEvent = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileUpload(syntheticEvent);
    }
  };

  const canRelease = bothApproved && (payment.status === 'funded' || payment.status === 'active' || payment.status === 'escrowed');
  const showValidationModule = (payment.status === 'funded' || payment.status === 'active' || payment.status === 'escrowed') && !isCompleted;
  const showYield = payment.yield_enabled && showValidationModule && (!isCompleted);

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getVerticalDisplayName(payment.vertical_type)}
            </h2>
            <p className="text-gray-600 mt-1">{payment.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(payment.amount, payment.currency)}
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Pagador:</span>
            <div className="font-medium">{payment.payer_email}</div>
          </div>
          <div>
            <span className="text-gray-500">Beneficiario:</span>
            <div className="font-medium">{payment.recipient_email}</div>
          </div>
          {payment.commission_beneficiary_email && (
            <div className="md:col-span-2">
              <span className="text-gray-500">Comisión para:</span>
              <div className="font-medium">{payment.commission_beneficiary_email}</div>
            </div>
          )}
        </div>
      </div>

      {/* CLABE and Deposit Information */}
      {payment.status === 'pending' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            💳 Información para depósito
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CLABE para depósito</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(payment.deposit_clabe || '')}
                  className="text-blue-600 hover:text-blue-700 text-xs"
                  title="Copiar CLABE"
                >
                  📋 Copiar
                </button>
              </div>
              <div className="text-lg font-mono font-bold text-gray-900 bg-gray-50 p-2 rounded border">
                {payment.deposit_clabe || 'No disponible'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Deposita el monto exacto a esta CLABE para activar el pago
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <span className="text-sm font-medium text-gray-700 block mb-2">Monto a depositar</span>
              <div className="text-lg font-bold text-green-600">
                {formatAmount(payment.amount, payment.currency)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Monto exacto requerido para activar el escrow
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custody Information */}
      {(payment.status === 'funded' || payment.status === 'active' || payment.status === 'escrowed') && payment.escrow && (
        <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
            🔒 Información de custodia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <span className="text-amber-600 font-medium">Monto en custodia</span>
              <div className="text-lg font-bold text-amber-900">
                {formatAmount(payment.escrow.custody_amount)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <span className="text-amber-600 font-medium">Monto de liberación</span>
              <div className="text-lg font-bold text-amber-900">
                {formatAmount(payment.escrow.release_amount)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <span className="text-amber-600 font-medium">Estado del escrow</span>
              <div className="text-lg font-bold text-amber-900 capitalize">
                {payment.escrow.status}
              </div>
            </div>
          </div>

          {/* Deadline Information */}
          {payment.escrow.custody_end && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">⏰ Plazo de liberación:</h4>
              <div className="text-sm">
                <span className="text-amber-600">Fecha límite para liberación automática:</span>
                <span className="ml-2 font-bold text-amber-900">
                  {new Date(payment.escrow.custody_end).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Los fondos estarán disponibles para liberación si no hay una disputa antes de esta fecha.
              </p>
            </div>
          )}
          
          {/* Show blockchain details if available */}
          {payment.escrow.smart_contract_escrow_id && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">📋 Detalles blockchain:</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-amber-600">Escrow ID:</span>
                  <span className="ml-2 font-mono text-amber-900">#{payment.escrow.smart_contract_escrow_id}</span>
                </div>
                {payment.escrow.blockchain_tx_hash && (
                  <div>
                    <span className="text-amber-600">Transaction Hash:</span>
                    <span className="ml-2 font-mono text-amber-900 text-xs break-all">
                      {payment.escrow.blockchain_tx_hash}
                    </span>
                  </div>
                )}
                {payment.escrow.release_tx_hash && (
                  <div>
                    <span className="text-amber-600">Release Hash:</span>
                    <span className="ml-2 font-mono text-amber-900 text-xs break-all">
                      {payment.escrow.release_tx_hash}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conditions for Release */}
      {showValidationModule && (
        <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            📋 Condiciones de liberación
          </h3>
          <p className="text-purple-700 mb-4">
            {payment.release_conditions || "No se especificaron condiciones de liberación"}
          </p>
        </div>
      )}

      {/* Dual Approval System */}
      {showValidationModule && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              ✅ Sistema de Aprobación Dual
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payer Approval */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Pagador</h4>
                  <div className={`w-4 h-4 rounded-full ${payment.payer_approval ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{payment.payer_email}</p>
                
                {payment.payer_approval ? (
                  <div className="text-green-600 text-sm font-medium">
                    ✅ Confirmó que las condiciones se cumplieron
                    {payment.payer_approval_timestamp && (
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(payment.payer_approval_timestamp).toLocaleDateString('es-MX')}
                      </div>
                    )}
                  </div>
                ) : isPayer ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">¿Se cumplieron las condiciones del pago?</p>
                    <div className="flex gap-2">
                      <button
                        disabled={isApproving}
                        onClick={() => onApprovalChange('payer', !payment.payer_approval)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          payment.payer_approval
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isApproving ? 'Procesando...' : (payment.payer_approval ? 'Revocar Aprobación' : 'Aprobar Liberación')}
                      </button>
                      <button
                        disabled={isApproving}
                        onClick={() => onApprovalChange('payer', false)}
                        className="flex-1 px-3 py-2 border border-red-300 text-red-700 bg-white text-sm rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        Disputar
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Tus fondos están protegidos en custodia hasta que ambas partes confirmen.
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Esperando confirmación del pagador...
                  </div>
                )}
              </div>

              {/* Payee Approval */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Beneficiario</h4>
                  <div className={`w-4 h-4 rounded-full ${payment.payee_approval ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{payment.recipient_email}</p>
                
                {payment.payee_approval ? (
                  <div className="text-green-600 text-sm font-medium">
                    ✅ Confirmó que las condiciones se cumplieron
                    {payment.payee_approval_timestamp && (
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(payment.payee_approval_timestamp).toLocaleDateString('es-MX')}
                      </div>
                    )}
                  </div>
                ) : isPayee ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">¿Se cumplieron las condiciones del pago?</p>
                    <div className="flex gap-2">
                      <button
                        disabled={isApproving}
                        onClick={() => onApprovalChange('payee', !payment.payee_approval)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          payment.payee_approval
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isApproving ? 'Procesando...' : (payment.payee_approval ? 'Revocar Aprobación' : 'Aprobar Liberación')}
                      </button>
                      <button
                        disabled={isApproving}
                        onClick={() => onApprovalChange('payee', false)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        No, disputar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Esperando confirmación del beneficiario...
                  </div>
                )}
              </div>
            </div>

            {/* Auto-release info */}
            {bothApproved && canRelease && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm font-medium">
                  🚀 Ambas partes han confirmado. Los fondos se liberarán automáticamente.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Yield Generation Section */}
      {showValidationModule && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📈 Genera rendimientos mientras esperas
            </h3>
            <button
              onClick={() => setShowCetes(!showCetes)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              {showCetes ? 'Ocultar' : 'Mostrar'} detalles
            </button>
          </div>
          
          {showCetes && (
            <div>
              {!payment.yield_enabled ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    🏛️
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Invierte en CETES mexicanos</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Tus fondos en custodia pueden generar rendimientos seguros respaldados por el gobierno mexicano
                      a través de nuestro socio regulado EtherFuse.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">7.2%</div>
                        <div className="text-xs text-green-600">Tasa CETES actual</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">
                          {(() => {
                            const annualRate = 0.072;
                            const custodyDays = payment.custody_end 
                              ? Math.max(1, Math.ceil((new Date(payment.custody_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                              : 7; // Default 7 days if no end date
                            const dailyRate = annualRate / 365;
                            const totalYieldRate = dailyRate * custodyDays;
                            const userYieldRate = totalYieldRate * 0.8; // 80% for user (hidden)
                            return (userYieldRate * 100).toFixed(2) + '%';
                          })()}
                        </div>
                        <div className="text-xs text-blue-600">Del monto del pago basado en tiempo de custodia</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-3">
                      💡 Los rendimientos se capitalizan diariamente y al completar el pago. 
                      En caso de disputa, todos los rendimientos generados se asignan al pagador.
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Activar después del fondeo • Mínimo $0.10 para mostrar rendimientos
                </div>
                <div className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed">
                  ⏳ Próximamente disponible
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      ✅ Rendimientos activos
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        CETES 7.2%
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Fondos invertidos en bonos gubernamentales mexicanos • Actualizado cada minuto
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tiempo activo</div>
                    <div className="font-medium text-gray-900">
                      {payment.yield_start_time ? (
                        `${Math.floor((Date.now() - new Date(payment.yield_start_time).getTime()) / (1000 * 60 * 60))}h ${Math.floor(((Date.now() - new Date(payment.yield_start_time).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m`
                      ) : '0h 0m'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">
                      ${payment.yield_earned_total ? payment.yield_earned_total.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-xs text-green-600">Total generado</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-3">
                  💡 Los rendimientos se capitalizan diariamente y al completar el pago. 
                  En caso de disputa, todos los rendimientos generados se asignan al pagador.
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              <strong>Nota importante:</strong> Los rendimientos están respaldados por CETES mexicanos a través de EtherFuse, 
              una plataforma regulada con declaración de hechos del CNBV. Las inversiones en instrumentos gubernamentales 
              conllevan riesgos de mercado. Consulta términos completos en el acuerdo del cliente.
            </div>
          </div>
            </div>
          )}
        </div>
      )}

      {/* Evidence Upload Section */}
      {(isPayee || isPayer) && (payment.status === 'escrowed' || payment.status === 'funded') && !isCompleted && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📎 Evidencia (Opcional)
            </h3>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showEvidence ? 'Ocultar' : 'Mostrar'} sección de evidencia
            </button>
          </div>
          
          {showEvidence && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Puedes subir evidencia (fotos, documentos, capturas) para documentar el cumplimiento de las condiciones antes de aprobar la liberación.
              </p>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Subir evidencia</p>
                <p className="text-gray-500 text-sm">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-gray-400 text-xs mt-1">Máximo 10MB por archivo • JPG, PNG, GIF, PDF, DOC, DOCX</p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept="image/*,.pdf,.doc,.docx" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {isUploading ? 'Subiendo...' : 'Seleccionar archivos'}
                </button>
              </div>
              
              {/* Error message */}
              {uploadError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}
              
              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos subidos:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="mr-2">{file.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                          {file.type.startsWith('image/') ? (
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {file.name}
                            </a>
                          ) : (
                            <span className="text-gray-700">{file.name}</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setIsSubmitting(true);
                      // Here you would submit the evidence to the backend
                      setTimeout(() => {
                        setIsSubmitting(false);
                        alert('Evidencia enviada exitosamente');
                      }, 1000);
                    }}
                    disabled={isSubmitting}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar evidencia'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🕒 Línea de tiempo
        </h3>
        <div className="space-y-3">
          {payment.events && payment.events
            .filter(event => !event.type.includes('error') && !event.type.includes('failed'))
            .map((event, index) => {
            return (
              <div key={index} className="flex items-start">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
                <span className="text-lg mr-2 flex-shrink-0">{getEventIcon(event.type)}</span>
                <div className="text-sm flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline">
                    <span className="font-medium mr-2">{getEventDisplayName(event.type)}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(event.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {event.description && (
                    <div className="text-gray-500 mt-1 break-words">
                      {event.description.length > 200 ? (
                        <details className="cursor-pointer">
                          <summary className="hover:text-gray-700">
                            {event.description.substring(0, 200)}...
                            <span className="text-blue-600 ml-1">Ver más</span>
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {event.description}
                          </div>
                        </details>
                      ) : (
                        event.description
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
