"use client";
import { useEffect, useRef, useState } from "react";
import PaymentDetailClient from "@/components/PaymentDetailClient";
import OrderCreatedModal from "@/components/OrderCreatedModal";

import { PrinterIcon, ArrowDownTrayIcon, ShareIcon } from "@heroicons/react/24/outline";
import QRCode from "qrcode.react";

function QrPrintout({ paymentId }: { paymentId: string }) {
  const [hmac, setHmac] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/payments/${paymentId}`)
      .then(res => res.json())
      .then(data => {
        setHmac(data.payment?.hmac || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [paymentId]);
  if (loading || !hmac) return null;
  return (
    <div className="flex flex-col items-center mt-8">
      <QRCode value={`https://kustodia.mx/verify?payment=${paymentId}&hmac=${hmac}`} size={120} />
      <div className="mt-2 text-xs text-gray-500 text-center">Escanea para verificar la autenticidad y estado en tiempo real</div>
    </div>
  );
}

export default function PagoInstruccionesPage({ params }: { params: { id: string } }) {
  const paymentId = params.id;
  const [showCopied, setShowCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard/pagos/${paymentId}` : "";
  const printRef = useRef<HTMLDivElement>(null);

  // Imprimir solo el recibo
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '', 'height=900,width=700');
    if (!win) return;
    win.document.write('<html><head><title>Instrucciones de pago</title>');
    win.document.write('<style>@media print { body { background: #fff; margin: 0; } .no-print { display: none !important; } .print-root { max-width: 700px; margin: 0 auto; background: #fff; padding: 32px 16px; border-radius: 16px; box-shadow: 0 2px 12px #e3eafd; } }</style>');
    win.document.write('</head><body><div class="print-root">');
    win.document.write(printContents);
    win.document.write('</div></body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  // Descargar PDF solo del recibo
  const handleDownload = async () => {
  if (!printRef.current) return;
  const html2pdf = (await import("html2pdf.js")).default;
  html2pdf().set({
    margin: 0.3,
    filename: `Kustodia_pago_${paymentId}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).from(printRef.current).save();
};

  // Compartir: genera PDF y comparte si el navegador lo soporta, si no descarga y copia enlace
  const handleShare = async () => {
  if (!printRef.current) return;
  setShowCopied(false);
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    // Generar PDF como blob
    const opt = {
      margin: 0.3,
      filename: `Kustodia_pago_${paymentId}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    const worker = html2pdf().set(opt).from(printRef.current);
    const pdfBlob = await worker.outputPdf('blob');
    const file = new File([pdfBlob], `Kustodia_pago_${paymentId}.pdf`, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Pago Kustodia',
        files: [file],
      });
      return;
    }
    // Fallback: descarga el PDF y copia el enlace
    worker.save();
    await navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  } catch {
    setShowCopied(false);
  }
};


  return (
    <div className="px-2 pt-4 pb-16 sm:px-4 md:px-8 max-w-2xl mx-auto">
      <div ref={printRef} className="bg-white rounded-xl shadow border border-gray-200 p-4 sm:p-6 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 text-center">Instrucciones de pago</h1>
        <div className="mb-4">
  {/* Solo muestra PaymentDetailClient en pantalla normal */}
  <div className="block print:hidden">
    <PaymentDetailClient id={paymentId} onLoaded={() => setLoading(false)} showPrintButton={false} />
  </div>
  {/* Solo muestra QrPrintout en el printout/PDF */}
  <div className="hidden print:block">
    <QrPrintout paymentId={paymentId} />
  </div>
</div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 justify-center mt-6 no-print">
        <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-700 font-semibold bg-white hover:bg-blue-50 transition shadow-sm w-full md:w-auto" title="Imprimir recibo">
          <PrinterIcon className="w-5 h-5" /> Imprimir
        </button>
      </div>
      {showCopied && (
        <div className="text-green-600 text-center mt-2">¡Enlace copiado!</div>
      )}
    <OrderCreatedModal open={loading} />
    </div>
  );
}
