import Image from 'next/image';
import Link from 'next/link';

export default function Seguridad() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-4 sm:p-6 lg:p-10 text-gray-900 text-base text-left my-4 sm:my-8 lg:my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mb-6">CÓMO KUSTODIA PROTEGE TUS FONDOS</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
          <strong>Última actualización:</strong> Julio 2025
        </div>
        <p className="mb-6">En <strong>Kustodia</strong> hemos diseñado una plataforma que <strong>minimiza los riesgos</strong> y <strong>maximiza la protección</strong> de tus fondos y datos. Descubre cómo nuestras tecnologías avanzadas trabajan para mantenerte seguro en cada transacción.</p>
        
        <h3 className="mt-8 font-semibold text-xl text-green-700">1. PROTECCIÓN MULTICAPA AVANZADA</h3>
        <p className="mb-2">Tu seguridad está respaldada por <strong>tecnologías de vanguardia</strong>:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Tranquilidad Total:</strong> Cada transacción está protegida por múltiples sistemas de seguridad que funcionan automáticamente.
        </div>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Encriptación Bancaria:</strong> Tus datos viajan protegidos con el mismo estándar que usan los bancos (AES-256)</li>
          <li><strong>Nvio (Institución de Fondos de Pago Electrónico):</strong> Licencia CNBV 1530/2022 - Procesamiento regulado de pagos</li>
          <li><strong>Juno (Infraestructura Blockchain):</strong> Infraestructura auditada para contratos inteligentes</li>
          <li><strong>Truora (Verificación de Identidad):</strong> Validación confiable de identidades</li>
          <li><strong>Fondos Segregados:</strong> Tu dinero se mantiene separado y protegido en custodia automática</li>
          <li><strong>Doble Protección Premium:</strong> Los Pagos Premium requieren aprobación de ambas partes</li>
          <li><strong>Bloqueo Inteligente:</strong> Disputas pausan automáticamente las transferencias para protegerte</li>
          <li><strong>Vigilancia Continua:</strong> Monitoreamos 24/7 para detectar y prevenir actividades inusuales</li>
        </ul>
        
        <h3 className="mt-8 font-semibold text-xl text-green-700">2. ALIADOS CONFIABLES Y REGULADOS</h3>
        <p className="mb-2">Trabajamos <strong>únicamente con empresas autorizadas</strong> por las autoridades mexicanas:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Seguridad Comprobada:</strong> Cada socio está regulado por autoridades financieras mexicanas y auditado constantemente.
        </div>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Nvio Pagos México:</strong> Institución autorizada por CNBV para procesar tus transferencias SPEI de forma segura</li>
          <li><strong>Juno:</strong> Conversión confiable entre pesos y MXNB con garantía de respaldo 1:1</li>
          <li><strong>Arbitrum:</strong> Blockchain de confianza con contratos inteligentes transparentes y verificables</li>
        </ul>
        
        <h3 className="mt-8 font-semibold text-xl text-green-700">3. ESTABILIDAD GARANTIZADA CON MXNB</h3>
        <p className="mb-2">El MXNB que utilizamos te ofrece <strong>la seguridad del peso mexicano</strong> en formato digital:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="mb-2"><strong>Valor Estable:</strong> Cada MXNB equivale exactamente a 1 peso mexicano - sin volatilidad</p>
          <p className="mb-1"><strong>Auditorías Públicas:</strong> Terceros independientes verifican las reservas regularmente</p>
          <p><strong>Transparencia Total:</strong> <a href="https://mxnb.mx/es-MX/transparencia" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline font-semibold">Consulta las auditorías en tiempo real</a></p>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Ventaja:</strong> Con MXNB eliminas el riesgo de fluctuación de precios mientras mantienes la flexibilidad digital.
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-green-700">4. INTELIGENCIA ARTIFICIAL AL SERVICIO DE TU SEGURIDAD</h3>
        <p className="mb-2">Nuestra IA trabaja para <strong>protegerte mejor</strong> y hacer tu experiencia más segura:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>IA Protectora:</strong> Tecnología inteligente que detecta patrones y te ayuda a tomar mejores decisiones.
        </div>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Privacidad Garantizada:</strong> Tus datos personales nunca llegan a la IA - solo análisis anónimos</li>
          <li><strong>Supervisión Experta:</strong> Profesionales humanos revisan todas las decisiones importantes</li>
          <li><strong>IA Auditada:</strong> Algoritmos regularmente verificados para garantizar justicia e imparcialidad</li>
          <li><strong>Resoluciones Justas:</strong> Te ayudamos a encontrar acuerdos mutuos, no decisiones impuestas</li>
          <li><strong>Proceso Transparente:</strong> Siempre sabes cómo y por qué la IA te ayuda</li>
        </ul>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="mb-2"><strong>Garantía Humana:</strong> La IA acelera el análisis, pero las decisiones importantes siempre las toman personas capacitadas</p>
          <p><strong>Datos Protegidos:</strong> Tu información personal permanece segura - la IA solo ve patrones anónimos</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-green-700">5. EXCELENCIA OPERATIVA CONTINUA</h3>
        <p className="mb-2">Nuestro equipo trabaja constantemente para <strong>mejorar tu seguridad</strong>:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Mejora Continua:</strong> Invertimos constantemente en tecnología y capacitación para mantenerte más seguro cada día.
        </div>
        <ul className="list-disc list-inside mb-4 space-y-1">
          <li><strong>Acceso Controlado:</strong> Solo el personal autorizado puede acceder a sistemas específicos</li>
          <li><strong>Pruebas Regulares:</strong> Expertos externos evalúan constantemente nuestra seguridad</li>
          <li><strong>Planes de Contingencia:</strong> Estamos preparados para mantener tu servicio en cualquier situación</li>
          <li><strong>Actualización Constante:</strong> Mejoramos continuamente nuestros sistemas</li>
          <li><strong>Monitoreo Proactivo:</strong> Detectamos problemas antes de que afecten a usuarios</li>
          <li><strong>Capacitación Continua:</strong> Nuestro equipo se mantiene actualizado</li>
          <li><strong>Innovación Responsable:</strong> Adoptamos nuevas tecnologías de manera segura</li>
        </ul>
        
        <h3 className="mt-8 font-semibold text-xl text-green-700">6. COLABORAMOS CONTIGO PARA MEJORAR</h3>
        <p className="mb-2">Tu ayuda nos permite hacer Kustodia <strong>aún más seguro</strong> para todos:</p>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="mb-1"><strong>Reporte colaborativo:</strong> <a href="mailto:security@kustodia.mx" className="text-gray-600 hover:underline font-semibold">security@kustodia.mx</a></p>
          <p className="text-sm text-gray-700">Respuesta rápida garantizada - trabajamos juntos por la seguridad</p>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Colaboración Activa:</strong> Tu experiencia y retroalimentación son esenciales para construir una plataforma cada vez más segura y confiable.
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">CONTACTO DE SEGURIDAD</h4>
          <p className="text-gray-700 mb-2"><strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong></p>
          <p className="text-gray-700 mb-1"><a href="mailto:security@kustodia.mx" className="text-gray-600 hover:underline font-semibold">security@kustodia.mx</a></p>
          <p className="text-gray-700 mb-1"><a href="mailto:soporte@kustodia.mx" className="text-gray-600 hover:underline">soporte@kustodia.mx</a></p>
          <p className="text-gray-700 mb-1">Dirección: Calle 32 #298 x 11, Oficinas 205-206, Col. Montebello, C.P. 97113, Mérida, Yucatán</p>
          <p className="text-gray-700 text-sm">Para reportes de seguridad y consultas técnicas</p>
        </div>
      </div>
    </div>
  );
}
