import Header from '../../../components/Header';
import { FaShoppingCart, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';
import SocialShare from '../../../components/SocialShare';

export default function BlogEvitarFraudesEcommerce() {
  return (
    <>
      <header>
        <title>Cómo evitar fraudes en compras online y marketplaces de servicios | Kustodia Blog</title>
        <meta name="description" content="Compra seguro en páginas independientes, Facebook, Instagram y marketplaces de servicios. Tips para evitar fraudes y proteger tu dinero con pagos en custodia blockchain." />
        <meta name="keywords" content="fraudes ecommerce, evitar fraudes compras online, pagos seguros facebook, compras instagram, marketplaces servicios, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-ecommerce" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo evitar fraudes en compras online y marketplaces de servicios | Kustodia Blog" />
        <meta property="og:description" content="Compra seguro en páginas independientes, Facebook, Instagram y marketplaces de servicios. Tips para evitar fraudes y proteger tu dinero con pagos en custodia blockchain." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-ecommerce" />
        <meta property="og:image" content="https://kustodia.mx/og-ecommerce-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo evitar fraudes en compras online y marketplaces de servicios | Kustodia Blog" />
        <meta name="twitter:description" content="Compra seguro en páginas independientes, Facebook, Instagram y marketplaces de servicios. Tips para evitar fraudes y proteger tu dinero con pagos en custodia blockchain." />
        <meta name="twitter:image" content="https://kustodia.mx/og-ecommerce-main.png" />
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
              Cómo evitar fraudes y proteger tu tienda online
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed font-light">
              Tener una tienda online es emocionante: puedes vender 24/7 y llegar a clientes de todo México. Pero también viene con riesgos que pueden costar dinero y credibilidad.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Principales riesgos del e-commerce
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Contracargos (chargebacks) de clientes deshonestos.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Pedidos falsos que buscan obtener productos gratis.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Fraudes con tarjetas de crédito robadas.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Clientes que reclaman que no recibieron el producto.
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Cómo proteger tu negocio
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Verifica la identidad del comprador antes de enviar productos caros.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Usa servicios de paquetería con seguimiento y confirmación de entrega.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Implementa un sistema de pagos en custodia para productos de alto valor.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Documenta todo: conversaciones, envíos y confirmaciones de entrega.
                  </li>
                </ul>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                La solución definitiva: pagos en custodia blockchain
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  Con Kustodia, el dinero del cliente queda bloqueado hasta que confirme que recibió el producto en buenas condiciones. Si reclama algo falso, tienes evidencia del envío para protegerte. Es la forma más segura de vender online sin riesgo de fraudes.
                </p>
              </div>
            </section>
            
            <div className="text-center mb-12">
              <Link 
                href="/ecommerce" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Descubre cómo funciona para e-commerce
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-700 mb-6 font-semibold">
                ¿Te gustó este artículo? <span className="text-blue-700">¡Compártelo y ayuda a otros emprendedores a proteger sus negocios!</span>
              </p>
              <SocialShare
                url="https://kustodia.mx/blog/evitar-fraudes-ecommerce"
                title="Protege tu tienda online de fraudes con Kustodia — Vende seguro y aumenta tus ganancias"
                summary="Descubre cómo proteger tu e-commerce de contracargos y fraudes con pagos en custodia blockchain."
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
