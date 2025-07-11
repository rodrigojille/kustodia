"use client";
import { useEffect, useState } from "react";
import { authFetch } from '../utils/authFetch';

interface AutomationStatusData {
  success: boolean;
  status: string;
  lastRun: {
    deposits: string;
    custodies: string;
    payouts: string;
    sync: string;
  };
  nextRun: {
    deposits: string;
    custodies: string;
    payouts: string;
    sync: string;
  };
  timestamp: string;
}

interface AutomationStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export default function AutomationStatus({ 
  showDetails = false, 
  compact = false, 
  className = "" 
}: AutomationStatusProps) {
  const [status, setStatus] = useState<AutomationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      authFetch('automation/status')
        .then(res => res.json())
        .then(data => {
          setStatus(data);
          setLoading(false);
          setError(null);
        })
        .catch(err => {
          setError('Error al cargar estado de automatización');
          setLoading(false);
        });
    };

    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return compact ? (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Verificando...</span>
      </div>
    ) : (
      <div className="text-gray-500 text-sm">Cargando estado de automatización...</div>
    );
  }

  if (error || !status) {
    return compact ? (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs text-red-600">Sin conexión</span>
      </div>
    ) : (
      <div className="text-red-600 text-sm">{error}</div>
    );
  }

  const isActive = status.success && status.status === 'running';

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
          {isActive ? 'Automatización activa' : 'Automatización inactiva'}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Estado de Automatización</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-red-700'}`}>
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {showDetails && isActive && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-600">💰</span>
                <span className="font-medium text-gray-700">Depósitos</span>
              </div>
              <div className="text-xs text-gray-500 ml-6">{status.nextRun.deposits}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600">🔓</span>
                <span className="font-medium text-gray-700">Custodias</span>
              </div>
              <div className="text-xs text-gray-500 ml-6">{status.nextRun.custodies}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-600">🏦</span>
                <span className="font-medium text-gray-700">Pagos</span>
              </div>
              <div className="text-xs text-gray-500 ml-6">{status.nextRun.payouts}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-600">🔄</span>
                <span className="font-medium text-gray-700">Blockchain</span>
              </div>
              <div className="text-xs text-gray-500 ml-6">{status.nextRun.sync}</div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Última actualización: {new Date(status.timestamp).toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      )}

      {!isActive && (
        <div className="text-sm text-red-600">
          ⚠️ El sistema de automatización no está funcionando. Los pagos pueden requerir procesamiento manual.
        </div>
      )}
    </div>
  );
}
