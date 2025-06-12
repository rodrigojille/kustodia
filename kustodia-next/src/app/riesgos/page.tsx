import Link from 'next/link';

export default function Riesgos() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-md w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 text-gray-900 text-base text-left my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
          <a href="/">
            <img src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" />
          </a>
        </div>
        <h2 className="text-3xl font-bold text-yellow-700 mb-6">Aviso de Riesgos sobre Activos Virtuales</h2>
        <p><strong>Importante:</strong> El uso de activos virtuales (stablecoins, MXNB) y contratos inteligentes implica riesgos tecnológicos, operativos y regulatorios.</p>
        <ul className="list-disc pl-6 mt-4 mb-4">
          <li>El token MXNB está respaldado 1:1 por reservas en pesos mexicanos, auditadas periódicamente por terceros independientes. Consulta la transparencia y auditorías de MXNB en <a href="https://mxnb.mx/es-MX/transparencia" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">mxnb.mx/transparencia</a>.</li>
          <li>El MXNB y otros activos virtuales <b>no son moneda de curso legal</b> en México ni están garantizados por el Gobierno Federal ni por el Banco de México.</li>
          <li>El MXNB está diseñado para mantener paridad 1:1 con el peso mexicano y su valor no fluctúa, sujeto a la robustez del mecanismo de respaldo y auditoría.</li>
          <li>Las operaciones con activos virtuales pueden estar sujetas a cambios regulatorios o restricciones futuras.</li>
          <li>El uso de contratos inteligentes y plataformas descentralizadas puede implicar riesgos tecnológicos, errores de código o pérdida de acceso.</li>
        </ul>
        <p>Antes de operar en Kustodia.mx, evalúa tu tolerancia al riesgo y consulta fuentes oficiales sobre la regulación y funcionamiento de activos virtuales en México.</p>
        <div className="mt-8 text-center">
          <Link href="/terminos" className="text-blue-700 underline font-medium">Términos y Condiciones</Link>
        </div>
      </div>
    </div>
  );
}
