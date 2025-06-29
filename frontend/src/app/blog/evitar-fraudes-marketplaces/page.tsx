import Header from '../../../components/Header';
import SocialShare from '../../../components/SocialShare';
import { FaGlobe, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';

export default function BlogEvitarFraudesMarketplaces() {
  return (
    <>
      <header>
        <title>Cómo evitar fraudes y proteger pagos en marketplaces de servicios | Kustodia Blog</title>
        <meta name="description" content="Facilita pagos en custodia en marketplaces de servicios y protege a clientes y profesionales. Tips para evitar fraudes y asegurar satisfacción usando blockchain." />
        <meta name="keywords" content="fraudes marketplaces servicios, pagos protegidos, escrow, custodia blockchain, plataformas profesionales, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-marketplaces" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo evitar fraudes y proteger pagos en marketplaces de servicios | Kustodia Blog" />
        <meta property="og:description" content="Facilita pagos en custodia en marketplaces de servicios y protege a clientes y profesionales. Tips para evitar fraudes y asegurar satisfacción usando blockchain." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-marketplaces" />
        <meta property="og:image" content="https://kustodia.mx/og-marketplaces-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo evitar fraudes y proteger pagos en marketplaces de servicios | Kustodia Blog" />
        <meta name="twitter:description" content="Facilita pagos en custodia en marketplaces de servicios y protege a clientes y profesionales. Tips para evitar fraudes y asegurar satisfacción usando blockchain." />
        <meta name="twitter:image" content="https://kustodia.mx/og-marketplaces-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
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
              Los marketplaces online han facilitado las compras, pero también han creado nuevas oportunidades para estafadores. Aprende a protegerte y hacer compras seguras en cualquier plataforma.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                ¿Cuáles son los fraudes más comunes?
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Vendedores falsos:</strong> Perfiles creados recientemente con productos inexistentes o falsificados.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Pagos fuera de la plataforma:</strong> Solicitan transferencias directas para "mejores precios".
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Productos que nunca llegan:</strong> Reciben el pago pero no envían el producto.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Phishing y links maliciosos:</strong> Te redirigen a sitios falsos para robar tus datos.
                    </div>
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                ¿Cómo protegerte usando Kustodia?
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                <ol className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">1</span>
                    Propón al vendedor usar Kustodia como método de pago protegido.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">2</span>
                    El dinero se deposita en un smart contract hasta verificar la entrega.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">3</span>
                    Solo se libera cuando confirmas que recibiste el producto correcto.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">4</span>
                    Si hay problemas, Kustodia puede mediar con evidencia para resolver.
                  </li>
                </ol>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Señales de alerta en marketplaces
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <ul className="space-y-4 text-lg text-red-700 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold text-xl">⚠</span>
                    Precios extremadamente bajos comparados con el mercado.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold text-xl">⚠</span>
                    Vendedor insiste en pago inmediato o transferencia directa.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold text-xl">⚠</span>
                    Perfil con poca historia o reseñas muy recientes.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold text-xl">⚠</span>
                    Comunicación solo por chat privado, evita el marketplace.
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Tips para compras seguras
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Verifica la reputación y reseñas del vendedor.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Lee los términos de protección del marketplace.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Usa pagos en custodia para transacciones importantes.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Documenta toda la comunicación y detalles del producto.
                  </li>
                </ul>
              </div>
            </section>
            
            <div className="text-center mb-12">
              <Link 
                href="/marketplaces" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Ver cómo funciona para marketplaces
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-700 mb-6 font-semibold">
                ¿Te gustó este artículo? <span className="text-blue-700">¡Compártelo y ayuda a que las compras online sean más seguras!</span>
              </p>
              <SocialShare
                url="https://kustodia.mx/blog/evitar-fraudes-marketplaces"
                title="Descubre cómo comprar seguro en marketplaces online con Kustodia — Evita fraudes y estafas en plataformas de venta!"
                summary="Tips para compras seguras en marketplaces online."
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
