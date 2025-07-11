'use client';

import React, { useState } from 'react';

interface AIRiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  score: number;
}

interface AIRiskAssessment {
  riskScore: number;
  recommendation: 'approve' | 'reject' | 'investigate';
  confidence: number;
  riskFactors: AIRiskFactor[];
  summary: string;
  actionRecommendations: string[];
}

interface Dispute {
  id: number;
  reason: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence_url?: string;
  admin_notes?: string;
  createdAt: string;
  updatedAt: string;
  raisedBy: {
    id: number;
    email: string;
  };
  escrow: {
    id: number;
    amount: string;
    status: string;
    payment: {
      id: number;
      amount: string;
      status: string;
      concept?: string;
      created_at: string;
    };
  };
  aiAssessment?: AIRiskAssessment;
}

interface DisputeCardProps {
  dispute: Dispute;
  onResolve: (disputeId: number, escrowId: number, approved: boolean, adminNotes: string) => Promise<void>;
  onViewDetails?: (disputeId: number) => void;
  isResolving: boolean;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  readOnly?: boolean;
}

const DisputeCard: React.FC<DisputeCardProps> = ({
  dispute,
  onResolve,
  onViewDetails,
  isResolving,
  formatDate,
  getStatusColor,
  readOnly = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showAIAssessment, setShowAIAssessment] = useState(false);

  const handleApprove = async () => {
    await onResolve(dispute.id, dispute.escrow.id, true, adminNotes);
    setShowResolutionForm(false);
    setAdminNotes('');
  };

  const handleReject = async () => {
    await onResolve(dispute.id, dispute.escrow.id, false, adminNotes);
    setShowResolutionForm(false);
    setAdminNotes('');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Disputa #{dispute.id}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
              {dispute.status === 'pending' ? 'Pendiente' : 
               dispute.status === 'approved' ? 'Aprobada' : 'Rechazada'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Usuario:</span> {dispute.raisedBy.email}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Escrow:</span> #{dispute.escrow.id} - ${parseFloat(dispute.escrow.amount).toLocaleString()} MXN
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Pago:</span> 
            <a 
              href={`/pagos/${dispute.escrow.payment.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline ml-1"
            >
              #{dispute.escrow.payment.id} - ${parseFloat(dispute.escrow.payment.amount).toLocaleString()} MXN
            </a>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {dispute.escrow.payment.status}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Fecha:</span> {formatDate(dispute.createdAt)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
          {dispute.aiAssessment && (
            <button
              onClick={() => setShowAIAssessment(!showAIAssessment)}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium ml-2"
            >
              🤖 {showAIAssessment ? 'Ocultar AI' : 'Ver AI'}
            </button>
          )}
        </div>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(dispute.id)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ml-2"
          >
            💬 Ver Detalles y Mensajes
          </button>
        )}
      </div>

      <div className="mb-3">
        <span className="font-medium text-gray-700">Razón: </span>
        <span className="text-gray-600">{dispute.reason}</span>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3 p-4 bg-white rounded-lg border border-gray-100">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Detalles de la disputa:</h4>
            <p className="text-gray-600 text-sm">{dispute.details}</p>
          </div>
          
          {dispute.evidence_url && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📎</span>
                <a 
                  href={dispute.evidence_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  Ver evidencia adjunta
                </a>
              </div>
            </div>
          )}

          {dispute.admin_notes && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Notas del admin:</h4>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border">{dispute.admin_notes}</p>
            </div>
          )}

          {dispute.status !== 'pending' && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Resuelto:</span> {formatDate(dispute.updatedAt)}
            </div>
          )}
        </div>
      )}

      {/* AI Risk Assessment Section */}
      {showAIAssessment && dispute.aiAssessment && (
        <div className="mt-4 space-y-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <h4 className="font-semibold text-purple-800">Evaluación de Riesgo AI</h4>
          </div>
          
          {/* Risk Score and Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  dispute.aiAssessment.riskScore >= 70 ? 'text-red-600' :
                  dispute.aiAssessment.riskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {dispute.aiAssessment.riskScore}/100
                </div>
                <div className="text-sm text-gray-600">Puntuación de Riesgo</div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  dispute.aiAssessment.recommendation === 'approve' ? 'text-green-600' :
                  dispute.aiAssessment.recommendation === 'reject' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {dispute.aiAssessment.recommendation === 'approve' ? '✅ Aprobar' :
                   dispute.aiAssessment.recommendation === 'reject' ? '❌ Rechazar' : '🔍 Investigar'}
                </div>
                <div className="text-sm text-gray-600">Recomendación</div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {dispute.aiAssessment.confidence}%
                </div>
                <div className="text-sm text-gray-600">Confianza</div>
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="bg-white p-3 rounded-lg border border-purple-100">
            <h5 className="font-medium text-gray-800 mb-2">Resumen:</h5>
            <p className="text-sm text-gray-700">{dispute.aiAssessment.summary}</p>
          </div>
          
          {/* Risk Factors */}
          {dispute.aiAssessment.riskFactors.length > 0 && (
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <h5 className="font-medium text-gray-800 mb-2">Factores de Riesgo:</h5>
              <div className="space-y-2">
                {dispute.aiAssessment.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                      factor.impact === 'high' ? 'bg-red-500' :
                      factor.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-800">{factor.factor}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          factor.impact === 'high' ? 'bg-red-100 text-red-700' :
                          factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {factor.impact === 'high' ? 'Alto' : factor.impact === 'medium' ? 'Medio' : 'Bajo'}
                        </span>
                        <span className="text-xs text-gray-500">({factor.score > 0 ? '+' : ''}{factor.score})</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Recommendations */}
          {dispute.aiAssessment.actionRecommendations.length > 0 && (
            <div className="bg-white p-3 rounded-lg border border-purple-100">
              <h5 className="font-medium text-gray-800 mb-2">Recomendaciones de Acción:</h5>
              <ul className="text-sm text-gray-700 space-y-1">
                {dispute.aiAssessment.actionRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!readOnly && dispute.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {!showResolutionForm ? (
            <button
              onClick={() => setShowResolutionForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              disabled={isResolving}
            >
              {isResolving ? 'Procesando...' : 'Resolver Disputa'}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas administrativas (opcional):
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agregar notas sobre la resolución..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isResolving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  {isResolving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      ✅ Aprobar (Refund)
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReject}
                  disabled={isResolving}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ❌ Rechazar
                </button>
                
                <button
                  onClick={() => setShowResolutionForm(false)}
                  disabled={isResolving}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisputeCard;
