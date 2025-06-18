import Header from '../../components/Header';
import { FaBuilding, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
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
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-12 mt-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
            <FaBuilding className="text-blue-700 text-5xl mb-4" />
            <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Pagos protegidos para empresas B2B y control de entregas</h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
              ¿Tu empresa compra o vende a otras empresas y necesita asegurar la entrega y calidad antes de liberar el pago? Kustodia protege el dinero en custodia blockchain hasta que ambas partes confirmen la entrega y conformidad.<br /><br />
              Ideal para pagos por adelantado, compras con múltiples entregas o flujos tipo escrow.
            </p>
            <div className="text-blue-700 font-bold mt-2 mb-4">
              El dinero solo se libera cuando la entrega y calidad han sido verificadas por ambas partes.
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">¿Cómo funciona para empresas B2B?</h2>
          <ol className="list-decimal list-inside bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-3">
            <li>Las empresas acuerdan el pago protegido y las condiciones de entrega/calidad.</li>
            <li>El dinero se transfiere a un <b>smart contract en la blockchain</b>, bloqueado para ambas partes.</li>
            <li>La entrega y calidad se verifican según lo pactado.</li>
            <li>Cuando ambas partes confirman, Kustodia libera el pago automáticamente.</li>
            <li>Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.</li>
          </ol>
          <div className="mt-4 text-center text-blue-700 font-bold">
            Ideal para pagos por adelantado, entregas múltiples y acuerdos de alto valor.
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Ventajas para empresas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg mb-3">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Sin fraudes ni sorpresas</div>
              <div className="text-gray-700">El dinero solo se libera si la entrega y calidad se cumplen como se prometió.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-3">
                <FaBuilding className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Confianza en cada operación</div>
              <div className="text-gray-700">Ideal para compras complejas, entregas múltiples y acuerdos de alto valor.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow-lg mb-3">
                <FaRegSmile className="text-blue-700 text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Tranquilidad para todos</div>
              <div className="text-gray-700">Ambas partes ganan seguridad y evitan conflictos.</div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-20 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">¿Quieres saber más sobre pagos protegidos B2B?</h2>
          <p className="mb-4 text-lg text-gray-700">Lee nuestro blog: <Link href="/blog/evitar-fraudes-b2b" className="text-blue-600 underline hover:text-blue-800">Cómo evitar fraudes y asegurar entregas en compras B2B</Link></p>
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </section>
      </main>
    </>
  );
}
