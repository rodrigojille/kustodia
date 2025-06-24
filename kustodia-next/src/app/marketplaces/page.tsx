import Header from '../../components/Header';
import { FaGlobe, FaShieldAlt, FaRegSmile, FaStore, FaRocket, FaCog } from 'react-icons/fa';
import Link from 'next/link';

export default function MarketplacesUseCase() {
  return (
    <>
      <header>
        <title>Marketplaces de servicios | Pagos protegidos con Kustodia</title>
        <meta name="description" content="Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio." />
        <meta name="keywords" content="marketplaces servicios, pagos protegidos, escrow, custodia blockchain, plataformas profesionales, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/marketplaces" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Marketplaces de servicios | Pagos protegidos con Kustodia" />
        <meta property="og:description" content="Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/marketplaces" />
        <meta property="og:image" content="https://kustodia.mx/og-marketplaces-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Marketplaces de servicios | Pagos protegidos con Kustodia" />
        <meta name="twitter:description" content="Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio." />
        <meta name="twitter:image" content="https://kustodia.mx/og-marketplaces-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="marketplaces-heading">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-5xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaStore className="text-blue-700 text-4xl" />
              </div>
              
              <h1 id="marketplaces-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Marketplaces y plataformas seguras
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                ¿Tienes una plataforma de venta online o marketplace? Integra Kustodia para que compradores y vendedores hagan transacciones con total seguridad.
              </p>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Elimina fraudes, aumenta la confianza y mejora la experiencia de tus usuarios con pagos en custodia blockchain.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
                  Integración API simple para proteger todas las transacciones de tu plataforma.
                </p>
                <p className="text-base md:text-lg text-blue-700">
                  Producto entregado, pago liberado. <strong>Cero fraudes para compradores y vendedores</strong>.
                </p>
              </div>
              
              <a
                href="/#early-access"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Solicitar Acceso Anticipado
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="benefits-heading">
          <div className="text-center mb-20">
            <h2 id="benefits-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ventajas para tu plataforma
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Aumenta la confianza y reduce fraudes en tu marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Cero fraudes</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Elimina estafas y aumenta la confianza entre compradores y vendedores de tu plataforma.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRocket className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Más transacciones</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Los usuarios compran y venden más cuando saben que sus transacciones están protegidas.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaCog className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Integración simple</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                API fácil de integrar con documentación completa y soporte técnico especializado.
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
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Cómo se integra Kustodia en mi marketplace?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Integración simple via API REST. El dinero queda en custodia hasta que ambas partes confirman la transacción exitosa.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué comisiones cobra Kustodia?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Comisiones competitivas que se adaptan al volumen de tu plataforma. Contacta para conocer nuestras tarifas preferenciales.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Es compatible con cualquier tipo de marketplace?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Sí, funciona para cualquier plataforma: e-commerce, servicios, bienes digitales, marketplace B2B, y más.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center" aria-labelledby="cta-heading">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 id="cta-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              ¿Quieres integrar pagos seguros en tu marketplace?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Lee nuestro blog: <Link href="/blog/como-integrar-pagos-seguros-marketplace" className="text-blue-600 underline hover:text-blue-800 font-semibold transition-colors">Cómo integrar pagos seguros en marketplaces</Link>
            </p>
            <Link 
              href="/" 
              className="inline-block bg-gray-100 text-blue-700 font-semibold px-8 py-4 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition-all duration-300"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
