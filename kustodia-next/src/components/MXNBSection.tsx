import React from 'react';
import FooterUrgencyCounter from './FooterUrgencyCounter';

const MXNBSection: React.FC = () => (
  <section className="w-full max-w-7xl mx-auto px-6 mb-32" aria-labelledby="mxnb-heading">
    {/* Hero Section */}
    <div className="text-center mb-20">
      <h2 id="mxnb-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Cómo Funciona la Custodia Inteligente
      </h2>
      <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto leading-relaxed">
        MXNB es una moneda digital estable respaldada 1:1 con pesos mexicanos. 
        Los smart contracts garantizan que los fondos solo se liberen cuando ambas partes cumplen lo acordado.
      </p>
      
      <a
        href="https://mxnb.mx/es-MX/transparencia"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
      >
        Ver transparencia de MXNB
      </a>
    </div>

    {/* Smart Contract Flow */}
    <div className="mb-20">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Proceso de Custodia Inteligente</h3>
      
      {/* Flow Steps */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {/* Step 1: Deposit */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-200 transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div className="text-center pt-4">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">Depositar Fondos</h4>
              <p className="text-sm text-gray-600">
                El comprador deposita MXNB en el smart contract
              </p>
            </div>
          </div>

          {/* Step 2: Escrow */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-100 hover:border-yellow-200 transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div className="text-center pt-4">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="font-bold text-gray-900 mb-2">Custodia Segura</h4>
              <p className="text-sm text-gray-600">
                Los fondos quedan protegidos en el contrato hasta cumplir condiciones
              </p>
            </div>
          </div>

          {/* Step 3: Conditions */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:border-purple-200 transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div className="text-center pt-4">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="font-bold text-gray-900 mb-2">Validar Entrega</h4>
              <p className="text-sm text-gray-600">
                El vendedor entrega y ambas partes confirman en la plataforma
              </p>
            </div>
          </div>

          {/* Step 4: Release */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:border-green-200 transition-all">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div className="text-center pt-4">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="font-bold text-gray-900 mb-2">Liberación Automática</h4>
              <p className="text-sm text-gray-600">
                El smart contract libera los fondos al vendedor instantáneamente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Box */}
      <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 text-center">
        <h4 className="text-2xl font-bold text-gray-900 mb-6">¿Por qué es Revolucionario?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold text-gray-800">100% Automático</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🔍</span>
            <span className="font-semibold text-gray-800">Totalmente Transparente</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold text-gray-800">Instantáneo 24/7</span>
          </div>
        </div>
      </div>
    </div>

    {/* Call to Action Section */}
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
      
      <div className="relative z-10">
        <FooterUrgencyCounter />
        
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          ¿Listo para probar la custodia inteligente?
        </h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Únete a la revolución de los pagos seguros con tecnología blockchain y MXNB
        </p>
        <a href="#early-access" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] mb-4">
          Conseguir 0% comisión de por vida
        </a>
        <div className="text-sm text-gray-500 max-w-md mx-auto">
          ⏰ Oferta válida solo para los primeros 100 usuarios registrados
        </div>
      </div>
    </div>
  </section>
);

export default MXNBSection;
