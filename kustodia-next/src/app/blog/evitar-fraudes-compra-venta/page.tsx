import Header from '../../../components/Header';
import { FaHandshake, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';
import SocialShare from '../../../components/SocialShare';

export default function BlogEvitarFraudesCompraVenta() {
  return (
    <>
      <header>
        <title>Cómo evitar fraudes en compra-venta entre particulares | Kustodia Blog</title>
        <meta name="description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Tips para proteger tu dinero en compras entre particulares usando pagos en custodia blockchain." />
        <meta name="keywords" content="fraudes compra venta particulares, pagos seguros autos, gadgets, muebles, evitar fraudes, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-compra-venta" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo evitar fraudes en compra-venta entre particulares | Kustodia Blog" />
        <meta property="og:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Tips para proteger tu dinero en compras entre particulares usando pagos en custodia blockchain." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-compra-venta" />
        <meta property="og:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo evitar fraudes en compra-venta entre particulares | Kustodia Blog" />
        <meta name="twitter:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Tips para proteger tu dinero en compras entre particulares usando pagos en custodia blockchain." />
        <meta name="twitter:image" content="https://kustodia.mx/og-compra-venta-main.png" />
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
              Cómo evitar fraudes en compra-venta entre particulares
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed font-light">
              Comprar y vender entre particulares puede ser riesgoso: desde artículos falsificados hasta estafas con pagos. Aquí te mostramos cómo protegerte y hacer transacciones seguras.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                ¿Dónde ocurren más fraudes?
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Facebook Marketplace:</strong> Sin protección al comprador, pagos directos sin mediación.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Grupos de WhatsApp:</strong> Ventas por mensaje directo, sin verificación del vendedor.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Sitios clasificados:</strong> Plataformas que conectan, pero no protegen la transacción.
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
                    Propón al vendedor o comprador usar Kustodia para el pago seguro.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">2</span>
                    El dinero se bloquea en la blockchain hasta que ambos cumplan.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">3</span>
                    Solo se libera cuando el comprador recibe y verifica el artículo.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">4</span>
                    Si hay disputa, Kustodia interviene con evidencia para resolver.
                  </li>
                </ol>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Tips para compra-venta segura
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Verifica la reputación del vendedor y pide referencias.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    No envíes dinero directo sin protección.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Solicita usar pagos en custodia para proteger tu dinero.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Guarda toda la evidencia de la compra y la comunicación.
                  </li>
                </ul>
              </div>
            </section>
            
            <div className="text-center mb-12">
              <Link 
                href="/compra-venta" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Ver cómo funciona para compra-venta
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-700 mb-6 font-semibold">
                ¿Te gustó este artículo? <span className="text-blue-700">¡Compártelo y ayuda a que las compras entre particulares sean más seguras!</span>
              </p>
              <SocialShare
                url="https://kustodia.mx/blog/evitar-fraudes-compra-venta"
                title="Descubre cómo comprar y vender seguro entre particulares con Kustodia — Evita fraudes en Facebook, WhatsApp y clasificados!"
                summary="Tips para compra-venta segura entre particulares."
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
