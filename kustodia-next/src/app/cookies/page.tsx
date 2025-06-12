import Link from 'next/link';

export default function Cookies() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-md w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
          <a href="/">
            <img src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" />
          </a>
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Política de Cookies</h2>
        <p>Kustodia.mx utiliza cookies y tecnologías similares para mejorar tu experiencia de usuario, analizar el tráfico y personalizar el contenido. Al continuar navegando en nuestro sitio, aceptas el uso de cookies.</p>
        <h3 className="mt-6 font-semibold text-lg">¿Qué son las cookies?</h3>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Sirven para recordar tus preferencias, sesiones y mejorar la funcionalidad del sitio.</p>
        <h3 className="mt-6 font-semibold text-lg">¿Qué cookies usamos?</h3>
        <ul className="list-disc pl-6">
          <li>Cookies esenciales para el funcionamiento del sitio.</li>
          <li>Cookies de analítica (Google Analytics u otras) para comprender el uso de la plataforma.</li>
          <li>Cookies de preferencia para recordar configuraciones de usuario.</li>
        </ul>
        <h3 className="mt-6 font-semibold text-lg">¿Cómo puedes controlar las cookies?</h3>
        <p>Puedes configurar tu navegador para aceptar o rechazar cookies. Ten en cuenta que deshabilitar cookies puede afectar la funcionalidad de la plataforma.</p>
        <div className="mt-8 text-center">
          <Link href="/privacidad" className="text-blue-700 underline font-medium">Aviso de Privacidad</Link>
        </div>
      </div>
    </div>
  );
}
