import Header from '../../../components/Header';
import { FaBuilding, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';
import SocialShare from '../../../components/SocialShare';

export default function BlogEvitarFraudesB2B() {
  return (
    <>
      <header>
        <title>Cómo evitar fraudes y asegurar entregas en compras B2B | Kustodia Blog</title>
        <meta name="description" content="Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Tips para evitar fraudes B2B y flujos tipo escrow." />
        <meta name="keywords" content="fraudes B2B, pagos protegidos empresas, control de entregas, escrow, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-b2b" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo evitar fraudes y asegurar entregas en compras B2B | Kustodia Blog" />
        <meta property="og:description" content="Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Tips para evitar fraudes B2B y flujos tipo escrow." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-b2b" />
        <meta property="og:image" content="https://kustodia.mx/og-b2b-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo evitar fraudes y asegurar entregas en compras B2B | Kustodia Blog" />
        <meta name="twitter:description" content="Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Tips para evitar fraudes B2B y flujos tipo escrow." />
        <meta name="twitter:image" content="https://kustodia.mx/og-b2b-main.png" />
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
              Cómo evitar fraudes y asegurar entregas en compras B2B
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 leading-relaxed font-light">
              Las compras entre empresas suelen implicar montos altos, entregas múltiples y riesgos de incumplimiento. Aquí te explicamos cómo proteger tus pagos y asegurar la entrega y calidad usando custodia blockchain.
            </p>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                ¿Cuáles son los riesgos más comunes?
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Pagos por adelantado:</strong> El proveedor recibe el dinero y no entrega o la calidad no es la pactada.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Entregas parciales o múltiples:</strong> Dificultad para coordinar pagos y entregas en varias etapas.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    <div>
                      <strong className="text-gray-900">Falta de intermediario:</strong> No hay una entidad que asegure el cumplimiento de ambas partes.
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
                    Las empresas acuerdan usar Kustodia para el pago protegido.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">2</span>
                    El dinero se bloquea en un smart contract en la blockchain.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">3</span>
                    Solo se libera cuando ambas partes confirman que la entrega y calidad se cumplieron.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1">4</span>
                    Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.
                  </li>
                </ol>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Tips para compras B2B seguras
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Deja por escrito las condiciones de entrega y calidad.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    No pagues todo por adelantado sin protección.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Solicita usar pagos en custodia para proteger ambas partes.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-xl">•</span>
                    Guarda toda la evidencia de la negociación y entrega.
                  </li>
                </ul>
              </div>
            </section>
            
            <div className="text-center mb-12">
              <Link 
                href="/b2b" 
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-semibold px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Ver cómo funciona para empresas B2B
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-700 mb-6 font-semibold">
                ¿Te gustó este artículo? <span className="text-blue-700">¡Compártelo y ayuda a que las empresas operen con mayor seguridad!</span>
              </p>
              <SocialShare
                url="https://kustodia.mx/blog/evitar-fraudes-b2b"
                title="Descubre cómo proteger pagos y entregas en compras B2B con Kustodia — Evita fraudes y conflictos en empresas!"
                summary="Tips para compras B2B seguras y control de entregas."
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
