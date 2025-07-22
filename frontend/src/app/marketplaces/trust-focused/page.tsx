'use client';
import TrustFocusedTemplate from '../../../components/trust/TrustFocusedTemplate';
import { FaShoppingCart, FaUserShield, FaStore, FaHandshake } from 'react-icons/fa';

// Marketplace-specific custom section
function MarketplaceTrustIssues() {
  return (
    <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-red-400">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Los riesgos de comprar y vender en línea en México
        </h3>
        <p className="text-lg text-gray-600">
          Sabemos que no confías en cualquiera para transacciones importantes
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">😰</span>
            Riesgos para Compradores
          </h4>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Productos falsos:</strong> Recibes algo diferente a lo que compraste
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Vendedores fantasma:</strong> Pagan y el vendedor desaparece
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Sin protección:</strong> Nadie te ayuda si algo sale mal
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">😤</span>
            Riesgos para Vendedores
          </h4>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Compradores fraudulentos:</strong> Reclaman reembolsos sin razón
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Pagos falsos:</strong> Prometen pagar pero nunca lo hacen
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                <strong>Chargebacks:</strong> Pierdes producto y dinero
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8 bg-blue-50 rounded-xl p-6">
        <p className="text-lg font-semibold text-blue-900">
          <span className="text-2xl mr-2">🛡️</span>
          Con Kustodia, compradores y vendedores están protegidos
        </p>
      </div>
    </div>
  );
}

function DualProtection() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Protección dual: Compradores y Vendedores seguros
        </h3>
        <p className="text-lg text-gray-600">
          La única plataforma que protege ambos lados de la transacción
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-green-50 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserShield className="text-green-600 text-2xl" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Para Compradores</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-green-700 text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dinero protegido</p>
                <p className="text-sm text-gray-600">Tu pago queda en custodia hasta recibir el producto</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-green-700 text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Reembolso garantizado</p>
                <p className="text-sm text-gray-600">Si no recibes el producto, te devolvemos todo</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-green-700 text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Vendedores verificados</p>
                <p className="text-sm text-gray-600">Solo vendedores confiables en nuestra plataforma</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStore className="text-blue-600 text-2xl" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900">Para Vendedores</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pago garantizado</p>
                <p className="text-sm text-gray-600">El comprador ya pagó antes de que envíes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sin chargebacks</p>
                <p className="text-sm text-gray-600">Protección total contra reclamos fraudulentos</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Compradores verificados</p>
                <p className="text-sm text-gray-600">Solo tratas con compradores reales y confiables</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8 bg-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-center mb-4">
          <FaHandshake className="text-purple-600 text-3xl mr-3" />
          <h4 className="text-xl font-semibold text-gray-900">Todos ganan</h4>
        </div>
        <p className="text-gray-700">
          Cuando compradores y vendedores están protegidos, todos pueden hacer negocios con confianza
        </p>
      </div>
    </div>
  );
}

export default function TrustFocusedMarketplaces() {
  return (
    <TrustFocusedTemplate
      vertical="marketplaces"
      heroIcon={<FaShoppingCart className="text-blue-700 text-4xl" />}
      heroTitle="Compra y vende en línea sin riesgos"
      heroSubtitle="Protección total para compradores y vendedores. Tu dinero seguro hasta recibir el producto."
      heroDescription="La única plataforma que protege ambos lados de la transacción. Compradores y vendedores pueden hacer negocios con total confianza."
      customSections={[
        <MarketplaceTrustIssues key="trust-issues" />,
        <DualProtection key="dual-protection" />
      ]}
      ctaText="Comprar con seguridad"
      finalCtaTitle="¿Listo para comprar y vender sin riesgos?"
      finalCtaDescription="Miles de compradores y vendedores ya confían en nosotros para sus transacciones"
    />
  );
}
