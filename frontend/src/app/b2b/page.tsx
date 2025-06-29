import Header from '../../components/Header';
import { FaBuilding, FaShieldAlt, FaRegSmile, FaFileContract, FaHandshake } from 'react-icons/fa';
import Link from 'next/link';

export default function B2BUseCase() {
  return (
    <>
      <header>
        <title>Empresas B2B y control de entregas | Pagos protegidos con Kustodia</title>
        <meta name="description" content="Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Ideal para compras con control de entregas, pagos por adelantado y flujos tipo escrow." />
        <meta name="keywords" content="pagos B2B, pagos protegidos empresas, control de entregas, escrow, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/b2b" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Empresas B2B y control de entregas | Pagos protegidos con Kustodia" />
        <meta property="og:description" content="Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Ideal para compras con control de entregas, pagos por adelantado y flujos tipo escrow." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/b2b" />
        <meta property="og:image" content="https://kustodia.mx/og-b2b-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Empresas B2B y control de entregas | Pagos protegidos con Kustodia" />
        <meta name="twitter:description" content="Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Ideal para compras con control de entregas, pagos por adelantado y flujos tipo escrow." />
        <meta name="twitter:image" content="https://kustodia.mx/og-b2b-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="b2b-heading">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-5xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaBuilding className="text-blue-700 text-4xl" />
              </div>
              
              <h1 id="b2b-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Transacciones B2B seguras
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                ¿Tu empresa necesita hacer transacciones comerciales seguras con otros negocios? Con Kustodia, el dinero queda protegido hasta que ambas empresas cumplan el acuerdo.
              </p>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Ideal para contratos de suministro, servicios empresariales y cualquier transacción comercial de alto valor.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
                  El dinero solo se libera cuando ambas empresas confirman que se cumplieron los términos del contrato.
                </p>
                <p className="text-base md:text-lg text-blue-700">
                  Servicios entregados, productos recibidos, pago liberado. <strong>Protección total para transacciones empresariales</strong>.
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
              Ventajas para empresas
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Transacciones comerciales con total seguridad y confianza
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Cero incumplimientos</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                El dinero solo se libera cuando ambas empresas confirman el cumplimiento del contrato.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaFileContract className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Contratos inteligentes</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Automatización transparente de pagos basada en el cumplimiento de condiciones.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Relaciones comerciales sólidas</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Fortalece la confianza entre empresas y reduce disputas comerciales.
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
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Cómo funciona para contratos empresariales?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Las empresas acuerdan términos, el pago queda en custodia, y cuando ambas partes confirman el cumplimiento, el dinero se libera automáticamente.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si hay disputas entre empresas?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Kustodia puede actuar como mediador imparcial, revisando evidencia y documentación para resolver la disputa según los términos acordados.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Es adecuado para contratos de gran valor?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Sí, la blockchain garantiza transparencia y seguridad para transacciones de cualquier monto, especialmente las de alto valor empresarial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center" aria-labelledby="cta-heading">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 id="cta-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              ¿Quieres saber más sobre transacciones B2B seguras?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Lee nuestro blog: <Link href="/blog/contratos-empresariales-seguros" className="text-blue-600 underline hover:text-blue-800 font-semibold transition-colors">Cómo asegurar contratos empresariales</Link>
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
