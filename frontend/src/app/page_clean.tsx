'use client';
import Head from 'next/head';
import { useState, useEffect, Suspense } from 'react';
import { FaShieldAlt, FaHeadset, FaRocket, FaLock, FaCheckCircle, FaRegSmile, FaUsers, FaChartLine } from 'react-icons/fa';
import Header from '../components/Header';
import EarlyAccessCounter from '../components/EarlyAccessCounter';
import UrgencyNotice from '../components/UrgencyNotice';
import RevealAnimation from '../components/RevealAnimation';
import VideoAvatar from '../components/VideoAvatar';
import { useAnalyticsContext } from '../components/AnalyticsProvider';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { LazySection } from '../components/LazyComponents';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const LazyVideoAvatar = dynamic(() => import('../components/VideoAvatar'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-3xl" />,
  ssr: false,
});

const LazyEarlyAccessForm = dynamic(() => import('../components/EarlyAccessForm'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const LazyFooter = dynamic(() => import('../components/Footer'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
  ssr: false,
});

const benefits = [
  {
    title: '¿Vas a pagar sin conocer al vendedor?',
    icon: <FaShieldAlt size={38} className="text-blue-600 mb-2" />,
    description: "No te arriesgues. Con Kustodia, el dinero no se mueve hasta que se cumple el acuerdo.",
    cta: "Protege tu compra"
  },
  {
    title: '¿Cansado de que te dejen plantado?',
    icon: <FaCheckCircle size={38} className="text-green-600 mb-2" />,
    description: "Asegura el cobro sin complicarte. Los compradores confían más cuando usas Kustodia.",
    cta: "Vende con seguridad"
  },
  {
    title: '¿Necesitas pagar anticipos o apartados?',
    icon: <FaLock size={38} className="text-purple-600 mb-2" />,
    description: "Protege tus anticipos, rentas o apartados. Paga con seguridad total.",
    cta: "Evita fraudes"
  }
];

export default function LandingPage() {
  const { trackUserAction } = useAnalyticsContext();

  return (
    <>
      <Head>
        <title>Kustodia - Pagos Seguros con Blockchain | Protege tu Dinero</title>
        <meta name="description" content="Kustodia protege tus pagos con tecnología blockchain. El dinero no se mueve hasta que se cumple el acuerdo. Evita fraudes en compras, ventas y anticipos." />
        <meta name="keywords" content="pagos seguros, blockchain, SPEI protegido, custodia digital, fraudes, anticipos, compras seguras" />
        <meta property="og:title" content="Kustodia - Pagos Seguros con Blockchain" />
        <meta property="og:description" content="Protege tu dinero hasta que todo salga perfecto. Sin riesgos, sin sorpresas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx" />
        <link rel="canonical" href="https://kustodia.mx" />
      </Head>

      <PerformanceMonitor />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header />
        
        {/* Hero Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto pt-32 pb-16" aria-labelledby="hero-heading">
            <div className="text-center mb-16">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <FaRocket className="w-4 h-4" />
                  Acceso Anticipado Disponible
                </div>
                
                <h1 id="hero-heading" className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                  Protege tu dinero hasta que 
                  <span className="text-blue-600 block mt-2">todo salga perfecto</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                  En un país donde millones hacen pagos sin garantías, Kustodia elimina el riesgo de fraudes. 
                  <span className="font-semibold text-gray-800"> El dinero no se mueve hasta que se cumple el acuerdo.</span>
                </p>
              </div>

              {/* Trust Indicator */}
              <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-bold">Sistema Activo</span>
                </div>
                <div className="w-px h-6 bg-green-300"></div>
                <span className="text-green-600 text-sm">
                  <span className="font-bold">Blockchain verificado</span> • Pagos protegidos 24/7
                </span>
              </div>

              {/* Video Avatar */}
              <div className="mb-16">
                <LazyVideoAvatar />
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Benefits Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="benefits-heading">
            <div className="text-center mb-16">
              <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Automatizamos la confianza
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sin tener que confiar a ciegas. Tan fácil como una transferencia bancaria, pero con control total.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {benefit.description}
                  </p>
                  <button 
                    onClick={() => trackUserAction('benefit_cta_click', { benefit: benefit.title })}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    {benefit.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </RevealAnimation>

        {/* How It Works Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="how-it-works-heading">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-xl border border-gray-200 p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  ¿Cómo funciona?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Aprobación dual única: ambas partes deben aprobar antes de liberar fondos
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Traditional vs Kustodia Comparison */}
                <div className="space-y-8">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                      ❌ Método Tradicional
                    </h3>
                    <div className="space-y-3 text-red-700">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Envías dinero sin protección</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Esperas y confías</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-semibold">¿Y si algo sale mal?</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      ✅ Con Kustodia
                    </h3>
                    <div className="space-y-3 text-green-700">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Transferencia bancaria protegida</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Aprobación dual automática</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-semibold">Liberas solo cuando todo está perfecto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Steps */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Proceso Simple
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Pago en custodia</h4>
                        <p className="text-gray-600 text-sm">Haces tu transferencia bancaria normal a Kustodia</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Recibe tu producto</h4>
                        <p className="text-gray-600 text-sm">El vendedor te entrega lo acordado</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Confirmas y liberamos</h4>
                        <p className="text-gray-600 text-sm">Solo cuando confirmes, el vendedor recibe el pago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Use Cases CTA Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="use-cases-heading">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl border border-indigo-200 p-8 md:p-12 text-center">
              <h2 id="use-cases-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perfecto para cualquier pago
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Desde comprar un auto usado hasta pagar el enganche de tu depa. Kustodia protege todo tipo de transacciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/casos-de-uso" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 inline-flex items-center gap-2"
                  onClick={() => trackUserAction('use_cases_cta_click')}
                >
                  <FaUsers className="w-5 h-5" />
                  Ver casos de uso
                </a>
                <a 
                  href="#early-access" 
                  className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-4 px-8 rounded-xl border border-indigo-200 transition-colors duration-200 inline-flex items-center gap-2"
                  onClick={() => trackUserAction('early_access_cta_click')}
                >
                  <FaRocket className="w-5 h-5" />
                  Acceso anticipado
                </a>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Early Access Section */}
        <RevealAnimation>
          <section id="early-access" className="w-full max-w-7xl px-6 mx-auto my-24" aria-labelledby="early-access-heading">
            <div className="flex justify-center w-full mb-12">
              <div className="max-w-5xl w-full">
                <UrgencyNotice />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-3xl w-full mx-auto text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <span className="text-5xl mb-6 block" role="img" aria-label="Cohete">🚀</span>
                  <h2 id="early-access-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                    Acceso anticipado a Kustodia
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
                    Únete a la revolución de los pagos seguros con tecnología blockchain y MXNB
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                      <span className="text-blue-700 font-bold text-lg">¡Acceso prioritario!</span>
                    </div>
                    <div className="text-blue-800 font-semibold text-xl">
                      Primeros en probar Kustodia
                    </div>
                    <div className="text-blue-600 text-sm mt-1">
                      Regístrate para acceso temprano exclusivo
                    </div>
                  </div>
                </div>
                
                <EarlyAccessCounter />
                <LazySection>
                  <LazyEarlyAccessForm />
                </LazySection>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Footer */}
        <LazySection>
          <LazyFooter />
        </LazySection>
      </main>
    </>
  );
}
