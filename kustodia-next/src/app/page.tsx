'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { FaShieldAlt, FaHeadset, FaRocket, FaLock, FaCheckCircle } from 'react-icons/fa';
import { ArcadeEmbed } from '../components/ArcadeEmbed';
import ApiSneakPeek from '../components/ApiSneakPeek';
import CasosDeUso from '../components/CasosDeUso';
import Header from '../components/Header';
import MXNBSection from '../components/MXNBSection';
import InstagramSection from '../components/InstagramSection';
import SmartContractInfo from '../components/SmartContractInfo';
import EarlyAccessCounter from '../components/EarlyAccessCounter';
import EarlyAccessForm from '../components/EarlyAccessForm';
import UrgencyNotice from '../components/UrgencyNotice';

const benefits = [
  {
    title: "Tan fácil como un SPEI, pero con tus condiciones",
    icon: <FaRocket className="text-blue-700 text-3xl" />,
    description: "Haz pagos como siempre. No necesitas aprender nada nuevo.",
    subtext: '',
  },
  {
    title: 'Control total',
    description: 'Tú decides cuándo se libera el dinero. Protege cada paso de tu operación.',
    icon: <FaShieldAlt size={38} className="text-blue-600 mb-2" />,
    subtext: '',
  },
  {
    title: 'Seguridad real',
    description: 'Protege anticipos, apartados y rentas: el dinero solo se libera cuando se cumplen las condiciones del pago.',
    icon: <FaLock size={38} className="text-blue-600 mb-2" />,
    subtext: '',
  },
  {
    title: 'Soporte humano',
    description: 'Te acompañamos en cada paso. Cualquier duda, estamos aquí.',
    icon: <FaHeadset size={38} className="text-blue-600 mb-2" />,
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
        <meta property="og:title" content="Kustodia - Pagos Inteligentes, Custodia y SPEI Seguro con Blockchain" />
        <meta property="og:description" content="Kustodia: pagos inteligentes, custodia y SPEI seguro con tecnología blockchain. Protege tus operaciones y paga solo cuando todo sale bien." />
        <meta property="og:image" content="/kustodia-og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kustodia - Pagos Inteligentes y Seguros en México" />
        <meta name="twitter:description" content="Kustodia es la plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien." />
        <meta name="twitter:image" content="/kustodia-og.png" />
        <link rel="canonical" href="https://kustodia.mx/" />
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Kustodia',
          url: 'https://kustodia.mx/',
          logo: '/kustodia-og.png',
          sameAs: [
            'https://x.com/Kustodia_mx',
            'https://www.linkedin.com/company/kustodia-mx',
            'https://www.instagram.com/kustodia.mx/#'
          ],
          description: 'Plataforma líder en pagos seguros y custodia en México.'
        }) }} />
      </Head>
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
      />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-20 mt-16">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl">
              {/* Trust indicator badge */}
              <div className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full border border-blue-200 mb-6">
                🔐 Servicio de custodia digital mediante blockchain
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-[1.1] max-w-4xl mx-auto text-center">
                Pagos en Kustodia seguros: 
                <span className="text-blue-600"> tu dinero solo se libera</span> cuando se cumple el trato.
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-normal leading-relaxed text-center">
                Protege compras, ventas o servicios. <span className="font-semibold text-gray-800">Sin riesgos de fraudes.</span>
              </p>
              
              {/* Clear value proposition */}
              <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                Kustodia es un <strong>servicio de custodia digital</strong> que automatiza pagos condicionales a través de contratos inteligentes para garantizar el cumplimiento de condiciones acordadas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <a href="#early-access" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
                  Regístrate sin costo de por vida
                </a>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  0% comisión primeros usuarios
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Kustodia?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La forma más segura y simple de proteger tus pagos en México
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <div key={b.title} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-blue-50 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:scale-105 group">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{b.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{b.title}</h3>
                {b.subtext && <div className="text-base text-blue-600 mb-3 font-medium">{b.subtext}</div>}
                <p className="text-gray-600 text-base leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Demo Section */}
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Así funciona Kustodia
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ejemplos reales de transacciones que podemos habilitar
            </p>
          </div>
          
          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Example 1: iPhone */}
            <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-6 md:p-8 border border-blue-100 carousel-item ${currentExample === 1 ? '' : 'hidden'}`} id="example-1">
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
                  
                  {/* Transaction Details */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h6 className="font-semibold text-blue-800 mb-3">Detalles de la transacción</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Comisión Kustodia:</span>
                        <span className="font-semibold text-gray-900 ml-2">0% - Promoción</span>
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
                  
                  {/* Smart Contract Link */}
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
            <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl p-6 md:p-8 border border-green-100 carousel-item ${currentExample === 2 ? '' : 'hidden'}`} id="example-2">
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
                        Honda Civic 2022 Touring
                      </h4>
                      <p className="text-gray-600 mb-1">ID: #KUS-2024-127</p>
                      <p className="text-sm text-gray-500">VIN: JHMFC2F89NK123456</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl md:text-4xl font-bold text-green-600">$385,000 MXN</div>
                      <div className="text-sm text-gray-500">Liberado en 72 horas</div>
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
                          <div className="text-xs text-gray-600">28 de enero, 9:00 AM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">📋</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Verificación de documentos</div>
                          <div className="text-xs text-gray-600">28 de enero, 2:00 PM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">🔧</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Inspección mecánica</div>
                          <div className="text-xs text-gray-600">29 de enero, 10:30 AM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">📄</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Traspaso legal</div>
                          <div className="text-xs text-gray-600">30 de enero, 3:15 PM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">$</span>
                        </div>
                        <div>
                          <div className="font-semibold text-green-600">Liberación final</div>
                          <div className="text-xs text-gray-600">30 de enero, 5:00 PM - $385,000 MXN</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Comprador:</span>
                      <div className="font-semibold">Carlos M. Rodríguez</div>
                      <div className="text-xs text-gray-500">★★★★★ Verificado</div>
                      <div className="text-xs text-gray-500">CLABE: ****3421</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Vendedor:</span>
                      <div className="font-semibold">AutoMax Seminuevos</div>
                      <div className="text-xs text-gray-500">★★★★★ Agencia certificada</div>
                      <div className="text-xs text-gray-500">CLABE: ****7892</div>
                    </div>
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h6 className="font-semibold text-green-800 mb-3">Detalles de la transacción</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Comisión Kustodia:</span>
                        <span className="font-semibold text-gray-900 ml-2">0% - Promoción</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Periodo custodia:</span>
                        <span className="font-semibold text-gray-900 ml-2">72 horas</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Verificación:</span>
                        <span className="font-semibold text-gray-900 ml-2">Documentos + Inspección</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Blockchain TX:</span>
                        <span className="font-semibold text-gray-900 ml-2">0x9b4c2...</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Smart Contract Link */}
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
            <div className={`bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl shadow-2xl p-6 md:p-8 border border-purple-100 carousel-item ${currentExample === 3 ? '' : 'hidden'}`} id="example-3">
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
                        Departamento Polanco 2BR
                      </h4>
                      <p className="text-gray-600 mb-1">ID: #KUS-2024-203</p>
                      <p className="text-sm text-gray-500">Escritura: ES-CDMX-2024-5891</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl md:text-4xl font-bold text-green-600">$2,500,000 MXN</div>
                      <div className="text-sm text-gray-500">Liberado en 15 días</div>
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
                          <div className="text-xs text-gray-600">1 de febrero, 10:00 AM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">📋</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Trámites notariales iniciados</div>
                          <div className="text-xs text-gray-600">2 de febrero, 2:30 PM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">$</span>
                        </div>
                        <div>
                          <div className="font-semibold text-green-600">Liberación parcial (20%)</div>
                          <div className="text-xs text-gray-600">5 de febrero, 11:15 AM - $500,000 MXN</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">🏠</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Entrega de inmueble</div>
                          <div className="text-xs text-gray-600">8 de febrero, 4:00 PM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">$</span>
                        </div>
                        <div>
                          <div className="font-semibold text-green-600">Liberación parcial (60%)</div>
                          <div className="text-xs text-gray-600">8 de febrero, 6:30 PM - $1,500,000 MXN</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">📋</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Escrituración completada</div>
                          <div className="text-xs text-gray-600">12 de febrero, 1:45 PM</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-xs">$</span>
                        </div>
                        <div>
                          <div className="font-semibold text-green-600">Liberación final (20%)</div>
                          <div className="text-xs text-gray-600">12 de febrero, 2:00 PM - $500,000 MXN</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Comprador:</span>
                      <div className="font-semibold">Ana S. Morales</div>
                      <div className="text-xs text-gray-500">★★★★★ Verificado</div>
                      <div className="text-xs text-gray-500">CLABE: ****6754</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Vendedor:</span>
                      <div className="font-semibold">Inmobiliaria Premier</div>
                      <div className="text-xs text-gray-500">★★★★★ Agencia certificada</div>
                      <div className="text-xs text-gray-500">CLABE: ****1987</div>
                    </div>
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h6 className="font-semibold text-purple-800 mb-3">Detalles de la transacción</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Comisión Kustodia:</span>
                        <span className="font-semibold text-gray-900 ml-2">0% - Promoción</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Periodo custodia:</span>
                        <span className="font-semibold text-gray-900 ml-2">15 días</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Verificación:</span>
                        <span className="font-semibold text-gray-900 ml-2">Peritaje + Notarial</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Blockchain TX:</span>
                        <span className="font-semibold text-gray-900 ml-2">0x7d5e8...</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Smart Contract Link */}
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

            {/* Navigation Buttons */}
            <button onClick={prevExample} className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all duration-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button onClick={nextExample} className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all duration-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            <button onClick={() => showExample(1)} className={`carousel-indicator ${currentExample === 1 ? 'active bg-blue-600' : 'bg-gray-300'} w-3 h-3 rounded-full`}></button>
            <button onClick={() => showExample(2)} className={`carousel-indicator ${currentExample === 2 ? 'active bg-blue-600' : 'bg-gray-300'} w-3 h-3 rounded-full`}></button>
            <button onClick={() => showExample(3)} className={`carousel-indicator ${currentExample === 3 ? 'active bg-blue-600' : 'bg-gray-300'} w-3 h-3 rounded-full`}></button>
          </div>

          {/* Use Case Tags */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              📱 Electrónicos: $25K - Transacciones promedio
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🚗 Automóviles: $385K - Transacciones promedio
            </div>
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              🏠 Inmuebles: $2.5M - Transacciones promedio
            </div>
          </div>
        </section>

        {/* Casos de Uso Section */}
        <CasosDeUso />

        <section id="early-access" className="w-full max-w-screen-xl px-4 mx-auto my-24">
          <div className="flex justify-center w-full mb-10">
            <div className="max-w-4xl w-full">
              <UrgencyNotice />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border border-blue-100 p-12 flex flex-col items-center max-w-2xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <span className="text-4xl mb-4 block">🚀</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Acceso Anticipado a Kustodia
                </h2>
                <p className="text-xl text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
                  Únete a la lista de espera y sé de los primeros en probar la plataforma de pagos seguros más avanzada de México.
                </p>
              </div>
              
              <EarlyAccessCounter />
              <EarlyAccessForm />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    Acceso prioritario
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    0% comisión
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    Soporte dedicado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Contracts Info Section */}
        <SmartContractInfo />
      </main>
      <section className="w-full flex flex-col items-center my-0 py-6 bg-white">
        <div className="flex flex-row flex-wrap gap-8 justify-center items-center w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <FaShieldAlt className="text-blue-500 text-3xl mb-1" />
            <span className="text-xs text-black text-center">Protección de fondos</span>
          </div>
          <div className="flex flex-col items-center">
            <FaLock className="text-blue-500 text-3xl mb-1" />
            <span className="text-xs text-black text-center">Verificado por blockchain</span>
          </div>
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-blue-500 text-3xl mb-1" />
            <span className="text-xs text-black text-center">Cumple con normativas</span>
          </div>
        </div>
      </section>
      <section className="w-full flex flex-col items-center my-8">
        <a href="#early-access" className="inline-block bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition w-full max-w-xs sm:max-w-none sm:w-auto text-center">Regístrate gratis</a>
      </section>
    </>
  );
}
