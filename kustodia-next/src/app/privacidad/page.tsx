import Image from 'next/image';
import Link from 'next/link';

export default function Privacidad() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
        <Link href="/">
          <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
        </Link>
      </div>
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Aviso de Privacidad</h2>
      <p>En Kustodia, la protección de tus datos personales es prioritaria y cumplimos con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
       <h3 className="mt-6 font-semibold text-lg">1. Responsable y Modelo Legal</h3>
       <p>Kustodia, operada por Tecnologías Avanzadas Centrales S.A.P.I. de C.V., es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
       <h3 className="mt-6 font-semibold text-lg">2. Datos que Recabamos</h3>
       <p>Recabamos datos como nombre, correo electrónico, CLABE, datos bancarios y aquellos estrictamente necesarios para operar la plataforma y cumplir nuestras obligaciones legales y contractuales.</p>
       <h3 className="mt-6 font-semibold text-lg">3. Finalidad y Proveedores</h3>
       <p>Utilizamos tus datos para crear tu cuenta, operar pagos condicionales, validar tu identidad y cumplir con obligaciones legales. Tus datos pueden ser compartidos exclusivamente con proveedores tecnológicos como MXNB, STP, Juno o instituciones bancarias para la ejecución de transferencias y operaciones. Nunca se compartirán con fines comerciales.</p>
       <h3 className="mt-6 font-semibold text-lg">4. No Venta ni Transferencia Comercial</h3>
       <p>No vendemos, rentamos ni transferimos tus datos personales a terceros con fines de lucro. Sólo compartimos información cuando existe un requerimiento legal por parte de autoridades competentes.</p>
       <h3 className="mt-6 font-semibold text-lg">5. Derechos ARCO</h3>
       <p>Puedes ejercer tus derechos de acceso, rectificación, cancelación u oposición (ARCO) enviando una solicitud por correo electrónico a <a href="mailto:soporte@kustodia.mx" className="underline text-indigo-700">soporte@kustodia.mx</a>, con los requisitos establecidos por la ley.</p>
       <h3 className="mt-6 font-semibold text-lg">6. Consentimiento Explícito</h3>
       <p>Al registrarte y utilizar Kustodia, otorgas tu consentimiento explícito para el tratamiento de tus datos personales conforme a este aviso de privacidad.</p>
       <h3 className="mt-6 font-semibold text-lg">7. Seguridad</h3>
       <p>Implementamos medidas técnicas, administrativas y organizacionales razonables para proteger tus datos personales contra pérdida, uso indebido, acceso no autorizado, alteración o destrucción.</p>
       <h3 className="mt-6 font-semibold text-lg">8. Cambios al Aviso</h3>
       <p>Este aviso puede ser modificado en el futuro. Los cambios sustanciales serán notificados mediante la plataforma web o correo electrónico registrado.</p>
      <div className="mt-8 text-center">
        <Link href="/terminos" className="text-blue-700 underline font-medium">Términos y Condiciones</Link>
      </div>
        </div>
      </div>
  );
}
