'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../utils/authFetch';

interface BridgeWalletData {
  success: boolean;
  bridgeWallet: string;
  mxnb: {
    balance: number;
    formattedBalance: string;
    symbol: string;
    name: string;
    contractAddress: string;
  };
  eth: {
    balance: number;
    formattedBalance: string;
  };
  timestamp: string;
}

export default function BridgeWalletBalance() {
  const [walletData, setWalletData] = useState<BridgeWalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await authFetch('admin/bridge-wallet-balance');
      const data = await response.json();
      
      if (data.success) {
        setWalletData(data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch balance');
      }
    } catch (err: any) {
      console.error('Error fetching bridge wallet balance:', err);
      setError('Network error fetching balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(balance);
  };

  const getBalanceColor = (balance: number) => {
    if (balance >= 50000) return 'text-green-600';
    if (balance >= 10000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance >= 50000) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (balance >= 10000) {
      return (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  if (loading && !walletData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🏦 Bridge Wallet Balance</h3>
          <button
            onClick={fetchBalance}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Retry'}
          </button>
        </div>
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (!walletData) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🏦 Bridge Wallet Balance</h3>
        <div className="flex items-center space-x-2">
          {getBalanceIcon(walletData.mxnb.balance)}
          <button
            onClick={fetchBalance}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* MXNB Balance */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">MXNB Token Balance</span>
            <span className="text-xs text-gray-500">{walletData.mxnb.symbol}</span>
          </div>
          <div className={`text-2xl font-bold ${getBalanceColor(walletData.mxnb.balance)}`}>
            {formatBalance(walletData.mxnb.balance)} MXNB
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ≈ ${formatBalance(walletData.mxnb.balance / 20)} USD
          </div>
        </div>

        {/* ETH Balance for Gas */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">ETH Balance (Gas)</span>
            <span className="text-xs text-gray-500">ETH</span>
          </div>
          <div className={`text-lg font-semibold ${walletData.eth.balance > 0.01 ? 'text-blue-600' : 'text-red-600'}`}>
            {walletData.eth.formattedBalance} ETH
          </div>
          {walletData.eth.balance <= 0.01 && (
            <div className="text-xs text-red-600 mt-1">
              ⚠️ Low gas balance - may affect transactions
            </div>
          )}
        </div>

        {/* Wallet Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            <span className="font-medium">Wallet:</span> {walletData.bridgeWallet.slice(0, 6)}...{walletData.bridgeWallet.slice(-4)}
          </div>
          <div>
            <span className="font-medium">Contract:</span> {walletData.mxnb.contractAddress.slice(0, 6)}...{walletData.mxnb.contractAddress.slice(-4)}
          </div>
          {lastUpdated && (
            <div>
              <span className="font-medium">Updated:</span> {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Balance Status Indicator */}
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              walletData.mxnb.balance >= 50000 ? 'bg-green-500' : 
              walletData.mxnb.balance >= 10000 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-600">
              {walletData.mxnb.balance >= 50000 ? 'Healthy Balance' : 
               walletData.mxnb.balance >= 10000 ? 'Moderate Balance' : 'Low Balance - Monitor Closely'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
