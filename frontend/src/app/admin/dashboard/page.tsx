'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';
import SupportTicketsTable from '../../../components/admin/SupportTicketsTable';
import DisputeCard from '../../../components/admin/DisputeCard';
import PaymentControlRoom from '../control-room/page';
import MultiSigDashboard from '../../../components/admin/MultiSigDashboard';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  user: {
    email: string;
  };
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
}

const AdminDashboardPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'disputes' | 'control-room' | 'multisig' | 'recovery' | 'analytics'>('tickets');
  const [resolvingDispute, setResolvingDispute] = useState<number | null>(null);
  
  // Recovery tab state
  const [operationsDashboard, setOperationsDashboard] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkOperationStatus, setBulkOperationStatus] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<any>(null);

  // Analytics tab state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Analytics functions
  const fetchAnalyticsData = async (period: string = analyticsPeriod) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const [keyMetrics, acquisition, transactions, growthKPIs] = await Promise.all([
        authFetch(`/api/admin/analytics/key-metrics?period=${period}`),
        authFetch(`/api/admin/analytics/acquisition?period=${period}`),
        authFetch(`/api/admin/analytics/transactions?period=${period}`),
        authFetch(`/api/admin/analytics/growth-kpis?period=${period}`)
      ]);

      if (keyMetrics.ok && acquisition.ok && transactions.ok && growthKPIs.ok) {
        const data = {
          keyMetrics: await keyMetrics.json(),
          acquisition: await acquisition.json(),
          transactions: await transactions.json(),
          growthKPIs: await growthKPIs.json()
        };
        setAnalyticsData(data);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setAnalyticsError(error.message || 'Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const exportAnalyticsReport = async () => {
    try {
      const response = await authFetch(`/api/admin/analytics/export?period=${analyticsPeriod}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kustodia-analytics-${analyticsPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  // Recovery functions
  const fetchOperationsDashboard = async () => {
    try {
      const response = await authFetch('/api/operations/dashboard');
      if (response.ok) {
        const data = await response.json();
        setOperationsDashboard(data);
      }
    } catch (error) {
      console.error('Error fetching operations dashboard:', error);
    }
  };

  const handleRetryOperation = async (operationId: string) => {
    try {
      setActionLoading(operationId);
      const response = await authFetch(`/api/operations/retry/${operationId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkOperationStatus(`✅ Operation ${operationId} retry initiated: ${data.message}`);
        fetchOperationsDashboard();
      } else {
        const data = await response.json();
        setBulkOperationStatus(`❌ Retry failed: ${data.message}`);
      }
    } catch (error: any) {
      setBulkOperationStatus(`❌ Retry error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRollbackOperation = async (operationId: string) => {
    try {
      setActionLoading(operationId);
      const response = await authFetch(`/api/operations/rollback/${operationId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkOperationStatus(`✅ Operation ${operationId} rollback completed: ${data.message}`);
        fetchOperationsDashboard();
      } else {
        const data = await response.json();
        setBulkOperationStatus(`❌ Rollback failed: ${data.message}`);
      }
    } catch (error: any) {
      setBulkOperationStatus(`❌ Rollback error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRetry = async () => {
    try {
      setActionLoading('bulk_retry');
      const response = await authFetch('/api/operations/bulk-retry', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkOperationStatus(`✅ Bulk retry initiated: ${data.message}`);
        fetchOperationsDashboard();
      } else {
        const data = await response.json();
        setBulkOperationStatus(`❌ Bulk retry failed: ${data.message}`);
      }
    } catch (error: any) {
      setBulkOperationStatus(`❌ Bulk retry error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRecovery = async () => {
    try {
      setActionLoading('bulk_recovery');
      const response = await authFetch('/api/operations/bulk-recovery', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkOperationStatus(`✅ Bulk recovery initiated: ${data.message}`);
        fetchOperationsDashboard();
      } else {
        const data = await response.json();
        setBulkOperationStatus(`❌ Bulk recovery failed: ${data.message}`);
      }
    } catch (error: any) {
      setBulkOperationStatus(`❌ Bulk recovery error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSystemHealthCheck = async () => {
    try {
      setActionLoading('health_check');
      const response = await authFetch('/api/operations/health-check', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkOperationStatus(`✅ System health check completed: ${data.message}`);
        fetchOperationsDashboard();
      } else {
        const data = await response.json();
        setBulkOperationStatus(`❌ Health check failed: ${data.message}`);
      }
    } catch (error: any) {
      setBulkOperationStatus(`❌ Health check error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'failed': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'retrying': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tickets
        const ticketsResponse = await authFetch('/api/admin/tickets');
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          setTickets(ticketsData);
        }
        
        // Fetch disputes
        const disputesResponse = await authFetch('/api/admin/disputes');
        if (disputesResponse.ok) {
          const disputesData = await disputesResponse.json();
          setDisputes(disputesData.disputes || []);
        }
        
        // Fetch operations dashboard if recovery tab is active
        if (activeTab === 'recovery') {
          await fetchOperationsDashboard();
        }
        
        // Fetch analytics data if analytics tab is active
        if (activeTab === 'analytics') {
          await fetchAnalyticsData();
        }
        
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

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
      const disputesResponse = await authFetch('/api/admin/disputes');
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
            onClick={() => setActiveTab('control-room')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'control-room'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎯 Centro de Control
          </button>
          <button
            onClick={() => setActiveTab('multisig')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'multisig'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔐 Multi-Sig
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recovery'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔧 Recovery
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics');
              if (!analyticsData) fetchAnalyticsData();
            }}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Analytics
          </button>
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
              <SupportTicketsTable tickets={tickets} />
            </div>
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <div className="space-y-6">
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

          {/* Control Room Tab */}
          {activeTab === 'control-room' && (
            <PaymentControlRoom />
          )}

          {/* MultiSig Tab */}
          {activeTab === 'multisig' && (
            <MultiSigDashboard />
          )}

          {/* Recovery Tab */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              {/* Operations Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">❌</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Failed Operations</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {operationsDashboard?.stats.totalFailedOperations || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🔄</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Retries</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {operationsDashboard?.stats.pendingRetries || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🚨</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Manual Required</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {operationsDashboard?.stats.manualInterventionRequired || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✅</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Recoveries</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {operationsDashboard?.stats.successfulRecoveries || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">↩️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Rollbacks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {operationsDashboard?.stats.rollbacksInitiated || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Failed Operations Table */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">🔧 Failed Operations Recovery</h3>
                  <p className="text-sm text-gray-500 mt-1">Monitor and recover failed payment operations</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retries</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attempt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {!operationsDashboard?.failedOperations || operationsDashboard.failedOperations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <span className="text-4xl mb-2">🎉</span>
                              <p className="text-lg font-medium">No Failed Operations</p>
                              <p className="text-sm">All payment operations are running smoothly!</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        operationsDashboard.failedOperations.map((operation: any) => (
                          <tr key={operation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {operation.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{operation.paymentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(operation.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {operation.retryCount}/3
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {operation.lastAttempt ? new Date(operation.lastAttempt).toLocaleString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {operation.canRetry && (
                                <button
                                  onClick={() => handleRetryOperation(operation.id)}
                                  disabled={actionLoading === operation.id}
                                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                >
                                  {actionLoading === operation.id ? 'Retrying...' : 'Retry'}
                                </button>
                              )}
                              {operation.canRollback && (
                                <button
                                  onClick={() => handleRollbackOperation(operation.id)}
                                  disabled={actionLoading === operation.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  Rollback
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOperation(operation)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bulk Recovery Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Bulk Recovery Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleBulkRetry()}
                    disabled={actionLoading === 'bulk_retry'}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <span className="mr-2">🔄</span>
                    {actionLoading === 'bulk_retry' ? 'Processing...' : 'Retry All Failed'}
                  </button>
                  
                  <button
                    onClick={() => handleBulkRecovery()}
                    disabled={actionLoading === 'bulk_recovery'}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <span className="mr-2">🛠️</span>
                    {actionLoading === 'bulk_recovery' ? 'Processing...' : 'Auto-Recover'}
                  </button>
                  
                  <button
                    onClick={() => handleSystemHealthCheck()}
                    disabled={actionLoading === 'health_check'}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <span className="mr-2">🏥</span>
                    {actionLoading === 'health_check' ? 'Checking...' : 'System Health Check'}
                  </button>
                </div>
                
                {bulkOperationStatus && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700">{bulkOperationStatus}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header with Controls */}
              <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Customer Analytics Dashboard</h2>
                    <p className="text-gray-600">Track growth, measure KPIs, and optimize operations in real-time</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                    {/* Time Period Selector */}
                    <select
                      value={analyticsPeriod}
                      onChange={(e) => {
                        const newPeriod = e.target.value as '7d' | '30d' | '90d' | '12m';
                        setAnalyticsPeriod(newPeriod);
                        fetchAnalyticsData(newPeriod);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Últimos 7 días</option>
                      <option value="30d">Últimos 30 días</option>
                      <option value="90d">Últimos 90 días</option>
                      <option value="12m">Últimos 12 meses</option>
                    </select>
                    
                    {/* Export Report Button */}
                    <button
                      onClick={exportAnalyticsReport}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      📥 Exportar Reporte
                    </button>
                    
                    {/* Refresh Button */}
                    <button
                      onClick={() => fetchAnalyticsData()}
                      disabled={analyticsLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {analyticsLoading ? '⏳' : '🔄'} Actualizar
                    </button>
                  </div>
                </div>

                {analyticsError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">❌ {analyticsError}</p>
                  </div>
                )}
              </div>

              {analyticsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Cargando datos analíticos...</p>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Key Metrics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Users */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {analyticsData.keyMetrics?.metrics?.totalUsers?.value?.toLocaleString() || '0'}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${
                              (analyticsData.keyMetrics?.metrics?.totalUsers?.growth || 0) >= 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(analyticsData.keyMetrics?.metrics?.totalUsers?.growth || 0) >= 0 ? '↗️' : '↘️'}
                              {Math.abs(analyticsData.keyMetrics?.metrics?.totalUsers?.growth || 0).toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <span className="text-2xl">👥</span>
                        </div>
                      </div>
                    </div>

                    {/* New Acquisitions */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Nuevas Adquisiciones</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {analyticsData.keyMetrics?.metrics?.newAcquisitions?.value?.toLocaleString() || '0'}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${
                              (analyticsData.keyMetrics?.metrics?.newAcquisitions?.growth || 0) >= 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(analyticsData.keyMetrics?.metrics?.newAcquisitions?.growth || 0) >= 0 ? '↗️' : '↘️'}
                              {Math.abs(analyticsData.keyMetrics?.metrics?.newAcquisitions?.growth || 0).toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
                          </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <span className="text-2xl">🎯</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Transactors */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {analyticsData.keyMetrics?.metrics?.activeTransactors?.value?.toLocaleString() || '0'}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${
                              (analyticsData.keyMetrics?.metrics?.activeTransactors?.growth || 0) >= 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(analyticsData.keyMetrics?.metrics?.activeTransactors?.growth || 0) >= 0 ? '↗️' : '↘️'}
                              {Math.abs(analyticsData.keyMetrics?.metrics?.activeTransactors?.growth || 0).toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
                          </div>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                          <span className="text-2xl">💳</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                          <p className="text-3xl font-bold text-gray-900">
                            ${(analyticsData.keyMetrics?.metrics?.totalRevenue?.value || 0).toLocaleString()}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${
                              (analyticsData.keyMetrics?.metrics?.totalRevenue?.growth || 0) >= 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(analyticsData.keyMetrics?.metrics?.totalRevenue?.growth || 0) >= 0 ? '↗️' : '↘️'}
                              {Math.abs(analyticsData.keyMetrics?.metrics?.totalRevenue?.growth || 0).toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
                          </div>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <span className="text-2xl">💰</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Acquisition & Transaction Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Acquisition */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Adquisición de Clientes</h3>
                      
                      {/* Traffic Sources */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-700 mb-3">Fuentes de Tráfico</h4>
                        <div className="space-y-3">
                          {analyticsData.acquisition?.acquisition?.trafficSources?.map((source: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-3" style={{
                                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
                                }}></div>
                                <span className="text-sm font-medium text-gray-700">{source.source}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">{source.users}</div>
                                <div className="text-xs text-gray-500">{source.percentage?.toFixed(1)}%</div>
                              </div>
                            </div>
                          )) || <p className="text-gray-500">No hay datos disponibles</p>}
                        </div>
                      </div>

                      {/* Conversion Funnel */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Embudo de Conversión</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                            <span className="text-sm text-gray-700">Visitantes</span>
                            <span className="font-semibold">{analyticsData.acquisition?.acquisition?.conversionFunnel?.visitors?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="text-sm text-gray-700">Registros</span>
                            <span className="font-semibold">{analyticsData.acquisition?.acquisition?.conversionFunnel?.signups?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                            <span className="text-sm text-gray-700">Primera Transacción</span>
                            <span className="font-semibold">{analyticsData.acquisition?.acquisition?.conversionFunnel?.firstTransaction?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                            <span className="text-sm text-gray-700">Clientes Recurrentes</span>
                            <span className="font-semibold">{analyticsData.acquisition?.acquisition?.conversionFunnel?.repeatCustomers?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Analytics */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Análisis de Transacciones</h3>
                      
                      {/* Payment Methods */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-700 mb-3">Métodos de Pago</h4>
                        <div className="space-y-3">
                          {analyticsData.transactions?.transactions?.paymentMethods?.map((method: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-3" style={{
                                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'][index % 3]
                                }}></div>
                                <span className="text-sm font-medium text-gray-700">{method.method}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900">{method.count}</div>
                                <div className="text-xs text-gray-500">{method.percentage?.toFixed(1)}%</div>
                              </div>
                            </div>
                          )) || <p className="text-gray-500">No hay datos disponibles</p>}
                        </div>
                      </div>

                      {/* Transaction Metrics */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">Métricas de Transacciones</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-blue-600">
                              ${(analyticsData.transactions?.transactions?.transactionSizes?.average || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Promedio</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-green-600">
                              ${(analyticsData.transactions?.transactions?.transactionSizes?.median || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Mediana</div>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-yellow-600">
                              ${(analyticsData.transactions?.transactions?.transactionSizes?.largest || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">Mayor</div>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {analyticsData.transactions?.transactions?.transactionSizes?.count?.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs text-gray-600">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth KPIs & Customer Lifetime Value */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Growth KPIs */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 KPIs de Crecimiento</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Tasa de Crecimiento Mensual</div>
                            <div className="text-xs text-gray-500">Crecimiento de usuarios activos</div>
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            {(analyticsData.growthKPIs?.kpis?.monthlyGrowthRate || 0).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Costo de Adquisición (CAC)</div>
                            <div className="text-xs text-gray-500">Por nuevo cliente</div>
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            ${(analyticsData.growthKPIs?.kpis?.customerAcquisitionCost || 0).toFixed(0)}
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Ratio LTV:CAC</div>
                            <div className="text-xs text-gray-500">Valor de vida vs costo</div>
                          </div>
                          <div className="text-xl font-bold text-yellow-600">
                            {(analyticsData.growthKPIs?.kpis?.ltvCacRatio || 0).toFixed(1)}:1
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Período de Recuperación</div>
                            <div className="text-xs text-gray-500">Meses para recuperar CAC</div>
                          </div>
                          <div className="text-xl font-bold text-purple-600">
                            {(analyticsData.growthKPIs?.kpis?.paybackPeriod || 0).toFixed(1)} meses
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Lifetime Value */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Valor de Vida del Cliente</h3>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                          <div className="text-3xl font-bold text-indigo-600 mb-1">
                            ${(analyticsData.transactions?.transactions?.customerLifetimeValue?.averageClv || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">CLV Promedio</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-green-600">
                              {(analyticsData.transactions?.transactions?.customerLifetimeValue?.retentionRate || 0).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">Retención</div>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg text-center">
                            <div className="text-lg font-bold text-red-600">
                              {(analyticsData.transactions?.transactions?.customerLifetimeValue?.churnRate || 0).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">Abandono</div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {(analyticsData.transactions?.transactions?.customerLifetimeValue?.avgTransactionsPerUser || 0).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">Transacciones por Usuario</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights & Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI-Powered Insights */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Insights de IA</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                          <div className="flex items-start">
                            <span className="text-green-500 mr-2">✅</span>
                            <div>
                              <p className="text-sm font-medium text-green-800">Crecimiento Positivo</p>
                              <p className="text-xs text-green-600">Las nuevas adquisiciones aumentaron 23% este período</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <div className="flex items-start">
                            <span className="text-blue-500 mr-2">💡</span>
                            <div>
                              <p className="text-sm font-medium text-blue-800">Oportunidad de Mejora</p>
                              <p className="text-xs text-blue-600">Optimizar conversión de visitantes a registros (+15% potencial)</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <div className="flex items-start">
                            <span className="text-yellow-500 mr-2">⚠️</span>
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Atención Requerida</p>
                              <p className="text-xs text-yellow-600">Tasa de abandono ligeramente alta en transacciones</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                          <div className="flex items-start">
                            <span className="text-purple-500 mr-2">🎯</span>
                            <div>
                              <p className="text-sm font-medium text-purple-800">Recomendación</p>
                              <p className="text-xs text-purple-600">Enfocar marketing en canales de búsqueda orgánica</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Actividad Reciente</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {[
                          { icon: '👤', action: 'Nuevo usuario registrado', time: 'Hace 2 min', color: 'text-green-600' },
                          { icon: '💳', action: 'Transacción completada: $2,500', time: 'Hace 5 min', color: 'text-blue-600' },
                          { icon: '🚗', action: 'Nuevo NFT de vehículo creado', time: 'Hace 8 min', color: 'text-purple-600' },
                          { icon: '📊', action: 'Reporte mensual generado', time: 'Hace 15 min', color: 'text-yellow-600' },
                          { icon: '🔄', action: 'Sincronización blockchain completada', time: 'Hace 20 min', color: 'text-indigo-600' },
                          { icon: '👥', action: '5 nuevos usuarios en la última hora', time: 'Hace 25 min', color: 'text-green-600' },
                          { icon: '💰', action: 'Ingresos diarios: $12,450', time: 'Hace 30 min', color: 'text-green-600' },
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded">
                            <span className="text-lg mr-3">{activity.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <p className={`text-xs ${activity.color}`}>{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📊</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay datos analíticos</h3>
                  <p className="text-gray-600 mb-4">Haz clic en "Actualizar" para cargar los datos</p>
                  <button
                    onClick={() => fetchAnalyticsData()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cargar Analytics
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
