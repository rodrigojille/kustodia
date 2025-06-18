import Header from '../../components/Header';
import { FaGlobe, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';

export default function MarketplacesUseCase() {
  return (
    <>
      <header>
        <title>Marketplaces de servicios | Pagos protegidos con Kustodia</title>
        <meta name="description" content="Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio." />
        <meta name="keywords" content="marketplaces servicios, pagos protegidos, escrow, custodia blockchain, plataformas profesionales, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/marketplaces" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Marketplaces de servicios | Pagos protegidos con Kustodia" />
        <meta property="og:description" content="Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/marketplaces" />
        <meta property="og:image" content="https://kustodia.mx/og-marketplaces-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Marketplaces de servicios | Pagos protegidos con Kustodia" />
        <meta name="twitter:description" content="Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio." />
        <meta name="twitter:image" content="https://kustodia.mx/og-marketplaces-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-12 mt-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
            <FaGlobe className="text-blue-700 text-5xl mb-4" />
            <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Pagos protegidos para marketplaces de servicios</h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
              ¿Tu plataforma conecta profesionales y clientes para ofrecer servicios? Protege los pagos en custodia blockchain: el dinero solo se libera cuando el cliente confirma que el servicio fue entregado y está satisfecho.<br /><br />
              Ideal para marketplaces, apps y plataformas de freelancers, consultores, técnicos, y cualquier servicio digital o presencial.
            </p>
            <div className="text-blue-700 font-bold mt-2 mb-4">
              El pago queda protegido hasta que la entrega y satisfacción sean verificadas por ambas partes.
            </div>
            <div className="w-full flex flex-col items-center mt-4">
              <a
                href="/#early-access"
                className="inline-block bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition"
              >
                Solicitar Acceso Anticipado
              </a>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">¿Cómo funciona para marketplaces de servicios?</h2>
          <ol className="list-decimal list-inside bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-3">
            <li>El cliente y el profesional acuerdan el servicio y usan Kustodia como intermediario seguro.</li>
            <li>El cliente transfiere el pago a un <b>smart contract en la blockchain</b>, bloqueado hasta la entrega.</li>
            <li>El profesional entrega el servicio según lo pactado.</li>
            <li>Cuando el cliente confirma satisfacción, Kustodia libera el pago automáticamente.</li>
            <li>Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.</li>
          </ol>
          <div className="mt-4 text-center text-blue-700 font-bold">
            Ideal para plataformas de servicios digitales, consultoría, técnicos, educación y más.
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Ventajas para plataformas y usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg mb-3">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Sin fraudes ni sorpresas</div>
              <div className="text-gray-700">El dinero solo se libera si el servicio se entrega como se prometió.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-3">
                <FaGlobe className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Confianza para todos</div>
              <div className="text-gray-700">Ideal para plataformas de servicios, apps y marketplaces digitales.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow-lg mb-3">
                <FaRegSmile className="text-blue-700 text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Satisfacción garantizada</div>
              <div className="text-gray-700">El cliente solo paga si está satisfecho con el servicio recibido.</div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-20 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">¿Quieres saber más sobre pagos protegidos en marketplaces?</h2>
          <p className="mb-4 text-lg text-gray-700">Lee nuestro blog: <Link href="/blog/evitar-fraudes-marketplaces" className="text-blue-600 underline hover:text-blue-800">Cómo evitar fraudes y proteger pagos en marketplaces de servicios</Link></p>
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </section>
      </main>
    </>
  );
}
