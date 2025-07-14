'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import PaymentsByMonthChart from './PaymentsByMonthChart';
import PaymentsByStageChart from './PaymentsByStageChart';

interface PaymentData {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_type?: string;
}

export default function RevolutAnalytics() {
  const [paymentsData, setPaymentsData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    authFetch('payments')
      .then(res => res.json())
      .then(data => {
        const payments = Array.isArray(data) ? data : (data.payments || []);
        setPaymentsData(payments);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching payments for analytics:', error);
        setLoading(false);
      });
  }, []);


  
  const periodOptions = [
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: 'all', label: 'Todo' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📊</div>
          <h2 className="text-xl font-bold text-gray-900">ANALÍTICAS DE PAGOS</h2>
        </div>
        
        {/* Period Selector */}
        <div className="relative">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payments by Month Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Pagos por Mes</h3>
          <div className="h-48">
            <PaymentsByMonthChart 
              filterStage={selectedStage} 
              onBarClick={setSelectedMonth}
              selectedMonth={selectedMonth}
            />
          </div>
        </div>

        {/* Payments by Stage Chart */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Pagos por Estado</h3>
          <div className="h-48">
            <PaymentsByStageChart 
              filterMonth={selectedMonth} 
              onSliceClick={setSelectedStage}
              selectedStage={selectedStage}
            />
          </div>
        </div>
      </div>



      {/* Interactive Features */}
      {(selectedMonth || selectedStage) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {selectedMonth && `Filtrando por mes: ${selectedMonth}`}
              {selectedMonth && selectedStage && ' • '}
              {selectedStage && `Estado: ${selectedStage}`}
            </div>
            <button
              onClick={() => {
                setSelectedMonth(null);
                setSelectedStage(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
