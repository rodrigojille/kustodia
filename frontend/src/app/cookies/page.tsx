import Image from 'next/image';
import Link from 'next/link';

export default function Cookies() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-4 sm:p-6 lg:p-10 text-gray-900 text-base text-left my-4 sm:my-8 lg:my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mb-6">POLÍTICA DE COOKIES – KUSTODIA</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
          <strong>Última actualización:</strong> Mayo 2025
        </div>
        <p className="mb-6"><strong>Kustodia</strong> (www.kustodia.mx), operada por <strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong>, utiliza cookies y tecnologías similares para mejorar tu experiencia de usuario, analizar el tráfico y garantizar el funcionamiento seguro de la plataforma.</p>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">1. ¿QUÉ SON LAS COOKIES?</h3>
        <p className="mb-4">Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Son esenciales para el funcionamiento seguro de la plataforma y para brindarte una experiencia personalizada.</p>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">2. TIPOS DE COOKIES QUE UTILIZAMOS</h3>
        <div className="mb-4 space-y-3">
          <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
            <p className="font-semibold text-gray-800">Cookies Esenciales (Obligatorias)</p>
            <p className="text-sm text-gray-700">Necesarias para el funcionamiento básico: autenticación, seguridad, sesión de usuario</p>
          </div>
          <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
            <p className="font-semibold text-gray-800">Cookies Analíticas (Opcionales)</p>
            <p className="text-sm text-gray-700">Google Analytics y PostHog para comprender el uso de la plataforma y mejorar funcionalidades</p>
          </div>
          <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
            <p className="font-semibold text-gray-800">Cookies de Preferencia (Opcionales)</p>
            <p className="text-sm text-gray-700">Recordar configuraciones de usuario, idioma y preferencias de dashboard</p>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">3. FINALIDAD Y TRATAMIENTO</h3>
        <p className="mb-2">Utilizamos cookies para:</p>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li>Mantener tu sesión activa y segura en la plataforma</li>
          <li>Recordar tus preferencias y configuraciones</li>
          <li>Analizar el rendimiento y uso de funcionalidades</li>
          <li>Prevenir fraudes y mejorar la seguridad</li>
          <li>Personalizar tu experiencia en el dashboard</li>
        </ul>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">4. CONTROL Y GESTIÓN</h3>
        <p className="mb-4">Tienes control total sobre las cookies no esenciales:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="mb-2"><strong>Configuración del navegador:</strong> Puedes aceptar, rechazar o eliminar cookies desde la configuración de tu navegador</p>
          <p className="text-sm text-gray-700"><strong>Nota:</strong> Deshabilitar cookies esenciales puede afectar el funcionamiento de la plataforma de pagos seguros</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">5. CONSENTIMIENTO Y ACEPTACIÓN</h3>
        <p className="mb-6">Al continuar navegando en nuestro sitio web y utilizar nuestros servicios, aceptas el uso de cookies conforme a esta política. Tu consentimiento puede ser retirado en cualquier momento modificando la configuración de tu navegador.</p>
        
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">CONTACTO PARA COOKIES</h4>
          <p className="text-gray-700 mb-2"><strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong></p>
          <p className="text-gray-700 mb-1"><a href="mailto:soporte@kustodia.mx" className="text-blue-600 hover:underline">soporte@kustodia.mx</a></p>
          <p className="text-gray-700 mb-1">Dirección: Calle 32 #298 x 11, Oficinas 205-206, Col. Montebello, C.P. 97113, Mérida, Yucatán</p>
          <p className="text-gray-700 text-sm">Para consultas sobre políticas de cookies y configuración</p>
        </div>
      </div>
    </div>
  );
}
