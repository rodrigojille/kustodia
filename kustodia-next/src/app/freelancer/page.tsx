import Header from '../../components/Header';
import { FaUserTie, FaShieldAlt, FaRocket, FaLock } from 'react-icons/fa';
import Link from 'next/link';

export default function FreelancerUseCase() {
  return (
    <>
      <header>
        <title>Pagos seguros para freelancers con blockchain | Kustodia</title>
        <meta name="description" content="Cobra seguro como freelancer: tus pagos quedan protegidos en un smart contract en la blockchain hasta que el trabajo está entregado. Evita fraudes, cobra sin riesgos y verifica tu dinero en todo momento." />
        <meta name="keywords" content="pagos seguros freelancer, escrow blockchain, evitar fraudes freelance, cobrar freelance seguro, smart contract pagos freelance, Kustodia" />
        <link rel="canonical" href="https://kustodia.mx/freelancer" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pagos seguros para freelancers con blockchain | Kustodia" />
        <meta property="og:description" content="Nunca más trabajes con miedo a no cobrar. Con Kustodia, tu pago está protegido en la blockchain hasta que el acuerdo se cumple. Seguridad, confianza y libertad para freelancers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/freelancer" />
        <meta property="og:image" content="https://kustodia.mx/og-freelancer-main.png" />
        <meta property="og:site_name" content="Kustodia" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pagos seguros para freelancers con blockchain | Kustodia" />
        <meta name="twitter:description" content="Nunca más trabajes con miedo a no cobrar. Con Kustodia, tu pago está protegido en la blockchain hasta que el acuerdo se cumple. Seguridad, confianza y libertad para freelancers." />
        <meta name="twitter:image" content="https://kustodia.mx/og-freelancer-main.png" />
        <meta name="twitter:site" content="@kustodia_mx" />
      </header>
      <Header isAuthenticated={false} userName={''} />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-12 mt-10">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 flex flex-col items-center text-center">
            <FaUserTie className="text-blue-700 text-5xl mb-4" />
            <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Pagos protegidos para freelancers</h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
              Sabemos lo que es dejarlo todo en tu trabajo, cumplir con entregas y, aun así, sentir la angustia de si vas a cobrar o no. Muchos freelancers han sufrido pagos incompletos, retrasos o, peor aún, clientes que desaparecen después de recibir el trabajo.<br /><br />
              En Kustodia, queremos que nunca más trabajes con miedo. Aquí, tu esfuerzo y dedicación siempre tienen recompensa.
            </p>
            <div className="text-blue-700 font-bold mt-2 mb-4">
              No es un SPEI normal: tu dinero queda protegido en un smart contract hasta que ambas partes cumplen.<br />
              <span className="text-base text-blue-900 font-normal">Si entregas tu trabajo y subes la evidencia, y el cliente no responde, <b>la preferencia es para ti</b>. Kustodia protege tu pago y tu tranquilidad.</span>
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
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">¿Cómo funciona para freelancers?</h2>
          <ol className="list-decimal list-inside bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-3">
            <li>
              Tu cliente inicia un pago seguro en Kustodia y define el monto y condiciones del trabajo.
            </li>
            <li>
              El dinero se transfiere a un <b>smart contract en la blockchain</b>, donde queda bloqueado y visible para ambas partes.
            </li>
            <li>
              Puedes <b>verificar en tiempo real</b> que el pago está asegurado antes de empezar a trabajar.
            </li>
            <li>
              Realizas el trabajo y subes la evidencia de entrega.
            </li>
            <li>
              Cuando ambas partes confirman la entrega, <b>Kustodia libera el pago automáticamente desde el smart contract</b>. Si hay disputa, intervenimos para ayudarte.
            </li>
          </ol>
          <div className="mt-4 text-center text-blue-700 font-bold">
            Así, trabajas con la confianza de que tu pago está garantizado y protegido por tecnología blockchain.
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="bg-white rounded-2xl shadow p-8 text-gray-700 text-lg space-y-6">
            <div>
              <b>¿Cómo sé que el dinero está seguro?</b>
              <div>El dinero queda bloqueado en un smart contract en la blockchain. Puedes verificar la transacción y el saldo en todo momento, sin depender de terceros.</div>
            </div>
            <div>
              <b>¿Qué pasa si el cliente no confirma la entrega?</b>
              <div>Si ambas partes no confirman, Kustodia puede intervenir como mediador y resolver la disputa según la evidencia aportada.</div>
            </div>
            <div>
              <b>¿Cuánto cuesta usar Kustodia?</b>
              <div>Durante el acceso anticipado, los primeros usuarios tendrán 0% comisión de por vida. Aprovecha la oportunidad y regístrate.</div>
            </div>
            <div>
              <b>¿Por qué es mejor que un pago SPEI tradicional?</b>
              <div>Kustodia utiliza lo mejor de un SPEI pero <b>automatiza la confianza en el trato hecho</b>. Olvídate de que te vuelvan a dejar sin un pago: aquí, tu dinero queda protegido y solo se libera cuando el acuerdo se cumple. Así, nunca más trabajas con miedo a no cobrar.</div>
            </div>
          </div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-16">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Ventajas para freelancers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg mb-3">
      <FaShieldAlt className="text-white text-3xl" />
    </div>
    <div className="font-bold text-lg mb-1 text-blue-800">Cero fraudes</div>
    <div className="text-gray-700">El dinero queda protegido y solo se libera si ambas partes cumplen.</div>
  </div>
  <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 shadow-lg mb-3">
      <FaLock className="text-white text-3xl" />
    </div>
    <div className="font-bold text-lg mb-1 text-blue-800">Custodia transparente</div>
    <div className="text-gray-700">Sigue el estado del pago en todo momento y sube evidencia de tu trabajo.</div>
  </div>
  <div className="flex flex-col items-center text-center bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl p-7 shadow hover:shadow-xl transition border border-blue-200">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 shadow-lg mb-3">
      <FaRocket className="text-blue-700 text-3xl" />
    </div>
    <div className="font-bold text-lg mb-1 text-blue-800">Pago rápido y seguro</div>
    <div className="text-gray-700">Recibe tu dinero sin retrasos ni sorpresas.</div>
  </div>
</div>
        </section>

        <section className="w-full max-w-screen-lg px-4 mx-auto mb-20 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">¿Quieres saber más sobre cómo evitar fraudes como freelancer?</h2>
          <p className="mb-4 text-lg text-gray-700">Lee nuestro blog: <Link href="/blog/evitar-fraudes-freelancer" className="text-blue-600 underline hover:text-blue-800">Cómo evitar fraudes en pagos de servicios freelance</Link></p>
          <Link href="/" className="inline-block bg-gray-100 text-blue-700 font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-200 transition mt-2">Volver al inicio</Link>
        </section>
      </main>
    </>
  );
}
