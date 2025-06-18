import Header from '../../components/Header';
import { FaShoppingCart, FaShieldAlt, FaRegSmile, FaInstagram, FaFacebook } from 'react-icons/fa';
import Link from 'next/link';

export default function EcommerceUseCase() {
  return (
    <>
      <header>
        <title>Pagos seguros para compras en e-commerce y redes sociales | Kustodia</title>
        <meta name="description" content="Compra en páginas independientes, Facebook, Instagram o marketplaces de servicios sin miedo a fraudes. Protege tu dinero con pagos en custodia blockchain, incluso fuera de Amazon o MercadoLibre." />
        <meta name="keywords" content="pagos seguros ecommerce, evitar fraudes compras, custodia blockchain, compras Facebook, compras Instagram, marketplaces servicios, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/ecommerce" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pagos seguros para compras en e-commerce y redes sociales | Kustodia" />
        <meta property="og:description" content="Compra en páginas independientes, Facebook, Instagram o marketplaces de servicios sin miedo a fraudes. Protege tu dinero con pagos en custodia blockchain, incluso fuera de Amazon o MercadoLibre." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/ecommerce" />
        <meta property="og:image" content="https://kustodia.mx/og-ecommerce-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pagos seguros para compras en e-commerce y redes sociales | Kustodia" />
        <meta name="twitter:description" content="Compra en páginas independientes, Facebook, Instagram o marketplaces de servicios sin miedo a fraudes. Protege tu dinero con pagos en custodia blockchain, incluso fuera de Amazon o MercadoLibre." />
        <meta name="twitter:image" content="https://kustodia.mx/og-ecommerce-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-12 mt-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
            <FaShoppingCart className="text-blue-700 text-5xl mb-4" />
            <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Compra seguro fuera de Amazon y MercadoLibre</h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
              ¿Vas a comprar en una página independiente, por Facebook, Instagram o en un marketplace de servicios? ¿Te preocupa que no te entreguen el producto o el servicio no se cumpla?<br /><br />
              Con Kustodia, tu dinero queda protegido en custodia blockchain hasta que recibes lo que pagaste. Así, puedes comprar con confianza incluso fuera de plataformas tradicionales.
            </p>
            <div className="text-blue-700 font-bold mt-2 mb-4">
              No importa si compras en una tienda online pequeña, en redes sociales o en un marketplace de servicios: <span className="text-base text-blue-900 font-normal">tu dinero solo se libera cuando recibes el producto o el servicio como lo acordaste.</span>
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">¿Cómo funciona para e-commerce y marketplaces?</h2>
          <ol className="list-decimal list-inside bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-3">
            <li>El comprador inicia un pago seguro y define las condiciones de entrega.</li>
            <li>El dinero se transfiere a un <b>smart contract en la blockchain</b>, bloqueado para ambas partes.</li>
            <li>El vendedor entrega el producto o servicio según lo acordado.</li>
            <li>Cuando el comprador confirma la recepción, Kustodia libera el pago automáticamente.</li>
            <li>Si hay disputa, Kustodia puede intervenir y resolver según la evidencia.</li>
          </ol>
          <div className="mt-4 text-center text-blue-700 font-bold">
            Compra y vende con confianza, incluso fuera de plataformas tradicionales.
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
              <div className="text-gray-700">El dinero solo se libera si el producto o servicio se entrega como se prometió.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-3">
                <FaShoppingCart className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Confianza en cada compra</div>
              <div className="text-gray-700">Ideal para tiendas independientes, Facebook, Instagram y marketplaces de servicios.</div>
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6">¿Quieres saber más sobre cómo comprar seguro fuera de Amazon o MercadoLibre?</h2>
          <p className="mb-4 text-lg text-gray-700">Lee nuestro blog: <Link href="/blog/evitar-fraudes-ecommerce" className="text-blue-600 underline hover:text-blue-800">Cómo evitar fraudes en compras online y marketplaces de servicios</Link></p>
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </section>
      </main>
    </>
  );
}
