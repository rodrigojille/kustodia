import Header from '../../components/Header';
import { FaShoppingCart, FaShieldAlt, FaRegSmile, FaArrowRight, FaTruck, FaHandshake } from 'react-icons/fa';
import Link from 'next/link';

export default function EcommerceUseCase() {
  return (
    <>
      <header>
        <title>Pagos seguros para compras en e-commerce y redes sociales | Kustodia</title>
        <meta name="description" content="Compra en páginas independientes, Facebook, Instagram o marketplaces de servicios sin miedo a fraudes. Protege tu dinero con pagos en custodia blockchain, incluso fuera de Amazon o MercadoLibre." />
        <meta name="keywords" content="pagos seguros ecommerce, evitar fraudes compras, custodia blockchain, compras Facebook, compras Instagram, marketplaces servicios, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/ecommerce" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pagos seguros para compras en e-commerce y redes sociales | Kustodia" />
        <meta property="og:description" content="Compra en páginas independientes, Facebook, Instagram o marketplaces de servicios sin miedo a fraudes. Protege tu dinero con pagos en custodia blockchain, incluso fuera de Amazon o MercadoLibre." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/ecommerce" />
        <meta property="og:image" content="https://kustodia.mx/og-ecommerce-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pagos seguros para compras en e-commerce y redes sociales | Kustodia" />
        <meta name="twitter:description" content="Compra en páginas independientes, Facebook, Instagram o marketplaces de servicios sin miedo a fraudes. Protege tu dinero con pagos en custodia blockchain, incluso fuera de Amazon o MercadoLibre." />
        <meta name="twitter:image" content="https://kustodia.mx/og-ecommerce-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-32 mt-20" aria-labelledby="ecommerce-heading">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 flex flex-col items-center max-w-5xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-30" aria-hidden="true"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaShoppingCart className="text-blue-700 text-4xl" />
              </div>
              
              <h1 id="ecommerce-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Pagos seguros para e-commerce
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
                ¿Vendes productos en línea y te preocupan las estafas? Con Kustodia, el dinero queda protegido hasta que el comprador reciba su producto.
              </p>
              
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Aumenta la confianza en tu tienda online y protege tanto a vendedores como compradores.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
                <p className="text-lg md:text-xl font-semibold text-blue-800 mb-4">
                  El dinero solo se libera cuando el comprador confirma que recibió el producto en perfectas condiciones.
                </p>
                <p className="text-base md:text-lg text-blue-700">
                  Sin producto entregado, no hay pago liberado. <strong>Protección total contra fraudes y productos no entregados</strong>.
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
              Ventajas para e-commerce
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Vende online con total seguridad y confianza
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Cero fraudes</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                El dinero solo se libera cuando el comprador confirma la recepción del producto.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaTruck className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Entrega confirmada</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                El comprador debe confirmar que recibió el producto para liberar el pago.
              </p>
            </article>

            <article className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:scale-[1.02] group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="text-blue-700 text-2xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-tight">Confianza mutua</h3>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                Compradores y vendedores ganan tranquilidad en cada transacción.
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
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si el comprador no confirma la recepción?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Si el comprador no confirma en el tiempo acordado, Kustodia puede intervenir como mediador y resolver según la evidencia de entrega.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Es compatible con mi tienda online actual?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  Kustodia se integra fácilmente con cualquier plataforma de e-commerce. Solo necesitas añadir nuestro botón de pago seguro.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">¿Qué pasa si el producto llega dañado?</h3>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed font-light">
                  El comprador puede rechazar el producto y el dinero queda en custodia hasta resolver el problema o se devuelve según lo acordado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-7xl px-6 mx-auto mb-20 text-center" aria-labelledby="cta-heading">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 lg:p-16 max-w-4xl mx-auto">
            <h2 id="cta-heading" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              ¿Quieres saber más sobre e-commerce seguro?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Lee nuestro blog: <Link href="/blog/evitar-fraudes-ecommerce" className="text-blue-600 underline hover:text-blue-800 font-semibold transition-colors">Cómo evitar fraudes en e-commerce</Link>
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
