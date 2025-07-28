'use client';

import Header from '../../components/Header';
import { FaHandshake, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';
import InterestRegistrationForm from '../../components/InterestRegistrationForm';

export default function CompraVentaUseCase() {
  return (
    <>
      <header>
        <title>Compra-venta entre particulares | Pagos seguros con Kustodia</title>
        <meta name="description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Protege tu dinero en compras entre particulares usando pagos en custodia blockchain. Seguridad para comprador y vendedor." />
        <meta name="keywords" content="compra venta particulares, pagos seguros autos, gadgets, muebles, evitar fraudes, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/compra-venta" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Compra-venta entre particulares | Pagos seguros con Kustodia" />
        <meta property="og:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Protege tu dinero en compras entre particulares usando pagos en custodia blockchain. Seguridad para comprador y vendedor." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/compra-venta" />
        <meta property="og:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compra-venta entre particulares | Pagos seguros con Kustodia" />
        <meta name="twitter:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Protege tu dinero en compras entre particulares usando pagos en custodia blockchain. Seguridad para comprador y vendedor." />
        <meta name="twitter:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="compra-venta-heading">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-5xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaHandshake className="text-blue-700 text-4xl" />
              </div>
              
              <h1 id="compra-venta-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Compra-venta segura entre particulares
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                ¿Vas a comprar o vender algo de valor entre particulares? Con Kustodia, el dinero queda protegido hasta que ambas partes cumplan lo acordado.
              </p>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Evita fraudes en Facebook Marketplace, MercadoLibre o cualquier plataforma de venta entre particulares.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
                  El dinero solo se libera cuando ambas partes confirman que se cumplió lo acordado.
                </p>
                <p className="text-base md:text-lg text-blue-700">
                  Producto entregado, pago liberado. <strong>Protección total para compradores y vendedores</strong>.
                </p>
              </div>
              
              <button
                onClick={() => document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Registro Prioritario
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="benefits-heading">
          <div className="text-center mb-20">
            <h2 id="benefits-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ventajas para compra-venta
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Compra y vende con total seguridad y confianza
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Cero estafas</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                El dinero solo se libera cuando ambas partes confirman que todo está bien.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Tranquilidad total</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Ideal para autos, electrónicos, muebles y cualquier artículo de valor.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Confianza mutua</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Compradores y vendedores pueden hacer negocios sin miedo a fraudes.
              </p>
            </article>
          </div>
        </section>

        {/* Vehicle Transparency Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="vehicle-transparency-heading">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-12 lg:p-16 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-6">
                    <span className="text-white font-semibold text-sm">🚗 NUEVO: Transparencia Vehicular</span>
                  </div>
                  
                  <h2 id="vehicle-transparency-heading" className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Vende tu auto con historial verificado
                  </h2>
                  
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    Primera plataforma que combina pagos seguros con transparencia vehicular blockchain. 
                    Los compradores pagan hasta 15% más por vehículos con historial verificado.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaShieldAlt className="text-green-800 text-sm" />
                      </div>
                      <span className="text-white">Historial de mantenimiento en blockchain</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaShieldAlt className="text-green-800 text-sm" />
                      </div>
                      <span className="text-white">Puntuación de confianza automática</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaShieldAlt className="text-green-800 text-sm" />
                      </div>
                      <span className="text-white">NFT vehicular único e inmutable</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/compra-venta/vehiculos" 
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'click', {
                            event_category: 'Vehicle Transparency',
                            event_label: 'View Vehicle Transparency',
                            page_location: window.location.href
                          });
                        }
                      }}
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center"
                    >
                      Ver Transparencia Vehicular
                    </Link>
                    <Link 
                      href="/public/vehicle/0" 
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.gtag) {
                          window.gtag('event', 'click', {
                            event_category: 'Vehicle Transparency',
                            event_label: 'View Example Vehicle',
                            page_location: window.location.href
                          });
                        }
                      }}
                      className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 text-center"
                    >
                      Ver Ejemplo
                    </Link>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">2022 CUPRA ATECA</h3>
                      <span className="bg-green-400 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        ✅ Verificado
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-white">
                        <span className="text-blue-100">Puntuación de Confianza:</span>
                        <span className="font-semibold text-green-400">85/100</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span className="text-blue-100">Eventos Verificados:</span>
                        <span className="font-semibold">2/2</span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span className="text-blue-100">Último Mantenimiento:</span>
                        <span className="font-semibold">25 jul 2025</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/20 pt-4">
                      <h4 className="font-semibold text-white mb-3">Historial Reciente:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-sm text-blue-100">Mantenimiento - hace 2 días</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-blue-100">Creación del NFT - hace 3 días</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="faq-heading">
          <div className="text-center mb-20">
            <h2 id="faq-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Cómo funciona para una compra-venta?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  El comprador deposita el dinero en custodia, el vendedor entrega el producto, y cuando ambos confirman, el pago se libera automáticamente.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si hay problemas con el producto?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Si el producto no está como se describió, el dinero queda en custodia hasta resolver la situación entre las partes.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Es seguro para productos caros como autos?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Sí, Kustodia es ideal para transacciones de alto valor. La blockchain garantiza la transparencia y seguridad del proceso.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interest Registration Form */}
        <section className="w-full max-w-4xl px-6 mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Te interesa proteger tus compras entre particulares?
            </h2>
            <p className="text-lg text-gray-600">
              Regístrate para acceso temprano a protección segura
            </p>
          </div>
          <div id="interest-form" className="text-center">
            <InterestRegistrationForm
              source="compra_venta_landing"
              vertical="compra-venta"
              title="Registro Prioritario"
              subtitle="Regístrate para acceso prioritario exclusivo"
              buttonText="Registro Prioritario"
            />
          </div>
        </section>
        
        {/* Blog CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <p className="text-lg text-gray-600 mb-4">
              ¿Quieres saber más? Lee nuestro blog: 
              <Link href="/blog/evitar-fraudes-marketplace" className="text-blue-600 underline hover:text-blue-800 font-semibold transition-colors ml-1">
                Cómo evitar fraudes en marketplaces
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
