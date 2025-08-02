'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../../utils/authFetch';

// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM INTERFACES
// =============================================================================

interface PaymentAnalytics {
  payment_stats: {
    total_payments: number;
    escrowed_payments: number;
    completed_payments: number;
    failed_payments: number;
    total_volume: number;
    avg_payment_amount: number;
    missing_juno_uuids: number;
  };
  escrow_distribution: Array<{
    status: string;
    count: number;
    total_amount: number;
  }>;
  juno_health: {
    payments_with_juno_uuid: number;
    payments_missing_juno_uuid: number;
    juno_processed_payments: number;
  };
  user_activity: {
    active_buyers: number;
    active_sellers: number;
    users_with_juno: number;
  };
  daily_trends: Array<{
    date: string;
    transaction_count: number;
    daily_volume: number;
    completed_count: number;
    failed_count: number;
  }>;
}

interface PaymentSearchResult {
  id: number;
  recipient_email: string;
  payer_email: string;
  amount: string;
  currency: string;
  status: string;
  reference: string;
  created_at: string;
  payout_juno_bank_account_id?: string;
  juno_payment_id?: string;
  buyer_email?: string;
  seller_email?: string;
  escrow_status?: string;
  missing_juno_uuid: boolean;
}

interface PaymentHealthCheck {
  critical_issues: Array<{
    issue_type: string;
    count: number;
    description: string;
  }>;
  automation_readiness: {
    ready_for_automation: number;
    blocked_automation: number;
    awaiting_release: number;
  };
  recent_activity: Array<{
    hour: string;
    payment_count: number;
    failed_count: number;
  }>;
}

interface UserAnalytics {
  summary: {
    total_users: number;
    active_buyers: number;
    active_sellers: number;
    users_with_juno: number;
    kyc_approved_users: number;
    avg_payments_per_user: number;
  };
  top_users: Array<{
    id: number;
    email: string;
    full_name: string;
    kyc_status: string;
    payment_count: number;
    total_volume: number;
    last_payment_date: string;
  }>;
}

interface JunoStatus {
  api_credentials: boolean;
  api_reachable: boolean;
  last_successful_call: string | null;
  error_rate_24h: number;
}

interface FailedOperation {
  id: string;
  type: 'bridge_transfer' | 'escrow_creation' | 'escrow_release' | 'mxnb_redemption';
  paymentId: number;
  status: string;
  error?: string;
  lastAttempt?: string;
  retryCount: number;
  canRetry: boolean;
  canRollback: boolean;
  details: any;
}

interface OperationsStats {
  totalFailedOperations: number;
  pendingRetries: number;
  manualInterventionRequired: number;
  successfulRecoveries: number;
  rollbacksInitiated: number;
}

interface OperationsDashboard {
  stats: OperationsStats;
  failedOperations: FailedOperation[];
}

// =============================================================================
// 🎯 MAIN CONTROL ROOM COMPONENT
// =============================================================================

