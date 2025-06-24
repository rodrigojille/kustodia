import React from 'react';
import FooterUrgencyCounter from './FooterUrgencyCounter';

const MXNBSection: React.FC = () => (
  <section className="w-full max-w-7xl mx-auto px-6 mb-32" aria-labelledby="mxnb-heading">
    {/* Hero Section */}
    <div className="text-center mb-20">
      <h2 id="mxnb-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Tecnología MXNB y Smart Contracts
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

    {/* Key Features */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-center">
        <div className="text-4xl mb-4" role="img" aria-label="Transparencia">🔍</div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">100% Transparente</h3>
        <p className="text-gray-600">
          Cada transacción es auditable en blockchain
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-center">
        <div className="text-4xl mb-4" role="img" aria-label="Seguridad">🛡️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Máxima Seguridad</h3>
        <p className="text-gray-600">
          Smart contracts automáticos sin intermediarios
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-center">
        <div className="text-4xl mb-4" role="img" aria-label="Velocidad">⚡</div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Instantáneo 24/7</h3>
        <p className="text-gray-600">
          Operaciones en segundos, disponible siempre
        </p>
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
