import Header from '../../components/Header';
import { FaHandshake, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';

export default function CompraVentaUseCase() {
  return (
    <>
      <header>
        <title>Compra-venta entre particulares | Pagos seguros con Kustodia</title>
        <meta name="description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Protege tu dinero en compras entre particulares usando pagos en custodia blockchain. Seguridad para comprador y vendedor." />
        <meta name="keywords" content="compra venta particulares, pagos seguros autos, gadgets, muebles, evitar fraudes, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/compra-venta" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Compra-venta entre particulares | Pagos seguros con Kustodia" />
        <meta property="og:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Protege tu dinero en compras entre particulares usando pagos en custodia blockchain. Seguridad para comprador y vendedor." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/compra-venta" />
        <meta property="og:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compra-venta entre particulares | Pagos seguros con Kustodia" />
        <meta name="twitter:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Protege tu dinero en compras entre particulares usando pagos en custodia blockchain. Seguridad para comprador y vendedor." />
        <meta name="twitter:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-12 mt-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
            <FaHandshake className="text-blue-700 text-5xl mb-4" />
            <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Compra-venta entre particulares sin fraudes</h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
              ¿Vas a vender o comprar un auto, gadget, mueble o cualquier bien entre particulares? El mayor riesgo es que el dinero o el bien no se entreguen como lo acordado.<br /><br />
              Con Kustodia, el dinero queda protegido en custodia blockchain hasta que ambas partes cumplen. Así, compras y vendes con total confianza.
            </p>
            <div className="text-blue-700 font-bold mt-2 mb-4">
              El dinero solo se libera cuando se cumplen las condiciones de la compraventa, protegiendo a ambas partes.
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">¿Cómo funciona para compra-venta entre particulares?</h2>
          <ol className="list-decimal list-inside bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-3">
            <li>El comprador y vendedor acuerdan las condiciones y usan Kustodia como intermediario seguro.</li>
            <li>El dinero se transfiere a un <b>smart contract en la blockchain</b>, bloqueado para ambas partes.</li>
            <li>El bien o producto se entrega según lo acordado.</li>
            <li>Cuando ambas partes confirman, Kustodia libera el pago automáticamente.</li>
            <li>Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.</li>
          </ol>
          <div className="mt-4 text-center text-blue-700 font-bold">
            Compra y vende con confianza, incluso sin conocer a la otra parte.
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Ventajas para compradores y vendedores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg mb-3">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Sin fraudes ni sorpresas</div>
              <div className="text-gray-700">El dinero solo se libera si el bien se entrega como se prometió.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-3">
                <FaHandshake className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Confianza en cada trato</div>
              <div className="text-gray-700">Ideal para autos, gadgets, muebles y cualquier bien entre particulares.</div>
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6">¿Quieres saber más sobre cómo comprar y vender seguro entre particulares?</h2>
          <p className="mb-4 text-lg text-gray-700">Lee nuestro blog: <Link href="/blog/evitar-fraudes-compra-venta" className="text-blue-600 underline hover:text-blue-800">Cómo evitar fraudes en compra-venta entre particulares</Link></p>
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </section>
      </main>
    </>
  );
}
