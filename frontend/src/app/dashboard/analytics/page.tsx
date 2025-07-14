'use client';

import { useState, useEffect } from 'react';
import RevolutAnalytics from '../../../components/RevolutAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Análisis y Estadísticas</h1>
          <p className="page-description">
            Visualiza el rendimiento de tus pagos y transacciones
          </p>
        </div>

        {/* Analytics Content */}
        <div className="space-y-6">
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-primary p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
              <div className="text-sm text-gray-600">Pagos este mes</div>
            </div>
            <div className="card-primary p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$45,230</div>
              <div className="text-sm text-gray-600">Volumen total</div>
            </div>
            <div className="card-primary p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">3</div>
              <div className="text-sm text-gray-600">Pagos pendientes</div>
            </div>
          </div>

          {/* Main Analytics Component */}
          <RevolutAnalytics />

          {/* Additional Analytics Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Trends */}
            <div className="card-primary p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tendencias de Pagos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pagos completados</span>
                  <span className="font-semibold text-green-600">+12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tiempo promedio</span>
                  <span className="font-semibold text-blue-600">2.3 días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tasa de éxito</span>
                  <span className="font-semibold text-green-600">98.5%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-primary p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Pago completado</div>
                    <div className="text-xs text-gray-500">Hace 2 horas</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Nuevo pago creado</div>
                    <div className="text-xs text-gray-500">Hace 4 horas</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Pago en custodia</div>
                    <div className="text-xs text-gray-500">Hace 1 día</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="card-primary p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Exportar Datos
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </button>
              <button className="btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                </svg>
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
