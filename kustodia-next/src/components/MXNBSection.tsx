import React from 'react';
import FooterUrgencyCounter from './FooterUrgencyCounter';

const MXNBSection: React.FC = () => (
  <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="mxnb-heading">
    {/* Hero Section */}
    <div className="text-center mb-20">
      <h2 id="mxnb-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
        Cómo Funciona la Custodia Inteligente
      </h2>
      <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed mb-8">
        MXNB es una moneda digital estable respaldada 1:1 con pesos mexicanos. 
        Los smart contracts garantizan que los fondos solo se liberen cuando ambas partes cumplen lo acordado.
      </p>
      
      <a
        href="https://mxnb.mx/es-MX/transparencia"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
      >
        Ver transparencia de MXNB
      </a>
    </div>

    {/* Smart Contract Flow */}
    <div className="mb-20">
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12 tracking-tight">Proceso de Custodia Inteligente</h3>
      
      {/* Flow Steps */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Step 1: Deposit */}
          <div className="relative bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group text-center">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              1
            </div>
            <div className="pt-4">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">Depositar Fondos</h4>
              <p className="text-gray-600 text-base leading-relaxed font-light">
                El comprador deposita MXNB en el smart contract de forma segura
              </p>
            </div>
          </div>

          {/* Step 2: Escrow */}
          <div className="relative bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group text-center">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              2
            </div>
            <div className="pt-4">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">Custodia Segura</h4>
              <p className="text-gray-600 text-base leading-relaxed font-light">
                Los fondos quedan protegidos en el contrato hasta cumplir todas las condiciones
              </p>
            </div>
          </div>

          {/* Step 3: Conditions */}
          <div className="relative bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group text-center">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              3
            </div>
            <div className="pt-4">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">✅</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">Validar Condiciones</h4>
              <p className="text-gray-600 text-base leading-relaxed font-light">
                Entrega de productos, servicios completados, rentas pagadas, o cualquier condición acordada
              </p>
            </div>
          </div>

          {/* Step 4: Release */}
          <div className="relative bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group text-center">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              4
            </div>
            <div className="pt-4">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">Liberación Automática</h4>
              <p className="text-gray-600 text-base leading-relaxed font-light">
                El smart contract libera los fondos instantáneamente una vez validadas las condiciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Box */}
      <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-sm p-8 lg:p-12 text-center border border-blue-100">
        <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 tracking-tight">¿Por qué es Revolucionario?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">💰</span>
            <span className="text-xl font-bold text-gray-900 mb-2">Respaldo 1:1 con MXN</span>
            <span className="text-base text-gray-600 font-light leading-relaxed">
              Cada MXNB está respaldado por 1 peso mexicano real en bancos regulados
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">🤖</span>
            <span className="text-xl font-bold text-gray-900 mb-2">100% Automático</span>
            <span className="text-base text-gray-600 font-light leading-relaxed">
              Smart contracts ejecutan las transacciones sin intervención humana
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">🔍</span>
            <span className="text-xl font-bold text-gray-900 mb-2">Totalmente Transparente</span>
            <span className="text-base text-gray-600 font-light leading-relaxed">
              Todas las transacciones son auditables públicamente en blockchain
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Call to Action Section */}
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-8 lg:p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
      
      <div className="relative z-10">
        <FooterUrgencyCounter />
        
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          ¿Listo para probar la custodia inteligente?
        </h3>
        <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
          Únete a la revolución de los pagos seguros con tecnología blockchain y MXNB
        </p>
        <a href="#early-access" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] mb-4">
          Conseguir 0% comisión de por vida
        </a>
        <div className="text-sm text-gray-500 max-w-md mx-auto font-light">
          ⏰ Oferta válida solo para los primeros 100 usuarios registrados
        </div>
      </div>
    </div>
  </section>
);

export default MXNBSection;
