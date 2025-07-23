'use client';
import React, { useState } from 'react';
import TrustFocusedTemplate from '../../../components/trust/TrustFocusedTemplate';
import { FaHandshake, FaShieldAlt, FaCheckCircle, FaPercentage, FaClock, FaPlay, FaEye, FaCalculator, FaFileContract, FaUpload } from 'react-icons/fa';
import { useAnalyticsContext } from '../../../components/AnalyticsProvider';

type CommissionRecipient = {
  id: string;
  email: string;
  percentage: string;
  name?: string;
};

export default function BrokersLandingPage() {
  const { trackEvent } = useAnalyticsContext();
  const [showCommissionExample, setShowCommissionExample] = useState(false);
  const [propertyValue, setPropertyValue] = useState(2500000);
  const [apartadoPercent, setApartadoPercent] = useState(10);
  const [commissionPercent, setCommissionPercent] = useState(3);
  const [commissionRecipients, setCommissionRecipients] = useState<CommissionRecipient[]>([]);
  
  const handleEarlyAccessClick = (section: string) => {
    trackEvent('brokers_early_access_click', {
      page: 'inmobiliarias_brokers',
      section: section
    });
  };
  
  // Helper functions for commission recipients
  const addCommissionRecipient = () => {
    const newRecipient: CommissionRecipient = {
      id: Date.now().toString(),
      email: '',
      percentage: ''
    };
    setCommissionRecipients([...commissionRecipients, newRecipient]);
  };

  const removeCommissionRecipient = (id: string) => {
    setCommissionRecipients(commissionRecipients.filter(r => r.id !== id));
  };

  const updateCommissionRecipient = (id: string, field: keyof CommissionRecipient, value: string) => {
    setCommissionRecipients(commissionRecipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };
  
  // Dynamic calculations
  const apartadoAmount = (propertyValue * apartadoPercent) / 100;
  const totalCommissionAmount = (apartadoAmount * commissionPercent) / 100;
  const brokerSplitTotal = commissionRecipients.reduce((sum, r) => sum + parseFloat(r.percentage || '0'), 0);
  const mainBrokerCommission = totalCommissionAmount * (100 - brokerSplitTotal) / 100;
  const vendorAmount = apartadoAmount - totalCommissionAmount;

  // Pain points specific to brokers and agents
  const brokerPainPoints = (
    <div className="bg-red-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-red-200">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-red-800 mb-4">
          Problemas Comunes de Brokers y Agentes
        </h3>
        <p className="text-lg text-red-700 max-w-3xl mx-auto">
          Casos reales reportados en redes sociales - Protege tu reputación y comisiones
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Clientes que Desaparecen</h4>
          <p className="text-gray-700 text-sm mb-2">
            "El cliente me pidió apartar la propiedad, le dije que depositara directo al vendedor. Nunca más lo volví a ver y perdí la comisión."
          </p>
          <div className="text-xs text-gray-500">- Agente inmobiliario (45 upvotes)</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Disputas por Comisiones</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Cerré la venta pero el vendedor dice que no me va a pagar comisión porque 'el cliente llegó solo'. No tengo como comprobarlo."
          </p>
          <div className="text-xs text-gray-500">- Broker independiente</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Apartados Sin Garantía</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Mi cliente apartó con $50,000 pero el vendedor vendió a otro. Ahora mi cliente me culpa a mí por no proteger su dinero."
          </p>
          <div className="text-xs text-gray-500">- Agente CDMX</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h4 className="font-bold text-red-800 mb-2">Falta de Confianza</h4>
          <p className="text-gray-700 text-sm mb-2">
            "Los clientes no confían en depositar directo. Quieren garantías pero no sé cómo dárselas sin un banco."
          </p>
          <div className="text-xs text-gray-500">- Agente Guadalajara</div>
        </div>
      </div>
      
      <div className="bg-red-100 rounded-lg p-4 mt-6 text-center">
        <p className="text-red-800 font-semibold">Con Kustodia, estos problemas son IMPOSIBLES</p>
        <p className="text-red-700 text-sm mt-2">Tu comisión queda protegida y tus clientes confían más en ti</p>
      </div>
    </div>
  );

  const commissionExample = (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <FaHandshake className="text-green-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">División Automática de Comisiones</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Configura las comisiones y simula el envío del cobro al comprador.
      </p>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowCommissionExample(!showCommissionExample)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center gap-2"
        >
          {showCommissionExample ? (
            <>
              <FaEye className="text-lg" />
              Ocultar ejemplo
            </>
          ) : (
            <>
              <FaPlay className="text-lg" />
              Ver ejemplo interactivo
            </>
          )}
        </button>
      </div>
      
      {showCommissionExample && (
        <div className="space-y-6">
          {/* Property Value and Commission Rate Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-4">Configuración de la Propiedad</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor de la Propiedad</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2,500,000"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">MXN</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tasa de Comisión</label>
                <div className="relative">
                  <input
                    type="number"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(Number(e.target.value))}
                    className="w-full pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-semibold">Comisión Total:</span>
                <span className="text-blue-900 font-bold text-xl">${(propertyValue * commissionPercent / 100).toLocaleString('es-MX')} MXN</span>
              </div>
            </div>
          </div>
          
          {/* Buyer Email Input */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-purple-800 mb-2">Email del Comprador</label>
            <input
              type="email"
              defaultValue="comprador@email.com"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="comprador@email.com"
            />
          </div>
          
          {/* Commission Distribution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Distribución de Comisiones</h4>
              <button
                onClick={addCommissionRecipient}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                ➕ Agregar broker
              </button>
            </div>
            
            {/* Main Broker */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                  <span className="text-green-600 font-bold text-sm">{(100 - brokerSplitTotal).toFixed(0)}%</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Broker Principal</div>
                  <div className="text-sm text-gray-600">broker@inmobiliaria.com</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">${((propertyValue * commissionPercent / 100) * (100 - brokerSplitTotal) / 100).toLocaleString('es-MX')} MXN</div>
                <div className="text-sm font-medium text-gray-500">{(100 - brokerSplitTotal).toFixed(0)}% del total</div>
              </div>
            </div>
            
            {/* Additional Brokers */}
            {commissionRecipients.map((recipient, index) => (
              <div key={recipient.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                    <input
                      type="number"
                      value={recipient.percentage}
                      onChange={(e) => updateCommissionRecipient(recipient.id, 'percentage', e.target.value)}
                      className="w-8 h-8 text-xs text-center border border-gray-300 rounded"
                      min="0"
                      max="100"
                      placeholder="%"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Co-Broker</div>
                    <input
                      type="email"
                      value={recipient.email}
                      onChange={(e) => updateCommissionRecipient(recipient.id, 'email', e.target.value)}
                      className="text-sm text-gray-600 border-none p-0 focus:outline-none focus:ring-0 bg-transparent"
                      placeholder="cobroker@partner.com"
                    />
                  </div>
                  <button
                    onClick={() => removeCommissionRecipient(recipient.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕ Eliminar
                  </button>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${((propertyValue * commissionPercent / 100) * parseFloat(recipient.percentage || '0') / 100).toLocaleString('es-MX')} MXN</div>
                  <div className="text-sm font-medium text-gray-500">{recipient.percentage}% del total</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Percentage Validation */}
          {commissionRecipients.length > 0 && (
            <div className={`p-3 rounded-lg ${(100 - brokerSplitTotal) >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Total de Porcentajes: {(100 - (100 - brokerSplitTotal)).toFixed(1)}%
                </span>
                {(100 - brokerSplitTotal) >= 0 ? (
                  <span className="text-green-600">✅ Válido</span>
                ) : (
                  <span className="text-red-600">⚠️ Excede 100%</span>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300">
              💸 Simular Pago de Comisiones
            </button>
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300">
              📧 Enviar Cobro al Comprador
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Release Conditions Example Component
  const releaseConditionsExample = (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <FaFileContract className="text-purple-600 text-2xl" />
        <h3 className="text-2xl font-bold text-gray-900">Condiciones de Liberación</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Define cuándo se liberará el dinero de la custodia para proteger a todas las partes.
      </p>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Ejemplo de condiciones para Enganche:</h4>
        <p className="text-gray-700 text-sm leading-relaxed">
          "El pago se liberará cuando el contrato de compra-venta esté firmado por ambas partes y se haya entregado la documentación requerida (escrituras, identificaciones, etc.)"
        </p>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-600" />
          <span className="text-gray-700">Ambas partes deben aprobar la liberación</span>
        </div>
        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-600" />
          <span className="text-gray-700">Condiciones claras y específicas</span>
        </div>
        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-600" />
          <span className="text-gray-700">Sistema de disputas si hay desacuerdo</span>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          🔒 El dinero permanece en custodia hasta que se cumplan las condiciones acordadas
        </p>
      </div>
    </div>
  );

  // Benefits specific to brokers and agents
  const brokerBenefits = (
    <div className="bg-green-50 rounded-2xl shadow-lg p-8 mb-12 border-2 border-green-200">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-green-800 mb-4">
          Como Kustodia Potencia tu Negocio Inmobiliario
        </h3>
        <p className="text-lg text-green-700 max-w-3xl mx-auto">
          Herramientas profesionales para brokers y agentes exitosos
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaPercentage className="text-green-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Comisiones Protegidas</h4>
          <p className="text-gray-700 text-sm">
            Configura tu comisión automáticamente en cada pago. Se libera cuando se completa la transacción. 
            No más disputas por comisiones.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="text-blue-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Validación Mutua</h4>
          <p className="text-gray-700 text-sm">
            Ambas partes suben documentos y confirman que todo está correcto. 
            Proceso transparente que protege a todos los involucrados.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-purple-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Mayor Confianza</h4>
          <p className="text-gray-700 text-sm">
            Tus clientes confían más cuando ofreces pagos con custodia. 
            Diferénciate de la competencia con herramientas profesionales.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <FaClock className="text-orange-600 text-xl" />
          </div>
          <h4 className="font-bold text-green-800 mb-2">Cierres Más Rápidos</h4>
          <p className="text-gray-700 text-sm">
            Los clientes toman decisiones más rápido cuando saben que su dinero está protegido. 
            Acelera tus ventas y aumenta tu volumen.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TrustFocusedTemplate
        vertical="brokers"
        heroTitle="Cierra más ventas con pagos protegidos"
        heroSubtitle="Protege las comisiones de tus agentes y genera más confianza con tus clientes usando custodia profesional para apartados, enganches y rentas."
        heroIcon={<FaHandshake className="text-blue-700 text-4xl" />}
        customSections={[brokerPainPoints, commissionExample, releaseConditionsExample, brokerBenefits]}
        ctaText="Acceso Prioritario"
        finalCtaTitle="¿Listo para cerrar más ventas?"
        finalCtaDescription="Únete a los brokers que ya protegen sus comisiones y generan más confianza"
        useInterestForm={true}
        formSource="brokers_landing"
      />
    </>
  );
}
