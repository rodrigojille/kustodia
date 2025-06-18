import Header from '../../../components/Header';
import { FaHandshake, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';
import SocialShare from '@/components/SocialShare';

export default function BlogEvitarFraudesCompraVenta() {
  return (
    <>
      <header>
        <title>Cómo evitar fraudes en compra-venta entre particulares | Kustodia Blog</title>
        <meta name="description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Tips para proteger tu dinero en compras entre particulares usando pagos en custodia blockchain." />
        <meta name="keywords" content="fraudes compra venta particulares, pagos seguros autos, gadgets, muebles, evitar fraudes, custodia blockchain, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/blog/evitar-fraudes-compra-venta" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Cómo evitar fraudes en compra-venta entre particulares | Kustodia Blog" />
        <meta property="og:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Tips para proteger tu dinero en compras entre particulares usando pagos en custodia blockchain." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://kustodia.mx/blog/evitar-fraudes-compra-venta" />
        <meta property="og:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cómo evitar fraudes en compra-venta entre particulares | Kustodia Blog" />
        <meta name="twitter:description" content="Evita fraudes en ventas de autos, gadgets, muebles y más. Tips para proteger tu dinero en compras entre particulares usando pagos en custodia blockchain." />
        <meta name="twitter:image" content="https://kustodia.mx/og-compra-venta-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center px-4 pt-10 pb-20">
        <article className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-blue-100 p-10 mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaHandshake className="text-blue-700 text-3xl" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-800">Cómo evitar fraudes en compra-venta entre particulares</h1>
          </div>
          <div className="text-gray-600 mb-6 text-base">Actualizado: Junio 2025 · Por Kustodia</div>

          <p className="text-lg text-gray-800 mb-6">
            Comprar o vender entre particulares (autos, gadgets, muebles, etc.) implica riesgos: pagos que no llegan, bienes que no se entregan, o disputas difíciles de resolver. Aquí te explicamos cómo protegerte y cerrar tratos sin miedo.
          </p>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Dónde ocurren más fraudes?</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li><b>Ventas de autos:</b> El comprador paga y nunca recibe el auto, o el vendedor entrega y nunca recibe el dinero.</li>
            <li><b>Gadgets y electrónicos:</b> Pagos por transferencia directa sin protección.</li>
            <li><b>Muebles y bienes usados:</b> Tratos entre desconocidos donde no hay intermediario seguro.</li>
          </ul>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">¿Cómo protegerte usando Kustodia?</h2>
          <ol className="list-decimal list-inside bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6 text-gray-800">
            <li>Acuerden usar Kustodia para el pago seguro.</li>
            <li>El dinero se bloquea en un smart contract en la blockchain.</li>
            <li>Solo se libera cuando ambas partes confirman que el bien fue entregado como se acordó.</li>
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
                <FaHandshake className="text-white text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Confianza en cada trato</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-6 shadow border border-blue-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow mb-2">
                <FaRegSmile className="text-blue-700 text-2xl" />
              </div>
              <div className="font-bold text-blue-800">Tranquilidad para todos</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-700 mb-3 mt-8">Tips para comprar y vender seguro</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-6">
            <li>Evita transferencias directas a desconocidos.</li>
            <li>Deja por escrito las condiciones del trato.</li>
            <li>Solicita usar pagos en custodia para proteger ambas partes.</li>
            <li>Guarda toda la evidencia de la negociación y entrega.</li>
          </ul>

          <div className="flex flex-col md:flex-row gap-4 items-center mt-10 mb-4">
            <Link href="/compra-venta" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition text-center w-full md:w-auto">Ver cómo funciona para compra-venta</Link>
            <a href="/#early-access" className="inline-block bg-white border border-blue-600 text-blue-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition text-center w-full md:w-auto">Solicitar acceso anticipado</a>
          </div>

          <SocialShare
            url="https://kustodia.mx/blog/evitar-fraudes-compra-venta"
            title="Descubre cómo proteger tu dinero en compra-venta entre particulares con Kustodia — Evita fraudes en ventas de autos, gadgets, muebles y más!"
            summary="Tips para proteger tu dinero en ventas de autos, gadgets, muebles."
          />
        </article>

        <div className="w-full max-w-3xl mx-auto text-center mt-6">
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </div>
      </main>
    </>
  );
}
