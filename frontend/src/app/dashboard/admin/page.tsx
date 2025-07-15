'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';
import SoporteTable from '../../../components/SoporteTable';
import DisputeCard from '../../../components/admin/DisputeCard';
import DisputeDetailsModal from '../../../components/admin/DisputeDetailsModal';
import HerokuLogsViewer from '../../../components/admin/HerokuLogsViewer';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  user: {
    email: string;
  };
}

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

const AdminDashboardPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'disputes' | 'operations' | 'production-logs'>('operations');
  
  // Environment detection
  const isProduction = typeof window !== 'undefined' && window.location.hostname === 'kustodia.mx';
  const [resolvingDispute, setResolvingDispute] = useState<number | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Operation Center state
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [paymentStatusGroups, setPaymentStatusGroups] = useState<Record<string, { count: number; amount: number }>>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Log filtering state
  const [logDateStart, setLogDateStart] = useState<string>('');
  const [logDateEnd, setLogDateEnd] = useState<string>('');
  const [logLevel, setLogLevel] = useState<string>('');
  const [logsCollapsed, setLogsCollapsed] = useState<boolean>(true);

  useEffect(() => {
    fetchTickets();
    fetchDisputes();
    
    // Load operations center data if on operations tab
    if (activeTab === 'operations') {
      fetchSystemData();
      fetchSystemLogs();
    }
  }, [activeTab]);
  
  // Refetch logs when filters change
  useEffect(() => {
    if (activeTab === 'operations') {
      fetchSystemLogs();
    }
  }, [logDateStart, logDateEnd, logLevel]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Fetch tickets
      const ticketsResponse = await authFetch('admin/tickets');
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      
      // Fetch disputes
      const disputesResponse = await authFetch('admin/disputes');
      if (disputesResponse.ok) {
        const disputesData = await disputesResponse.json();
        const disputes = disputesData.disputes || [];
        
        // Fetch AI assessments for pending disputes
        const pendingDisputes = disputes.filter((d: Dispute) => d.status === 'pending');
        if (pendingDisputes.length > 0) {
          try {
            const aiResponse = await authFetch('dispute/ai-assessment/batch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                disputeIds: pendingDisputes.map((d: Dispute) => d.id)
              })
            });
            
            if (aiResponse.ok) {
              const aiAssessments = await aiResponse.json();
              
              // Merge AI assessments with disputes
              const disputesWithAI = disputes.map((dispute: Dispute) => ({
                ...dispute,
                aiAssessment: aiAssessments[dispute.id] || undefined
              }));
              
              setDisputes(disputesWithAI);
            } else {
              console.warn('Failed to fetch AI assessments, status:', aiResponse.status);
              const errorText = await aiResponse.text();
              console.warn('AI API error response:', errorText);
              setDisputes(disputes);
            }
          } catch (aiError) {
            console.error('Error fetching AI assessments:', aiError);
            setDisputes(disputes);
          }
        } else {
          setDisputes(disputes);
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemData = async () => {
    setIsLoadingSystem(true);
    try {
      const [overviewResponse, activityResponse, paymentsResponse] = await Promise.all([
        authFetch('/api/admin/system/overview'),
        authFetch('/api/admin/system/activity'),
        authFetch('/api/admin/payments')
      ]);

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setSystemOverview(overviewData);
      } else {
        console.error('Failed to fetch system overview');
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      } else {
        console.error('Failed to fetch system activity');
      }

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        // Handle both array and object responses
        const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData.payments || []);
        const statusGroups = payments.reduce((acc: any, payment: any) => {
          const status = payment.status;
          if (!acc[status]) {
            acc[status] = { count: 0, amount: 0 };
          }
          acc[status].count += 1;
          acc[status].amount += Number(payment.amount || 0);
          return acc;
        }, {} as Record<string, { count: number; amount: number }>);
        setPaymentStatusGroups(statusGroups);
      } else {
        console.error('Failed to fetch payments');
      }


    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    setActionLoading(action);
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'execute-payouts':
          endpoint = '/api/admin/system/actions/execute-payouts';
          break;
        case 'restart-services':
          endpoint = '/api/admin/system/actions/restart-services';
          break;
        case 'view-logs':
          endpoint = '/api/admin/system/actions/logs';
          method = 'GET';
          break;
        case 'emergency-mode':
          // Emergency mode placeholder
          alert('Modo de emergencia - Funcionalidad pendiente de implementar');
          return;
        default:
          return;
      }

      const response = await authFetch(endpoint, {
        method
      });

      const result = await response.json();
      
      if (response.ok) {
        if (action === 'view-logs') {
          // Show logs in a modal or new window
          console.log('System Logs:', result.logs);
          alert(`Logs obtenidos: ${result.logs?.length || 0} entradas`);
        } else {
          alert(`Éxito: ${result.message}`);
        }
        // Refresh system data after action
        fetchSystemData();
      } else {
        alert(`Error: ${result.error || 'Action failed'}`);
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      alert(`Error ejecutando acción: ${error}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDisputeDetails = (disputeId: number) => {
    setSelectedDisputeId(disputeId);
    setShowDisputeModal(true);
  };

  const handleCloseDisputeModal = () => {
    setShowDisputeModal(false);
    setSelectedDisputeId(null);
  };

  const handleResolveDispute = async (disputeId: number, escrowId: number, approved: boolean, adminNotes: string) => {
    setResolvingDispute(disputeId);
    try {
      const response = await authFetch(`/api/dispute/${escrowId}/admin-resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved,
          admin_notes: adminNotes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve dispute');
      }
      
      // Refresh disputes
      const disputesResponse = await authFetch('admin/disputes');
      if (disputesResponse.ok) {
        const disputesData = await disputesResponse.json();
        setDisputes(disputesData.disputes || []);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to resolve dispute');
    } finally {
      setResolvingDispute(null);
    }
  };

  // Fetch system overview data
  const fetchSystemOverview = async () => {
    try {
      setIsLoadingSystem(true);
      const response = await authFetch('admin/system/overview');
      
      if (response.ok) {
        const data = await response.json();
        setSystemOverview(data);
      } else {
        console.error('Failed to fetch system overview');
      }
    } catch (error) {
      console.error('Error fetching system overview:', error);
    } finally {
      setIsLoadingSystem(false);
    }
  };
  
  // Fetch system logs with filtering
  const fetchSystemLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (logDateStart) params.append('startDate', logDateStart);
      if (logDateEnd) params.append('endDate', logDateEnd);
      if (logLevel) params.append('level', logLevel);
      
      const response = await authFetch(`admin/system/activity?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.logs || []);
      } else {
        console.error('Failed to fetch system logs');
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };
  
  // Refresh logs manually
  const refreshLogs = () => {
    fetchSystemLogs();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingDisputes = disputes.filter(dispute => dispute.status === 'pending');
  const resolvedDisputes = disputes.filter(dispute => dispute.status !== 'pending');

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Panel de Administración</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tickets de Soporte
            {tickets.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tickets.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'disputes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Disputas
            {pendingDisputes.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-900 py-0.5 px-2.5 rounded-full text-xs">
                {pendingDisputes.length} pendientes
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Centro de Operaciones
          </button>
          {/* Production Logs Tab - Only show in production */}
          {isProduction && (
            <button
              onClick={() => setActiveTab('production-logs')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'production-logs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Logs de Producción
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                Heroku
              </span>
            </button>
          )}
        </nav>
      </div>

      {loading && <p className="text-center text-gray-500">Cargando datos...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      {!loading && !error && (
        <>
          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Tickets de Soporte</h2>
              <SoporteTable />
            </div>
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
              {/* AI Risk Assessment Summary */}
              {/* Debug info */}
              {pendingDisputes.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
                  <p className="text-sm text-yellow-700">
                    Pending disputes: {pendingDisputes.length} | 
                    With AI: {pendingDisputes.filter(d => d.aiAssessment).length}
                  </p>
                  <p className="text-sm text-yellow-700">
                    AI Assessment status: {pendingDisputes.some(d => d.aiAssessment) ? 'Available' : 'Not loaded'}
                  </p>
                </div>
              )}
              
              {pendingDisputes.some(d => d.aiAssessment) && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow p-6 md:p-8 border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h2 className="text-xl font-semibold text-purple-800">Resumen de Riesgo AI</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {(() => {
                      const disputesWithAI = pendingDisputes.filter(d => d.aiAssessment);
                      const highRisk = disputesWithAI.filter(d => d.aiAssessment!.riskScore >= 70).length;
                      const mediumRisk = disputesWithAI.filter(d => d.aiAssessment!.riskScore >= 40 && d.aiAssessment!.riskScore < 70).length;
                      const lowRisk = disputesWithAI.filter(d => d.aiAssessment!.riskScore < 40).length;
                      const avgRisk = disputesWithAI.length > 0 ? Math.round(disputesWithAI.reduce((sum, d) => sum + d.aiAssessment!.riskScore, 0) / disputesWithAI.length) : 0;
                      
                      return (
                        <>
                          <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                            <div className="text-2xl font-bold text-purple-600">{avgRisk}/100</div>
                            <div className="text-sm text-gray-600">Riesgo Promedio</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                            <div className="text-2xl font-bold text-red-600">{highRisk}</div>
                            <div className="text-sm text-gray-600">Alto Riesgo</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{mediumRisk}</div>
                            <div className="text-sm text-gray-600">Riesgo Medio</div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-purple-100 text-center">
                            <div className="text-2xl font-bold text-green-600">{lowRisk}</div>
                            <div className="text-sm text-gray-600">Bajo Riesgo</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <h3 className="font-medium text-gray-800 mb-2">Recomendaciones de AI:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {(() => {
                        const disputesWithAI = pendingDisputes.filter(d => d.aiAssessment);
                        const recommendations = {
                          approve: disputesWithAI.filter(d => d.aiAssessment!.recommendation === 'approve').length,
                          reject: disputesWithAI.filter(d => d.aiAssessment!.recommendation === 'reject').length,
                          investigate: disputesWithAI.filter(d => d.aiAssessment!.recommendation === 'investigate').length
                        };
                        
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span>Aprobar: {recommendations.approve}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              <span>Rechazar: {recommendations.reject}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                              <span>Investigar: {recommendations.investigate}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pending Disputes */}
              {pendingDisputes.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    🚨 Disputas Pendientes
                    <span className="ml-2 bg-red-100 text-red-900 py-1 px-3 rounded-full text-sm">
                      {pendingDisputes.length}
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {pendingDisputes.map((dispute) => (
                      <DisputeCard
                        key={dispute.id}
                        dispute={dispute}
                        onResolve={handleResolveDispute}
                        onViewDetails={handleViewDisputeDetails}
                        isResolving={resolvingDispute === dispute.id}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Resolved Disputes */}
              {resolvedDisputes.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Disputas Resueltas</h2>
                  <div className="space-y-4">
                    {resolvedDisputes.map((dispute) => (
                      <DisputeCard
                        key={dispute.id}
                        dispute={dispute}
                        onResolve={handleResolveDispute}
                        onViewDetails={handleViewDisputeDetails}
                        isResolving={false}
                        formatDate={formatDate}
                        getStatusColor={getStatusColor}
                        readOnly={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {disputes.length === 0 && (
                <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200 text-center">
                  <p className="text-gray-500">No hay disputas registradas</p>
                </div>
              )}
            </div>
          )}

          {/* Operation Center Tab */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              {isLoadingSystem ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando datos del sistema...</p>
                </div>
              ) : (
                <>
                  {/* System Status Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow p-4 md:p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 truncate">Sistema</p>
                          <p className={`text-lg font-semibold truncate ${
                            systemOverview?.overview?.systemStatus === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {systemOverview?.overview?.systemStatus === 'active' ? 'Funcionando' : 'Error'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full flex-shrink-0 ${
                          systemOverview?.overview?.systemStatus === 'active' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-2xl ${
                            systemOverview?.overview?.systemStatus === 'active' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {systemOverview?.overview?.systemStatus === 'active' ? '✅' : '❌'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Automación MXNB</p>
                          <p className={`text-2xl font-bold ${
                            systemOverview?.automationStatus?.payoutProcessor === 'running' ? 'text-blue-600' : 'text-yellow-600'
                          }`}>
                            {systemOverview?.automationStatus?.payoutProcessor === 'running' ? 'Funcionando' : 'Detenido'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          systemOverview?.automationStatus?.payoutProcessor === 'running' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          <svg className={`w-6 h-6 ${
                            systemOverview?.automationStatus?.payoutProcessor === 'running' ? 'text-blue-600' : 'text-yellow-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Pagos Pendientes Card */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {paymentStatusGroups['pending']?.count || 0}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {(paymentStatusGroups['pending']?.amount || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Pagos en Custodia Card */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pagos en Custodia</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {paymentStatusGroups['escrowed']?.count || 0}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {(paymentStatusGroups['escrowed']?.amount || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                           <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced System Logs with Filtering - Collapsible */}
                  <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
                      <button
                        onClick={() => setLogsCollapsed(!logsCollapsed)}
                        className="flex items-center space-x-2 text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                      >
                        <span>📊 Actividad Reciente del Sistema</span>
                        <span className={`transform transition-transform duration-200 ${
                          logsCollapsed ? 'rotate-0' : 'rotate-90'
                        }`}>
                          ▶
                        </span>
                      </button>
                      
                      {/* Log Filtering Controls */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="flex space-x-2">
                          <input
                            type="date"
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                            onChange={(e) => setLogDateStart(e.target.value)}
                            title="Fecha inicio"
                          />
                          <input
                            type="date"
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                            onChange={(e) => setLogDateEnd(e.target.value)}
                            title="Fecha fin"
                          />
                        </div>
                        <select 
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) => setLogLevel(e.target.value)}
                          title="Filtrar por nivel"
                        >
                          <option value="">Todos los niveles</option>
                          <option value="error">Errores</option>
                          <option value="warn">Advertencias</option>
                          <option value="info">Información</option>
                          <option value="debug">Debug</option>
                        </select>
                        <button
                          onClick={refreshLogs}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                          title="Actualizar logs"
                        >
                          🔄
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Logs Content */}
                    {!logsCollapsed && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((activity, index) => {
                            const getStatusColor = (status: string) => {
                              switch (status) {
                                case 'success': return 'bg-green-50 border-green-200';
                                case 'error': return 'bg-red-50 border-red-200';
                                case 'warning': return 'bg-yellow-50 border-yellow-200';
                                default: return 'bg-blue-50 border-blue-200';
                              }
                            };
                            
                            const getDotColor = (status: string) => {
                              switch (status) {
                                case 'success': return 'bg-green-500';
                                case 'error': return 'bg-red-500';
                                case 'warning': return 'bg-yellow-500';
                                default: return 'bg-blue-500';
                              }
                            };

                            return (
                              <div key={activity.id || index} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(activity.level || activity.status)}`}>
                                <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${getDotColor(activity.level || activity.status)}`}></div>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-700">{activity.message || activity.description}</span>
                                    {activity.paymentId && (
                                      <span className="text-xs text-gray-500 mt-1">
                                        Payment #{activity.paymentId} • {activity.paymentAmount} {activity.paymentCurrency}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-500 block">
                                    {activity.formattedTimestamp || new Date(activity.timestamp).toLocaleDateString('es-MX', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit'
                                    })}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(activity.timestamp).toLocaleTimeString('es-MX', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  {activity.level && (
                                    <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                                      activity.level === 'error' ? 'bg-red-100 text-red-800' :
                                      activity.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                                      activity.level === 'info' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {activity.level}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No hay actividad reciente del sistema</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

              {/* System Health & Monitoring */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">🔧 Estado de Servicios</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Backend</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Activo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Base de Datos</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Activo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Juno API</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Limitado</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bridge Wallet</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Activo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MXNB Contract</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Activo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">⚡ Procesos Automáticos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payout Processor</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ejecutándose</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Escrow Monitor</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ejecutándose</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bridge Transfers</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Activo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MXNB Redemptions</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Con errores</span>
                    </div>
                  </div>
                </div>
              </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">🚀 Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button 
                        onClick={() => handleQuickAction('restart-services')}
                        disabled={actionLoading === 'restart-services'}
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-blue-600 mb-2">
                          {actionLoading === 'restart-services' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Reiniciar Servicios</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction('execute-payouts')}
                        disabled={actionLoading === 'execute-payouts'}
                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-green-600 mb-2">
                          {actionLoading === 'execute-payouts' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Ejecutar Payouts</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction('view-logs')}
                        disabled={actionLoading === 'view-logs'}
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-purple-600 mb-2">
                          {actionLoading === 'view-logs' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Ver Logs</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction('emergency-mode')}
                        disabled={actionLoading === 'emergency-mode'}
                        className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="text-red-600 mb-2">
                          {actionLoading === 'emergency-mode' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                          ) : (
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Modo Emergencia</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Production Logs Tab - Only show in production */}
          {activeTab === 'production-logs' && isProduction && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow p-6 md:p-8 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-xl font-semibold text-green-800">Logs de Heroku - Producción</h2>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    En Vivo
                  </span>
                </div>
                <p className="text-green-700 text-sm mb-6">
                  Monitoreo en tiempo real de los logs de aplicación desde Heroku Platform API.
                  Incluye logs de aplicación, router, y dynos con filtros avanzados.
                </p>
                
                {/* Heroku Logs Viewer Component */}
                <HerokuLogsViewer />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Dispute Details Modal */}
      {selectedDisputeId && (
        <DisputeDetailsModal
          disputeId={selectedDisputeId}
          isOpen={showDisputeModal}
          onClose={handleCloseDisputeModal}
          onResolve={async (disputeId, action, notes) => {
            const dispute = disputes.find(d => d.id === disputeId);
            if (dispute) {
              await handleResolveDispute(disputeId, dispute.escrow.id, action === 'approve', notes || '');
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
