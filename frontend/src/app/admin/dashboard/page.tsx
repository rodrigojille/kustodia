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
  const [activeTab, setActiveTab] = useState<'tickets' | 'disputes' | 'control-room' | 'multisig' | 'recovery'>('tickets');
  const [resolvingDispute, setResolvingDispute] = useState<number | null>(null);
  
  // Recovery tab state
  const [operationsDashboard, setOperationsDashboard] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkOperationStatus, setBulkOperationStatus] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<any>(null);

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
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
