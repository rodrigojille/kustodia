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
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center px-4 pt-10 pb-20">
        <article className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-blue-100 p-10 mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaShoppingCart className="text-blue-700 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">Cómo evitar fraudes en compras online y marketplaces de servicios</h1>
          </div>
          <div className="text-gray-600 mb-6 text-base">Actualizado: Junio 2025 · Por Kustodia</div>

          <p className="text-lg text-gray-800 mb-6">
            Comprar fuera de Amazon, MercadoLibre o plataformas conocidas puede ser riesgoso: páginas independientes, ventas por Facebook o Instagram, y marketplaces de servicios suelen carecer de protección al comprador. Aquí te decimos cómo protegerte y comprar con confianza.
          </p>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Dónde ocurren más fraudes?</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li><b>Páginas independientes:</b> Tiendas online pequeñas o nuevas, sin reputación comprobada.</li>
            <li><b>Facebook e Instagram:</b> Compras por mensaje directo, grupos o Marketplace, donde no hay mediador.</li>
            <li><b>Marketplaces de servicios:</b> Plataformas que conectan profesionales y clientes pero no garantizan el pago seguro.</li>
          </ul>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Cómo protegerte usando Kustodia?</h2>
          <ol className="list-decimal list-inside bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6 text-gray-800">
            <li>Solicita al vendedor usar Kustodia para el pago seguro.</li>
            <li>El dinero se bloquea en un smart contract en la blockchain.</li>
            <li>Solo se libera si recibes el producto o servicio según lo acordado.</li>
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
                <FaShoppingCart className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Confianza en cada compra</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow mb-2">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Tranquilidad para todos</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Tips para comprar seguro</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li>Verifica la reputación del vendedor y busca referencias.</li>
            <li>No envíes dinero directo a cuentas personales si no conoces al vendedor.</li>
            <li>Solicita usar pagos en custodia para proteger tu dinero.</li>
            <li>Guarda toda la evidencia de la compra y la comunicación.</li>
          </ul>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-10 mb-4">
            <Link href="/ecommerce" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition text-center w-full md:w-auto">Ver cómo funciona para e-commerce</Link>
            <a href="/#early-access" className="inline-block bg-white border border-blue-600 text-blue-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition text-center w-full md:w-auto">Solicitar acceso anticipado</a>
          </div>

          <SocialShare
            url="https://kustodia.mx/blog/evitar-fraudes-ecommerce"
            title="Descubre cómo comprar seguro en páginas independientes, Facebook, Instagram y marketplaces con Kustodia — Evita fraudes en compras online!"
            summary="Tips para comprar seguro en internet y proteger tu dinero."
          />

        </article>

        <div className="w-full max-w-3xl mx-auto text-center mt-6">
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </div>
      </main>
    </>
  );
}
