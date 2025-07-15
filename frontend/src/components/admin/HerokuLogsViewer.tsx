'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '../../utils/authFetch';

interface HerokuLog {
  timestamp: string;
  formattedTimestamp: string;
  source: string;
  dyno: string;
  message: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  rawLine: string;
}

interface HerokuLogsResponse {
  logs: HerokuLog[];
  totalLines: number;
  filteredLines: number;
  appName: string;
  timestamp: string;
}

interface HerokuDyno {
  id: string;
  name: string;
  type: string;
  size: string;
  state: string;
  created_at: string;
  updated_at: string;
  command: string;
}

interface HerokuLogsViewerProps {
  environmentOverride?: 'production' | 'local';
  logs?: HerokuLog[];
  dynos?: HerokuDyno[];
  loading?: boolean;
  error?: string | null;
  onFetchLogs?: (filters: any) => Promise<void>;
  onFetchDynos?: () => Promise<void>;
}

const HerokuLogsViewer: React.FC<HerokuLogsViewerProps> = ({ 
  environmentOverride,
  logs = [],
  dynos = [],
  loading = false,
  error = null,
  onFetchLogs,
  onFetchDynos
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState({
    lines: 100,
    level: 'all',
    source: '',
    dyno: ''
  });
  
  // Environment detection
  const isProduction = environmentOverride === 'production' || 
    (environmentOverride === undefined && typeof window !== 'undefined' && window.location.hostname === 'kustodia.mx');
  const environment = environmentOverride || (isProduction ? 'production' : 'local');

  const fetchLogs = () => {
    if (onFetchLogs) {
      onFetchLogs({
        ...filters,
        environment
      });
    }
  };

  const fetchDynos = () => {
    if (onFetchDynos && isProduction) {
      onFetchDynos();
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDynos();
  }, [filters]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, filters]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getDynoStateColor = (state: string) => {
    switch (state) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      case 'starting': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {isProduction ? 'Heroku Production Logs' : 'Local System Logs'}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isProduction 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {isProduction ? 'Producción' : 'Desarrollo'}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lines</label>
            <select
              value={filters.lines}
              onChange={(e) => setFilters(prev => ({ ...prev, lines: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={50}>50 lines</option>
              <option value={100}>100 lines</option>
              <option value={200}>200 lines</option>
              <option value={500}>500 lines</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input
              type="text"
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              placeholder="app, router, etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dyno</label>
            <input
              type="text"
              value={filters.dyno}
              onChange={(e) => setFilters(prev => ({ ...prev, dyno: e.target.value }))}
              placeholder="web.1, worker.1, etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Dynos Status - Only in production */}
      {isProduction && dynos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dyno Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynos.map(dyno => (
              <div key={dyno.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{dyno.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDynoStateColor(dyno.state)}`}>
                    {dyno.state}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Type: {dyno.type}</div>
                  <div>Size: {dyno.size}</div>
                  <div>Updated: {new Date(dyno.updated_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Logs Display */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {isProduction ? 'Production' : 'Local'} Logs ({logs.length} entries)
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading && logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading {isProduction ? 'Heroku' : 'local'} logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No logs found for the current filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <span>{log.formattedTimestamp}</span>
                        <span>•</span>
                        <span className="font-medium">{log.source}[{log.dyno}]</span>
                      </div>
                      <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                        {log.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HerokuLogsViewer;
