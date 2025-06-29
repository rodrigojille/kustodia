import Head from 'next/head';
import Header from '../../../components/Header';
import SocialShare from '../../../components/SocialShare';
import { FaGlobe, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';

export default function BlogEvitarFraudesMarketplace() {
  return (
    <>
      <Head>
        <title>Evitar fraudes en marketplaces: Guía completa de protección | Kustodia Blog</title>
        <meta name="description" content="Protege tu negocio y clientes de fraudes en marketplaces. Aprende las mejores prácticas y cómo implementar pagos seguros con tecnología blockchain." />
        <meta name="keywords" content="fraudes marketplace, pagos seguros, escrow, custodia digital, protección compradores vendedores, blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-marketplace" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Evitar fraudes en marketplaces: Guía completa de protección | Kustodia Blog" />
        <meta property="og:description" content="Protege tu negocio y clientes de fraudes en marketplaces. Aprende las mejores prácticas y cómo implementar pagos seguros con tecnología blockchain." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-marketplace" />
        <meta property="og:image" content="https://kustodia.mx/og-marketplace-fraud.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Evitar fraudes en marketplaces: Guía completa de protección | Kustodia Blog" />
        <meta name="twitter:description" content="Protege tu negocio y clientes de fraudes en marketplaces. Aprende las mejores prácticas y cómo implementar pagos seguros con tecnología blockchain." />
        <meta name="twitter:image" content="https://kustodia.mx/og-marketplace-fraud.png" />
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
              Cómo evitar fraudes en marketplaces online
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed font-light">
              Los fraudes en marketplaces pueden destruir la confianza de tus usuarios y dañar tu reputación. Descubre cómo proteger a compradores y vendedores con tecnología de custodia inteligente.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Los fraudes más comunes en marketplaces
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <h3 className="text-xl font-bold text-red-800 mb-4">🚨 Fraudes del vendedor</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• No envío del producto</li>
                      <li>• Productos falsificados</li>
                      <li>• Descripción engañosa</li>
                      <li>• Vendedores fantasma</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                    <h3 className="text-xl font-bold text-orange-800 mb-4">🔍 Fraudes del comprador</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Disputas falsas</li>
                      <li>• Devolución de productos dañados</li>
                      <li>• Pagos con tarjetas robadas</li>
                      <li>• Reseñas negativas injustificadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Soluciones de protección avanzada
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-6">
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-xl font-bold text-green-800 mb-4">🛡️ Custodia inteligente</h3>
                    <p className="text-gray-700 mb-4">
                      Los fondos se mantienen seguros hasta que ambas partes confirmen la transacción exitosa.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>✅ Verificación automática de entrega</li>
                      <li>✅ Liberación condicionada de fondos</li>
                      <li>✅ Resolución de disputas transparente</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">🔐 Verificación blockchain</h3>
                    <p className="text-gray-700 mb-4">
                      Cada transacción queda registrada de manera inmutable en blockchain.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li>✅ Historial de transacciones verificable</li>
                      <li>✅ Identidad digital comprobada</li>
                      <li>✅ Auditoría automática de operaciones</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Implementación en tu marketplace
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Integración rápida</h3>
                    <p className="text-gray-600 text-sm">API simple que se conecta en minutos con tu plataforma existente</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sin fricciones</h3>
                    <p className="text-gray-600 text-sm">Experiencia fluida que no interfiere con el proceso de compra</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Analíticas completas</h3>
                    <p className="text-gray-600 text-sm">Dashboard con métricas de seguridad y confianza</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Casos de uso reales
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">E-commerce de electrónicos</h3>
                    <p className="text-gray-600">
                      Reducción del 95% en disputas de pagos y aumento del 40% en confianza del usuario tras implementar custodia inteligente.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Marketplace de servicios</h3>
                    <p className="text-gray-600">
                      Protección completa para freelancers y clientes, con liberación automática de pagos al completar proyectos.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Plataforma inmobiliaria</h3>
                    <p className="text-gray-600">
                      Apartados seguros para propiedades con verificación documental y liberación condicionada de fondos.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <div className="text-center mb-12">
              <Link 
                href="/#early-access" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Protege tu marketplace ahora
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-700 mb-6 font-semibold">
                ¿Te gustó este artículo? <span className="text-blue-700">¡Compártelo y ayuda a crear marketplaces más seguros!</span>
              </p>
              <SocialShare
                url="https://kustodia.mx/blog/evitar-fraudes-marketplace"
                title="Descubre cómo proteger tu marketplace de fraudes con custodia inteligente — Kustodia Blog"
                summary="Guía completa para evitar fraudes en marketplaces y proteger a compradores y vendedores."
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
