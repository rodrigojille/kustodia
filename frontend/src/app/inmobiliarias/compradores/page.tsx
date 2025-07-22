'use client';
import React from 'react';
import TrustFocusedTemplate from '../../../components/trust/TrustFocusedTemplate';
import { FaHome, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaHandshake, FaLock, FaClock, FaEye, FaMoneyBillWave } from 'react-icons/fa';
import { useAnalyticsContext } from '../../../components/AnalyticsProvider';

export default function BuyersLandingPage() {
  const { trackEvent } = useAnalyticsContext();
  
  const handleEarlyAccessClick = (section: string) => {
    trackEvent('buyers_early_access_click', {
      page: 'inmobiliarias_compradores',
      section: section
    });
  };

  // Pain points specific to buyers
  const buyerPainPoints = (
    <div className="bg-red-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-red-200">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-red-800 mb-4">
          Fraudes Comunes Contra Compradores
        </h3>
        <p className="text-lg text-red-700 max-w-3xl mx-auto">
          Casos reales reportados en redes sociales - Protege tu patrimonio
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Transferencias Falsas</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Me mandaron comprobante de $8,000 pesos por renta, pero era falso. No aparecía en Banxico. Perdí el apartado."
          </p>
          <div className="text-xs text-gray-500">- Usuario redes sociales (58 upvotes)</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Vendedores Fantasma</h4>
          <p className="text-gray-700 text-sm mb-2">
            "El 'propietario' desapareció con mi anticipo. La casa ni siquiera era suya. No había forma de recuperar mi dinero."
          </p>
          <div className="text-xs text-gray-500">- Caso común reportado</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Documentos Falsos</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Las escrituras eran falsas. Perdí $500,000 pesos de enganche. Nunca recuperé mi dinero."
          </p>
          <div className="text-xs text-gray-500">- Reporte frecuente</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Desarrolladores Quebrados</h4>
          <p className="text-gray-700 text-sm mb-2">
            "La constructora quebró antes de entregar. Nunca recuperé mi dinero ni obtuve mi casa."
          </p>
          <div className="text-xs text-gray-500">- Caso documentado</div>
        </div>
      </div>
      
      <div className="bg-red-100 rounded-lg p-4 mt-6 text-center">
        <p className="text-red-800 font-semibold">Con Kustodia, estos fraudes son IMPOSIBLES</p>
        <p className="text-red-700 text-sm mt-2">Tu dinero se mantiene seguro hasta que TODO esté verificado y correcto</p>
      </div>
    </div>
  );

  // Benefits specific to buyers
  const buyerBenefits = (
    <div className="bg-green-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-green-200">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-green-800 mb-4">
          Compra tu Casa con Total Seguridad
        </h3>
        <p className="text-lg text-green-700 max-w-3xl mx-auto">
          Protección completa para apartados, enganches, rentas y compraventas
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaLock className="text-green-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Apartados Protegidos</h4>
          <p className="text-gray-700 text-sm">
            Tu apartado queda en custodia hasta que se firme el contrato final. 
            Si algo sale mal, recuperas tu dinero completo.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-blue-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Enganches Seguros</h4>
          <p className="text-gray-700 text-sm">
            Tu enganche se libera solo cuando recibas las escrituras y llaves. 
            Protección total contra desarrolladores fraudulentos.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-purple-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Rentas Garantizadas</h4>
          <p className="text-gray-700 text-sm">
            El depósito de renta se mantiene seguro hasta que confirmes que todo está en orden. 
            No más estafas con propiedades inexistentes.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-orange-600 font-bold">⚖️</span>
          </div>
          <h4 className="font-bold text-green-800 mb-2">Disputas a tu Favor</h4>
          <p className="text-gray-700 text-sm">
            Si hay problemas, nuestro sistema de disputas protege al comprador. 
            Tu dinero regresa si la disputa se resuelve en tu favor.
          </p>
        </div>
      </div>
      
      <div className="bg-green-100 rounded-lg p-6 mt-8">
        <h4 className="font-bold text-green-800 mb-4 text-center">Tipos de Transacciones Protegidas:</h4>
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-green-700">Apartados</div>
            <div className="text-sm text-gray-600">Reserva tu propiedad</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-green-700">Enganches</div>
            <div className="text-sm text-gray-600">Pago inicial seguro</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-green-700">Rentas</div>
            <div className="text-sm text-gray-600">Depósitos protegidos</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-green-700">Compraventas</div>
            <div className="text-sm text-gray-600">Pago total seguro</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Payment Tracking Component
  const paymentTrackingExample = (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <FaEye className="text-blue-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Seguimiento en Tiempo Real</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Mantente informado del progreso de tu transacción con actualizaciones en tiempo real.
      </p>
      
      <div className="space-y-4 mb-6">
        {[
          { step: 'Pago creado', amount: '$50,000', status: 'completed', time: 'Hace 2 días', statusLabel: 'Pendiente' },
          { step: 'Pago financiado', amount: '', status: 'completed', time: 'Hace 1 día', statusLabel: 'Financiado' },
          { step: 'En custodia', amount: '', status: 'current', time: 'En progreso', statusLabel: 'En custodia' },
          { step: 'Condiciones cumplidas', amount: '', status: 'pending', time: 'Pendiente', statusLabel: 'Completado' }
        ].map((item, index) => (
          <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
            item.status === 'completed' ? 'bg-green-50 border-green-200' :
            item.status === 'current' ? 'bg-blue-50 border-blue-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.status === 'completed' ? 'bg-green-100' :
                item.status === 'current' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                {item.status === 'completed' ? (
                  <FaCheckCircle className="text-green-600 text-sm" />
                ) : item.status === 'current' ? (
                  <FaClock className="text-blue-600 text-sm" />
                ) : (
                  <FaClock className="text-gray-400 text-sm" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{item.step}</div>
                {item.amount && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <FaMoneyBillWave className="text-xs" />
                    {item.amount}
                  </div>
                )}
              </div>
            </div>
            <span className={`text-sm font-medium ${
              item.status === 'completed' ? 'text-green-600' :
              item.status === 'current' ? 'text-blue-600' :
              'text-gray-500'
            }`}>
              {item.time}
            </span>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          🔔 Consulta el estado de tu pago en tiempo real desde tu dashboard
        </p>
      </div>
    </div>
  );

  return (
    <>
      <TrustFocusedTemplate
        vertical="inmobiliarias"
        heroTitle="Compra tu casa sin riesgo de fraude"
        heroSubtitle="Protege tus apartados, enganches y rentas con custodia segura. Tu dinero solo se libera cuando TODO esté verificado y correcto."
        heroIcon={<FaHome className="text-blue-700 text-4xl" />}
        customSections={[buyerPainPoints, paymentTrackingExample, buyerBenefits]}
        ctaText="Proteger mi compra gratis"
        finalCtaTitle="¿Listo para comprar sin riesgo?"
        finalCtaDescription="Únete a los mexicanos que ya protegen sus compras inmobiliarias"
      />
    </>
  );
}
