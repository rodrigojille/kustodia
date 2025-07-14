"use client";
import { useRouter } from 'next/navigation';
import NuevoPagoForm from "@/components/NuevoPagoForm";

export default function NuevoPagoPage() {
  const router = useRouter();

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Back Link */}
        <button 
          onClick={() => router.push('/dashboard/crear-pago')}
          className="flex items-center mb-6 px-3 py-2 bg-transparent border border-gray-300 rounded-lg text-gray-600 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
        >
          <span className="mr-2">←</span>
          Volver a tipos de pago
        </button>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="page-title mb-4">
            💰 Pago Condicional Estándar
          </h1>
          
          <p className="page-description text-base sm:text-lg max-w-2xl mx-auto">
            Ideal para transacciones que requieren garantías rápidas y sencillas.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="card-primary p-4 sm:p-6 lg:p-8">
          <NuevoPagoForm />
        </div>
      </div>
    </div>
  );
}
