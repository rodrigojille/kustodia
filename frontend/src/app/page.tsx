'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { FaShieldAlt, FaHeadset, FaRocket, FaLock, FaCheckCircle } from 'react-icons/fa';
import { ArcadeEmbed } from '../components/ArcadeEmbed';
import ApiSneakPeek from '../components/ApiSneakPeek';
import CasosDeUso from '../components/CasosDeUso';
import Header from '../components/Header';
import MXNBSection from '../components/MXNBSection';
import EarlyAccessCounter from '../components/EarlyAccessCounter';
import EarlyAccessForm from '../components/EarlyAccessForm';
import UrgencyNotice from '../components/UrgencyNotice';
import RevealAnimation from '../components/RevealAnimation';
import VideoAvatar from '../components/VideoAvatar';
import { useAnalyticsContext } from '../components/AnalyticsProvider';

const benefits = [
  {
    title: "Tan fácil como un SPEI, pero con tus condiciones",
    icon: <FaRocket className="text-blue-700 text-3xl" />,
    description: "Haz pagos como siempre. No necesitas aprender nada nuevo.",
    subtext: '',
  },
  {
    title: 'Control total',
    icon: <FaShieldAlt size={38} className="text-blue-600 mb-2" />,
    description: 'Tú decides cuándo se libera el dinero. Protege cada paso de tu operación.',
    subtext: '',
  },
  {
    title: 'Seguridad real',
    icon: <FaLock size={38} className="text-blue-600 mb-2" />,
    description: 'Protege enganches, rentas y ventas: el dinero solo se libera como acordado.',
    subtext: '',
  },
  {
    title: 'Soporte humano',
    icon: <FaHeadset size={38} className="text-blue-600 mb-2" />,
    description: 'Te acompañamos en cada paso. Cualquier duda, estamos aquí.',
    subtext: '',
  },
];

