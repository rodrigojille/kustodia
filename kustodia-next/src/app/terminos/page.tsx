import Image from 'next/image';
import Link from 'next/link';

export default function Terminos() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
        <Link href="/">
          <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
        </Link>
      </div>
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Términos y Condiciones</h2>
       <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm">
         <strong>Transparencia legal:</strong> Kustodia es una plataforma de automatización de pagos condicionales operada bajo una S.A.P.I. de C.V. No es entidad financiera, fiduciaria ni banco. No retiene fondos propios, ni ofrece servicios de almacenamiento de valor.
       </div>
       <p>Bienvenido a Kustodia. Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones conforme a la legislación mexicana.</p>
       <h3 className="mt-6 font-semibold text-lg">1. Introducción</h3>
       <p>Estos Términos y Condiciones regulan el acceso y uso de la plataforma tecnológica Kustodia.mx, operada por Tecnologías Avanzadas Centrales SAPI de CV (en adelante, “Kustodia”), por parte de cualquier persona (en adelante, “el Usuario”) que utilice los servicios de automatización de pagos bajo condiciones preestablecidas.</p>
       <h3 className="mt-6 font-semibold text-lg">2. Objeto de la Plataforma</h3>
       <p>Kustodia permite rutear y condicionar pagos entre terceros a través de contratos inteligentes ("smart contracts") y stablecoins (MXNB), utilizando infraestructura de terceros regulados como Nvio (para CLABEs y SPEI) y Juno (para stablecoins).</p>
       <h3 className="mt-6 font-semibold text-lg">3. Registro y Verificación de Identidad</h3>
       <p>Para operar en la plataforma, el Usuario debe completar un proceso de registro y verificación de identidad (KYC/AML) a través del proveedor Truora. Kustodia se reserva el derecho de rechazar o suspender cuentas que no cumplan con los requisitos legales o de seguridad.</p>
       <h3 className="mt-6 font-semibold text-lg">4. Cuentas y Pagos</h3>
       <p>Los fondos depositados a través de CLABEs generadas en la plataforma son dirigidos a cuentas bancarias a nombre de Tecnologías Avanzadas Centrales SAPI de CV. Estos fondos se usan únicamente para ejecutar instrucciones bajo condiciones específicas y se convierten en activos digitales (MXNB) para su custodia temporal en contratos inteligentes.</p>
       <div className="mb-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs rounded">
         <b>Nota legal:</b> Kustodia no es una institución financiera ni una Institución de Fondos de Pago Electrónico (IFPE). La plataforma no administra ni custodia fondos de los usuarios de manera directa; únicamente orquesta la automatización y ejecución de pagos a través de terceros regulados y contratos inteligentes.
       </div>
       <h3 className="mt-6 font-semibold text-lg">5. Custodia Condicional</h3>
       <p>Los fondos digitalizados se almacenan en contratos inteligentes en la red Arbitrum bajo la lógica de “escrow”. La liberación de los fondos se realiza automáticamente al cumplirse condiciones previamente pactadas (por fecha, evento o verificación). El Usuario entiende y acepta que Kustodia no es un custodio bancario ni tiene control exclusivo sobre los fondos, ya que la custodia técnica se realiza mediante mecanismos automatizados y, en su caso, multisig para fortalecer la seguridad.</p>
       <h3 className="mt-6 font-semibold text-lg">6. Responsabilidad y Riesgos</h3>
       <p>El uso de activos virtuales y contratos inteligentes implica riesgos tecnológicos, cibernéticos y operativos. El Usuario acepta que el valor del activo MXNB no está respaldado por el Gobierno Federal ni por el Banco de México. Kustodia no garantiza rendimientos ni resultados en las operaciones entre partes.</p>
       <div className="mb-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs rounded">
         <b>Riesgos regulatorios:</b> El Usuario reconoce que la operación de la plataforma podría estar sujeta a cambios regulatorios, supervisión de autoridades financieras o requerimientos adicionales de cumplimiento, sin que ello implique responsabilidad para Kustodia por modificaciones en el marco legal.
       </div>
       <h3 className="mt-6 font-semibold text-lg">7. Privacidad y Datos Personales</h3>
       <p>Kustodia trata los datos personales de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su Aviso de Privacidad. La verificación KYC/AML se realiza mediante un tercero (Truora) autorizado.</p>
       <h3 className="mt-6 font-semibold text-lg">8. Modificaciones a los Términos</h3>
       <p>Kustodia podrá modificar estos Términos y Condiciones en cualquier momento. Se notificará a los Usuarios mediante los canales registrados y el uso continuo de la plataforma se considerará aceptación de los cambios.</p>
       <h3 className="mt-6 font-semibold text-lg">9. Jurisdicción y Ley Aplicable</h3>
       <p>Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta por los tribunales competentes de la Ciudad de México.</p>
       <div className="mt-8 text-center">
         <Link href="/privacidad" className="text-blue-700 underline font-medium">Aviso de Privacidad</Link>
       </div>
        </div>
      </div>
  );
}
