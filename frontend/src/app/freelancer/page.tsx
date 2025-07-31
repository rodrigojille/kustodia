'use client';

import Header from '../../components/Header';
import { FaUserTie, FaShieldAlt, FaRocket, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import InterestRegistrationForm from '../../components/InterestRegistrationForm';
import { useEffect } from 'react';
import { useAnalyticsContext } from '../../components/AnalyticsProvider';

export default function FreelancerUseCase() {
  const { trackEvent, trackUserAction } = useAnalyticsContext();
  
  // Track page load
  useEffect(() => {
    trackEvent('freelancer_page_loaded', {
      page_type: 'use_case',
      use_case: 'freelancer',
      referrer: document.referrer || 'direct',
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
    });
  }, []);
  return (
    <>
      <header>
        <title>Pagos seguros para freelancers con blockchain | Kustodia</title>
        <meta name="description" content="Cobra seguro como freelancer: tus pagos quedan protegidos en un smart contract en la blockchain hasta que el trabajo está entregado. Evita fraudes, cobra sin riesgos y verifica tu dinero en todo momento." />
        <meta name="keywords" content="pagos seguros freelancer, escrow blockchain, evitar fraudes freelance, cobrar freelance seguro, smart contract pagos freelance, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/freelancer" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pagos seguros para freelancers con blockchain | Kustodia" />
        <meta property="og:description" content="Nunca más trabajes con miedo a no cobrar. Con Kustodia, tu pago está protegido en la blockchain hasta que el acuerdo se cumple. Seguridad, confianza y libertad para freelancers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/freelancer" />
        <meta property="og:image" content="https://kustodia.mx/og-freelancer-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pagos seguros para freelancers con blockchain | Kustodia" />
        <meta name="twitter:description" content="Nunca más trabajes con miedo a no cobrar. Con Kustodia, tu pago está protegido en la blockchain hasta que el acuerdo se cumple. Seguridad, confianza y libertad para freelancers." />
        <meta name="twitter:image" content="https://kustodia.mx/og-freelancer-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="freelancer-heading">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-5xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaUserTie className="text-blue-700 text-4xl" />
              </div>
              
              <h1 id="freelancer-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Pagos protegidos para freelancers
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                Sabemos lo que es dejarlo todo en tu trabajo, cumplir con entregas y, aun así, sentir la angustia de si vas a cobrar o no.
              </p>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                En Kustodia, queremos que nunca más trabajes con miedo. Aquí, tu esfuerzo y dedicación siempre tienen recompensa.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
                  No es un SPEI normal: tu dinero queda protegido en un smart contract hasta que ambas partes cumplen.
                </p>
                <p className="text-base md:text-lg text-blue-700">
                  Si entregas tu trabajo y subes la evidencia, y el cliente no responde, <strong>la preferencia es para ti</strong>. Kustodia protege tu pago y tu tranquilidad.
                </p>
              </div>
              
              <button
                onClick={() => {
                  trackUserAction('freelancer_cta_click', {
                    button_text: 'Registro Prioritario',
                    use_case: 'freelancer',
                    target_section: 'interest-form',
                    engagement_level: 'very_high',
                    conversion_stage: 'interest'
                  });
                  document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
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
              Ventajas para freelancers
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Trabaja con confianza, cobra con seguridad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Cero fraudes</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                El dinero queda protegido y solo se libera si ambas partes cumplen.
              </p>
            </article>
            
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaLock className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Custodia transparente</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Sigue el estado del pago en todo momento y sube evidencia de tu trabajo.
              </p>
            </article>
            
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRocket className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Pago rápido y seguro</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Recibe tu dinero sin retrasos ni sorpresas.
              </p>
            </article>
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
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Cómo sé que el dinero está seguro?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  El dinero queda bloqueado en un smart contract en la blockchain. Puedes verificar la transacción y el saldo en todo momento, sin depender de terceros.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si el cliente no confirma la entrega?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Si ambas partes no confirman, Kustodia puede intervenir como mediador y resolver la disputa según la evidencia aportada.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Cuánto cuesta usar Kustodia?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Durante el acceso anticipado, los primeros usuarios tendrán acceso prioritario exclusivo. Aprovecha la oportunidad y regístrate.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Por qué es mejor que un pago SPEI tradicional?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Kustodia utiliza lo mejor de un SPEI pero <strong className="text-gray-900">automatiza la confianza en el trato hecho</strong>. Olvídate de que te vuelvan a dejar sin un pago: aquí, tu dinero queda protegido y solo se libera cuando el acuerdo se cumple. Así, nunca más trabajas con miedo a no cobrar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interest Registration Form */}
        <section className="w-full max-w-4xl px-6 mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Te interesa proteger tus pagos como freelancer?
            </h2>
            <p className="text-lg text-gray-600">
              Regístrate para acceso temprano a pagos protegidos
            </p>
          </div>
          <div id="interest-form" className="text-center">
            <InterestRegistrationForm
              source="freelancer_landing"
              vertical="freelancer"
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
              <Link href="/blog/evitar-fraudes-freelancer" className="text-blue-600 underline hover:text-blue-800 font-semibold transition-colors ml-1">
                Cómo evitar fraudes en pagos de servicios freelance
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
