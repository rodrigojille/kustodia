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
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center px-4 pt-10 pb-20">
        <article className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-blue-100 p-10 mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaBuilding className="text-blue-700 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">Cómo evitar fraudes y asegurar entregas en compras B2B</h1>
          </div>
          <div className="text-gray-600 mb-6 text-base">Actualizado: Junio 2025 · Por Kustodia</div>

          <p className="text-lg text-gray-800 mb-6">
            Las compras entre empresas suelen implicar montos altos, entregas múltiples y riesgos de incumplimiento. Aquí te explicamos cómo proteger tus pagos y asegurar la entrega y calidad usando custodia blockchain.
          </p>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Cuáles son los riesgos más comunes?</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li><b>Pagos por adelantado:</b> El proveedor recibe el dinero y no entrega o la calidad no es la pactada.</li>
            <li><b>Entregas parciales o múltiples:</b> Dificultad para coordinar pagos y entregas en varias etapas.</li>
            <li><b>Falta de intermediario:</b> No hay una entidad que asegure el cumplimiento de ambas partes.</li>
          </ul>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Cómo protegerte usando Kustodia?</h2>
          <ol className="list-decimal list-inside bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6 text-gray-800">
            <li>Las empresas acuerdan usar Kustodia para el pago protegido.</li>
            <li>El dinero se bloquea en un smart contract en la blockchain.</li>
            <li>Solo se libera cuando ambas partes confirman que la entrega y calidad se cumplieron.</li>
            <li>Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.</li>
          </ol>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow mb-2">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Sin fraudes ni sorpresas</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow mb-2">
                <FaBuilding className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Confianza en cada operación</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow mb-2">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Tranquilidad para todos</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Tips para compras B2B seguras</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li>Deja por escrito las condiciones de entrega y calidad.</li>
            <li>No pagues todo por adelantado sin protección.</li>
            <li>Solicita usar pagos en custodia para proteger ambas partes.</li>
            <li>Guarda toda la evidencia de la negociación y entrega.</li>
          </ul>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-10 mb-4">
            <Link href="/b2b" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition text-center w-full md:w-auto">Ver cómo funciona para empresas B2B</Link>
            <a href="/#early-access" className="inline-block bg-white border border-blue-600 text-blue-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition text-center w-full md:w-auto">Solicitar acceso anticipado</a>
          </div>

          <SocialShare
            url="https://kustodia.mx/blog/evitar-fraudes-b2b"
            title="Descubre cómo proteger pagos y entregas en compras B2B con Kustodia — Evita fraudes y conflictos en empresas!"
            summary="Tips para compras B2B seguras y control de entregas."
          />

        </article>

        <div className="w-full max-w-3xl mx-auto text-center mt-6">
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </div>
      </main>
    </>
  );
}
