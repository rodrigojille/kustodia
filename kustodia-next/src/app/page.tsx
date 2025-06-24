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
  // TODO: Replace with real auth state
  const isAuthenticated = false;
  const userName = '';
  const [currentExample, setCurrentExample] = useState(1);

  const showExample = (num: number) => {
    setCurrentExample(num);
  };

  const nextExample = () => {
    const next = currentExample === 3 ? 1 : currentExample + 1;
    setCurrentExample(next);
  };

  const prevExample = () => {
    const prev = currentExample === 1 ? 3 : currentExample - 1;
    setCurrentExample(prev);
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
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
            addressRegion: 'México'
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
            addressLocality: 'Ciudad de México',
            addressRegion: 'México',
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
              name: 'Juan Pérez'
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
          <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="hero-heading">
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl">
                {/* Trust indicator badge */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium px-6 py-3 rounded-full border border-blue-200 mb-8 shadow-sm">
                  🔐 Servicio de custodia digital mediante blockchain
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
                    Regístrate sin costo de por vida
                  </a>
                  <div id="cta-description" className="text-base text-gray-500 flex items-center gap-3 font-medium">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
                    0% comisión primeros usuarios
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealAnimation>

        {/* Benefits Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="benefits-heading">
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

        {/* Product Demo Section */}
        <RevealAnimation>
          <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="demo-heading">
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
                        ✓ Liberado
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
                            <span className="text-white text-xs">✓</span>
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
                            <span className="text-white text-xs">📱</span>
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
                        <div className="text-xs text-gray-500">★★★★★ Verificado</div>
                        <div className="text-xs text-gray-500">CLABE: ****9847</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vendedor:</span>
                        <div className="font-semibold">TechStore México</div>
                        <div className="text-xs text-gray-500">★★★★★ Tienda oficial</div>
                        <div className="text-xs text-gray-500">CLABE: ****2156</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h6 className="font-semibold text-blue-800 mb-3">Detalles de la transacción</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Comisión Kustodia:</span>
                          <div className="font-semibold text-green-600 ml-2">
                            <div className="text-lg">🎉 Promoción 0% de por vida</div>
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
                        ✓ Liberado
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
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Apartado vehicular</div>
                            <div className="text-xs text-gray-600">20 de enero, 10:00 AM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">🔍</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Inspección mecánica</div>
                            <div className="text-xs text-gray-600">22 de enero, 2:00 PM</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">📋</span>
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
                        <div className="text-xs text-gray-500">★★★★★ Verificado</div>
                        <div className="text-xs text-gray-500">CLABE: ****3421</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vendedor:</span>
                        <div className="font-semibold">AutoMax Seminuevos</div>
                        <div className="text-xs text-gray-500">★★★★★ Distribuidor autorizado</div>
                        <div className="text-xs text-gray-500">CLABE: ****7890</div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4">
                      <h6 className="font-semibold text-green-800 mb-3">Detalles de la transacción</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Comisión Kustodia:</span>
                          <div className="font-semibold text-green-600 ml-2">
                            <div className="text-lg">🎉 Promoción 0% de por vida</div>
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
                        ✓ Liberado
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
                            <span className="text-white text-xs">✓</span>
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
                            <div className="font-semibold text-gray-900">Avalúo inmobiliario</div>
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
                            <span className="text-white text-xs">✍️</span>
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
                        <div className="text-xs text-gray-500">★★★★★ Verificado</div>
                        <div className="text-xs text-gray-500">CLABE: ****5678</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Vendedor:</span>
                        <div className="font-semibold">Inmobiliaria Polanco</div>
                        <div className="text-xs text-gray-500">★★★★★ Inmobiliaria certificada</div>
                        <div className="text-xs text-gray-500">CLABE: ****9012</div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h6 className="font-semibold text-purple-800 mb-3">Detalles de la transacción</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Comisión Kustodia:</span>
                          <div className="font-semibold text-green-600 ml-2">
                            <div className="text-lg">🎉 Promoción 0% de por vida</div>
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

        {/* Casos de Uso Section */}
        <RevealAnimation>
          <CasosDeUso />
        </RevealAnimation>

        {/* Early Access Section */}
        <RevealAnimation>
          <section id="early-access" className="w-full max-w-7xl px-6 mx-auto my-32" aria-labelledby="early-access-heading">
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
                    Acceso Anticipado a Kustodia
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
                    Únete a la revolución de los pagos seguros con tecnología blockchain y MXNB
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 max-w-xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-green-700 font-bold text-lg">¡Oferta limitada!</span>
                    </div>
                    <div className="text-green-800 font-semibold text-xl">
                      0% comisión de por vida
                    </div>
                    <div className="text-green-600 text-sm mt-1">
                      Solo para los primeros 100 usuarios
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

        {/* MXNB Section */}
        <RevealAnimation>
          <MXNBSection />
        </RevealAnimation>

      </main>
    </>
  );
}
