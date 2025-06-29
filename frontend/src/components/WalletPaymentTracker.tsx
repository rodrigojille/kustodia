"use client";
"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { signContractInteraction } from "../utils/portalWallet";

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
    custody_end?: string;
  };
  yield_enabled?: boolean;
  yield_start_time?: string;
  yield_earned_total?: number;
  yield_earned_payer?: number;
  yield_earned_platform?: number;
  custody_end?: string;

  // New fields for Web3 Payment
  recipient_wallet?: string;
  custody_amount?: number;
  custody_days?: number;
  user_commission_beneficiary?: string;
  user_commission_amount?: number;
  platform_commission_beneficiary?: string;
  platform_commission_amount?: number;
  contract?: {
    address: string;
  };
}

interface WalletPaymentTrackerProps {
  payment: Payment;
  currentUser: string;
  onApprovalChange: (type: 'payer' | 'payee', approved: boolean, txHash?: string) => void;
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
    'spei_completado': 'Transferencia SPEI completada'
  };
  return eventNames[eventType] || eventType;
}

function getEventIcon(eventType: string): string {
  const eventIcons: Record<string, string> = {
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
    'spei_completado': '✅'
  };
  return eventIcons[eventType] || '📝';
}

export default function WalletPaymentTracker({ payment, currentUser, onApprovalChange, isApproving }: WalletPaymentTrackerProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const isPayee = currentUser === payment.recipient_email;
  const isPayer = currentUser === payment.payer_email;

  const handleCreateEscrow = async () => {
    // Stricter checks to satisfy the linter
    if (
      payment.payment_type !== 'web3' ||
      !payment.contract || 
      !payment.contract.address ||
      !payment.recipient_wallet ||
      payment.custody_amount === undefined ||
      payment.custody_days === undefined ||
      !payment.user_commission_beneficiary ||
      payment.user_commission_amount === undefined ||
      !payment.platform_commission_beneficiary ||
      payment.platform_commission_amount === undefined
    ) {
      alert("Faltan datos del pago para crear la custodia. Contacte a soporte.");
      return;
    }

    // Assign to constants to help TypeScript's control flow analysis
    const contractAddress = payment.contract.address;
    const recipientWallet = payment.recipient_wallet;
    const custodyAmount = payment.custody_amount;
    const custodyDays = payment.custody_days;
    const userCommissionBeneficiary = payment.user_commission_beneficiary;
    const userCommissionAmount = payment.user_commission_amount;
    const platformCommissionBeneficiary = payment.platform_commission_beneficiary;
    const platformCommissionAmount = payment.platform_commission_amount;

    try {
      onApprovalChange('payer', true); // Reuse for loading state

      const txHash = await signContractInteraction(
        contractAddress,
        'createEscrow',
        [
          recipientWallet,
          ethers.parseUnits(payment.amount.toString(), 6),
          ethers.parseUnits(custodyAmount.toString(), 6),
          custodyDays * 24 * 60 * 60,
          userCommissionBeneficiary,
          ethers.parseUnits(userCommissionAmount.toString(), 6),
          platformCommissionBeneficiary,
          ethers.parseUnits(platformCommissionAmount.toString(), 6),
        ]
      );

      onApprovalChange('payer', true, txHash);
    } catch (error: any) {
      console.error(`Error during escrow creation:`, error);
      alert(`Error al crear la custodia: ${error.message}`);
      onApprovalChange('payer', false);
    }
  };

  const handleWeb3Approval = async (type: 'payer' | 'payee') => {
    if (!payment.escrow?.smart_contract_escrow_id) {
      alert('Error: El ID de la custodia en el contrato no está disponible.');
      return;
    }
    
    const contractAddress = process.env.NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS;
    if (!contractAddress) {
      alert('Error: La dirección del contrato de escrow no está configurada.');
      return;
    }

    try {
      onApprovalChange(type, true);

      const txHash = await signContractInteraction(
        contractAddress,
        'approvePayment',
        [payment.escrow.smart_contract_escrow_id]
      );

      onApprovalChange(type, true, txHash);
    } catch (error: any) {
      console.error(`Error during ${type} approval:`, error);
      alert(`Error al aprobar: ${error.message}`);
      onApprovalChange(type, false);
    }
  };

  const isCommissionRecipient = currentUser === payment.commission_beneficiary_email;

  const bothApproved = payment.payer_approval && payment.payee_approval;
  const isCompleted = payment.status === 'completed' || payment.status === 'cancelled';

  const canRelease = bothApproved && (payment.status === 'funded' || payment.status === 'active');
  const showValidationModule = (payment.status === 'funded' || payment.status === 'active') && !isCompleted;

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

      {/* Custody Information */}
      {(payment.status === 'funded' || payment.status === 'active') && payment.escrow && (
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
          {/* Dual Approval System */}
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
                        onClick={() => handleWeb3Approval('payer')}
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
                        onClick={() => alert('La disputa de Web3 aún no está implementada')}
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
                        onClick={() => handleWeb3Approval('payee')}
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
                        onClick={() => alert('La disputa de Web3 aún no está implementada')}
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
                <div className="text-sm text-blue-800">
                  <p><strong>Ambas partes han aprobado.</strong> La liberación de los fondos se procesará automáticamente.</p>
                  <p>Si hay algún problema, contacta a soporte inmediatamente.</p>
                </div>
              </div>
            )}

            {!bothApproved && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-xs text-yellow-800">
                  <strong>Nota importante:</strong> La liberación de fondos requiere la aprobación de ambas partes. Si una de las partes no está de acuerdo, puede iniciar una disputa. Si no hay acuerdo ni disputa antes del plazo, los fondos se liberarán al beneficiario.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yield Information */}
      {payment.yield_enabled && (
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            🌱 Rendimientos generados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <span className="text-green-600 font-medium">Total generado</span>
              <div className="text-lg font-bold text-green-900">
                {formatAmount(payment.yield_earned_total || 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <span className="text-green-600 font-medium">Para el pagador</span>
              <div className="text-lg font-bold text-green-900">
                {formatAmount(payment.yield_earned_payer || 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <span className="text-green-600 font-medium">Para la plataforma</span>
              <div className="text-lg font-bold text-green-900">
                {formatAmount(payment.yield_earned_platform || 0)}
              </div>
            </div>
          </div>
          {payment.yield_start_time && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
              <div className="text-sm">
                <span className="text-green-600">Inicio de generación de rendimientos:</span>
                <span className="ml-2 font-bold text-green-900">
                  {new Date(payment.yield_start_time).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
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

      {/* Create Escrow Button */}
      {isPayer && payment.status === 'pending' && payment.payment_type === 'web3' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acción Requerida</h3>
          <p className="text-gray-600 text-sm mb-4">
            Debes crear la custodia en la blockchain para continuar con el pago. Esto bloqueará los fondos en el contrato inteligente.
          </p>
          <button
            onClick={handleCreateEscrow}
            disabled={isApproving}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isApproving ? 'Creando Custodia...' : 'Crear Custodia en Blockchain'}
          </button>
        </div>
      )}

      {/* Evidence Upload Section */}
      {(isPayee || isPayer) && payment.status === 'funded' && !isCompleted && (
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
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Subir evidencia</p>
                <p className="text-gray-500 text-sm">Arrastra archivos aquí o haz clic para seleccionar</p>
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" />
                <button className="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Seleccionar archivos
                </button>
              </div>
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
          {payment.events && payment.events.map((event, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-lg mr-2">{getEventIcon(event.type)}</span>
              <div className="text-sm">
                <span className="font-medium">{getEventDisplayName(event.type)}</span>
                {event.description && (
                  <span className="text-gray-500 ml-2">{event.description}</span>
                )}
                <span className="text-gray-500 ml-2">
                  {new Date(event.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
