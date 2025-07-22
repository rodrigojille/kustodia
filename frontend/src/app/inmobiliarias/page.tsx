import Header from '../../components/Header';
import { FaHome, FaShieldAlt, FaRegSmile, FaHandshake, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import LandingPageSurvey from '../../components/LandingPageSurvey';

export default function InmobiliariasUseCase() {
  return (
    <>
      <header>
        <title>Pagos seguros para inmobiliarias y agentes | Kustodia</title>
        <meta name="description" content="Cierra ventas más rápido y protege anticipos, apartados y rentas con pagos en custodia blockchain. Seguridad y confianza total para inmobiliarias y agentes." />
        <meta name="keywords" content="pagos seguros inmobiliarias, custodia blockchain, anticipos, apartados, rentas, evitar fraudes inmobiliarios, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/inmobiliarias" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pagos seguros para inmobiliarias y agentes | Kustodia" />
        <meta property="og:description" content="Cierra ventas más rápido y protege anticipos, apartados y rentas con pagos en custodia blockchain. Seguridad y confianza total para inmobiliarias y agentes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/inmobiliarias" />
        <meta property="og:image" content="https://kustodia.mx/og-inmobiliarias-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pagos seguros para inmobiliarias y agentes | Kustodia" />
        <meta name="twitter:description" content="Cierra ventas más rápido y protege anticipos, apartados y rentas con pagos en custodia blockchain. Seguridad y confianza total para inmobiliarias y agentes." />
        <meta name="twitter:image" content="https://kustodia.mx/og-inmobiliarias-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="inmobiliarias-heading">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-5xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaHome className="text-blue-700 text-4xl" />
              </div>
              
              <h1 id="inmobiliarias-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Ventas inmobiliarias sin fraudes
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                ¿Vas a vender una propiedad y necesitas asegurar que el comprador tenga los fondos? Con Kustodia, el dinero queda protegido hasta completar la compraventa.
              </p>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Evita fraudes y transacciones fallidas. Vende con total seguridad y confianza.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
                  El dinero solo se libera cuando ambas partes cumplen las condiciones de la compraventa.
                </p>
                <p className="text-base md:text-lg text-blue-700">
                  Documentos verificados, propiedad entregada según lo acordado. <strong>Protección total para vendedor y comprador</strong>.
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

        {/* How it Works Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="how-it-works-heading">
          <div className="text-center mb-20">
            <h2 id="how-it-works-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              ¿Cómo funciona para ventas inmobiliarias?
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Proceso simple y seguro que protege tanto al vendedor como al comprador
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <ol className="space-y-8 text-lg lg:text-xl text-gray-700">
              <li className="flex items-start">
                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mr-6 mt-1 flex-shrink-0">1</span>
                <span>Vendedor y comprador acuerdan las condiciones de la propiedad y usan Kustodia como intermediario seguro.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mr-6 mt-1 flex-shrink-0">2</span>
                <span>El dinero se transfiere a un <strong className="text-blue-700">smart contract en la blockchain</strong>, bloqueado para ambas partes.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mr-6 mt-1 flex-shrink-0">3</span>
                <span>Se verifican documentos, títulos de propiedad y condiciones según lo acordado.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mr-6 mt-1 flex-shrink-0">4</span>
                <span>Cuando ambas partes confirman, Kustodia libera el pago automáticamente.</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-full font-bold text-lg mr-6 mt-1 flex-shrink-0">5</span>
                <span>Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32" aria-labelledby="benefits-heading">
          <div className="text-center mb-20">
            <h2 id="benefits-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Ventajas para agentes inmobiliarios
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Vende propiedades con total seguridad y confianza
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Sin fraudes ni sorpresas</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                El dinero solo se libera si la propiedad y documentos se entregan como se prometió.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaHome className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Confianza en cada venta</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Ideal para casas, departamentos, terrenos y cualquier propiedad inmobiliaria.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Tranquilidad para todos</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Compradores y vendedores ganan seguridad y evitan conflictos.
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
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si el comprador no tiene fondos suficientes?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Con Kustodia, el dinero debe estar bloqueado en custodia antes de proceder. Esto garantiza que el comprador tiene los fondos reales disponibles.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Es seguro usar blockchain para propiedades de alto valor?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Sí, la blockchain es inmutable y transparente. Los smart contracts se ejecutan automáticamente según las condiciones acordadas, sin posibilidad de manipulación.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si hay problemas con los documentos de la propiedad?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Si los documentos no están en orden, el dinero permanece en custodia hasta resolver el problema o se devuelve al comprador según lo acordado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center" aria-labelledby="cta-heading">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 id="cta-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              ¿Quieres saber más sobre ventas inmobiliarias seguras?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Lee nuestro blog: <Link href="/blog/evitar-fraudes-inmobiliarias" className="text-blue-600 underline hover:text-blue-800 font-semibold transition-colors">Cómo evitar fraudes en ventas inmobiliarias</Link>
            </p>
            
            <div className="flex justify-center mb-6">
              <Link 
                href="/#early-access" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                🚀 Acceso Anticipado Gratis
              </Link>
            </div>
            
            <Link 
              href="/" 
              className="inline-block bg-gray-100 text-blue-700 font-semibold px-6 py-3 rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition-all duration-300"
            >
              Volver al inicio
            </Link>
          </div>
        </section>

        {/* Landing Page Survey */}
        <LandingPageSurvey 
          vertical="inmobiliarias"
          pageName="inmobiliarias"
          variant="original"
          triggerAfterSeconds={45}
          showOnScrollPercentage={70}
          showOnExit={true}
        />
      </main>
    </>
  );
}
