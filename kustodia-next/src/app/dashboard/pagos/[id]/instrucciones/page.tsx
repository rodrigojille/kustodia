"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PaymentDetailClient from "@/components/PaymentDetailClient";

export default function PagoInstruccionesPage({ params }: { params: { id: string } }) {
  const paymentId = params.id;
  const [showCopied, setShowCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard/pagos/${paymentId}` : "";

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print(); // For MVP, print dialog can be used for both print/download
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Pago Kustodia",
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 md:px-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 text-center">Instrucciones de pago</h1>
        <div className="mb-4">
          <PaymentDetailClient id={paymentId} />
        </div>
        <div className="flex flex-col md:flex-row gap-2 justify-center mt-6">
          <button onClick={handlePrint} className="btn btn-outline-primary w-full md:w-auto">Imprimir</button>
          <button onClick={handleDownload} className="btn btn-outline-primary w-full md:w-auto">Descargar PDF</button>
          <button onClick={handleShare} className="btn btn-outline-primary w-full md:w-auto">Compartir</button>
        </div>
        {showCopied && (
          <div className="text-green-600 text-center mt-2">¡Enlace copiado!</div>
        )}
      </div>
    </div>
  );
}
