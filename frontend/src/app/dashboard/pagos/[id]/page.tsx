// Este archivo fue movido desde /pagos/[id]/page.tsx. Puedes mostrar aquí el detalle del pago.

import type { ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
) {
  return {
    title: `Pago #${params.id}`,
    description: `Detalle del pago ${params.id}`,
  };
}

import PaymentDetailClient from "@/components/PaymentDetailClient";


export default function PagoDetallePage({ params }: { params: { id: string } }) {
  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 md:px-8">
      <PaymentDetailClient id={params.id} />
    </div>
  );
}



