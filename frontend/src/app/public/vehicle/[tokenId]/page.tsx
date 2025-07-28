'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MarketplaceAnalytics, { trackVehicleView, trackTrustScoreInteraction } from '../../../../components/MarketplaceAnalytics';

// Add global gtag type declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

interface VehicleEvent {
  eventType: number;
  eventTypeSpanish: string;
  eventIcon: string;
  eventColor: string;
  formattedDate: string;
  formattedTime: string;
  relativeTime: string;
  enhancedDescription: string;
  trustScore: number;
  verificationLevel: string;
  impactLevel: string;
  documentCount: number;
  documentTypes: string[];
  isVerified: boolean;
}

interface VehicleHistory {
  events: VehicleEvent[];
  summary: {
    totalEvents: number;
    eventTypes: { [key: string]: number };
    averageTrustScore: number;
    hasRecentActivity: boolean;
    riskFactors: string[];
  };
  verificationStatus: {
    status: string;
    percentage: number;
    color: string;
    verifiedEvents: number;
    totalEvents: number;
  };
}

interface PublicVehicleData {
  success: boolean;
  vehicle: {
    tokenId: string;
    make: string;
    model: string;
    year: string;
    color: string;
    displayName?: string;
    isVerified: boolean;
    blockchain: string;
    verificationUrl: string;
  };
  history: VehicleHistory;
  trustIndicators: {
    blockchainVerified: boolean;
    kustodiaVerified: boolean;
    totalVerifications: number;
    riskLevel: string;
  };
  disclaimer: string;
}

export default function PublicVehicleHistoryPage() {
  const params = useParams();
  const tokenId = params?.tokenId as string;
  
  const [vehicleData, setVehicleData] = useState<PublicVehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenId) return;

    const fetchVehicleHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/vehicle/${tokenId}/history`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle history');
        }

        const data = await response.json();
        setVehicleData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleHistory();
  }, [tokenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial del vehículo...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el historial</h1>
          <p className="text-gray-600 mb-4">{error || 'No se pudo encontrar el vehículo'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const { vehicle, history, trustIndicators } = vehicleData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-gray-600 mt-1">
                Token ID: {vehicle.tokenId} • {vehicle.blockchain}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                trustIndicators.kustodiaVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {trustIndicators.kustodiaVerified ? '✅ Verificado' : '⚠️ Parcialmente Verificado'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Vehicle Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h3>
            <div className="space-y-2">
              <div><span className="font-medium">Marca:</span> {vehicle.make}</div>
              <div><span className="font-medium">Modelo:</span> {vehicle.model}</div>
              <div><span className="font-medium">Año:</span> {vehicle.year}</div>
              <div><span className="font-medium">Color:</span> {vehicle.color}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificación</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium">Estado:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  history.verificationStatus.percentage >= 80 
                    ? 'bg-green-100 text-green-800'
                    : history.verificationStatus.percentage >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {history.verificationStatus.status}
                </span>
              </div>
              <div><span className="font-medium">Eventos Verificados:</span> {history.verificationStatus.verifiedEvents}/{history.verificationStatus.totalEvents}</div>
              <div><span className="font-medium">Puntuación de Confianza:</span> {history.summary.averageTrustScore}/100</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain</h3>
            <div className="space-y-2">
              <div><span className="font-medium">Red:</span> {vehicle.blockchain}</div>
              <div><span className="font-medium">Verificado:</span> {trustIndicators.blockchainVerified ? '✅ Sí' : '❌ No'}</div>
              <div>
                <a 
                  href={vehicle.verificationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Ver en Blockchain Explorer →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Event History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Historial de Eventos</h2>
            <p className="text-gray-600 text-sm mt-1">
              {history.summary.totalEvents} eventos registrados • 
              {history.summary.hasRecentActivity ? ' Actividad reciente' : ' Sin actividad reciente'}
            </p>
          </div>

          <div className="p-6">
            {history.events.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <p className="text-gray-600">No hay eventos registrados para este vehículo</p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: event.eventColor }}
                    >
                      {event.eventIcon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.eventTypeSpanish}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            event.impactLevel === 'Alto' ? 'bg-red-100 text-red-800' :
                            event.impactLevel === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Impacto {event.impactLevel}
                          </span>
                          <span className="text-sm text-gray-500">
                            Confianza: {event.trustScore}/100
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mt-1">{event.enhancedDescription}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{event.formattedDate} • {event.formattedTime}</span>
                          <span>{event.relativeTime}</span>
                          {event.documentCount > 0 && (
                            <span>📎 {event.documentCount} documentos</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {event.isVerified && (
                            <span className="text-green-600 text-sm">✅ {event.verificationLevel}</span>
                          )}
                        </div>
                      </div>

                      {event.documentTypes.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {event.documentTypes.map((docType, docIndex) => (
                              <span 
                                key={docIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {docType}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Risk Factors */}
        {history.summary.riskFactors.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Factores de Riesgo</h3>
            <ul className="space-y-1">
              {history.summary.riskFactors.map((risk, index) => (
                <li key={index} className="text-yellow-700">• {risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Aviso Legal</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {vehicleData.disclaimer}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Powered by <strong>Kustodia</strong> • Blockchain Verified • 
              Última actualización: {new Date().toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
