import React from 'react';
import FooterUrgencyCounter from './FooterUrgencyCounter';

const MXNBSection: React.FC = () => (
  <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="mxnb-heading">
    {/* Hero Section */}
    <div className="text-center mb-20">
      <h2 id="mxnb-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
        Cómo funciona MXNB y la custodia inteligente
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

    {/* Benefits Box */}
    <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-sm p-8 lg:p-12 text-center border border-blue-100">
        <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 tracking-tight">¿Por qué es revolucionario?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">🔗</span>
            <span className="text-xl font-bold text-gray-900 mb-2">Blockchain + SPEI unificado</span>
            <span className="text-base text-gray-600 font-light leading-relaxed">
              Primera plataforma que combina blockchain, stablecoins y SPEI tradicional en un solo lugar
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">💰</span>
            <span className="text-xl font-bold text-gray-900 mb-2">Reservas auditadas</span>
            <span className="text-base text-gray-600 font-light leading-relaxed">
              MXNB respaldado por reservas auditadas trimestralmente que garantizan paridad 1:1 con MXN
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">🤖</span>
            <span className="text-xl font-bold text-gray-900 mb-2">Custodia automática</span>
            <span className="text-base text-gray-600 font-light leading-relaxed">
              Smart contracts ejecutan automáticamente las condiciones sin intermediarios ni intervención manual
            </span>
          </div>
        </div>
    </div>

    {/* Call to Action Section */}
    <div className="mt-24 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-8 lg:p-12 text-center relative overflow-hidden">
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
