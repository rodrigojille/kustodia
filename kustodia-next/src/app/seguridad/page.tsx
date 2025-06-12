import Link from 'next/link';

export default function Seguridad() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-md w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
          <a href="/">
            <img src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" />
          </a>
        </div>
        <h2 className="text-3xl font-bold text-green-700 mb-6">Política de Seguridad</h2>
        <p>En Kustodia, la seguridad de la información y de los fondos de nuestros usuarios es prioritaria. Implementamos medidas técnicas, administrativas y organizacionales para proteger la plataforma y los datos personales.</p>
        <h3 className="mt-6 font-semibold text-lg">Medidas implementadas</h3>
        <ul className="list-disc pl-6">
          <li>Encriptación de datos en tránsito y en reposo.</li>
          <li>Autenticación fuerte y validación de identidad (KYC/AML).</li>
          <li>Monitoreo continuo de la infraestructura y pruebas de penetración.</li>
          <li>Políticas de acceso restringido y control de privilegios.</li>
          <li>Respaldo y recuperación ante desastres.</li>
        </ul>
        <h3 className="mt-6 font-semibold text-lg">MXNB: Respaldo y transparencia</h3>
        <p>El token MXNB utilizado en Kustodia está respaldado 1:1 por reservas en pesos mexicanos, auditadas periódicamente por terceros independientes. Puedes consultar los informes y auditorías en <a href="https://mxnb.mx/es-MX/transparencia" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">mxnb.mx/transparencia</a>.</p>
        <h3 className="mt-6 font-semibold text-lg">Reporte de incidentes</h3>
        <p>Si detectas alguna vulnerabilidad o incidente de seguridad, repórtalo a <a href="mailto:security@kustodia.mx" className="underline text-green-700">security@kustodia.mx</a>.</p>
        <div className="mt-8 text-center">
          <Link href="/privacidad" className="text-blue-700 underline font-medium">Aviso de Privacidad</Link>
        </div>
      </div>
    </div>
  );
}