const PaymentControlRoom = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'health' | 'users' | 'operations'>('overview');
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  
  // Analytics Data
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [healthCheck, setHealthCheck] = useState<PaymentHealthCheck | null>(null);
  const [junoStatus, setJunoStatus] = useState<JunoStatus | null>(null);
  
  // Search & Operations
  const [searchResults, setSearchResults] = useState<PaymentSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    status: '',
    escrow_status: '',
    missing_juno_uuid: false,
    date_from: '',
    date_to: ''
  });
  
  // Operations Control Room
  const [operationsDashboard, setOperationsDashboard] = useState<OperationsDashboard | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<FailedOperation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [bulkOperationStatus, setBulkOperationStatus] = useState<string | null>(null);

  // =============================================================================
  // 📊 DATA FETCHING
  // =============================================================================

  const fetchAnalytics = async () => {
    try {
      const [paymentRes, userRes, healthRes, junoRes] = await Promise.all([
        authFetch(`/api/admin/analytics/payments?timeframe=${timeframe}`),
        authFetch(`/api/admin/analytics/users?timeframe=${timeframe}`),
        authFetch('/api/admin/health/payments'),
        authFetch('/api/admin/monitoring/juno-status')
      ]);

      if (paymentRes.ok) {
        const data = await paymentRes.json();
        setPaymentAnalytics(data.analytics);
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUserAnalytics(data.user_analytics);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealthCheck(data.health_check);
      }

      if (junoRes.ok) {
        const data = await junoRes.json();
        setJunoStatus(data.juno_status);
      }
    } catch (err: any) {
      setError(`Error fetching analytics: ${err.message}`);
    }
  };

  const searchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (searchFilters.status) params.append('status', searchFilters.status);
      if (searchFilters.escrow_status) params.append('escrow_status', searchFilters.escrow_status);
      if (searchFilters.missing_juno_uuid) params.append('missing_juno_uuid', 'true');
      if (searchFilters.date_from) params.append('date_from', searchFilters.date_from);
      if (searchFilters.date_to) params.append('date_to', searchFilters.date_to);

      const response = await authFetch(`/api/admin/payments/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.payments);
      }
    } catch (err: any) {
      setError(`Search error: ${err.message}`);
    }
  };

  const executeBulkFix = async (fixType: string) => {
    try {
      setBulkOperationStatus('Processing...');
      const response = await authFetch('/api/admin/operations/bulk-fix-uuids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fix_type: fixType })
      });

      if (response.ok) {
        const data = await response.json();
        setBulkOperationStatus(`✅ ${data.message} (${data.affected_rows} rows affected)`);
        // Refresh analytics
        fetchAnalytics();
      } else {
        setBulkOperationStatus('❌ Operation failed');
      }
    } catch (err: any) {
      setBulkOperationStatus(`❌ Error: ${err.message}`);
    }
  };

  // =============================================================================
  // 🚨 OPERATIONS CONTROL ROOM FUNCTIONS
  // =============================================================================

  const fetchOperationsDashboard = async () => {
    try {
      const response = await authFetch('/api/operations/dashboard');
      if (response.ok) {
        const data = await response.json();
        setOperationsDashboard(data);
      }
    } catch (err: any) {
      setError(`Error fetching operations dashboard: ${err.message}`);
    }
  };

  const handleManualRecovery = async (paymentId: number) => {
    try {
      setActionLoading(`recovery_${paymentId}`);
      const response = await authFetch(`/api/operations/recover/${paymentId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('✅ Manual recovery completed successfully!');
        fetchOperationsDashboard(); // Refresh data
      } else {
        const data = await response.json();
        alert(`❌ Recovery failed: ${data.message}`);
      }
    } catch (error: any) {
      alert(`❌ Recovery error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualRollback = async (paymentId: number) => {
    const reason = prompt('Enter rollback reason:');
    if (!reason) return;

    try {
      setActionLoading(`rollback_${paymentId}`);
      const response = await authFetch(`/api/operations/rollback/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('✅ Rollback initiated successfully! Manual intervention required.');
        fetchOperationsDashboard(); // Refresh data
      } else {
        const data = await response.json();
        alert(`❌ Rollback failed: ${data.message}`);
      }
    } catch (error: any) {
      alert(`❌ Rollback error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const runSafetyMonitor = async () => {
    try {
      setActionLoading('safety_monitor');
      const response = await authFetch('/api/operations/safety-monitor', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Safety monitor completed: ${data.message}`);
        fetchOperationsDashboard(); // Refresh data
      } else {
        const data = await response.json();
        alert(`❌ Safety monitor failed: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Safety monitor error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Additional handler functions for Operations tab
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchAnalytics();
      if (activeTab === 'operations') {
        await fetchOperationsDashboard();
      }
      setLoading(false);
    };
    fetchData();
  }, [timeframe, activeTab]);

  // Auto-refresh operations data every 30 seconds when on operations tab
  useEffect(() => {
    if (activeTab === 'operations') {
      const interval = setInterval(fetchOperationsDashboard, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // =============================================================================
  // 🎨 UTILITY FUNCTIONS
  // =============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'escrowed': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'released': 'bg-green-100 text-green-800',
      'funded': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // =============================================================================
  // 🎯 RENDER COMPONENTS
  // =============================================================================

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentAnalytics?.payment_stats.total_payments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentAnalytics ? formatCurrency(paymentAnalytics.payment_stats.total_volume) : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Missing UUIDs</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentAnalytics?.payment_stats.missing_juno_uuids || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {userAnalytics?.summary.total_users || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Issues Alert */}
      {healthCheck?.critical_issues && healthCheck.critical_issues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Critical Issues Detected</h3>
              <div className="mt-2 text-sm text-red-700">
                {healthCheck.critical_issues.map((issue, index) => (
                  <div key={index} className="mb-1">
                    <strong>{issue.issue_type}:</strong> {issue.count} affected items - {issue.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automation Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 Automation Status</h3>
          {healthCheck?.automation_readiness && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ready for Automation</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  {healthCheck.automation_readiness.ready_for_automation}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blocked (Missing UUIDs)</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                  {healthCheck.automation_readiness.blocked_automation}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Awaiting Release</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                  {healthCheck.automation_readiness.awaiting_release}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Juno API Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🏦 Juno API Health</h3>
          {junoStatus && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Credentials</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  junoStatus.api_credentials 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {junoStatus.api_credentials ? '✅ Valid' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Reachable</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  junoStatus.api_reachable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {junoStatus.api_reachable ? '✅ Online' : '❌ Offline'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Daily Transaction Trends</h3>
        {paymentAnalytics?.daily_trends && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentAnalytics.daily_trends.slice(0, 10).map((trend, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(trend.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.transaction_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(parseFloat(trend.daily_volume.toString()))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{trend.completed_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{trend.failed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Advanced Payment Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by email, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchFilters.status}
            onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="escrowed">Escrowed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={searchFilters.missing_juno_uuid}
              onChange={(e) => setSearchFilters({...searchFilters, missing_juno_uuid: e.target.checked})}
              className="mr-2"
            />
            Missing Juno UUID
          </label>
        </div>
        <button
          onClick={searchPayments}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search Payments
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results ({searchResults.length})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escrow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juno UUID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.recipient_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(parseFloat(payment.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.escrow_status && getStatusBadge(payment.escrow_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.missing_juno_uuid ? (
                        <span className="text-red-600 font-medium">❌ Missing</span>
                      ) : (
                        <span className="text-green-600 font-medium">✅ Present</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderOperationsTab = () => (
    <div className="space-y-6">
      {/* Operations Dashboard Stats */}
      {operationsDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-medium">⚠️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Failed Operations</p>
                <p className="text-2xl font-semibold text-gray-900">{operationsDashboard.stats.totalFailedOperations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-medium">🔄</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Retries</p>
                <p className="text-2xl font-semibold text-gray-900">{operationsDashboard.stats.pendingRetries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Manual Intervention</p>
                <p className="text-2xl font-semibold text-gray-900">{operationsDashboard.stats.manualInterventionRequired}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Successful Recoveries</p>
                <p className="text-2xl font-semibold text-gray-900">{operationsDashboard.stats.successfulRecoveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-medium">⬅️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Rollbacks Initiated</p>
                <p className="text-2xl font-semibold text-gray-900">{operationsDashboard.stats.rollbacksInitiated}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🔧 Manual Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={runSafetyMonitor}
            disabled={actionLoading === 'safety_monitor'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {actionLoading === 'safety_monitor' ? 'Running...' : '🔍 Run Safety Monitor'}
          </button>
        </div>
      </div>

      {/* Failed Operations List */}
      {operationsDashboard && operationsDashboard.failedOperations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚠️ Failed Operations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retry Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attempt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operationsDashboard.failedOperations.map((operation) => (
                  <tr key={operation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {operation.paymentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        operation.type === 'escrow_creation' ? 'bg-red-100 text-red-800' :
                        operation.type === 'bridge_transfer' ? 'bg-yellow-100 text-yellow-800' :
                        operation.type === 'escrow_release' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {operation.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {operation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {operation.retryCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {operation.lastAttempt ? formatDate(operation.lastAttempt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {operation.canRetry && (
                        <button
                          onClick={() => handleManualRecovery(operation.paymentId)}
                          disabled={actionLoading === `recovery_${operation.paymentId}`}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {actionLoading === `recovery_${operation.paymentId}` ? 'Recovering...' : '🔄 Retry'}
                        </button>
                      )}
                      {operation.canRollback && (
                        <button
                          onClick={() => handleManualRollback(operation.paymentId)}
                          disabled={actionLoading === `rollback_${operation.paymentId}`}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {actionLoading === `rollback_${operation.paymentId}` ? 'Rolling back...' : '⬅️ Rollback'}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOperation(operation)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        🔍 Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Operations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🔧 Bulk Operations</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Fix Missing Juno UUIDs</h4>
            <p className="text-sm text-gray-600 mb-3">
              Automatically populate missing payout_juno_bank_account_id from seller relationships
            </p>
            <button
              onClick={() => executeBulkFix('seller_uuid')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Fix Missing UUIDs
            </button>
          </div>
          
          {bulkOperationStatus && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm font-medium">{bulkOperationStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Operation Details Modal */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Operation Details - Payment #{selectedOperation.paymentId}
                </h3>
                <button
                  onClick={() => setSelectedOperation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operation Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOperation.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOperation.status}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Error Message</label>
                  <p className="mt-1 text-sm text-red-600">{selectedOperation.error || 'No error message'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Retry Count</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedOperation.retryCount}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operation Details</label>
                  <pre className="mt-1 text-xs bg-gray-100 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedOperation.details, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedOperation(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );



  // =============================================================================
  // 🎯 MAIN RENDER
  // =============================================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Control Room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Payment Operations Control Room</h1>
        <p className="text-gray-600">Comprehensive payment analytics, troubleshooting & operations center</p>
        
        {/* Timeframe Selector */}
        <div className="mt-4 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Timeframe:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            {key: 'overview', label: '📊 Overview', desc: 'Analytics Dashboard'},
            {key: 'search', label: '🔍 Search', desc: 'Payment Lookup'},
            {key: 'health', label: '🏥 Health', desc: 'System Status'},
            {key: 'users', label: '👥 Users', desc: 'User Analytics'},
            {key: 'operations', label: '🔧 Operations', desc: 'Bulk Actions'}
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 border-b border-gray-200'
              }`}
            >
              <span className="block">{tab.label}</span>
              <span className="block text-xs text-gray-400">{tab.desc}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-3">❌</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'operations' && renderOperationsTab()}
        {/* Add other tabs as needed */}
      </div>
    </div>
  );
};

export default PaymentControlRoom;