export default function LandingPage() {
  // 📊 ANALYTICS: Initialize landing page tracking
  const { trackEvent, trackUserAction } = useAnalyticsContext();
  
  // TODO: Replace with real auth state
  const isAuthenticated = false;
  const userName = '';
  const [currentExample, setCurrentExample] = useState(1);
  
  // 📊 Track landing page load and customer journey start
  useEffect(() => {
    trackEvent('landing_page_loaded', {
      journey_stage: 'awareness',
      has_auth: isAuthenticated,
      referrer: document.referrer || 'direct',
      utm_source: new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
    });
  }, []);

  const showExample = (num: number) => {
    setCurrentExample(num);
    
    // 📊 ANALYTICS: Track carousel manual navigation
    trackUserAction('carousel_navigation', {
      example_number: num,
      interaction_type: 'manual_select'
    });
  };

  // Handle hash navigation on page load
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash === '#use-cases') {
        setTimeout(() => {
          const element = document.getElementById('use-cases-heading');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100); // Small delay to ensure page is fully loaded
      }
    };

    // Handle on initial load
    handleHashNavigation();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  const nextExample = () => {
    const next = currentExample === 3 ? 1 : currentExample + 1;
    setCurrentExample(next);
    
    // 📊 ANALYTICS: Track carousel next navigation
    trackUserAction('carousel_navigation', {
      example_number: next,
      interaction_type: 'next_button'
    });
  };

  const prevExample = () => {
    const prev = currentExample === 1 ? 3 : currentExample - 1;
    setCurrentExample(prev);
    
    // 📊 ANALYTICS: Track carousel prev navigation
    trackUserAction('carousel_navigation', {
      example_number: prev,
      interaction_type: 'prev_button'
    });
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(nextExample, 5000);
    return () => clearInterval(interval);
  }, [currentExample]);

  return (
    <>
       <Head>
        <title>Kustodia - Pagos Inteligentes, Custodia y SPEI Seguro con Blockchain</title>
        <meta name="description" content="Kustodia: pagos inteligentes, custodia y SPEI seguro con tecnología blockchain. Protege tus operaciones y paga solo cuando todo sale bien. ¡Regístrate gratis!" />
        <meta name="keywords" content="custodia digital, pagos seguros México, blockchain México, SPEI seguro, escrow digital, pagos inteligentes, fintech México, MXNB" />
        <meta name="author" content="Kustodia México" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="es-MX" />
        <meta name="language" content="Spanish" />
        <meta name="geo.region" content="MX" />
        <meta name="geo.country" content="México" />
        <meta name="geo.placename" content="Ciudad de México" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kustodia" />
        <meta property="og:title" content="Kustodia - Pagos Inteligentes, Custodia y SPEI Seguro con Blockchain" />
        <meta property="og:description" content="Kustodia: pagos inteligentes, custodia y SPEI seguro con tecnología blockchain. Protege tus operaciones y paga solo cuando todo sale bien." />
        <meta property="og:image" content="https://kustodia.mx/kustodia-og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/" />
        <meta property="og:locale" content="es_MX" />
        <meta property="og:site_name" content="Kustodia" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kustodia - Pagos Inteligentes y Seguros en México" />
        <meta name="twitter:description" content="Kustodia es la plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien." />
        <meta name="twitter:image" content="https://kustodia.mx/kustodia-og.png" />
        <meta name="twitter:creator" content="@kustodia_mx" />
        <meta name="twitter:site" content="@kustodia_mx" />
        <link rel="canonical" href="https://kustodia.mx/" />
        <link rel="alternate" hrefLang="es-MX" href="https://kustodia.mx/" />
        <link rel="alternate" hrefLang="es" href="https://kustodia.mx/" />
        <link rel="alternate" hrefLang="x-default" href="https://kustodia.mx/" />
        <link rel="icon" href="/kustodia-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/kustodia-logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/kustodia-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/kustodia-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Kustodia',
          url: 'https://kustodia.mx/',
          logo: '/kustodia-og.png',
          sameAs: [
            'https://x.com/Kustodia_mx',
            'https://instagram.com/kustodia_mx'
          ],
          description: 'Plataforma líder en pagos inteligentes y custodia digital con tecnología blockchain en México',
          foundingDate: '2024',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['Spanish', 'English']
          },
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'MX',
            addressRegion: 'M├®xico'
          }
        }) }} />
        
        {/* WebSite Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Kustodia',
          url: 'https://kustodia.mx/',
          description: 'Pagos inteligentes, custodia y SPEI seguro con tecnología blockchain en México',
          inLanguage: 'es-MX',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://kustodia.mx/?q={search_term}',
            'query-input': 'required name=search_term'
          }
        }) }} />
        
        {/* Service Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Custodia Digital y Pagos Seguros',
          provider: {
            '@type': 'Organization',
            name: 'Kustodia'
          },
          description: 'Servicio de custodia digital inteligente que protege pagos y transacciones usando tecnología blockchain y MXNB',
          serviceType: 'Financial Technology',
          areaServed: {
            '@type': 'Country',
            name: 'México'
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Servicios de Custodia Digital',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Custodia de Pagos para E-commerce'
                }
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Protección de Transacciones Inmobiliarias'
                }
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Custodia para Freelancers y Servicios'
                }
              }
            ]
          }
        }) }} />
        
        {/* LocalBusiness Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Kustodia',
          image: '/kustodia-og.png',
          url: 'https://kustodia.mx/',
          telephone: '+52 55 1234 5678',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle 123, Colonia Centro',
            addressLocality: 'Ciudad de M├®xico',
            addressRegion: 'M├®xico',
            postalCode: '12345',
            addressCountry: 'MX'
          },
          openingHours: 'Mo-Fr 09:00-18:00',
          sameAs: [
            'https://x.com/Kustodia_mx',
            'https://instagram.com/kustodia_mx'
          ],
          review: {
            '@type': 'Review',
            reviewBody: 'Excelente servicio de custodia digital. Me siento seguro con mis pagos.',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5',
              worstRating: '1'
            },
            author: {
              '@type': 'Person',
              name: 'Juan P├®rez'
            }
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '19.4326',
            longitude: '-99.1332'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            bestRating: '5',
            worstRating: '1',
            ratingCount: '100'
          }
        }) }} />
      </Head>
      
      <Header userName={userName} isAuthenticated={isAuthenticated} />
      
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        
        {/* Hero Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24 mt-20" aria-labelledby="hero-heading">
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl">
                {/* Trust indicator badge */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium px-6 py-3 rounded-full border border-blue-200 mb-8 shadow-sm">
                  🔒 Servicio de custodia digital mediante blockchain
                </div>
                
                <h1 id="hero-heading" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-gray-900 leading-[0.95] max-w-6xl mx-auto text-center tracking-tight">
                  Pagos seguros: 
                  <span className="text-blue-600"> tu dinero solo se libera</span> cuando se cumple el trato.
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-500 mb-16 max-w-4xl mx-auto font-light leading-relaxed text-center">
                  Protege compras, ventas o servicios. <span className="font-medium text-gray-700">Sin riesgos de fraudes.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <a href="#early-access" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] min-w-[320px]" aria-describedby="cta-description">
                    Registro prioritario exclusivo
                  </a>
                  <div id="cta-description" className="text-base text-gray-500 flex items-center gap-3 font-medium">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
                    Acceso prioritario exclusivo
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Benefits Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="benefits-heading">
            <div className="text-center mb-20">
              <h2 id="benefits-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                ¿Por qué elegir Kustodia?
              </h2>
              <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
                La forma más segura y simple de proteger tus pagos en México
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" role="list">
              {benefits.map((benefit, index) => (
                <RevealAnimation key={benefit.title} delay={index * 0.1} direction="up">
                  <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group h-80" role="listitem">
                    <div className="mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" aria-hidden="true">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight min-h-[3.5rem] flex items-center justify-center">
                      {benefit.title}
                    </h3>
                    {benefit.subtext && (
                      <div className="text-base text-blue-600 mb-3 font-medium">{benefit.subtext}</div>
                    )}
                    <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light flex-1 flex items-center justify-center">
                      {benefit.description}
                    </p>
                  </article>
                </RevealAnimation>
              ))}
            </div>
          </section>
        </RevealAnimation>

        {/* Video Avatar Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="video-avatar-heading">
            <div className="text-center mb-16">
              <h2 id="video-avatar-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Conoce cómo funciona
              </h2>
              <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
                Nuestro equipo te explica paso a paso cómo proteger tus pagos
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
              {/* Video Avatar */}
              <div className="flex-1 max-w-md">
                <VideoAvatar 
                  title="Tu asesor digital"
                  subtitle="Haz clic para que te explique paso a paso cómo protegemos tus pagos."
                  muted={true}
                />
              </div>
              
              {/* Supporting Content */}
              <div className="flex-1 max-w-lg">
                <div className="space-y-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 font-bold shadow-lg">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Haces un SPEI como siempre, pero con tus condiciones</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Realiza el pago como lo harías normalmente, pero con la seguridad de que tus condiciones se cumplirán.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 font-bold shadow-lg">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Custodia Inteligente</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Los fondos se quedan protegidos en una custodia inteligente hasta cumplir las condiciones acordadas.
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 font-bold shadow-lg">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Validar condiciones</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Se valida la entrega de productos, servicios, o cualquier condición acordada.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 font-bold shadow-lg">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Liberación Inteligente</h3>
                      <p className="text-gray-600 leading-relaxed">
                        La custodia inteligente libera los fondos al vendedor de forma automática e instantánea.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Product Demo Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="demo-heading">
            <div className="text-center mb-20">
              <h2 id="demo-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Así funciona Kustodia
              </h2>
              <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
                Ejemplos reales de transacciones que podemos habilitar
              </p>
            </div>
            
            {/* Carousel Container */}
            <div className="relative max-w-4xl mx-auto">
              
              {/* Example 1: iPhone */}
              <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-100 carousel-item transition-all duration-500 ease-in-out ${currentExample === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}`} id="example-1">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">K</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold">Pago Completado</h3>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ✅ Liberado
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          iPhone 15 Pro 256GB
                        </h4>
                        <p className="text-gray-600 mb-1">ID: #KUS-2024-081</p>
                        <p className="text-sm text-gray-500">Ref: APPLE-IPHONE15PRO-256GB</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl md:text-4xl font-bold text-green-600">$25,000 MXN</div>
                        <div className="text-sm text-gray-500">Liberado en 24 horas</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Cronología</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">Ô£ô</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Pago en custodia</div>
                            <div className="text-xs text-gray-600">15 de enero, 2:30 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">📦</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Envío confirmado</div>
                            <div className="text-xs text-gray-600">15 de enero, 4:15 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">🚚</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">En tránsito</div>
                            <div className="text-xs text-gray-600">15 de enero, 6:00 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">🏠</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Entrega confirmada</div>
                            <div className="text-xs text-gray-600">16 de enero, 11:30 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">$</span>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">Liberación final</div>
                            <div className="text-xs text-gray-600">16 de enero, 2:30 PM - $25,000 MXN</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Comprador:</span>
                        <div className="font-semibold">María G. López</div>
                        <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Verificado</div>
                        <div className="text-xs text-gray-500">CLABE: ****9847</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vendedor:</span>
                        <div className="font-semibold">TechStore México</div>
                        <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Tienda oficial</div>
                        <div className="text-xs text-gray-500">CLABE: ****2156</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h6 className="font-semibold text-blue-800 mb-3">Detalles de la transacción</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Comisión Kustodia:</span>
                          <div className="font-semibold text-green-600 ml-2">
                            <div className="text-lg">👑 Acceso prioritario exclusivo</div>
                            <div className="text-xs text-gray-500 line-through">Tarifa regular: 2.5% - $625 MXN</div>
                            <div className="text-xs text-green-600 font-bold">Ahorras: $625 MXN</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Periodo custodia:</span>
                          <span className="font-semibold text-gray-900 ml-2">24 horas</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Verificación:</span>
                          <span className="font-semibold text-gray-900 ml-2">Entrega + Confirmación</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Blockchain TX:</span>
                          <span className="font-semibold text-gray-900 ml-2">0x8f2a9...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        Transacción verificada en blockchain
                      </p>
                      <a href="https://sepolia.arbiscan.io/address/0xa5b45dc1cf2e44844eba557df29687d24f5d8543" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                        Ver contrato inteligente en Arbitrum
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 2: Car */}
              <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl p-6 md:p-8 border border-green-100 carousel-item transition-all duration-500 ease-in-out ${currentExample === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}`} id="example-2">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">K</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold">Pago Completado</h3>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ✅ Liberado
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          Honda Civic 2022
                        </h4>
                        <p className="text-gray-600 mb-1">ID: #KUS-2024-092</p>
                        <p className="text-sm text-gray-500">VIN: JHMFC1F39MX123456</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl md:text-4xl font-bold text-green-600">$385,000 MXN</div>
                        <div className="text-sm text-gray-500">Liberado en 7 días</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Cronología</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">Ô£ô</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Apartado vehicular</div>
                            <div className="text-xs text-gray-600">20 de enero, 10:00 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">🔧</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Inspección mecánica</div>
                            <div className="text-xs text-gray-600">22 de enero, 2:00 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">📄</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Documentos verificados</div>
                            <div className="text-xs text-gray-600">24 de enero, 11:00 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">🚗</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Entrega del vehículo</div>
                            <div className="text-xs text-gray-600">26 de enero, 9:30 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">$</span>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">Liberación final</div>
                            <div className="text-xs text-gray-600">27 de enero, 3:00 PM - $385,000 MXN</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Comprador:</span>
                        <div className="font-semibold">Carlos Mendoza</div>
                        <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Verificado</div>
                        <div className="text-xs text-gray-500">CLABE: ****3421</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vendedor:</span>
                        <div className="font-semibold">AutoMax Seminuevos</div>
                        <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Distribuidor autorizado</div>
                        <div className="text-xs text-gray-500">CLABE: ****7890</div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4">
                      <h6 className="font-semibold text-green-800 mb-3">Detalles de la transacción</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Comisión Kustodia:</span>
                          <div className="font-semibold text-green-600 ml-2">
                            <div className="text-lg">👑 Acceso prioritario exclusivo</div>
                            <div className="text-xs text-gray-500 line-through">Tarifa regular: 1.5% - $5,775 MXN</div>
                            <div className="text-xs text-green-600 font-bold">Ahorras: $5,775 MXN</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Periodo custodia:</span>
                          <span className="font-semibold text-gray-900 ml-2">5 días hábiles</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Verificación:</span>
                          <span className="font-semibold text-gray-900 ml-2">Inspección + Documentos</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Blockchain TX:</span>
                          <span className="font-semibold text-gray-900 ml-2">0x9c4b8...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        Transacción verificada en blockchain
                      </p>
                      <a href="https://sepolia.arbiscan.io/address/0xa5b45dc1cf2e44844eba557df29687d24f5d8543" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-green-600 hover:text-green-800 text-sm font-medium underline">
                        Ver contrato inteligente en Arbitrum
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 3: Real Estate */}
              <div className={`bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl p-6 md:p-8 border border-purple-100 carousel-item transition-all duration-500 ease-in-out ${currentExample === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}`} id="example-3">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">K</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold">Pago Completado</h3>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ✅ Liberado
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                          Enganche Apartamento Polanco
                        </h4>
                        <p className="text-gray-600 mb-1">ID: #KUS-2024-103</p>
                        <p className="text-sm text-gray-500">Folio: POL-2BR-85M2-2024</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl md:text-4xl font-bold text-green-600">$2,500,000 MXN</div>
                        <div className="text-sm text-gray-500">Enganche por 30 días</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Cronología</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">Ô£ô</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Apartado inmobiliario</div>
                            <div className="text-xs text-gray-600">1 de febrero, 11:00 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">🏠</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Avaluación inmobiliaria</div>
                            <div className="text-xs text-gray-600">8 de febrero, 4:00 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">📄</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Documentos revisados</div>
                            <div className="text-xs text-gray-600">15 de febrero, 1:30 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Promesa de compraventa</div>
                            <div className="text-xs text-gray-600">28 de febrero, 10:00 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">$</span>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">Liberación final</div>
                            <div className="text-xs text-gray-600">3 de marzo, 3:00 PM - $2,500,000 MXN</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Comprador:</span>
                        <div className="font-semibold">Ana Patricia Silva</div>
                        <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Verificado</div>
                        <div className="text-xs text-gray-500">CLABE: ****5678</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vendedor:</span>
                        <div className="font-semibold">Inmobiliaria Polanco</div>
                        <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ Inmobiliaria certificada</div>
                        <div className="text-xs text-gray-500">CLABE: ****9012</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h6 className="font-semibold text-purple-800 mb-3">Detalles de la transacción</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Comisión Kustodia:</span>
                          <div className="font-semibold text-green-600 ml-2">
                            <div className="text-lg">👑 Acceso prioritario exclusivo</div>
                            <div className="text-xs text-gray-500 line-through">Tarifa regular: 2% - $50,000 MXN</div>
                            <div className="text-xs text-green-600 font-bold">Ahorras: $50,000 MXN</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Periodo custodia:</span>
                          <span className="font-semibold text-gray-900 ml-2">30 días</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Verificación:</span>
                          <span className="font-semibold text-gray-900 ml-2">Avalúo + Notarización</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Blockchain TX:</span>
                          <span className="font-semibold text-gray-900 ml-2">0xa7f3c...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        Transacción verificada en blockchain
                      </p>
                      <a href="https://sepolia.arbiscan.io/address/0xa5b45dc1cf2e44844eba557df29687d24f5d8543" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-purple-600 hover:text-purple-800 text-sm font-medium underline">
                        Ver contrato inteligente en Arbitrum
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevExample}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
                aria-label="Ver ejemplo anterior"
                type="button"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button 
                onClick={nextExample}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
                aria-label="Ver siguiente ejemplo"
                type="button"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center mt-8 gap-3" role="tablist" aria-label="Seleccionar ejemplo">
                <button 
                  onClick={() => showExample(1)} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${currentExample === 1 ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Ver ejemplo iPhone 15 Pro"
                  role="tab"
                  aria-selected={currentExample === 1}
                  type="button"
                />
                <button 
                  onClick={() => showExample(2)} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${currentExample === 2 ? 'bg-green-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Ver ejemplo Honda Civic 2022"
                  role="tab"
                  aria-selected={currentExample === 2}
                  type="button"
                />
                <button 
                  onClick={() => showExample(3)} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${currentExample === 3 ? 'bg-purple-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label="Ver ejemplo apartamento en Polanco"
                  role="tab"
                  aria-selected={currentExample === 3}
                  type="button"
                />
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* CETES Yield Generation Section */}
        {false && (
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="yield-heading">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl shadow-xl border border-amber-200 p-8 md:p-12 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100 rounded-full -mr-20 -mt-20 opacity-30" aria-hidden="true"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-100 rounded-full -ml-16 -mb-16 opacity-30" aria-hidden="true"></div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <span className="text-5xl mb-6 block" role="img" aria-label="Cohete">­ƒÜÇ</span>
                  <h2 id="yield-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                    Tus pagos en custodia ahora <span className="text-amber-600">podr├ín generar rendimientos</span>
                  </h2>
                  
                  <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed mb-8">
                    Mientras tu dinero est├í en custodia, puede generar rendimientos seguros respaldados por 
                    <span className="font-semibold text-amber-700"> CETES del Gobierno de M├®xico</span>
                  </p>
                  
                  <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-lg">­ƒÅø´©Å</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">7.2%</div>
                      <div className="text-sm text-gray-600">Tasa anual actual</div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Respaldado por Certificados de la Tesorer├¡a (CETES) ÔÇó <a href="https://stablebonds.s3.us-west-2.amazonaws.com/CNBV_Statement_of_Fact.pdf" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">Regulados ante CNBV</a>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Demo Examples with Yield */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  {/* iPhone Example with Yield */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">­ƒô▒</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">iPhone 15 Pro</h3>
                        <div className="text-sm text-gray-600">$25,000 MXN</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Custodia:</span>
                        <span className="font-semibold">24 horas</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rendimiento generado:</span>
                        <span className="font-bold text-blue-600">+$12 MXN</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        0.05% del monto del pago
                      </div>
                    </div>
                    
                    <div className="text-xs text-center text-gray-500">
                      ­ƒÆí Dinero protegido <span className="font-semibold">+ Rendimientos</span>
                    </div>
                  </div>
                  
                  {/* Car Example with Yield */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">­ƒÜù</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Honda Civic 2022</h3>
                        <div className="text-sm text-gray-600">$385,000 MXN</div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Custodia:</span>
                        <span className="font-semibold">7 d├¡as</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rendimiento generado:</span>
                        <span className="font-bold text-green-600">+$531 MXN</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        0.14% del monto del pago
                      </div>
                    </div>
                    
                    <div className="text-xs text-center text-gray-500">
                      ­ƒÆí M├ís tiempo = <span className="font-semibold">M├ís rendimientos</span>
                    </div>
                  </div>
                  
                  {/* Apartment Example with Yield */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">­ƒÅá</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Apartamento Polanco</h3>
                        <div className="text-sm text-gray-600">$2,500,000 MXN</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Custodia:</span>
                        <span className="font-semibold">30 d├¡as</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rendimiento generado:</span>
                        <span className="font-bold text-purple-600">+$36,986 MXN</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        1.48% del monto del pago
                      </div>
                    </div>
                    
                    <div className="text-xs text-center text-gray-500">
                      ­ƒÆí Monto mayor = <span className="font-semibold">Rendimientos mayores</span>
                    </div>
                  </div>
                </div>
                
                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="text-amber-600">­ƒøí´©Å</span>
                      M├íxima Seguridad
                    </h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Respaldado por <strong>CETES del Gobierno de M├®xico</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Regulado por la <strong>Comisi├│n Nacional Bancaria (CNBV)</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Capital protegido al 100% en cualquier momento</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Rendimientos calculados diariamente</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="text-amber-600">ÔÜí</span>
                      F├ícil de Usar
                    </h3>
                    <ul className="space-y-4 text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span><strong>Activaci├│n opcional</strong> despu├®s de crear tu custodia digital</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Sin montos m├¡nimos requeridos</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Rendimientos visibles en tiempo real</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500 mt-1">Ô£ô</span>
                        <span>Genera rendimientos mientras tus pagos est├ín en custodia</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Call to Action */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-2xl p-8 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-4">
                      ­ƒÜÇ Pr├│ximamente disponible
                    </h3>
                    <p className="text-lg opacity-90 mb-6">
                      S├® de los primeros en generar rendimientos con tus pagos en custodia
                    </p>
                    <a 
                      href="#early-access" 
                      className="inline-block bg-white text-amber-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      Reg├¡strate para acceso anticipado
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealAnimation>
        )}

        {/* Casos de Uso Section */}
        <RevealAnimation>
          <CasosDeUso />
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
                <EarlyAccessForm />
                
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center gap-8 text-base text-gray-500 font-medium" role="list">
                    <span className="flex items-center gap-2" role="listitem">
                      <span className="text-green-500 text-lg" aria-hidden="true">✓</span>
                      Acceso prioritario
                    </span>
                    <span className="flex items-center gap-2" role="listitem">
                      <span className="text-green-500 text-lg" aria-hidden="true">✓</span>
                      Sin compromisos
                    </span>
                    <span className="flex items-center gap-2" role="listitem">
                      <span className="text-green-500 text-lg" aria-hidden="true">✓</span>
                      Cancelación gratuita
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* NFT Digital Twin Section - HIDDEN */}
        {false && (
          <RevealAnimation>
            <section className="w-full max-w-7xl px-6 mx-auto mb-24" aria-labelledby="nft-heading">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl border border-purple-200 p-8 md:p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full -mr-20 -mt-20 opacity-30" aria-hidden="true"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full -ml-16 -mb-16 opacity-30" aria-hidden="true"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h2 id="nft-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      ­ƒÄ¿ Gemelos Digitales de Activos
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      Crea gemelos digitales verificados de tus veh├¡culos y propiedades. Publica en cualquier marketplace con confianza total.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Step 1 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        1
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">­ƒÄ¿ Crear Gemelo Digital</h3>
                      <p className="text-sm text-gray-600">
                        Propietarios crean el gemelo digital verificado de su veh├¡culo o propiedad a trav├®s de Kustodia
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        2
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">­ƒô▒ Publicar Seguro</h3>
                      <p className="text-sm text-gray-600">
                        Agentes pueden mostrar el gemelo digital en cualquier plataforma con verificaci├│n autom├ítica
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        3
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ô£à Verificar Informaci├│n</h3>
                      <p className="text-sm text-gray-600">
                        Compradores pueden verificar toda la informaci├│n antes de comprar con c├│digos QR y blockchain
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        4
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">­ƒöä Crear Seguros</h3>
                      <p className="text-sm text-gray-600">
                        Pago seguro con Kustodia con el gemelo digital como respaldo y verificaci├│n autom├ítica
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">­ƒÆ░ Para Compradores</h4>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>ÔÇó Historial verificado y trazabilidad completa</li>
                        <li>ÔÇó Protecci├│n de pago con garant├¡a de dep├│sito</li>
                        <li>ÔÇó Registros inmutables de propiedad</li>
                        <li>ÔÇó Verificaci├│n f├ícil con c├│digos QR</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">­ƒÆ░ Para Vendedores</h4>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>ÔÇó Mayor valor del activo con verificaci├│n</li>
                        <li>ÔÇó Publicar en cualquier plataforma de venta</li>
                        <li>ÔÇó Historial transparente de transacciones</li>
                        <li>ÔÇó Reducci├│n de fraudes y disputas</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-3">­ƒÅó Para Agencias y Talleres</h4>
                      <ul className="text-sm text-purple-800 space-y-2">
                        <li>ÔÇó Actualizar registros de mantenimiento</li>
                        <li>ÔÇó Historial certificado de servicios</li>
                        <li>ÔÇó Mayor confianza del cliente</li>
                        <li>ÔÇó Nuevas oportunidades de ingresos</li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <a 
                      href="/nft-demo" 
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      ­ƒÄ¿ Probar Gemelos Digitales
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </RevealAnimation>
        )}

        {/* MXNB Section */}
        <RevealAnimation>
          <MXNBSection />
        </RevealAnimation>

      </main>
    </>
  );
}
