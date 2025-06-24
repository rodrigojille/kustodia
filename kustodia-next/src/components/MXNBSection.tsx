import React from 'react';
import FooterUrgencyCounter from './FooterUrgencyCounter';

const MXNBSection: React.FC = () => (
  <section className="w-full max-w-7xl mx-auto px-6 mb-32" aria-labelledby="mxnb-heading">
    {/* Hero Section */}
    <div className="text-center mb-20">
      <h2 id="mxnb-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
        ¿Qué es MXNB y cómo funcionan los smart contracts?
      </h2>
      <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
        MXNB es una moneda digital estable, respaldada 1:1 con pesos mexicanos, que permite realizar pagos y custodia de dinero de forma segura, rápida y transparente.
      </p>
      <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
        En Kustodia, usamos smart contracts para garantizar que los fondos solo se liberen cuando ambas partes cumplen lo acordado, brindando máxima protección y confianza en cada operación.
      </p>
      
      <a
        href="https://mxnb.mx/es-MX/transparencia"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
      >
        Más sobre transparencia de MXNB
      </a>
    </div>

    {/* Section 1: Transparency & Security */}
    <div className="mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" role="img" aria-label="Transparencia">🔍</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparencia Total</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Puedes verificar en todo momento la existencia y respaldo de MXNB. Cada transacción es visible en blockchain y auditable por cualquier persona.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" role="img" aria-label="Seguridad">🛡️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Máxima Seguridad</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Tus fondos están protegidos y custodiados hasta que ambas partes estén de acuerdo. Sin intermediarios, sin riesgos.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-6" role="img" aria-label="Escudo protector">🔐</div>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">100% Respaldado</h4>
            <p className="text-xl text-gray-600 leading-relaxed">
              Cada MXNB está respaldado 1:1 con pesos mexicanos en cuentas bancarias verificables
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Section 2: Automation & Reliability */}
    <div className="mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 text-center relative overflow-hidden lg:order-1">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-100 rounded-full -ml-16 -mb-16 opacity-30" aria-hidden="true"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-6" role="img" aria-label="Automatización">⚡</div>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Automático e Inteligente</h4>
            <p className="text-xl text-gray-600 leading-relaxed">
              Los smart contracts ejecutan las condiciones automáticamente, sin intervención humana
            </p>
          </div>
        </div>
        
        <div className="space-y-8 lg:order-2">
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" role="img" aria-label="Automatización">⚙️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Automatización Completa</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Los smart contracts aseguran que los pagos se liberen solo cuando se cumplen las condiciones pactadas, sin intermediarios.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" role="img" aria-label="Fiabilidad">✅</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Confianza Garantizada</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  No hay trucos ni sorpresas: todo es automático, transparente y verificable en tiempo real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section 3: Autonomy & Speed */}
    <div className="mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" role="img" aria-label="Autonomía">🤖</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Autonomía Total</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Las reglas se cumplen solas, sin personas de por medio. El código es la ley, eliminando la posibilidad de manipulación.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl" role="img" aria-label="Velocidad">⚡</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Velocidad Instantánea</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Pagos y liberaciones de fondos en segundos, no en días. La tecnología blockchain permite operaciones instantáneas 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-6" role="img" aria-label="Rapidez">🚀</div>
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Operaciones 24/7</h4>
            <p className="text-xl text-gray-600 leading-relaxed">
              Sin horarios bancarios ni días festivos. Tu dinero disponible cuando lo necesites
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Call to Action Section */}
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 text-center relative overflow-hidden">
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
