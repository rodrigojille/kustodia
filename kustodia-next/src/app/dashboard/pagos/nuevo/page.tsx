// Este archivo fue movido desde /pagos/nuevo/page.tsx. Puedes agregar aquí el formulario de nuevo pago.

import NuevoPagoForm from "@/components/NuevoPagoForm";

export default function NuevoPagoPage() {
  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 md:px-8">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-2 sm:p-4 md:p-6 max-w-full">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">Nuevo movimiento</h1>
        <NuevoPagoForm />
      </div>
    </div>
  );
}
