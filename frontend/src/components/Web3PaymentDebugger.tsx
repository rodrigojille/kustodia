"use client";

import React, { useState } from 'react';
import { Web3PaymentDebugger, DebugResult } from '@/utils/web3PaymentDebugger';

export default function Web3PaymentDebuggerComponent() {
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [userEmail, setUserEmail] = useState('rodrigo@kustodia.mx');

  const runDebug = async () => {
    setIsDebugging(true);
    setDebugResults([]);
    
    try {
      const debugInstance = new Web3PaymentDebugger();
      const results = await debugInstance.debugFullFlow(userEmail);
      setDebugResults(results);
    } catch (error) {
      console.error('Debug failed:', error);
    } finally {
      setIsDebugging(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const summary = debugResults.length > 0 ? {
    total: debugResults.length,
    success: debugResults.filter(r => r.status === 'success').length,
    errors: debugResults.filter(r => r.status === 'error').length,
    warnings: debugResults.filter(r => r.status === 'warning').length,
  } : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🔧 Web3 Payment Debugger
        </h2>
        <p className="text-gray-600 mb-4">
          Comprehensive debugging tool for Portal wallet and MXNB payment flow
        </p>
        
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email to Debug
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user email"
            />
          </div>
          <button
            onClick={runDebug}
            disabled={isDebugging || !userEmail}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDebugging ? 'Debugging...' : 'Run Debug'}
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-700">{summary.total}</div>
              <div className="text-sm text-gray-500">Total Checks</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{summary.success}</div>
              <div className="text-sm text-green-500">Success</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
              <div className="text-sm text-red-500">Errors</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-yellow-500">Warnings</div>
            </div>
          </div>
        )}
      </div>

      {isDebugging && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-700">Running diagnostic checks...</span>
          </div>
        </div>
      )}

      {debugResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Debug Results</h3>
          {debugResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm uppercase tracking-wide">
                        {result.step.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{result.message}</p>
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {debugResults.length === 0 && !isDebugging && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Run Debug" to start comprehensive Web3 payment debugging</p>
        </div>
      )}
    </div>
  );
}
