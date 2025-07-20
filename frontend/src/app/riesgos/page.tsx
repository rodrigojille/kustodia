import Link from 'next/link';
import Image from 'next/image';

export default function Riesgos() {
  return (
    <div className="bg-blue-50 min-h-screen flex items-center justify-center">
      <div className="max-w-screen-xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 p-4 sm:p-6 lg:p-10 text-gray-900 text-base text-left my-4 sm:my-8 lg:my-12" style={{fontFamily: 'Montserrat, Arial, sans-serif'}}>
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={56} height={56} className="mx-auto block" priority />
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mb-6">TRANSPARENCIA Y PROTECCIÓN DE RIESGOS</h2>
        <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
          <strong>Protección informada desde:</strong> Julio 2025
        </div>
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <strong className="text-gray-900">Información transparente para decisiones inteligentes</strong>
          </div>
          <p className="text-gray-800">En <strong>Kustodia</strong> creemos en la <strong>transparencia total</strong>. Te proporcionamos toda la información sobre riesgos para que tomes decisiones informadas y uses nuestra plataforma con total confianza y conocimiento.</p>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">1. ACTIVOS VIRTUALES: TECNOLOGÍA Y CONSIDERACIONES</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-red-600">Transparencia Legal Requerida</strong>
          </div>
          <p className="text-red-800 text-sm">Los activos virtuales (MXNB, stablecoins) <strong>NO son moneda de curso legal en México</strong> y NO están garantizados por el Gobierno Federal ni por el Banco de México.</p>
        </div>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-green-600">Respaldo Sólido y Transparente</strong>
          </div>
          <p className="text-green-800 text-sm">MXNB mantiene <strong>paridad 1:1 auditada</strong> con el peso mexicano. <a href="https://mxnb.mx/es-MX/transparencia" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold underline">Verifica transparencia en tiempo real →</a></p>
        </div>
        
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li><strong>Riesgo Tecnológico:</strong> Volatilidad de blockchain, congestiones de red, actualizaciones de protocolo</li>
          <li><strong>Riesgo Regulatorio:</strong> Cambios en políticas gubernamentales sobre activos virtuales</li>
          <li><strong>Riesgo de Liquidez:</strong> Variaciones en disponibilidad de mercado y spread de intercambio</li>
          <li><strong>Riesgo de Smart Contracts:</strong> Vulnerabilidades en código blockchain y protocolos DeFi</li>
        </ul>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Tecnología Blockchain</strong>
            </div>
            <p className="text-gray-700 text-sm">Contratos inteligentes pueden tener vulnerabilidades - trabajamos continuamente en actualizaciones de seguridad</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Marco Regulatorio</strong>
            </div>
            <p className="text-gray-700 text-sm">Regulación en evolución - mantenemos cumplimiento con las normativas vigentes</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Liquidez y Conversiones</strong>
            </div>
            <p className="text-gray-700 text-sm">Conversiones MXNB-MXN pueden tener demoras menores por procesos de seguridad</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Nuestro Compromiso</strong>
            </div>
            <p className="text-gray-700 text-sm">Monitoreamos y actualizamos continuamente para maximizar tu protección</p>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">2. TIPOS DE PAGO: CARACTERÍSTICAS Y CONSIDERACIONES</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-gray-800">Diferentes opciones, diferentes protecciones</strong>
          </div>
          <p className="text-gray-800 text-sm">Cada tipo de pago está diseñado para diferentes necesidades y niveles de protección:</p>
        </div>
        
        <h4 className="mt-6 font-semibold text-lg text-gray-600">2.1 Pagos Condicionales Estándar</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-gray-800">Automatización que te protege</strong>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Liberación Automática:</strong> Fondos se liberan automáticamente cuando se cumplen las condiciones - sin esperas innecesarias</p>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Consideración:</strong> Asegúrate de recibir bienes/servicios antes del plazo límite</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Ventana de Disputa:</strong> Tiempo específico para reportar problemas - aprovéchalo</p>
            </div>
          </div>
        </div>
        
        <h4 className="mt-6 font-semibold text-lg text-gray-600">2.2 Pagos Condicionales Premium</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-gray-800">Máxima seguridad con doble aprobación</strong>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-purple-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Doble Aprobación:</strong> Ambas partes deben aprobar - protección máxima contra fraudes</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Custodia Segura:</strong> Fondos protegidos hasta acuerdo mutuo - tu dinero siempre seguro</p>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Resolución Colaborativa:</strong> Disputas requieren diálogo - promovemos acuerdos justos</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Sin Prisa:</strong> Sin límites de tiempo artificiales - resuelve a tu ritmo</p>
            </div>
          </div>
        </div>
        
        <h4 className="mt-6 font-semibold text-lg text-gray-600">2.3 Pagos Web3</h4>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-gray-800">Tecnología blockchain de vanguardia</strong>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Tecnología Avanzada:</strong> Blockchain Arbitrum para transacciones rápidas y seguras</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Red Descentralizada:</strong> Menor dependencia de un solo punto de falla</p>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Irreversibilidad:</strong> Transacciones permanentes una vez confirmadas - verifica bien los detalles</p>
            </div>
            <div className="flex items-start">
              <span className="text-purple-600 mr-2 mt-1">•</span>
              <p className="text-gray-700"><strong>Costos Transparentes:</strong> Fees de red variables mostrados antes de confirmar</p>
            </div>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">3. RESOLUCIÓN DE DISPUTAS: PROTECCIÓN COLABORATIVA</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-orange-600">Protección universal durante disputas</strong>
          </div>
          <p className="text-orange-800 text-sm">Cualquier disputa activa <strong>protege automáticamente</strong> tus fondos en TODOS los tipos de pago hasta resolución completa.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Facilitación Experta</strong>
            </div>
            <p className="text-gray-700 text-sm">Kustodia facilita comunicación entre partes para acuerdos justos</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Sin Presión Temporal</strong>
            </div>
            <p className="text-gray-700 text-sm">Tiempo suficiente para resolver adecuadamente cada caso</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Custodia Protectora</strong>
            </div>
            <p className="text-gray-700 text-sm">Fondos seguros durante todo el proceso de resolución</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Proceso Justo</strong>
            </div>
            <p className="text-gray-700 text-sm">Priorizamos soluciones que beneficien a ambas partes</p>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">4. SISTEMAS DE IA: TECNOLOGÍA CON SUPERVISIÓN HUMANA</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-green-600">Garantía de Supervisión Humana</strong>
          </div>
          <p className="text-green-800 text-sm">Todas las decisiones críticas son <strong>revisadas personalmente</strong> por nuestro equipo de cumplimiento experto.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Análisis Inteligente</strong>
            </div>
            <p className="text-gray-700 text-sm">IA proporciona evaluación inicial rápida para optimizar procesos</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Tecnología Avanzada</strong>
            </div>
            <p className="text-gray-700 text-sm">Sistemas confiables con planes de contingencia para disponibilidad</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Revisión Experta</strong>
            </div>
            <p className="text-gray-700 text-sm">Equipo humano especializado supervisa cada decisión importante</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Mejora Continua</strong>
            </div>
            <p className="text-gray-700 text-sm">Algoritmos evolucionan para brindar mejor servicio constantemente</p>
          </div>
        </div>
        <div className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-400 text-gray-700 text-sm rounded">
          <strong>Garantía:</strong> Todas las decisiones críticas son revisadas por nuestro equipo humano de cumplimiento.
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">5. OPERACIONES: INFRAESTRUCTURA Y PROTECCIONES</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-blue-600">Infraestructura robusta con protecciones múltiples</strong>
          </div>
          <p className="text-blue-800 text-sm">Mantenemos sistemas de alta disponibilidad con planes de contingencia para garantizar la mejor experiencia posible.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Alta Disponibilidad</strong>
            </div>
            <p className="text-gray-700 text-sm">Sistemas redundantes y monitoreo 24/7 para minimizar interrupciones</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Socios Confiables</strong>
            </div>
            <p className="text-gray-700 text-sm">Proveedores regulados (Nvio, Juno, Truora) con SLAs estrictos</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Seguridad Multicapa</strong>
            </div>
            <p className="text-red-700 text-sm">Protecciones avanzadas contra amenazas cibernéticas</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Equipo Especializado</strong>
            </div>
            <p className="text-gray-700 text-sm">Personal capacitado con procesos de control de calidad</p>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">6. ENTORNO REGULATORIO: CUMPLIMIENTO Y ADAPTACIÓN</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-gray-800">Compromiso con el cumplimiento regulatorio</strong>
          </div>
          <p className="text-gray-700 text-sm">Mantenemos estrecha colaboración con autoridades y nos adaptamos proactivamente a cambios normativos.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Adaptación Normativa</strong>
            </div>
            <p className="text-gray-700 text-sm">Seguimiento continuo de regulación para adaptar servicios</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Colaboración Institucional</strong>
            </div>
            <p className="text-gray-700 text-sm">Trabajo conjunto con autoridades para cumplimiento óptimo</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">KYC/AML Robusto</strong>
            </div>
            <p className="text-gray-700 text-sm">Procesos de identificación que evolucionan con requisitos</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <strong className="text-gray-800">Claridad Fiscal</strong>
            </div>
            <p className="text-gray-700 text-sm">Información actualizada sobre tratamiento fiscal de activos</p>
          </div>
        </div>
        
        <h3 className="mt-8 font-semibold text-xl text-gray-700">7. GUÍA DE PROTECCIÓN: TU SEGURIDAD ES NUESTRA PRIORIDAD</h3>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-2">
            <strong className="text-gray-800">Herramientas para usar Kustodia con total confianza</strong>
          </div>
          <p className="text-gray-700 text-sm">Sigue estas recomendaciones para maximizar tu protección y aprovechar al máximo nuestra plataforma.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <strong className="text-gray-800">Evalúa Tu Perfil Financiero</strong>
            </div>
            <p className="text-gray-700 text-sm mb-2">Conoce tu tolerancia al riesgo y capacidad financiera</p>
            <div className="text-xs text-gray-600">• Define tus objetivos de inversión</div>
            <div className="text-xs text-gray-600">• Establece límites cómodos para ti</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <strong className="text-gray-800">Domina Nuestros Términos</strong>
            </div>
            <p className="text-gray-700 text-sm mb-2">Comprende completamente cómo funcionamos</p>
            <div className="text-xs text-gray-600">• Revisa tipos de pago disponibles</div>
            <div className="text-xs text-gray-600">• Entiende procesos de protección</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <strong className="text-gray-800">Protege Tu Acceso</strong>
            </div>
            <p className="text-gray-700 text-sm mb-2">Mantén seguras tus credenciales</p>
            <div className="text-xs text-gray-600">• Usa contraseñas únicas y fuertes</div>
            <div className="text-xs text-gray-600">• Activa autenticación de dos factores</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <strong className="text-gray-800">Verifica Cada Transacción</strong>
            </div>
            <p className="text-gray-700 text-sm mb-2">Revisa detalles antes de confirmar</p>
            <div className="text-xs text-gray-600">• Confirma direcciones y montos</div>
            <div className="text-xs text-gray-600">• Verifica condiciones del pago</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <strong className="text-gray-800">Mantén Registros Completos</strong>
            </div>
            <p className="text-gray-700 text-sm mb-2">Documenta todas tus operaciones</p>
            <div className="text-xs text-gray-600">• Guarda comprobantes de transacciones</div>
            <div className="text-xs text-gray-600">• Conserva comunicaciones importantes</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-3">
              <strong className="text-gray-800">Reporta Actividad Sospechosa</strong>
            </div>
            <p className="text-gray-700 text-sm mb-2">Comunícate inmediatamente si algo es inusual</p>
            <div className="text-xs text-gray-600">• Contacta soporte ante dudas</div>
            <div className="text-xs text-gray-600">• Reporta accesos no autorizados</div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h4 className="font-semibold text-lg text-gray-800 mb-2">CONTACTO PARA DUDAS SOBRE RIESGOS</h4>
          <p className="text-gray-700 mb-2"><strong>Tecnologías Avanzadas Centrales, S.A.P.I. de C.V.</strong></p>
          <p className="text-gray-700 mb-1"><a href="mailto:soporte@kustodia.mx" className="text-blue-600 hover:underline">soporte@kustodia.mx</a></p>
          <p className="text-gray-700 text-sm">Para consultas sobre riesgos y funcionamiento de la plataforma</p>
        </div>
      </div>
    </div>
  );
}
