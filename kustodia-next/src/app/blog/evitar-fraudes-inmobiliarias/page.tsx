import Header from '../../../components/Header';
import { FaHome, FaShieldAlt, FaRegSmile, FaShareAlt } from 'react-icons/fa';
import Link from 'next/link';
import SocialShare from '../../../components/SocialShare';

export default function BlogEvitarFraudesInmobiliarias() {
  return (
    <>
      <header>
        <title>Cómo evitar fraudes en operaciones inmobiliarias | Kustodia</title>
        <meta name="description" content="Descubre cómo proteger anticipos, apartados y rentas de fraudes inmobiliarios con pagos en custodia blockchain. Guía práctica para agentes y clientes." />
        <meta name="keywords" content="fraudes inmobiliarios, evitar fraudes, pagos en custodia, blockchain inmobiliaria, anticipos seguros, apartados, rentas, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-inmobiliarias" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo evitar fraudes en operaciones inmobiliarias | Kustodia" />
        <meta property="og:description" content="Descubre cómo proteger anticipos, apartados y rentas de fraudes inmobiliarios con pagos en custodia blockchain. Guía práctica para agentes y clientes." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-inmobiliarias" />
        <meta property="og:image" content="https://kustodia.mx/og-inmobiliarias-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo evitar fraudes en operaciones inmobiliarias | Kustodia" />
        <meta name="twitter:description" content="Descubre cómo proteger anticipos, apartados y rentas de fraudes inmobiliarios con pagos en custodia blockchain. Guía práctica para agentes y clientes." />
        <meta name="twitter:image" content="https://kustodia.mx/og-inmobiliarias-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center px-4 pt-10 pb-20">
        <article className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-blue-100 p-10 mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaHome className="text-blue-700 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">Cómo evitar fraudes en operaciones inmobiliarias</h1>
          </div>
          <div className="text-gray-600 mb-6 text-base">Actualizado: Junio 2025 · Por Kustodia</div>

          <p className="text-lg text-gray-800 mb-6">
            ¿Te ha pasado que un cliente aparta una propiedad y luego desaparece? ¿O que entregas llaves y el anticipo nunca llega? Los fraudes en el sector inmobiliario son más comunes de lo que imaginas, pero hoy existen formas modernas y tecnológicas de protegerte.
          </p>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Historias reales: ¿cómo ocurre el fraude?</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li><b>El anticipo fantasma:</b> El cliente promete transferir el anticipo, pero nunca llega. El trato se cae y el agente pierde tiempo y oportunidades.</li>
            <li><b>El apartado sin compromiso:</b> El cliente aparta, pero luego se arrepiente y exige el reembolso, dejando al agente sin ingresos y con la propiedad fuera del mercado.</li>
            <li><b>La renta insegura:</b> El inquilino paga el primer mes, recibe las llaves y luego deja de pagar, generando pérdidas y conflictos.</li>
          </ul>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Solución: pagos en custodia blockchain</h2>
          <p className="mb-4 text-gray-800">
            Con Kustodia, los anticipos, apartados y rentas quedan bloqueados en un smart contract en la blockchain. El dinero solo se libera cuando ambas partes cumplen lo acordado. Si el trato no se concreta, el dinero se devuelve de forma automática y transparente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow mb-2">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Sin fraudes ni pérdidas</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow mb-2">
                <FaHome className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Propiedades protegidas</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow mb-2">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Tranquilidad para todos</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Tips para agentes y clientes</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li>Exige siempre que los anticipos y apartados se hagan en custodia, nunca directo a una cuenta personal.</li>
            <li>Verifica que el dinero esté bloqueado antes de entregar llaves o firmar contrato.</li>
            <li>Utiliza plataformas con historial y reputación verificable.</li>
            <li>Si hay disputa, recurre a la evidencia y deja que la tecnología decida de forma justa.</li>
          </ul>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-10 mb-4">
            <Link href="/inmobiliarias" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition text-center w-full md:w-auto">Ver cómo funciona para inmobiliarias</Link>
            <a href="/#early-access" className="inline-block bg-white border border-blue-600 text-blue-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition text-center w-full md:w-auto">Solicitar acceso anticipado</a>
          </div>

          <SocialShare
            url="https://kustodia.mx/blog/evitar-fraudes-inmobiliarias"
            title="Descubre cómo proteger anticipos y rentas en inmuebles con Kustodia — Evita fraudes en operaciones inmobiliarias!"
            summary="Tips para proteger anticipos y rentas en inmuebles."
          />
        </article>

        <div className="w-full max-w-3xl mx-auto text-center mt-6">
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </div>
      </main>
    </>
  );
}
