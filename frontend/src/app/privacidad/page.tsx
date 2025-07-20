import Image from 'next/image';
import Link from 'next/link';

export default function Privacidad() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-4 sm:p-6 lg:p-10 text-gray-900 text-base text-left my-4 sm:my-8 lg:my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
        <Link href="/">
          <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
        </Link>
      </div>
      <h2 className="text-3xl font-bold text-blue-700 mb-6">AVISO DE PRIVACIDAD</h2>
      <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
        <strong>Protección vigente desde:</strong> Mayo 2025
      </div>
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="mb-2">
          <strong className="text-gray-900">Protección integral de datos personales</strong>
        </div>
        <p className="text-gray-800">En <strong>Kustodia</strong>, la protección de la privacidad es fundamental. <strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong> cumple estrictamente con los estándares de la <strong>LFPDPPP</strong> para garantizar la seguridad de los datos personales.</p>
      </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">1. RESPONSABLE DEL TRATAMIENTO</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Identificación del responsable</strong>
         </div>
         <p className="text-gray-800"><strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong> es el responsable del tratamiento de datos personales. Con domicilio en Mérida, Yucatán, cumple con todas las disposiciones de la LFPDPPP.</p>
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">2. DATOS PERSONALES RECABADOS</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Principio de minimización de datos</strong>
         </div>
         <p className="text-gray-800 mb-3">Se aplica el principio de <strong>minimización de datos</strong>, recabando únicamente la información necesaria para los fines establecidos:</p>
       </div>
       <div className="grid md:grid-cols-2 gap-4 mb-4">
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Datos de Identificación</strong>
           </div>
           <p className="text-gray-700 text-sm">Nombre, correo electrónico, teléfono para la cuenta de usuario</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Datos Financieros</strong>
           </div>
           <p className="text-gray-700 text-sm">CLABE y datos bancarios con cifrado de seguridad</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Datos de Verificación</strong>
           </div>
           <p className="text-gray-700 text-sm">Documentos oficiales para cumplimiento KYC</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Datos de Uso</strong>
           </div>
           <p className="text-gray-700 text-sm">Información de navegación y uso de la plataforma</p>
         </div>
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">3. FINALIDADES DEL TRATAMIENTO</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Uso de datos personales</strong>
         </div>
       </div>
       <div className="space-y-3 mb-4">
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div>
             <strong className="text-gray-800">Prestación de servicios:</strong>
             <p className="text-gray-700 text-sm">Creación de cuentas y ejecución de Pagos Condicionales (Estándar, Premium, Web3)</p>
           </div>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div>
             <strong className="text-gray-800">Cumplimiento regulatorio:</strong>
             <p className="text-gray-700 text-sm">Verificación de identidad KYC/AML y cumplimiento de obligaciones normativas</p>
           </div>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div>
             <strong className="text-gray-800">Soporte y asistencia:</strong>
             <p className="text-gray-700 text-sm">Sistemas de IA con supervisión humana para resolución de disputas y soporte</p>
           </div>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div>
             <strong className="text-gray-800">Mejora de servicios:</strong>
             <p className="text-gray-700 text-sm">Análisis de uso y encuestas de satisfacción para mejora continua</p>
           </div>
         </div>
       </div>
       <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded">
         <strong>Sistemas de IA:</strong> Utilizamos inteligencia artificial para análisis preliminares y soporte automatizado. Todas las decisiones críticas son supervisadas por nuestro equipo humano de cumplimiento.
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">4. TERCEROS INVOLUCRADOS</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Proveedores de servicios</strong>
         </div>
         <p className="text-gray-800 text-sm">Los datos personales pueden ser compartidos con <strong>proveedores especializados</strong> que cumplen con estándares de seguridad y regulación:</p>
       </div>
       <div className="grid md:grid-cols-2 gap-4 mb-4">
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Nvio Pagos México</strong>
           </div>
           <p className="text-gray-700 text-sm">IFPE autorizada por CNBV para procesamiento SPEI</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Juno & Truora</strong>
           </div>
           <p className="text-gray-700 text-sm">Servicios de conversión MXNB y verificación de identidad</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">PostHog Analytics</strong>
           </div>
           <p className="text-gray-700 text-sm">Análisis de uso con datos anonimizados</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Nebius AI</strong>
           </div>
           <p className="text-gray-700 text-sm">Servicios de inteligencia artificial sin acceso a datos identificables</p>
         </div>
       </div>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Protección en sistemas de IA</strong>
         </div>
         <p className="text-gray-800 text-sm">Los sistemas de inteligencia artificial procesan únicamente <strong>datos anonimizados</strong> y se utilizan exclusivamente para mejora de servicios. No tienen acceso a información personal identificable.</p>
       </div>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Política de no comercialización</strong>
         </div>
         <p className="text-gray-800 text-sm">Los datos personales <strong>no se venden, rentan o transfieren</strong> a terceros con fines comerciales. Solo se comparten cuando existe requerimiento legal de autoridades competentes.</p>
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">5. DERECHOS ARCO</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Derechos del titular</strong>
         </div>
         <p className="text-gray-800 mb-3">Los titulares de datos personales tienen derecho a ejercer los siguientes derechos ARCO:</p>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
           <div className="bg-white p-2 rounded border border-green-100 text-center">
             <div className="text-green-600 font-bold">A</div>
             <div className="text-green-700">Acceder</div>
           </div>
           <div className="bg-white p-2 rounded border border-green-100 text-center">
             <div className="text-green-600 font-bold">R</div>
             <div className="text-green-700">Rectificar</div>
           </div>
           <div className="bg-white p-2 rounded border border-green-100 text-center">
             <div className="text-green-600 font-bold">C</div>
             <div className="text-green-700">Cancelar</div>
           </div>
           <div className="bg-white p-2 rounded border border-green-100 text-center">
             <div className="text-green-600 font-bold">O</div>
             <div className="text-green-700">Oponerte</div>
           </div>
         </div>
       </div>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Ejercicio de derechos</strong>
         </div>
         <p className="text-gray-800 mb-2">Para ejercer derechos ARCO, contactar a:</p>
         <div className="bg-white p-3 rounded-lg border border-gray-200">
           <p className="mb-1"><a href="mailto:soporte@kustodia.mx" className="text-blue-600 hover:underline font-semibold">soporte@kustodia.mx</a></p>
           <p className="text-sm text-gray-600">Incluir: identificación oficial, descripción del derecho y documentación de respaldo</p>
         </div>
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">6. CONSENTIMIENTO</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Consentimiento informado</strong>
         </div>
         <p className="text-gray-800">El uso de los servicios de Kustodia constituye <strong>consentimiento expreso</strong> para el tratamiento de datos personales conforme a los términos establecidos en este aviso de privacidad.</p>
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">7. TRATAMIENTO DE DATOS POR SISTEMAS DE IA</h3>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Salvaguardas en inteligencia artificial</strong>
         </div>
         <p className="text-gray-800 mb-3">Los sistemas de inteligencia artificial operan bajo estrictas medidas de protección:</p>
       </div>
       <div className="grid md:grid-cols-2 gap-4 mb-4">
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Anonimización completa</strong>
           </div>
           <p className="text-gray-700 text-sm">Datos personales completamente anonimizados antes del procesamiento</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Supervisión humana</strong>
           </div>
           <p className="text-gray-700 text-sm">Personal especializado revisa todas las decisiones críticas</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Finalidad específica</strong>
           </div>
           <p className="text-gray-700 text-sm">Uso limitado para soporte, análisis y mejora de servicios</p>
         </div>
         <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
           <div className="mb-2">
             <strong className="text-gray-800">Sin decisiones automatizadas</strong>
           </div>
           <p className="text-gray-700 text-sm">No se realizan decisiones automatizadas que afecten significativamente al titular</p>
         </div>
       </div>
       <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
         <div className="mb-2">
           <strong>Grabación de sesiones</strong>
         </div>
         <p className="text-gray-800 text-sm">Se realizan grabaciones de sesión para mejora de servicios. Los campos sensibles (contraseñas, datos de pago) se <strong>enmascaran automáticamente</strong>. Los usuarios pueden ejercer su derecho de oposición.</p>
       </div>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">8. MEDIDAS DE SEGURIDAD</h3>
       <p className="mb-2">Implementamos medidas técnicas, administrativas y organizacionales para proteger tus datos:</p>
       <ul className="list-disc list-inside mb-4 space-y-1">
         <li>Encriptación de datos en tránsito y en reposo</li>
         <li>Controles de acceso y autenticación robusta</li>
         <li>Monitoreo continuo de seguridad</li>
         <li>Políticas de retención y destrucción segura</li>
         <li>Protección especial para datos procesados por IA</li>
         <li>Enmascaramiento automático en grabaciones de sesión</li>
       </ul>
       
       <h3 className="mt-8 font-semibold text-xl text-blue-700">9. MODIFICACIONES AL AVISO</h3>
       <p className="mb-6">Este Aviso de Privacidad puede ser actualizado. Las modificaciones sustanciales serán notificadas por correo electrónico o mediante aviso en la plataforma. El uso continuado implica aceptación de los cambios.</p>
       
       <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
         <h4 className="font-semibold text-lg text-gray-800 mb-2">CONTACTO PARA PRIVACIDAD</h4>
         <p className="text-gray-700 mb-2"><strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong></p>
         <p className="text-gray-700 mb-1">Correo: <a href="mailto:soporte@kustodia.mx" className="text-blue-600 hover:underline">soporte@kustodia.mx</a></p>
         <p className="text-gray-700 mb-1">Dirección: Calle 32 #298 x 11, Oficinas 205-206, Col. Montebello, C.P. 97113, Mérida, Yucatán</p>
         <p className="text-gray-700 text-sm">Para ejercer derechos ARCO y consultas sobre privacidad</p>
       </div>
        </div>
      </div>
  );
}
