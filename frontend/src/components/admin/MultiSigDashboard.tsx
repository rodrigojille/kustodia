'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../utils/authFetch';
import { useBrowserWallet } from '../../hooks/useBrowserWallet';
import BlacklistManagement from './BlacklistManagement';

interface PendingTransaction {
  id: string;
  paymentId: string;
  amount: string;
  recipient: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  requiredSignatures: number;
  currentSignatures: number;
  createdAt: string;
  expiresAt: string;
  signers: string[];
  concept?: string;
  transactionType: 'high_value' | 'enterprise';
}

interface UpcomingPayment {
  paymentId: number;
  amount: number;
  amountUsd: number;
  currency: string;
  description: string;
  payerEmail: string;
  payeeEmail: string;
  escrowId: number;
  escrowEndTime: string;
  hoursUntilRelease: number;
  status: 'upcoming' | 'pre-approval-created';
  requiresMultiSig: boolean;
  walletType: string;
  targetWallet: string;
  createdAt: string;
  // Multisig request info (if exists)
  multisigRequestId?: string;
  multisigStatus?: string;
  currentSignatures?: number;
  multisigRequiredSignatures?: number;
  multisigCreatedAt?: string;
}

interface PreApprovedTransaction {
  id: number;
  paymentId: number;
  transactionHash: string | null;
  walletAddress: string;
  requiredSignatures: number;
  currentSignatures: number;
  status: 'pending' | 'approved' | 'executed' | 'expired';
  approvalType: string;
  amount: number;
  amountUsd: number;
  recipientAddress: string;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  metadata: {
    type: string;
    currency: string;
    description: string;
    createdAt: string;
  };
}

interface WalletConfig {
  address: string;
  requiredSignatures: number;
  totalOwners: number;
  owners: string[];
}

interface TransactionStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalExpired: number;
  averageApprovalTime: number;
  totalVolume: number;
  totalVolumeUsd: number;
}

const MultiSigDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'approvals' | 'history' | 'blacklist'>('wallet');
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [preApprovedTransactions, setPreApprovedTransactions] = useState<PreApprovedTransaction[]>([]);
  const [approvedTransactions, setApprovedTransactions] = useState<any[]>([]);
  const [walletConfig, setWalletConfig] = useState<{
    highValue: WalletConfig;
    enterprise: WalletConfig;
  } | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Browser wallet integration
  const {
    isConnected,
    isConnecting,
    walletInfo,
    availableWallets,
    error: walletError,
    connect: connectWallet,
    disconnect: disconnectWallet,
    signMessage,
    clearError: clearWalletError,
  } = useBrowserWallet();

  useEffect(() => {
    fetchMultiSigData();
  }, []);

  const fetchMultiSigData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [pendingResponse, configResponse, statsResponse, preApprovedResponse, approvedResponse] = await Promise.all([
        authFetch('/api/multisig/pending'),
        authFetch('/api/multisig/wallet-config'),
        authFetch('/api/multisig/statistics'),
        authFetch('/api/pre-approval/list'),
        authFetch('/api/multisig/approved')
      ]);

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingTransactions(pendingData.pendingApprovals || []);
        setUpcomingPayments(pendingData.upcomingPayments || []);
        setPreApprovedTransactions(pendingData.preApprovedTransactions || []);
      }

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setWalletConfig(configData.config);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.statistics);
      }

      if (preApprovedResponse.ok) {
        const preApprovedData = await preApprovedResponse.json();
        setPreApprovedTransactions(preApprovedData.data || []);
      }

      if (approvedResponse.ok) {
        const approvedData = await approvedResponse.json();
        setApprovedTransactions(approvedData.approvedTransactions || []);
      }

    } catch (err: any) {
      setError(err.message || 'Error loading multi-sig data');
      console.error('Error fetching multi-sig data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId: string, signature?: string) => {
    setActionLoading(`approve-${transactionId}`);
    
    try {
      const response = await authFetch(`/api/multisig/approve/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature }),
      });

      if (response.ok) {
        await fetchMultiSigData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve transaction');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    setActionLoading(`reject-${transactionId}`);
    
    try {
      const response = await authFetch(`/api/multisig/reject/${transactionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchMultiSigData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject transaction');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePreApproval = async (paymentId: number) => {
    setActionLoading(`pre-approve-${paymentId}`);
    setError(null);
    
    try {
      const response = await authFetch('/api/pre-approval/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Pre-approval created successfully:', data);
        await fetchMultiSigData(); // Refresh data to show new pending approval
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create pre-approval');
      }
    } catch (err: any) {
      console.error('Pre-approval creation error:', err);
      setError(`Failed to create pre-approval: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'executed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'high_value': return 'bg-orange-100 text-orange-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle browser wallet transaction signing
  const handleWalletSign = async (transactionId: string, approve: boolean) => {
    setActionLoading(`${approve ? 'approve' : 'reject'}-${transactionId}`);
    
    try {
      if (approve) {
        if (!isConnected || !walletInfo) {
          throw new Error('Wallet not connected');
        }

        // Create message to sign for multi-sig approval
        const message = `Approve multi-sig transaction: ${transactionId}\nWallet: ${walletInfo.address}\nTimestamp: ${Date.now()}`;
        
        // Sign the message with browser wallet
        const signature = await signMessage(message);
        
        // Approve in backend with signature
        await handleApproveTransaction(transactionId, signature);
      } else {
        // Reject transaction
        await handleRejectTransaction(transactionId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔐 Billetera Multi-Firma</h2>
          <p className="text-gray-600">Gestiona aprobaciones de transacciones de alto valor con firma móvil</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            {isConnected ? 'Wallet Conectado' : 'Wallet Desconectado'}
          </div>
          <button
            onClick={fetchMultiSigData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wallet'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📱 Conexión de Billetera
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'approvals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⏳ Aprobaciones Pendientes
            {(pendingTransactions.length > 0 || preApprovedTransactions.length > 0) && (
              <span className="ml-2 bg-yellow-100 text-yellow-900 py-0.5 px-2.5 rounded-full text-xs">
                {pendingTransactions.length + preApprovedTransactions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Estadísticas y Configuración
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'blacklist'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🚫 Lista Negra AML
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* WalletConnect Section */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Conexión de Billetera del Navegador</h3>
              <p className="text-sm text-gray-600 mt-1">
                Conecta tu extensión de billetera del navegador (MetaMask, Coinbase Wallet, etc.) para firmar transacciones multi-firma
              </p>
            </div>
            <div className="p-6">
              {/* Wallet Connection Interface */}
              {!isConnected ? (
                <div className="space-y-4">
                  {availableWallets.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Billeteras disponibles:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {availableWallets.map((wallet) => (
                          <span key={wallet} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {wallet}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={connectWallet}
                        disabled={isConnecting}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isConnecting ? 'Conectando...' : 'Conectar Billetera'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-4">No se detectó extensión de billetera</p>
                      <p className="text-sm text-gray-500">Por favor instala MetaMask, Coinbase Wallet, u otra extensión de billetera Web3</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-green-800 font-medium">Billetera Conectada</p>
                        <p className="text-green-600 text-sm font-mono">
                          {walletInfo?.address ? `${walletInfo.address.slice(0, 10)}...${walletInfo.address.slice(-8)}` : 'N/A'}
                        </p>
                        <p className="text-green-600 text-xs">Chain ID: {walletInfo?.chainId}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Desconectar Billetera
                  </button>
                </div>
              )}
              
              {/* Wallet Error */}
              {walletError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-red-800 text-sm">{walletError}</p>
                    <button
                      onClick={clearWalletError}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Configuration */}
          {walletConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Billetera de Alto Valor</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dirección:</span>
                    <span className="font-mono text-xs">{walletConfig.highValue?.address ? `${walletConfig.highValue.address.slice(0, 10)}...${walletConfig.highValue.address.slice(-8)}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Firmas Requeridas:</span>
                    <span className="font-medium">{walletConfig.highValue.requiredSignatures} of {walletConfig.highValue.totalOwners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Umbral:</span>
                    <span className="font-medium">$1,000 - $10,000</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Billetera Empresarial</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dirección:</span>
                    <span className="font-mono text-xs">{walletConfig.enterprise?.address ? `${walletConfig.enterprise.address.slice(0, 10)}...${walletConfig.enterprise.address.slice(-8)}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Firmas Requeridas:</span>
                    <span className="font-medium">{walletConfig.enterprise.requiredSignatures} of {walletConfig.enterprise.totalOwners}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Umbral:</span>
                    <span className="font-medium">&gt;$10,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Transactions */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Aprobaciones Pendientes ({pendingTransactions.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isConnected 
                  ? 'Firma transacciones usando tu billetera del navegador conectada'
                  : 'Conecta tu billetera del navegador para firmar transacciones'
                }
              </p>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No hay transacciones pendientes que requieran aprobación</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transactionType)}`}>
                          {transaction.transactionType?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatAmount(transaction.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.currentSignatures}/{transaction.requiredSignatures} firmas
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-gray-600">ID de Pago</div>
                        <div className="font-medium text-gray-900">{transaction.paymentId}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Destinatario</div>
                        <div className="font-mono text-xs text-gray-900">
                          {transaction.recipient ? `${transaction.recipient.slice(0, 10)}...${transaction.recipient.slice(-8)}` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Expira</div>
                        <div className="text-gray-900">{formatDate(transaction.expiresAt)}</div>
                      </div>
                    </div>

                    {transaction.concept && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600">Concepto</div>
                        <div className="text-sm text-gray-900">{transaction.concept}</div>
                      </div>
                    )}

                    {transaction.status === 'pending' && (
                      <div className="flex space-x-3">
                        {isConnected ? (
                          <>
                            <button
                              onClick={() => handleWalletSign(transaction.id, true)}
                              disabled={actionLoading === `approve-${transaction.id}`}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `approve-${transaction.id}` ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Signing...
                                </div>
                              ) : (
                                '📱 Firmar y Aprobar'
                              )}
                            </button>
                            <button
                              onClick={() => handleWalletSign(transaction.id, false)}
                              disabled={actionLoading === `reject-${transaction.id}`}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `reject-${transaction.id}` ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Rechazando...
                                </div>
                              ) : (
                                'Rechazar'
                              )}
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-gray-600 text-sm mb-2">Conecta tu billetera del navegador para firmar transacciones</p>
                            <button
                              onClick={() => setActiveTab('wallet')}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Ir a Conexión de Billetera →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximos Pagos Multi-Firma */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Próximos Pagos Multi-Firma ({upcomingPayments.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Pagos en depósito que requerirán aprobación multi-firma cuando sean liberados
              </p>
            </div>

            {upcomingPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No hay próximos pagos que requieran aprobación multi-firma</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {upcomingPayments.map((payment) => (
                  <div key={payment.paymentId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          PRÓXIMO
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {payment.walletType.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: payment.currency,
                          }).format(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ~{formatAmount(payment.amountUsd.toString())}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <div className="text-sm text-gray-600">Pagador</div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.payerEmail}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Beneficiario</div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.payeeEmail}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Hora de Liberación</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(payment.escrowEndTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.hoursUntilRelease > 0 ? `${payment.hoursUntilRelease}h restantes` : 'Listo para liberación'}
                        </div>
                      </div>
                    </div>

                    {payment.description && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600">Descripción</div>
                        <div className="text-sm text-gray-900">{payment.description}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Billetera Objetivo: <span className="font-mono">{payment.targetWallet ? `${payment.targetWallet.slice(0, 10)}...${payment.targetWallet.slice(-8)}` : 'N/A'}</span>
                      </div>
                      
                      {payment.hoursUntilRelease <= 24 && (
                        <div className="flex items-center space-x-2 text-amber-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm font-medium">Requiere atención pronto</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Pre-Approval Action Button or Status */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {payment.multisigRequestId ? (
                        /* Show multisig request status and signature buttons if it exists */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              ✅ <strong>Pre-aprobación creada</strong> - las firmas pueden recolectarse ahora
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {payment.currentSignatures || 0}/{payment.multisigRequiredSignatures || 0} firmas
                              </span>
                              <span className="text-xs text-gray-500">
                                Creado {payment.multisigCreatedAt ? formatDate(payment.multisigCreatedAt) : 'recientemente'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Signature Collection Buttons */}
                          {(payment.currentSignatures || 0) < (payment.multisigRequiredSignatures || 2) && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                💡 Conecta tu billetera para firmar esta pre-aprobación
                              </div>
                              <div className="flex space-x-2">
                                {isConnected ? (
                                  <>
                                    <button
                                      onClick={() => payment.multisigRequestId && handleWalletSign(payment.multisigRequestId, true)}
                                      disabled={actionLoading === `approve-${payment.multisigRequestId}`}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {actionLoading === `approve-${payment.multisigRequestId}` ? (
                                        <>
                                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Firmando...
                                        </>
                                      ) : (
                                        '📱 Firmar Aprobación'
                                      )}
                                    </button>
                                    <button
                                      onClick={() => payment.multisigRequestId && handleWalletSign(payment.multisigRequestId, false)}
                                      disabled={actionLoading === `reject-${payment.multisigRequestId}`}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {actionLoading === `reject-${payment.multisigRequestId}` ? 'Rechazando...' : 'Rechazar'}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={connectWallet}
                                    disabled={isConnecting}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {isConnecting ? 'Conectando...' : '🔗 Conectar Billetera'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Show completion status */}
                          {(payment.currentSignatures || 0) >= (payment.multisigRequiredSignatures || 2) && (
                            <div className="flex items-center justify-center pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-2 text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Completamente firmado - listo para ejecución cuando el depósito se libere</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Show create pre-approval button if no multisig request exists */
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            💡 <strong>Pre-aprobar ahora</strong> para habilitar liberación automática cuando llegue el momento
                          </div>
                          <button
                            onClick={() => handleCreatePreApproval(payment.paymentId)}
                            disabled={actionLoading === `pre-approve-${payment.paymentId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === `pre-approve-${payment.paymentId}` ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creando...
                              </>
                            ) : (
                              <>
                                🔐 Crear Pre-Aprobación
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stats.totalPending + stats.totalApproved + stats.totalRejected + stats.totalExpired}</div>
                <div className="text-sm text-gray-600">Transacciones Totales</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
                <div className="text-sm text-gray-600">Aprobación Pendiente</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{stats.totalApproved}</div>
                <div className="text-sm text-gray-600">Aprobadas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="text-2xl font-bold text-red-600">{stats.totalRejected}</div>
                <div className="text-sm text-gray-600">Rechazadas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{stats.totalExpired}</div>
                <div className="text-sm text-gray-600">Ejecutadas</div>
              </div>
            </div>
          )}

          {/* Approved Transactions History */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">📋 Historial de Transacciones Aprobadas</h2>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {approvedTransactions.length} completadas
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Trazabilidad completa de todas las transacciones multi-firma aprobadas</p>
            </div>
            
            <div className="p-6">
              {approvedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Aún no hay transacciones aprobadas</p>
                  <p className="text-sm text-gray-400 mt-1">Las transacciones multi-firma completadas aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedTransactions.map((transaction) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">
                                Transacción #{transaction.paymentId}
                              </span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'executed' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {transaction.status === 'executed' ? '✅ Ejecutada' : '✅ Aprobada'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {transaction.signatures?.length || 0}/{transaction.requiredSignatures} firmas
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Cantidad</div>
                              <div className="font-medium text-gray-900">
                                ${parseFloat(transaction.amount).toLocaleString()}
                                {transaction.amountUsd && (
                                  <span className="text-gray-500 ml-1">(${transaction.amountUsd.toLocaleString()} USD)</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Destinatario</div>
                              <div className="font-mono text-xs text-gray-900">
                                {transaction.recipientAddress 
                                  ? `${transaction.recipientAddress.slice(0, 10)}...${transaction.recipientAddress.slice(-8)}`
                                  : transaction.metadata?.paymentDetails?.recipientEmail || 'N/A'
                                }
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Tipo</div>
                              <div className="font-medium text-gray-900 capitalize">
                                {transaction.type || transaction.transactionType || 'Payment'}
                              </div>
                            </div>
                          </div>
                          
                          {transaction.metadata?.paymentDetails?.description && (
                            <div className="mt-2">
                              <div className="text-gray-600 text-sm">Descripción</div>
                              <div className="text-sm text-gray-900">{transaction.metadata.paymentDetails.description}</div>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span>Creado: {new Date(transaction.createdAt).toLocaleDateString()}</span>
                                {transaction.metadata?.executedAt && (
                                  <span>Ejecutado: {new Date(transaction.metadata.executedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                              {transaction.transactionHash && (
                                <div className="flex items-center space-x-2">
                                  <span>TX:</span>
                                  <span className="font-mono">
                                    {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-6)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Signatures Details */}
                          {transaction.signatures && transaction.signatures.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="text-xs text-gray-600 mb-2">Firmas:</div>
                              <div className="space-y-1">
                                {transaction.signatures.map((signature: any, idx: number) => (
                                  <div key={signature.id || idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        signature.type === 'approval' ? 'bg-green-500' : 'bg-red-500'
                                      }`}></div>
                                      <span className="font-mono text-gray-700">
                                        {signature.signerAddress.slice(0, 8)}...{signature.signerAddress.slice(-6)}
                                      </span>
                                      {signature.metadata?.signerName && (
                                        <span className="text-gray-500">({signature.metadata.signerName})</span>
                                      )}
                                    </div>
                                    <span className="text-gray-500">
                                      {new Date(signature.signedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Management Tab */}
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          <BlacklistManagement />
        </div>
      )}
    </div>
  );
};

export default MultiSigDashboard;