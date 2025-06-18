import React from "react";

const casos = [
  {
    title: "Inmobiliarias y agentes",
    description: "Cierra ventas más rápido y genera confianza con tus clientes usando pagos en custodia. Protege anticipos, apartados y rentas: el dinero solo se libera cuando se cumplen las condiciones del pago.",
    icon: "🏠",
  },
  {
    title: "Freelancers y servicios",
    description: "Asegura tu pago antes de comenzar a trabajar. El cliente deposita en custodia y tú entregas con tranquilidad. Sin riesgos de impago.",
    icon: "💻",
  },
  {
    title: "E-commerce y ventas online",
    description: "Ofrece máxima confianza a tus compradores. El pago queda protegido hasta que el producto llega en buen estado.",
    icon: "🛒",
  },
  {
    title: "Compra-venta entre particulares",
    description: "Evita fraudes en ventas de autos, gadgets, muebles y más. El dinero solo se libera cuando se cumplen las condiciones del pago.",
    icon: "🤝",
  },
  {
    title: "Empresas B2B y control de entregas",
    description: "Gestiona compras entre empresas con pagos protegidos: el dinero queda en custodia hasta que la entrega y la calidad sean verificadas. Ideal para compras con control de entregas, pagos por adelantado y flujos tipo escrow.",
    icon: "🏢",
  },
  {
    title: "Marketplaces de servicios",
    description: "Facilita pagos en custodia en marketplaces donde se ofrecen servicios y es fundamental asegurar la entrega y satisfacción antes de liberar el pago. Ideal para plataformas que conectan profesionales y clientes, garantizando la completitud del servicio.",
    icon: "🌐",
  },
];

export default function CasosDeUso() {
  return (
    <section className="w-full max-w-5xl mx-auto my-20">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black mb-10 text-center">Casos de uso</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {casos.map((c) => {
          let href = null;
          if (c.title === "Freelancers y servicios") href = "/freelancer";
          if (c.title === "Inmobiliarias y agentes") href = "/inmobiliarias";
          if (c.title === "E-commerce y ventas online") href = "/ecommerce";
          if (c.title === "Compra-venta entre particulares") href = "/compra-venta";
          if (c.title === "Empresas B2B y control de entregas") href = "/b2b";
          if (c.title === "Marketplaces de servicios") href = "/marketplaces";
          return (
            <div key={c.title} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-blue-100 hover:shadow-xl transition h-full">
              <div className="text-4xl mb-3">{c.icon}</div>
              <div className="text-lg font-bold text-black mb-2">{c.title}</div>
              <div className="text-black text-base mb-3 flex-1">{c.description}</div>
              <div className="flex w-full justify-center mt-auto">
                {href ? (
                  <a href={href} className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow hover:bg-blue-700 transition">Saber más</a>
                ) : (
                  <span className="inline-block px-6 py-2 bg-blue-200 text-white rounded-lg font-semibold text-sm shadow opacity-60 cursor-not-allowed">Saber más</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
