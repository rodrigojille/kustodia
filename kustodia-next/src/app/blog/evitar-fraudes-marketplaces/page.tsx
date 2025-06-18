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
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center px-4 pt-10 pb-20">
        <article className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-blue-100 p-10 mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaGlobe className="text-blue-700 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">Cómo evitar fraudes y proteger pagos en marketplaces de servicios</h1>
          </div>
          <div className="text-gray-600 mb-6 text-base">Actualizado: Junio 2025 · Por Kustodia</div>

          <p className="text-lg text-gray-800 mb-6">
            Los marketplaces de servicios conectan profesionales y clientes, pero también pueden ser terreno fértil para fraudes y disputas. Aquí te explicamos cómo proteger los pagos y garantizar la satisfacción usando custodia blockchain.
          </p>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Dónde ocurren más fraudes?</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li><b>Servicios no entregados:</b> El profesional recibe el pago pero no cumple.</li>
            <li><b>Clientes insatisfechos:</b> El cliente paga y el servicio no es lo prometido.</li>
            <li><b>Disputas difíciles de resolver:</b> Falta de intermediario imparcial.</li>
          </ul>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Cómo protegerse usando Kustodia?</h2>
          <ol className="list-decimal list-inside bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6 text-gray-800">
            <li>El cliente y el profesional acuerdan usar Kustodia para el pago seguro.</li>
            <li>El pago se bloquea en un smart contract en la blockchain.</li>
            <li>El profesional entrega el servicio según lo pactado.</li>
            <li>El cliente confirma satisfacción y se libera el pago.</li>
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
                <FaGlobe className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Confianza para todos</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow mb-2">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Satisfacción garantizada</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Tips para marketplaces de servicios seguros</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li>Define claramente el alcance del servicio y las condiciones de satisfacción.</li>
            <li>Utiliza pagos en custodia para proteger a ambas partes.</li>
            <li>Guarda toda la evidencia de la negociación y entrega.</li>
          </ul>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-10 mb-4">
            <Link href="/marketplaces" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition text-center w-full md:w-auto">Ver cómo funciona para marketplaces</Link>
            <a href="/#early-access" className="inline-block bg-white border border-blue-600 text-blue-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition text-center w-full md:w-auto">Solicitar acceso anticipado</a>
          </div>

          <div className="flex gap-4 mt-8 mb-2 items-center justify-center bg-blue-50 rounded-xl p-4 border border-blue-200">
            <span className="font-bold text-blue-800">Compartir:</span>
            <a
              href="https://twitter.com/intent/tweet?text=Descubre%20c%C3%B3mo%20proteger%20pagos%20y%20servicios%20en%20marketplaces%20con%20Kustodia%20%E2%80%94%20Evita%20fraudes%20y%20conflictos%20en%20plataformas!%20https%3A%2F%2Fkustodia.mx%2Fblog%2Fevitar-fraudes-marketplaces&utm_source=blog&utm_medium=social&utm_campaign=share"
              target="_blank" rel="noopener noreferrer" aria-label="Compartir en Twitter" className="hover:text-blue-500"
            >
              <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 001.964-2.478 8.972 8.972 0 01-2.828 1.082 4.48 4.48 0 00-7.636 4.088A12.72 12.72 0 013.15 4.61a4.48 4.48 0 001.388 5.976 4.47 4.47 0 01-2.03-.56v.057a4.48 4.48 0 003.59 4.393 4.486 4.486 0 01-2.025.077 4.48 4.48 0 004.184 3.11A8.98 8.98 0 012 19.54a12.72 12.72 0 006.89 2.02c8.26 0 12.785-6.84 12.785-12.77 0-.195-.005-.39-.014-.583A9.18 9.18 0 0024 4.59a8.978 8.978 0 01-2.54.698z"/></svg>
            </a>
            <a
              href="https://wa.me/?text=Descubre%20c%C3%B3mo%20proteger%20pagos%20y%20servicios%20en%20marketplaces%20con%20Kustodia%3A%20https%3A%2F%2Fkustodia.mx%2Fblog%2Fevitar-fraudes-marketplaces&utm_source=blog&utm_medium=social&utm_campaign=share"
              target="_blank" rel="noopener noreferrer" aria-label="Compartir en WhatsApp" className="hover:text-green-500"
            >
              <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.91 11.91 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.98L0 24l6.26-1.64A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.71 0-3.39-.44-4.86-1.28l-.35-.2-3.72.97.99-3.62-.22-.37A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2c2.5 0 4.85.98 6.62 2.75A9.92 9.92 0 0122 12c0 5.52-4.48 10-10 10zm5.06-7.47c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.26-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.13-.42-2.16-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.13-.13.29-.34.44-.51.15-.17.2-.29.3-.48.1-.19.05-.36-.02-.5-.07-.13-.61-1.47-.83-2.01-.22-.54-.44-.47-.61-.48-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.11 4.92 4.24.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.6-.65 1.83-1.29.23-.64.23-1.19.16-1.29-.07-.1-.25-.16-.52-.29z"/></svg>
            </a>
            <a
              href="https://www.linkedin.com/shareArticle?mini=true&url=https://kustodia.mx/blog/evitar-fraudes-marketplaces&title=Cómo%20evitar%20fraudes%20y%20proteger%20pagos%20en%20marketplaces%20de%20servicios%20con%20custodia%20blockchain&summary=Tips%20para%20plataformas%20de%20servicios%20y%20clientes%20seguros.&source=Kustodia&utm_source=blog&utm_medium=social&utm_campaign=share"
              target="_blank" rel="noopener noreferrer" aria-label="Compartir en LinkedIn" className="hover:text-blue-700"
            >
              <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20.25h-3v-9h3v9zm-1.5-10.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm15.25 10.25h-3v-4.5c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.17-1.73 2.38v4.57h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.03 0 3.59 2 3.59 4.59v4.72zm0 0"/></svg>
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkustodia.mx%2Fblog%2Fevitar-fraudes-marketplaces&utm_source=blog&utm_medium=social&utm_campaign=share"
              target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook" className="hover:text-blue-800"
            >
              <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .733.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.729 0 1.321-.591 1.321-1.324v-21.35c0-.733-.592-1.325-1.325-1.325z"/></svg>
            </a>
          </div>
        </article>

        <div className="w-full max-w-3xl mx-auto text-center mt-6">
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </div>
      </main>
    </>
  );
}
