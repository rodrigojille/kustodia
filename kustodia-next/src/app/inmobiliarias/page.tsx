import Header from '../../components/Header';
import { FaHome, FaHandshake, FaShieldAlt, FaRegSmile } from 'react-icons/fa';
import Link from 'next/link';

export default function InmobiliariasUseCase() {
  return (
    <>
      <header>
        <title>Pagos seguros para inmobiliarias y agentes | Kustodia</title>
        <meta name="description" content="Cierra ventas más rápido y protege anticipos, apartados y rentas con pagos en custodia blockchain. Seguridad y confianza total para inmobiliarias y agentes." />
        <meta name="keywords" content="pagos seguros inmobiliarias, custodia blockchain, anticipos, apartados, rentas, evitar fraudes inmobiliarios, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/inmobiliarias" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pagos seguros para inmobiliarias y agentes | Kustodia" />
        <meta property="og:description" content="Cierra ventas más rápido y protege anticipos, apartados y rentas con pagos en custodia blockchain. Seguridad y confianza total para inmobiliarias y agentes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/inmobiliarias" />
        <meta property="og:image" content="https://kustodia.mx/og-inmobiliarias-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pagos seguros para inmobiliarias y agentes | Kustodia" />
        <meta name="twitter:description" content="Cierra ventas más rápido y protege anticipos, apartados y rentas con pagos en custodia blockchain. Seguridad y confianza total para inmobiliarias y agentes." />
        <meta name="twitter:image" content="https://kustodia.mx/og-inmobiliarias-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-12 mt-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg mb-4">
              <FaHome className="text-white text-4xl" />
            </div>
            <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Pagos protegidos para inmobiliarias y agentes</h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
              ¿Te ha pasado que un cliente se arrepiente después de apartar una propiedad? ¿O que un anticipo nunca llega? <br /><br />
              En Kustodia, protegemos anticipos, apartados y rentas con tecnología blockchain. Así, cierras ventas más rápido y sin miedo a perder dinero ni oportunidades.
            </p>
            <div className="text-blue-700 font-bold mt-2 mb-4">
              El dinero queda en custodia hasta que ambas partes cumplen. <span className="text-base text-blue-900 font-normal">Si el trato no se concreta, el dinero vuelve seguro. Así, todos ganan confianza y tranquilidad.</span>
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">¿Cómo funciona para inmobiliarias?</h2>
          <ol className="list-decimal list-inside bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-3">
            <li>El cliente inicia un pago seguro y define condiciones (anticipo, apartado, renta).</li>
            <li>El dinero se transfiere a un <b>smart contract en la blockchain</b>, visible y bloqueado para ambas partes.</li>
            <li>Puedes verificar el pago antes de entregar llaves o firmar contrato.</li>
            <li>Cuando ambas partes cumplen, Kustodia libera el pago automáticamente. Si no se concreta, el dinero se devuelve.</li>
          </ol>
          <div className="mt-4 text-center text-blue-700 font-bold">
            Vende, renta o aparta propiedades con total confianza y sin riesgos.
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-6">
            <div>
              <b>¿Qué pasa si el cliente se arrepiente?</b>
              <div>Si el trato no se concreta, el dinero se devuelve automáticamente desde la custodia blockchain. Nadie pierde y todos ganan confianza.</div>
            </div>
            <div>
              <b>¿Cómo sé que el dinero está seguro?</b>
              <div>El dinero queda bloqueado en un smart contract en la blockchain. Puedes verificarlo en todo momento.</div>
            </div>
            <div>
              <b>¿Puedo usarlo para rentas o apartados?</b>
              <div>Sí, Kustodia es ideal para anticipos, apartados y rentas. Protege cada etapa de la operación inmobiliaria.</div>
            </div>
            <div>
              <b>¿Por qué es mejor que una transferencia tradicional?</b>
              <div>Kustodia automatiza la confianza en el trato: el dinero solo se libera cuando ambas partes cumplen. Así, nunca más pierdes tiempo ni dinero por arrepentimientos o fraudes.</div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Ventajas para inmobiliarias y agentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg mb-3">
                <FaHandshake className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Cierra ventas más rápido</div>
              <div className="text-gray-700">Anticipos y apartados protegidos: el dinero solo se libera si se cumplen las condiciones.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-3">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Sin fraudes ni pérdidas</div>
              <div className="text-gray-700">La custodia blockchain protege tu operación de principio a fin.</div>
            </div>
            <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow-lg mb-3">
                <FaRegSmile className="text-blue-700 text-3xl" />
              </div>
              <div className="font-bold text-lg mb-1 text-blue-800">Tranquilidad para todos</div>
              <div className="text-gray-700">Clientes y agentes ganan confianza y cierran más operaciones.</div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-20 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">¿Quieres saber más sobre cómo evitar fraudes inmobiliarios?</h2>
          <p className="mb-4 text-lg text-gray-700">Lee nuestro blog: <Link href="/blog/evitar-fraudes-inmobiliarias" className="text-blue-600 underline hover:text-blue-800">Cómo evitar fraudes en operaciones inmobiliarias</Link></p>
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </section>
      </main>
    </>
  );
}
