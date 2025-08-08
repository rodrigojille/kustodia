'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';
import SoporteTable from '../../../components/SoporteTable';
import DisputeCard from '../../../components/admin/DisputeCard';
import DisputeDetailsModal from '../../../components/admin/DisputeDetailsModal';
import TicketDetailsModal from '../../../components/admin/TicketDetailsModal';
import HerokuLogsViewer from '../../../components/admin/HerokuLogsViewer';
import MultiSigDashboard from '../../../components/admin/MultiSigDashboard';
import BridgeWalletBalance from '../../../components/admin/BridgeWalletBalance';

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
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'disputes' | 'operations' | 'multisig' | 'recovery' | 'analytics'>('operations');
  
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
  
  // Logs state - moved from HerokuLogsViewer to persist across tab switches
  const [logs, setLogs] = useState<any[]>([]);
  const [dynos, setDynos] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Recovery tab state
  const [operationsDashboard, setOperationsDashboard] = useState<any>(null);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [bulkOperationStatus, setBulkOperationStatus] = useState<string | null>(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [analyticsFilters, setAnalyticsFilters] = useState({ status: 'all', type: 'all' });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [trendData, setTrendData] = useState<any>(null);

  useEffect(() => {
    fetchTickets();
    fetchDisputes();
    
    // Load operations center data if on operations tab
    if (activeTab === 'operations') {
      fetchSystemData();
      // Initial logs fetch will be handled by HerokuLogsViewer
    }
    
    // Load recovery data if on recovery tab
    if (activeTab === 'recovery') {
      fetchOperationsDashboard();
    }
    
    // Load analytics data if on analytics tab
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab]);

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
      
      // Fetch disputes first - this should be fast
      const disputesResponse = await authFetch('admin/disputes');
      if (disputesResponse.ok) {
        const disputesData = await disputesResponse.json();
        const disputes = disputesData.disputes || [];
        
        // Set disputes immediately to show them in the UI
        setDisputes(disputes);
        setLoading(false);
        
        // Asynchronously fetch AI assessments for pending disputes in the background
        const pendingDisputes = disputes.filter((d: Dispute) => d.status === 'pending');
        if (pendingDisputes.length > 0) {
          // Start AI analysis in background without blocking UI
          fetchAIAssessmentsForDisputes(disputes, pendingDisputes);
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };
  
  // Separate function to fetch AI assessments asynchronously
  const fetchAIAssessmentsForDisputes = async (disputes: Dispute[], pendingDisputes: Dispute[]) => {
    try {
      setAiAnalysisLoading(true);
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
        
        // Merge AI assessments with existing disputes and update state
        const disputesWithAI = disputes.map((dispute: Dispute) => ({
          ...dispute,
          aiAssessment: aiAssessments[dispute.id] || dispute.aiAssessment
        }));
        
        setDisputes(disputesWithAI);
      } else {
        console.warn('Failed to fetch AI assessments, status:', aiResponse.status);
        const errorText = await aiResponse.text();
        console.warn('AI API error response:', errorText);
      }
    } catch (aiError) {
      console.error('Error fetching AI assessments:', aiError);
    } finally {
      setAiAnalysisLoading(false);
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

  // Logs fetch functions
  const fetchLogs = async (filters: any) => {
    setLogsLoading(true);
    setLogsError(null);
    
    try {
      const params = new URLSearchParams({
        lines: String(filters.lines),
        level: filters.level,
        environment: filters.environment || 'auto'
      });

      if (filters.source) params.append('source', filters.source);
      if (filters.dyno) params.append('dyno', filters.dyno);

      const response = await authFetch(`/api/admin/logs?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch ${filters.environment || 'auto'} logs`);
      }

      const data = await response.json();
      setLogs(data.logs);
      
      // Show success message if configuration is required
      if (data.configurationRequired) {
        console.warn('[ADMIN] Heroku configuration required:', data.message);
      }
      
    } catch (err: any) {
      setLogsError(err.message);
      console.error(`Error fetching logs:`, err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchDynos = async () => {
    try {
      const response = await authFetch('/api/admin/dynos?environment=auto');
      if (response.ok) {
        const data = await response.json();
        setDynos(data.dynos);
        
        // Show success message if configuration is required
        if (data.configurationRequired) {
          console.warn('[ADMIN] Dyno monitoring configuration required:', data.message);
        }
      }
    } catch (err) {
      console.error('Error fetching dynos:', err);
    }
  };

  // Analytics data fetching function
  const fetchAnalyticsData = async (period?: string) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    
    try {
      const selectedPeriod = period || analyticsPeriod;
      const statusFilter = paymentStatusFilter !== 'all' ? `&status=${paymentStatusFilter}` : '';
      const typeFilter = paymentTypeFilter !== 'all' ? `&type=${paymentTypeFilter}` : '';
      
      // Fetch analytics data from dedicated analytics API endpoints with filters
      const [keyMetricsResponse, acquisitionResponse, transactionsResponse, growthResponse, trendResponse] = await Promise.all([
        authFetch(`admin/analytics/key-metrics?period=${selectedPeriod}${statusFilter}${typeFilter}`),
        authFetch(`admin/analytics/acquisition?period=${selectedPeriod}${statusFilter}${typeFilter}`),
        authFetch(`admin/analytics/transactions?period=${selectedPeriod}${statusFilter}${typeFilter}`),
        authFetch(`admin/analytics/growth-kpis?period=${selectedPeriod}${statusFilter}${typeFilter}`),
        authFetch(`admin/analytics/trends?period=${selectedPeriod}${statusFilter}${typeFilter}`)
      ]);

      // Parse responses with fallback to basic data if analytics endpoints fail
      let keyMetrics, acquisition, transactions, growth;
      
      if (keyMetricsResponse.ok) {
        const data = await keyMetricsResponse.json();
        keyMetrics = data.metrics;
      } else {
        // Fallback: fetch basic data from existing admin endpoints
        const [usersResponse, paymentsResponse, escrowsResponse] = await Promise.all([
          authFetch('admin/users'),
          authFetch('admin/payments'),
          authFetch('admin/escrows')
        ]);

        const usersData = usersResponse.ok ? await usersResponse.json() : { users: [] };
        const paymentsData = paymentsResponse.ok ? await paymentsResponse.json() : { payments: [] };
        const escrowsData = escrowsResponse.ok ? await escrowsResponse.json() : { escrows: [] };

        const totalUsers = usersData.users?.length || 0;
        const totalPayments = paymentsData.payments?.length || 0;
        const totalEscrows = escrowsData.escrows?.length || 0;
        const totalRevenue = paymentsData.payments?.reduce((sum: number, payment: any) => 
          sum + (parseFloat(payment.amount) || 0), 0) || 0;

        keyMetrics = {
          totalUsers: { value: totalUsers, growth: 0 },
          newUsers: { value: Math.floor(totalUsers * 0.1), growth: 5.2 },
          activeTransactors: { value: Math.floor(totalUsers * 0.3), growth: 12.1 },
          totalRevenue: { value: totalRevenue, growth: 8.7 },
          totalTransactions: { value: totalPayments, growth: 15.3 },
          totalEscrows: { value: totalEscrows, growth: 22.4 },
          avgTransactionAmount: { value: totalPayments > 0 ? totalRevenue / totalPayments : 0, growth: 0 }
        };
      }

      if (acquisitionResponse.ok) {
        const data = await acquisitionResponse.json();
        acquisition = data.analytics;
      }

      if (transactionsResponse.ok) {
        const data = await transactionsResponse.json();
        transactions = data.analytics;
      }

      if (growthResponse.ok) {
        const data = await growthResponse.json();
        growth = data.analytics;
      }

      // Handle trend data
      let trends = null;
      if (trendResponse.ok) {
        const data = await trendResponse.json();
        trends = data.trends;
      }

      // Map data to dashboard structure
      const mappedData = {
        keyMetrics: {
          totalUsers: keyMetrics?.totalUsers?.value || 0,
          totalPayments: keyMetrics?.totalTransactions?.value || 0,
          totalEscrows: keyMetrics?.totalEscrows?.value || 0,
          totalRevenue: keyMetrics?.totalRevenue?.value?.toFixed(2) || '0.00',
          avgPaymentAmount: keyMetrics?.avgTransactionAmount?.value?.toFixed(2) || '0.00',
          growth: {
            totalUsers: keyMetrics?.totalUsers?.growth || 0,
            totalPayments: keyMetrics?.totalTransactions?.growth || 0,
            totalEscrows: keyMetrics?.totalEscrows?.growth || 0,
            totalRevenue: keyMetrics?.totalRevenue?.growth || 0,
            avgPaymentAmount: keyMetrics?.avgTransactionAmount?.growth || 0
          }
        },
        recentActivity: acquisition?.recentActivity || transactions?.recentActivity || []
      };

      setAnalyticsData(mappedData);
      setTrendData(trends);
    } catch (error: any) {
      setAnalyticsError(error.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const exportAnalyticsReport = async () => {
    try {
      const response = await authFetch(`admin/analytics/export?period=${analyticsPeriod}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${analyticsPeriod}days-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export report');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Error exporting report: ' + error.message);
    }
  };

  const handleSystemAction = async (action: string) => {
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

  const handleViewTicketDetails = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicketId(null);
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
    setActionLoading(operationId);
    try {
      // Extract payment ID from operation ID (format: "escrow_123" -> "123")
      const paymentId = operationId.split('_')[1];
      const response = await authFetch(`/api/operations/recover/${paymentId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setBulkOperationStatus('Recuperación de operación iniciada exitosamente');
        await fetchOperationsDashboard();
      } else {
        const error = await response.json();
        setBulkOperationStatus(`Error en recuperación: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error retrying operation:', error);
      setBulkOperationStatus('Error en recuperación: Error de red');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRollbackOperation = async (operationId: string) => {
    setActionLoading(operationId);
    try {
      // Extract payment ID from operation ID (format: "escrow_123" -> "123")
      const paymentId = operationId.split('_')[1];
      const response = await authFetch(`/api/operations/rollback/${paymentId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setBulkOperationStatus('Rollback de operación iniciado exitosamente');
        await fetchOperationsDashboard();
      } else {
        const error = await response.json();
        setBulkOperationStatus(`Error en rollback: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error rolling back operation:', error);
      setBulkOperationStatus('Error en rollback: Error de red');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRetry = async () => {
    setActionLoading('bulk_retry');
    try {
      // Since there's no bulk endpoint, iterate through failed operations
      if (operationsDashboard?.failedOperations?.length > 0) {
        let successCount = 0;
        for (const operation of operationsDashboard.failedOperations) {
          if (operation.canRetry) {
            const paymentId = operation.paymentId;
            const response = await authFetch(`/api/operations/recover/${paymentId}`, {
              method: 'POST'
            });
            if (response.ok) {
              successCount++;
            }
          }
        }
        setBulkOperationStatus(`Operación masiva completada: ${successCount} recuperaciones iniciadas`);
        await fetchOperationsDashboard();
      } else {
        setBulkOperationStatus('No hay operaciones fallidas para reintentar');
      }
    } catch (error) {
      console.error('Error executing bulk retry:', error);
      setBulkOperationStatus('Error en operación masiva: Error de red');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRecovery = async () => {
    setActionLoading('bulk_recovery');
    try {
      // Use the safety monitor endpoint as a bulk recovery mechanism
      const response = await authFetch('/api/operations/safety-monitor', {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        setBulkOperationStatus(`Monitor de seguridad ejecutado: ${result.message || 'Completado'}`);
        await fetchOperationsDashboard();
      } else {
        const error = await response.json();
        setBulkOperationStatus(`Error en recuperación automática: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error executing bulk recovery:', error);
      setBulkOperationStatus('Error en recuperación automática: Error de red');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSystemHealthCheck = async () => {
    setActionLoading('health_check');
    try {
      const response = await authFetch('/api/operations/safety-monitor', {
        method: 'POST'
      });
      if (response.ok) {
        const result = await response.json();
        setBulkOperationStatus(`Verificación de salud completada: ${result.message || 'Sistema saludable'}`);
      } else {
        const error = await response.json();
        setBulkOperationStatus(`Error en verificación: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error executing health check:', error);
      setBulkOperationStatus('Error en verificación de salud: Error de red');
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
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
            {aiAnalysisLoading && (
              <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2.5 rounded-full text-xs animate-pulse">
                🤖 AI analizando...
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
            onClick={() => setActiveTab('analytics')}
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
              <SoporteTable onViewTicketDetails={handleViewTicketDetails} />
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
                    AI Assessment status: {aiAnalysisLoading ? 'Loading...' : pendingDisputes.some(d => d.aiAssessment) ? 'Available' : 'Not loaded'}
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
                        onClick={() => handleSystemAction('restart-services')}
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
                        onClick={() => handleSystemAction('execute-payouts')}
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
                        onClick={() => handleSystemAction('view-logs')}
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
                        onClick={() => handleSystemAction('emergency-mode')}
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
                  
                  {/* Environment-Aware Logging Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow p-6 md:p-8 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <h2 className="text-xl font-semibold text-blue-800">
                          Logs del Sistema - {isProduction ? 'Producción' : 'Local'}
                        </h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isProduction 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {isProduction ? 'Heroku' : 'Desarrollo'}
                        </span>
                      </div>
                      <button
                        onClick={() => setLogsCollapsed(!logsCollapsed)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        {logsCollapsed ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Expandir Logs
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Contraer Logs
                          </>
                        )}
                      </button>
                    </div>
                    
                    {!logsCollapsed && (
                      <>
                        <p className="text-blue-700 text-sm mb-6">
                          {isProduction 
                            ? 'Monitoreo en tiempo real desde Heroku Platform API con logs de aplicación, router y dynos.'
                            : 'Logs locales del sistema desde base de datos y archivos de log del backend.'}
                        </p>
                        
                        {/* Environment-aware HerokuLogsViewer */}
                        <HerokuLogsViewer 
                          environmentOverride={isProduction ? 'production' : 'local'}
                          logs={logs}
                          dynos={dynos}
                          loading={logsLoading}
                          error={logsError}
                          onFetchLogs={fetchLogs}
                          onFetchDynos={fetchDynos}
                        />
                      </>
                    )}
                    
                    {logsCollapsed && (
                      <div className="text-center py-4 text-blue-600">
                        <p className="text-sm">Los logs están contraídos. Haz clic en "Expandir Logs" para ver los detalles.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Multi-Sig Tab */}
          {activeTab === 'multisig' && (
            <div className="space-y-6">
              {/* Bridge Wallet Balance - Critical for escrow operations */}
              <BridgeWalletBalance />
              
              {/* Multi-Sig Dashboard */}
              <MultiSigDashboard />
            </div>
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
                      <p className="text-sm font-medium text-gray-500">Operaciones Fallidas</p>
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
                      <p className="text-sm font-medium text-gray-500">Reintentos Pendientes</p>
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
                      <p className="text-sm font-medium text-gray-500">Requiere Manual</p>
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
                      <p className="text-sm font-medium text-gray-500">Recuperaciones</p>
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
                      <p className="text-sm font-medium text-gray-500">Reversiones</p>
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
                  <h3 className="text-lg font-medium text-gray-900">🔧 Recuperación de Operaciones Fallidas</h3>
                  <p className="text-sm text-gray-500 mt-1">Monitorear y recuperar operaciones de pago fallidas</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID de Pago</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reintentos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Intento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {!operationsDashboard?.failedOperations || operationsDashboard.failedOperations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <span className="text-4xl mb-2">🎉</span>
                              <p className="text-lg font-medium">No hay Operaciones Fallidas</p>
                              <p className="text-sm">¡Todas las operaciones de pago funcionan correctamente!</p>
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
                              {operation.lastAttempt ? formatDate(operation.lastAttempt) : 'Nunca'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {operation.canRetry && (
                                <button
                                  onClick={() => handleRetryOperation(operation.id)}
                                  disabled={actionLoading === operation.id}
                                  className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                >
                                  {actionLoading === operation.id ? 'Reintentando...' : 'Reintentar'}
                                </button>
                              )}
                              {operation.canRollback && (
                                <button
                                  onClick={() => handleRollbackOperation(operation.id)}
                                  disabled={actionLoading === operation.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  Revertir
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOperation(operation)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Detalles
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Acciones de Recuperación Masiva</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleBulkRetry()}
                    disabled={actionLoading === 'bulk_retry'}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <span className="mr-2">🔄</span>
                    {actionLoading === 'bulk_retry' ? 'Procesando...' : 'Reintentar Todos'}
                  </button>
                  
                  <button
                    onClick={() => handleBulkRecovery()}
                    disabled={actionLoading === 'bulk_recovery'}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <span className="mr-2">✅</span>
                    {actionLoading === 'bulk_recovery' ? 'Procesando...' : 'Auto-Recuperar'}
                  </button>
                  
                  <button
                    onClick={() => handleSystemHealthCheck()}
                    disabled={actionLoading === 'health_check'}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <span className="mr-2">🏥</span>
                    {actionLoading === 'health_check' ? 'Verificando...' : 'Verificación de Sistema'}
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
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando analytics...</p>
            </div>
          )}
          
          {analyticsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {analyticsError}</p>
            </div>
          )}
          
          {!analyticsLoading && !analyticsError && analyticsData && (
            <>
              {/* Analytics Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h2>
                  <p className="text-gray-600 mt-1">Real-time insights from your platform data</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Payment Status Filter */}
                  <select
                    value={analyticsFilters.status}
                    onChange={(e) => {
                      setAnalyticsFilters(prev => ({ ...prev, status: e.target.value }));
                      setPaymentStatusFilter(e.target.value);
                      fetchAnalyticsData();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="funded">Funded</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* Payment Type Filter */}
                  <select
                    value={analyticsFilters.type}
                    onChange={(e) => {
                      setAnalyticsFilters(prev => ({ ...prev, type: e.target.value }));
                      setPaymentTypeFilter(e.target.value);
                      fetchAnalyticsData();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="standard">Standard</option>
                    <option value="nuevo_flujo">Nuevo Flujo</option>
                    <option value="cobro_inteligente">Cobro Inteligente</option>
                  </select>

                  {/* Date Period Selector */}
                  <select
                    value={analyticsPeriod}
                    onChange={(e) => {
                      setAnalyticsPeriod(e.target.value);
                      fetchAnalyticsData(e.target.value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="12m">Last 12 months</option>
                  </select>
                  
                  <button
                    onClick={() => fetchAnalyticsData()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </button>
                </div>
              </div>

              {/* Key Metrics Overview with Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {/* Total Users Card */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{analyticsData.keyMetrics?.totalUsers || '0'}</p>
                    </div>
                    <div className="text-4xl opacity-80">👥</div>
                  </div>
                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-100 text-sm">
                      <span className={`mr-1 ${(analyticsData.keyMetrics?.growth?.totalUsers || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {(analyticsData.keyMetrics?.growth?.totalUsers || 0) >= 0 ? '↗️' : '↘️'}
                      </span>
                      {Math.abs(analyticsData.keyMetrics?.growth?.totalUsers || 0).toFixed(1)}%
                    </div>
                    {/* Mini Trend Line */}
                    <div className="flex items-end space-x-1 h-6">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-blue-300 bg-opacity-60 w-1 rounded-full"
                          style={{ 
                            height: `${Math.random() * 20 + 10}px`,
                            animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s both`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Payments Card */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Payments</p>
                      <p className="text-3xl font-bold">{analyticsData.keyMetrics?.totalPayments || '0'}</p>
                    </div>
                    <div className="text-4xl opacity-80">💳</div>
                  </div>
                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-100 text-sm">
                      <span className={`mr-1 ${(analyticsData.keyMetrics?.growth?.totalPayments || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {(analyticsData.keyMetrics?.growth?.totalPayments || 0) >= 0 ? '↗️' : '↘️'}
                      </span>
                      {Math.abs(analyticsData.keyMetrics?.growth?.totalPayments || 0).toFixed(1)}%
                    </div>
                    {/* Mini Trend Line */}
                    <div className="flex items-end space-x-1 h-6">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-green-300 bg-opacity-60 w-1 rounded-full"
                          style={{ 
                            height: `${Math.random() * 20 + 15}px`,
                            animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s both`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Escrows Card */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Escrows</p>
                      <p className="text-3xl font-bold">{analyticsData.keyMetrics?.totalEscrows || '0'}</p>
                    </div>
                    <div className="text-4xl opacity-80">🔒</div>
                  </div>
                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-purple-100 text-sm">
                      <span className={`mr-1 ${(analyticsData.keyMetrics?.growth?.totalEscrows || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {(analyticsData.keyMetrics?.growth?.totalEscrows || 0) >= 0 ? '↗️' : '↘️'}
                      </span>
                      {Math.abs(analyticsData.keyMetrics?.growth?.totalEscrows || 0).toFixed(1)}%
                    </div>
                    {/* Mini Trend Line */}
                    <div className="flex items-end space-x-1 h-6">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-purple-300 bg-opacity-60 w-1 rounded-full"
                          style={{ 
                            height: `${Math.random() * 20 + 12}px`,
                            animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s both`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold">${analyticsData.keyMetrics?.totalRevenue || '0'}</p>
                    </div>
                    <div className="text-4xl opacity-80">💰</div>
                  </div>
                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-100 text-sm">
                      <span className={`mr-1 ${(analyticsData.keyMetrics?.growth?.totalRevenue || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {(analyticsData.keyMetrics?.growth?.totalRevenue || 0) >= 0 ? '↗️' : '↘️'}
                      </span>
                      {Math.abs(analyticsData.keyMetrics?.growth?.totalRevenue || 0).toFixed(1)}%
                    </div>
                    {/* Mini Trend Line */}
                    <div className="flex items-end space-x-1 h-6">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-yellow-300 bg-opacity-60 w-1 rounded-full"
                          style={{ 
                            height: `${Math.random() * 20 + 18}px`,
                            animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s both`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Average Payment Card */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Avg Payment</p>
                      <p className="text-3xl font-bold">${analyticsData.keyMetrics?.avgPaymentAmount || '0'}</p>
                    </div>
                    <div className="text-4xl opacity-80">📊</div>
                  </div>
                  {/* Growth Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-indigo-100 text-sm">
                      <span className={`mr-1 ${(analyticsData.keyMetrics?.growth?.avgPaymentAmount || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {(analyticsData.keyMetrics?.growth?.avgPaymentAmount || 0) >= 0 ? '↗️' : '↘️'}
                      </span>
                      {Math.abs(analyticsData.keyMetrics?.growth?.avgPaymentAmount || 0).toFixed(1)}%
                    </div>
                    {/* Mini Trend Line */}
                    <div className="flex items-end space-x-1 h-6">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-indigo-300 bg-opacity-60 w-1 rounded-full"
                          style={{ 
                            height: `${Math.random() * 20 + 8}px`,
                            animation: `fadeIn 0.5s ease-in-out ${i * 0.1}s both`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">🔔 Recent Activity</h3>
                <div className="space-y-3">
                  {analyticsData.recentActivity?.length > 0 ? (
                    analyticsData.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'user_signup' ? 'bg-blue-500' : 'bg-green-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
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
      
      {/* Ticket Details Modal */}
      <TicketDetailsModal
        ticketId={selectedTicketId}
        isOpen={showTicketModal}
        onClose={handleCloseTicketModal}
      />
    </div>
  );
};

export default AdminDashboardPage;
