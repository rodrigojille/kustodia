import Image from 'next/image';
import Link from 'next/link';

export default function Terminos() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-4 sm:p-6 lg:p-10 text-gray-900 text-base text-left my-4 sm:my-8 lg:my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
        <Link href="/">
          <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
        </Link>
      </div>
      <h2 className="text-3xl font-bold text-blue-700 mb-6">TÉRMINOS Y CONDICIONES DE SERVICIOS KUSTODIA</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
          <strong>Vigencia:</strong> Mayo 2025
        </div>
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-gray-900 text-lg font-medium mb-2">Bienvenido a Kustodia</p>
          <p className="text-gray-800">Kustodia es una plataforma tecnológica especializada en <strong>pagos condicionales seguros</strong>. Operamos bajo la solidez jurídica de <strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong>, combinando protocolos de seguridad bancaria con tecnología blockchain.</p>
        </div>
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <strong>Compromiso de servicio:</strong> Al utilizar Kustodia, usted accede a un sistema de pagos con protección integral y transparencia completa en cada transacción.
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">1. DEFINICIÓN DE SERVICIOS</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Comisionista mercantil especializado</strong>
          </div>
          <p className="text-gray-800">Como <strong>comisionista mercantil especializado</strong> (regulado por el Código de Comercio Mexicano), Kustodia ejecuta instrucciones de pago con precisión y seguridad. Coordinamos, programamos y protegemos cada transacción según las condiciones establecidas por el usuario.</p>
        </div>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg">
          <div className="mb-2">
            <strong>Marco de protección</strong>
          </div>
          <p className="text-sm">Actuamos como <strong>custodio temporal especializado</strong> de tokens estables (MXNB). No somos una entidad bancaria tradicional. Esta estructura nos permite ofrecer mayor flexibilidad operativa y tarifas competitivas mientras mantenemos estándares de seguridad institucionales.</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">2. INFRAESTRUCTURA TECNOLÓGICA Y ALIANZAS</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-900 font-medium mb-3">Proveedores de servicios regulados:</p>
          <ul className="space-y-2">
            <li><strong>Nvio Pagos México</strong> - Institución de Fondos de Pago Electrónico autorizada por CNBV</li>
            <li><strong>Juno</strong> - Proveedor de conversión MXN-MXNB con respaldo 1:1</li>
            <li><strong>Arbitrum</strong> - Red blockchain para ejecución de contratos inteligentes</li>
          </ul>
        </div>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Proceso operativo:</strong>
          </div>
          <p className="text-gray-800 text-sm">Los fondos SPEI se convierten automáticamente a <strong>MXNB tokens estables</strong> y se custodian en <strong>contratos inteligentes</strong> hasta que se cumplan las condiciones establecidas por el usuario.</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">3. PROCESO DE VERIFICACIÓN</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Verificación de identidad</strong>
          </div>
          <p className="text-gray-800 mb-3">Para garantizar la seguridad de todos los usuarios y el cumplimiento normativo, se requiere un proceso de <strong>verificación de identidad</strong> realizado mediante nuestro proveedor autorizado <strong>Truora</strong>.</p>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700"><strong>Beneficios:</strong> Mayor seguridad, cumplimiento legal automatizado, y acceso completo a todas las funcionalidades de la plataforma.</p>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">4. CUSTODIA Y PROTECCIÓN DE FONDOS</h3>
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-900 font-medium mb-2">Sistema de custodia automatizada</p>
          <p className="text-gray-800 text-sm">Los fondos tokenizados (MXNB) son <strong>custodiados en contratos inteligentes</strong> que ejecutan la liberación automática cuando se cumplen las condiciones predefinidas: fecha, evento, entrega, confirmación u otros parámetros establecidos.</p>
        </div>
        
        <h4 className="mt-4 font-semibold text-lg text-blue-600">4.1 Sistema de Doble Aprobación</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Pagos Condicionales Premium</strong>
          </div>
          <p className="text-gray-800 mb-3">Los <strong>Pagos Condicionales Premium</strong> requieren confirmación de <strong>ambas partes</strong> antes de la liberación de fondos:</p>
          <ul className="space-y-1 text-gray-800 text-sm">
            <li><strong>Pagador</strong>: Confirma que se cumplieron las condiciones establecidas</li>
            <li><strong>Beneficiario</strong>: Valida preparación para recibir los fondos</li>
            <li><strong>Protección integral</strong>: Los fondos permanecen seguros hasta obtener ambas aprobaciones</li>
            <li><strong>Prevención de disputas</strong>: Evita liberaciones prematuras o no consensuadas</li>
          </ul>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Protección garantizada:</strong> Sin la doble aprobación, los fondos permanecen completamente protegidos, incluso después del plazo establecido.
        </div>
        <div className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-400 text-gray-800 text-sm rounded">
          <strong>Facilitación de acuerdos:</strong> Kustodia actúa como facilitador neutral, asistiendo a que ambas partes lleguen a acuerdos satisfactorios sin imponer decisiones unilaterales.
        </div>
        
        <h4 className="mt-4 font-semibold text-lg text-blue-600">4.2 Bloqueo por Disputas</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Protección durante disputas</strong>
          </div>
          <p className="text-gray-800 mb-3">Para <strong>todos los tipos de pagos</strong> (Estándar, Premium, y Web3), cuando existe una disputa activa:</p>
          <ul className="space-y-1 text-gray-800 text-sm">
            <li><strong>Fondos protegidos</strong> hasta la resolución completa de la disputa</li>
            <li><strong>Suspensión temporal</strong> de liberaciones automáticas</li>
            <li><strong>Facilitación del diálogo</strong> entre las partes involucradas</li>
            <li><strong>Liberación segura</strong> únicamente tras resolución completa</li>
          </ul>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Importante:</strong> Las disputas activas bloquean completamente la liberación de fondos, independientemente del tipo de pago o plazo establecido.
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">5. COMISIÓN Y TARIFAS</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Estructura de comisiones</strong>
          </div>
          <p className="text-gray-800">El uso del servicio puede generar comisiones visibles al momento de configurar cada operación. Dichas comisiones pueden ser cubiertas por una de las partes o repartidas entre ambas, según acuerdo privado.</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">6. DISPUTAS Y REEMBOLSOS</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Proceso de disputas</strong>
          </div>
          <p className="text-gray-800">En caso de disputa, Kustodia podrá congelar temporalmente la liberación de los fondos hasta recibir evidencia de resolución mutua (acuerdo firmado, acta o resolución judicial/arbitral). Kustodia no media, arbitra ni juzga disputas.</p>
        </div>
        
        <h4 className="mt-4 font-semibold text-lg text-blue-600">6.1 Resolución de Disputas</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Proceso de facilitación</strong>
          </div>
          <p className="text-gray-800 mb-3">En caso de disputas en cualquier tipo de pago, Kustodia facilita el proceso de resolución mediante:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li><strong>Evaluación Inicial:</strong> Análisis preliminar por IA para clasificar y priorizar la disputa</li>
            <li><strong>Revisión Humana:</strong> Nuestro equipo de cumplimiento revisa todos los casos y evidencia</li>
            <li><strong>Facilitación:</strong> Proporcionamos herramientas para comunicación y presentación de evidencia</li>
            <li><strong>Resolución Consensuada:</strong> Trabajamos con ambas partes para llegar a un acuerdo mutuo</li>
            <li><strong>Fondos Protegidos:</strong> Los fondos permanecen en custodia hasta la resolución completa</li>
          </ul>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Compromiso de Calidad:</strong> Nuestro equipo de cumplimiento humano supervisa personalmente cada disputa, asegurando decisiones justas y transparentes para ambas partes.
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Proceso Colaborativo:</strong> Todas las resoluciones requieren el acuerdo de comprador y vendedor. No imponemos decisiones unilaterales.
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">7. OBLIGACIONES DEL USUARIO</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Compromisos del usuario</strong>
          </div>
          <p className="text-gray-800 mb-3">Al usar Kustodia, el Usuario se compromete a:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li>No usar la plataforma para fines ilícitos, fraudulentos o engañosos.</li>
            <li>No suplantar identidades ni falsificar documentos.</li>
            <li>No interferir con los sistemas técnicos de la plataforma.</li>
            <li>Cumplir con la legislación mexicana vigente.</li>
          </ul>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">8. SERVICIOS ADICIONALES</h3>
        
        <h4 className="mt-4 font-semibold text-lg text-blue-600">8.1 Asistencia por Inteligencia Artificial</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Servicios de IA</strong>
          </div>
          <p className="text-gray-800 mb-3">Kustodia utiliza sistemas de inteligencia artificial para mejorar la experiencia del usuario:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li><strong>Asistente Virtual:</strong> Chatbot con IA para soporte y consultas generales</li>
            <li><strong>Análisis Inicial de Disputas:</strong> Evaluación preliminar automática para clasificar y priorizar disputas</li>
            <li><strong>Procesamiento de Consultas:</strong> Respuestas automatizadas basadas en IA</li>
          </ul>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Garantía de Supervisión Humana:</strong> Aunque la IA realiza análisis preliminares, todas las decisiones finales sobre disputas son tomadas por nuestro equipo de cumplimiento humano en conjunto con las partes involucradas.
        </div>
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded">
          <strong>Proceso de Resolución:</strong> La IA solo proporciona análisis inicial. Todas las resoluciones de disputas requieren revisión humana, evaluación del equipo de cumplimiento y acuerdo entre comprador y vendedor.
        </div>
        
        <h4 className="mt-4 font-semibold text-lg text-blue-600">8.2 Sistema de Tickets de Soporte</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Soporte técnico</strong>
          </div>
          <p className="text-gray-800 mb-3">Kustodia proporciona un sistema formal de tickets para consultas y soporte técnico que incluye:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li>Creación y seguimiento de tickets de soporte</li>
            <li>Comunicación bidireccional con el equipo de soporte</li>
            <li>Gestión de evidencia y documentación de casos</li>
            <li>Notificaciones automáticas sobre el estado de las consultas</li>
          </ul>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">8.3 Solicitudes de Pago</h4>
          <div className="mb-2">
            <strong>Funcionalidad de solicitudes</strong>
          </div>
          <p className="text-gray-800 mb-3">Los usuarios pueden generar solicitudes de pago dirigidas a otros usuarios verificados de la plataforma. Este servicio permite:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li>Creación de solicitudes de pago personalizadas</li>
            <li>Seguimiento del estado de las solicitudes</li>
            <li>Notificaciones automáticas para todas las partes involucradas</li>
            <li>Integración con todos los tipos de pago disponibles</li>
          </ul>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">8.4 Reembolsos Automáticos</h4>
          <div className="mb-2">
            <strong>Procesamiento de reembolsos</strong>
          </div>
          <p className="text-gray-800 mb-3">En situaciones específicas, Kustodia puede procesar reembolsos automáticos:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li>Transacciones no completadas por problemas técnicos</li>
            <li>Pagos duplicados detectados por el sistema</li>
            <li>Errores de procesamiento identificados automáticamente</li>
            <li>Cancelaciones dentro del período permitido</li>
          </ul>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">9. PROTECCIÓN DE DATOS</h3>
          <p className="text-gray-800 mb-3">Kustodia protege tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Los datos podrán compartirse con proveedores regulados únicamente para la ejecución del servicio. Consulta el Aviso de Privacidad completo.</p>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">9.1 Uso de Datos en Sistemas de IA</h4>
          <p className="text-gray-800 mb-3">Al utilizar servicios con inteligencia artificial, aceptas que:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li>Tus consultas pueden ser procesadas por sistemas de IA</li>
            <li>Los datos se utilizan para mejorar la calidad del servicio</li>
            <li>No se almacenan datos sensibles en sistemas de IA externos</li>
            <li>Puedes solicitar la exclusión de procesamiento automatizado</li>
          </ul>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">10. MODIFICACIONES A LOS TÉRMINOS</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Actualización de términos</strong>
          </div>
          <p className="text-gray-800">Kustodia podrá actualizar estos T&C en cualquier momento. Las modificaciones serán comunicadas por correo o mediante la plataforma. El uso continuado se interpretará como aceptación de los cambios.</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-blue-700">11. JURISDICCIÓN Y LEY APLICABLE</h3>
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-2">
            <strong>Marco legal</strong>
          </div>
          <p className="text-gray-800">Estos T&C se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta ante los tribunales competentes de la Ciudad de México, renunciando expresamente a cualquier otro fuero.</p>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">CONTACTO LEGAL</h4>
          <p className="text-gray-700 mb-2"><strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong></p>
          <p className="text-gray-700 mb-1">Email: <a href="mailto:soporte@kustodia.mx" className="text-blue-600 hover:underline">soporte@kustodia.mx</a></p>
          <p className="text-gray-700 mb-1">Dirección: Calle 32 #298 x 11, Oficinas 205-206, Col. Montebello, C.P. 97113, Mérida, Yucatán</p>
          <p className="text-gray-700 text-sm">Para consultas legales y cumplimiento normativo</p>
        </div>
        </div>
      </div>
  );
}
