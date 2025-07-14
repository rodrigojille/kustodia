"use client";
import React, { useState, useEffect } from "react";
import DisputeMessagingModal from "./DisputeMessagingModal";
import { authFetch } from '../utils/authFetch';

interface Dispute {
  id: number;
  reason: string;
  details: string;
  status: string;
  evidence_url?: string;
  created_at: string;
  updated_at: string;
  escrow: {
    id: number;
    payment_id: number;
    amount: number;
    status: string;
    payment: {
      id: number;
      amount: string;
      status: string;
      description?: string;
      created_at: string;
    };
  };
  raisedBy: {
    id: number;
    name: string;
    email: string;
  };
}

export default function DisputasTable() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await authFetch('dispute');
      
      if (!response.ok) {
        throw new Error("Error al cargar disputas");
      }
      
      const data = await response.json();
      setDisputes(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filtered = disputes.filter(d => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = !search || 
      d.reason.toLowerCase().includes(searchTerm) ||
      d.details.toLowerCase().includes(searchTerm) ||
      d.id.toString().includes(searchTerm);
    
    const matchesStatus = !status || d.status === status;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewMessages = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowMessaging(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando disputas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 font-medium">❌ Error al cargar disputas</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
        <button 
          onClick={fetchDisputes}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar disputas..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filtered.length} de {disputes.length} disputas
          </div>
        </div>

        {/* Disputes List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {disputes.length === 0 ? 'No tienes disputas' : 'No se encontraron disputas'}
            </h3>
            <p className="text-gray-600">
              {disputes.length === 0 
                ? 'Cuando levantes una disputa, aparecerá aquí.' 
                : 'Intenta cambiar los filtros de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((dispute) => (
              <div 
                key={dispute.id} 
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">Disputa #{dispute.id}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                            {getStatusLabel(dispute.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Razón:</strong> {dispute.reason}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {dispute.details}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-7m0 0L8 9m4 3l4-3" />
                        </svg>
                        Escrow #{dispute.escrow.id}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        ${dispute.escrow.amount}
                      </div>
                      {dispute.escrow.payment && (
                        <a
                          href={`/dashboard/pagos/${dispute.escrow.payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Pago #{dispute.escrow.payment.id}
                          <span className={`ml-1 px-2 py-1 text-xs rounded-full border ${
                            dispute.escrow.payment.status === 'completed' 
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : dispute.escrow.payment.status === 'escrowed'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : dispute.escrow.payment.status === 'funded'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {dispute.escrow.payment.status}
                          </span>
                        </a>
                      )}
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(dispute.created_at)}
                      </div>
                      {dispute.evidence_url && (
                        <a 
                          href={dispute.evidence_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Ver evidencia
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleViewMessages(dispute)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                      </svg>
                      Ver mensajes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messaging Modal */}
      {showMessaging && selectedDispute && (
        <DisputeMessagingModal
          escrowId={selectedDispute.escrow.id}
          isOpen={showMessaging}
          onClose={() => {
            setShowMessaging(false);
            setSelectedDispute(null);
          }}
        />
      )}
    </>
  );
}
