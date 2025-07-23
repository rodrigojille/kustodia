import Head from 'next/head';
import Header from '../../../components/Header';
import SocialShare from '../../../components/SocialShare';
import { FaCode, FaShieldAlt, FaCogs } from 'react-icons/fa';
import Link from 'next/link';

export default function BlogComoIntegrarPagosSeguroMarketplace() {
  return (
    <>
      <Head>
        <title>Cómo integrar pagos seguros en marketplace: Guía técnica completa | Kustodia Blog</title>
        <meta name="description" content="Guía paso a paso para desarrolladores: integra pagos seguros con escrow API de Kustodia en tu marketplace. Incluye código, ejemplos y mejores prácticas." />
        <meta name="keywords" content="integración pagos seguros, escrow API, desarrollo marketplace, pagos blockchain, API custodia, integración técnica, Kustodia developers" />
        <link rel="canonical" href="https://kustodia.mx/blog/como-integrar-pagos-seguros-marketplace" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo integrar pagos seguros en marketplace: Guía técnica completa | Kustodia Blog" />
        <meta property="og:description" content="Guía paso a paso para desarrolladores: integra pagos seguros con escrow API de Kustodia en tu marketplace. Incluye código, ejemplos y mejores prácticas." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/como-integrar-pagos-seguros-marketplace" />
        <meta property="og:image" content="https://kustodia.mx/og-integration-guide.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo integrar pagos seguros en marketplace: Guía técnica completa | Kustodia Blog" />
        <meta name="twitter:description" content="Guía paso a paso para desarrolladores: integra pagos seguros con escrow API de Kustodia en tu marketplace. Incluye código, ejemplos y mejores prácticas." />
        <meta name="twitter:image" content="https://kustodia.mx/og-integration-guide.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </Head>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <article className="w-full max-w-4xl bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 mx-auto relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 opacity-30" aria-hidden="true"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-100 rounded-full -ml-10 -mb-10 opacity-30" aria-hidden="true"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              Cómo integrar pagos seguros en tu marketplace
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed font-light">
              Implementar pagos en custodia en tu marketplace no tiene que ser complicado. Con la tecnología adecuada, puedes proteger a compradores y vendedores en minutos, no meses.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Guía de integración paso a paso
              </h2>
              <div className="space-y-8">
                
                {/* Step 1 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Configuración inicial</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-4 mb-4">
                    <code className="text-sm text-gray-700">
                      npm install @kustodia/sdk<br/>
                      # o<br/>
                      yarn add @kustodia/sdk
                    </code>
                  </div>
                  <p className="text-gray-600">
                    Instala el SDK de Kustodia en tu proyecto. Compatible con Node.js, React, Vue, Angular y frameworks backend.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Autenticación</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-4 mb-4 overflow-x-auto">
                    <code className="text-sm text-gray-700 whitespace-pre-wrap">
{`import { Kustodia } from '@kustodia/sdk';

const kustodia = new Kustodia({
  apiKey: process.env.KUSTODIA_API_KEY,
  network: 'mainnet', // o 'testnet'
  webhook: 'https://tu-marketplace.com/webhook'
});`}
                    </code>
                  </div>
                  <p className="text-gray-600">
                    Configura las credenciales y webhook para recibir notificaciones de estado en tiempo real.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Crear transacción en custodia</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-4 mb-4 overflow-x-auto">
                    <code className="text-sm text-gray-700 whitespace-pre-wrap">
{`const transaction = await kustodia.createEscrow({
  amount: 25000, // MXN
  buyer: {
    id: 'user_123',
    email: 'comprador@email.com'
  },
  seller: {
    id: 'vendor_456',
    email: 'vendedor@email.com'
  },
  description: 'iPhone 15 Pro - 256GB',
  custodyPeriod: 24, // horas
  metadata: {
    productId: 'iphone-15-pro-256',
    category: 'electronics'
  }
});`}
                    </code>
                  </div>
                  <p className="text-gray-600">
                    Crea la transacción en custodia con todos los detalles necesarios. Los fondos quedan protegidos hasta confirmación.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Manejar estados de transacción</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-4 mb-4 overflow-x-auto">
                    <code className="text-sm text-gray-700 whitespace-pre-wrap">
{`// Webhook handler
app.post('/webhook', (req, res) => {
  const { transactionId, status, event } = req.body;
  
  switch(status) {
    case 'FUNDING_PENDING':
      // Mostrar instrucciones de pago
      break;
    case 'FUNDED':
      // Notificar al vendedor
      break;
    case 'RELEASED':
      // Transacción completada
      break;
    case 'DISPUTED':
      // Iniciar proceso de mediación
      break;
  }
});`}
                    </code>
                  </div>
                  <p className="text-gray-600">
                    Implementa el webhook para recibir actualizaciones en tiempo real y actualizar tu UI automáticamente.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Componentes UI listos para usar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🛒</span>
                    <h3 className="text-lg font-bold text-gray-900">Checkout protegido</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-3 mb-3">
                    <code className="text-xs text-gray-700">
                      {`&lt;KustodiaCheckout 
  amount={25000} 
  product="iPhone 15 Pro" 
  onSuccess={handleSuccess} 
  onError={handleError} 
/&gt;`}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Componente React que integra automáticamente custodia en tu checkout existente.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-lg font-bold text-gray-900">Dashboard de transacciones</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-3 mb-3">
                    <code className="text-xs text-gray-700">
                      {`&lt;KustodiaDashboard 
  userId={currentUser.id} 
  role="seller" 
  onTransactionClick={viewDetails} 
/&gt;`}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Panel de control para que usuarios vean sus transacciones y estados en tiempo real.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔔</span>
                    <h3 className="text-lg font-bold text-gray-900">Notificaciones inteligentes</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-3 mb-3">
                    <code className="text-xs text-gray-700">
                      {`&lt;KustodiaNotifications 
  position="top-right" 
  autoHide={5000} 
  showProgress={true} 
/&gt;`}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sistema de notificaciones que informa automáticamente sobre cambios de estado.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🎛️</span>
                    <h3 className="text-lg font-bold text-gray-900">Panel administrativo</h3>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-3 mb-3">
                    <code className="text-xs text-gray-700">
                      {`&lt;KustodiaAdmin 
  permissions={adminPerms} 
  analytics={true} 
  disputeResolution={true} 
/&gt;`}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    Herramientas administrativas para gestionar disputas y ver métricas detalladas.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Casos de uso por industria
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🛍️</span>
                    <h3 className="text-lg font-bold text-gray-900">E-commerce</h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Protección completa para productos físicos y digitales, con verificación automática de entrega.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Ideal para: Electrónicos, ropa, muebles, productos artesanales
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💼</span>
                    <h3 className="text-lg font-bold text-gray-900">Servicios freelance</h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Pagos por hitos de proyecto con liberación automática al cumplir entregables específicos.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Ideal para: Desarrollo web, diseño gráfico, marketing digital, consultoría
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🏠</span>
                    <h3 className="text-lg font-bold text-gray-900">Inmobiliaria</h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Apartados seguros y pagos de rentas con verificación documental automatizada.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Ideal para: Venta de propiedades, rentas, apartados, crowdfunding inmobiliario
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🚗</span>
                    <h3 className="text-lg font-bold text-gray-900">Vehículos</h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Transacciones seguras para autos usados con verificación de papeles y condiciones.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Ideal para: Venta de autos, motos, maquinaria, refacciones
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Precios y beneficios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Startup</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">1.5%</div>
                  <p className="text-sm text-gray-600 mb-4">Por transacción exitosa</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Hasta 1,000 transacciones/mes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      API completa
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Componentes React
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Soporte por email
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Growth</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">1.2%</div>
                  <p className="text-sm text-gray-600 mb-4">Por transacción exitosa</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Hasta 10,000 transacciones/mes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Panel administrativo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Webhooks avanzados
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Soporte prioritario
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">0.8%</div>
                  <p className="text-sm text-gray-600 mb-4">Por transacción exitosa</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Transacciones ilimitadas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Integración personalizada
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      SLA garantizado
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      Account manager dedicado
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6 mt-6 text-center">
                <p className="text-lg font-bold text-green-800 mb-2">
                  🎉 Oferta de lanzamiento: Acceso prioritario durante los primeros 3 meses
                </p>
              </div>
            </section>
            
            <div className="text-center mb-12">
              <Link 
                href="/#early-access" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Comenzar integración
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-700 mb-6 font-semibold">
                ¿Te gustó este artículo? <span className="text-blue-700">¡Compártelo y ayuda a crear marketplaces más seguros!</span>
              </p>
              <SocialShare
                url="https://kustodia.mx/blog/como-integrar-pagos-seguros-marketplace"
                title="Guía completa para integrar pagos seguros en marketplaces — Kustodia Blog"
                summary="Aprende a integrar pagos seguros con custodia blockchain en tu marketplace paso a paso."
              />
            </div>
          </div>
        </article>
        
        <div className="w-full max-w-4xl mx-auto text-center mt-8">
          <Link 
            href="/" 
            className="inline-block bg-gray-100 text-blue-700 font-semibold px-8 py-4 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition-all duration-300"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  );
}
