"use client";

import Web3PaymentDebuggerComponent from '@/components/Web3PaymentDebugger';

export default function Web3PaymentDebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Web3 Payment Debug Console
          </h1>
          <p className="text-gray-600">
            Comprehensive debugging for Portal wallet integration and MXNB payments
          </p>
        </div>
        
        <Web3PaymentDebuggerComponent />
        
        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/dashboard/nuevo-flujo"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">💰 Test Payment Flow</h4>
              <p className="text-sm text-gray-600">
                Go to the actual payment form to test the Web3 payment process
              </p>
            </a>
            
            <a
              href="/dashboard"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900 mb-2">📊 Dashboard</h4>
              <p className="text-sm text-gray-600">
                Return to the main dashboard
              </p>
            </a>
          </div>
        </div>

        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Debug Checklist
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Environment Variables:</strong> Verify all required env vars are set
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>User Authentication:</strong> Check if user is properly authenticated
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Portal SDK:</strong> Verify Portal SDK initialization
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Wallet Status:</strong> Check if Portal wallet exists and is accessible
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>MXNB Balance:</strong> Verify user has sufficient MXNB tokens
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Contract Access:</strong> Test MXNB and Escrow contract interactions
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Network Connectivity:</strong> Verify connection to Arbitrum Sepolia
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
