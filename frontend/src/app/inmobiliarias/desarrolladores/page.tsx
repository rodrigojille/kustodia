'use client';
import React from 'react';
import TrustFocusedTemplate from '../../../components/trust/TrustFocusedTemplate';
import { FaBuilding, FaShieldAlt, FaCheckCircle, FaChartLine, FaClock, FaCalculator, FaMoneyBillWave, FaPercentage } from 'react-icons/fa';
import { useState } from 'react';
import { useAnalyticsContext } from '../../../components/AnalyticsProvider';

export default function DevelopersLandingPage() {
  const { trackEvent } = useAnalyticsContext();
  
  // State for yield calculator
  const [apartadosAmount, setApartadosAmount] = useState(5000000);
  const [enganchesAmount, setEnganchesAmount] = useState(8000000);
  const [averageHoldTime, setAverageHoldTime] = useState(4);
  
  const handleEarlyAccessClick = (section: string) => {
    trackEvent('developers_early_access_click', {
      page: 'inmobiliarias_desarrolladores',
      section: section
    });
  };
  
  // Calculator functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  


  // Pain points specific to developers and sellers
  const developerPainPoints = (
    <div className="bg-red-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-red-200">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-red-800 mb-4">
          Problemas Comunes de Desarrolladores y Vendedores
        </h3>
        <p className="text-lg text-red-700 max-w-3xl mx-auto">
          Casos reales reportados en redes sociales - Protege tus ventas y reputación
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Capital Improductivo</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Tengo $15M en apartados parados en cuentas de cheques por 4-6 meses hasta escrituración. Es dinero que no me genera nada."
          </p>
          <div className="text-xs text-gray-500">- Desarrollador Guadalajara</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Cashflow Limitado</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Necesito liquidez para nuevos proyectos pero mi capital está amarrado en enganches hasta que se firmen escrituras. No puedo crecer."
          </p>
          <div className="text-xs text-gray-500">- Inmobiliaria Monterrey</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Oportunidad Perdida</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Mis $8M en apartados podrían generar $560K anuales en CETES (7%), pero están en cuentas que no dan nada. Es dinero perdido."
          </p>
          <div className="text-xs text-gray-500">- Desarrollador Puebla</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Financiamiento Caro</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Para nuevos proyectos pido créditos al 15-18% anual, pero tengo $12M en apartados que podrían financiar sin intereses."
          </p>
          <div className="text-xs text-gray-500">- Constructora CDMX</div>
        </div>
      </div>
      
      <div className="bg-green-100 rounded-lg p-4 mt-6 text-center">
        <p className="text-green-800 font-semibold">Con Kustodia, convierte estos problemas en OPORTUNIDADES</p>
        <p className="text-green-700 text-sm mt-2">Capital productivo + Rendimientos CETES + Liquidez inmediata</p>
      </div>
    </div>
  );

  // Benefits specific to developers and sellers
  const developerBenefits = (
    <div className="bg-green-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-green-200">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-green-800 mb-4">
          Optimiza tu Capital con Kustodia
        </h3>
        <p className="text-lg text-green-700 max-w-3xl mx-auto">
          Convierte capital improductivo en rendimientos CETES mientras proteges a tus compradores
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaMoneyBillWave className="text-green-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Capital Productivo</h4>
          <p className="text-gray-700 text-sm">
            Convierte apartados y enganches en capital que genera rendimientos CETES del 7% anual. 
            Tu dinero trabaja para ti mientras está en custodia.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-blue-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Liquidez Inmediata</h4>
          <p className="text-gray-700 text-sm">
            Accede a tu capital cuando lo necesites sin esperar escrituraciones. 
            Financia nuevos proyectos con los rendimientos generados.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-purple-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Ahorro en Financiamiento</h4>
          <p className="text-gray-700 text-sm">
            Evita créditos bancarios al 15-18% anual. Usa tu capital en custodia 
            para financiar proyectos con rendimientos CETES en lugar de intereses.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <FaClock className="text-orange-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Doble Beneficio</h4>
          <p className="text-gray-700 text-sm">
            Genera rendimientos CETES mientras proteges a tus compradores. 
            Optimización financiera + confianza del cliente en una sola solución.
          </p>
        </div>
      </div>
      
      <div className="bg-green-100 rounded-lg p-6 mt-8">
        <h4 className="font-bold text-green-800 mb-4 text-center">Perfecto para:</h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🏗️</div>
            <div className="font-semibold text-green-700">Desarrolladores</div>
            <div className="text-sm text-gray-600">Preventa y entrega de proyectos</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🏠</div>
            <div className="font-semibold text-green-700">Vendedores</div>
            <div className="text-sm text-gray-600">Venta de propiedades existentes</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-semibold text-green-700">Constructoras</div>
            <div className="text-sm text-gray-600">Proyectos comerciales y residenciales</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Yield Calculator Component
  const yieldCalculatorExample = (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border border-green-200 p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <FaCalculator className="text-green-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Calculadora de Rendimientos CETES</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Calcula cuánto dinero adicional generarías con tus apartados y enganches en CETES al 7% anual.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apartados promedio (MXN)
            </label>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="number" 
                value={apartadosAmount}
                onChange={(e) => setApartadosAmount(Number(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                step="500000"
                placeholder="5,000,000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Capital en apartados que tienes en promedio</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enganches promedio (MXN)
            </label>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="number" 
                value={enganchesAmount}
                onChange={(e) => setEnganchesAmount(Number(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                step="500000"
                placeholder="8,000,000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Capital en enganches que manejas</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo promedio hasta escrituración (meses)
            </label>
            <input 
              type="number" 
              value={averageHoldTime}
              onChange={(e) => setAverageHoldTime(Number(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
              max="12"
              step="1"
              placeholder="4"
            />
            <p className="text-xs text-gray-500 mt-1">Meses que el dinero está "parado"</p>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-bold text-green-800 mb-4">Rendimientos CETES (7% anual)</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-700">Capital total:</span>
              <span className="font-bold text-green-800">{formatCurrency(apartadosAmount + enganchesAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Rendimiento mensual:</span>
              <span className="font-bold text-green-800">{formatCurrency(((apartadosAmount + enganchesAmount) * 0.07) / 12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Rendimiento por periodo:</span>
              <span className="font-bold text-green-800">{formatCurrency(((apartadosAmount + enganchesAmount) * 0.07 * averageHoldTime) / 12)}</span>
            </div>
            <hr className="border-green-200" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-green-800">Rendimiento anual:</span>
              <span className="font-bold text-green-800">{formatCurrency((apartadosAmount + enganchesAmount) * 0.07)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          📈 Tu capital genera rendimientos CETES mientras está en custodia + protección para compradores
        </p>
      </div>
    </div>
  );

  const cashflowBenefits = (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          💰 Optimiza tu capital de trabajo
        </h3>
        <p className="text-lg text-gray-600">
          El verdadero beneficio: convierte apartados y enganches en capital productivo
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-green-600 text-xl">📈</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Rendimientos del 7% anual con CETES</h4>
          <p className="text-sm text-gray-600">
            Los apartados y enganches generan yields a través de CETES mientras esperan escrituración (3-6 meses promedio)
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-blue-600 text-xl">🔄</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Liquidez inmediata</h4>
          <p className="text-sm text-gray-600">
            Acceso al capital cuando lo necesites, sin esperar a que se complete la venta
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-purple-600 text-xl">🏦</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Capital de trabajo optimizado</h4>
          <p className="text-sm text-gray-600">
            Convierte dinero "muerto" en cuentas en capital productivo que financia nuevos proyectos
          </p>
        </div>
      </div>
      
      <div className="mt-8 bg-green-100 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <span className="text-green-700 text-sm font-bold">✓</span>
          </div>
          <div>
            <h5 className="font-semibold text-green-900 mb-1">Ejemplo real:</h5>
            <p className="text-green-800 text-sm">
              Desarrollador con $20M anuales en apartados → $1.4M adicionales en rendimientos CETES (7%) → Financia 10% más proyectos sin crédito bancario
            </p>
          </div>
        </div>
      </div>
    </div>
  );



  return (
    <>
      <TrustFocusedTemplate
        vertical="desarrolladores"
        heroTitle="Maximiza el cashflow de cada apartado"
        heroSubtitle="Genera rendimientos CETES + acceso inmediato a liquidez mientras esperas la escrituración. Convierte apartados en capital productivo que trabaja para ti."
        heroIcon={<FaBuilding className="text-blue-700 text-4xl" />}
        customSections={[developerPainPoints, cashflowBenefits, yieldCalculatorExample, developerBenefits]}
        ctaText="Acceso Prioritario"
        finalCtaTitle="¿Listo para optimizar tu capital de trabajo?"
        finalCtaDescription="Únete a los desarrolladores que ya generan rendimientos en sus apartados y enganches"
        useInterestForm={true}
        formSource="desarrolladores_landing"
      />
    </>
  );
}
