/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqData = [
  {
    question: '¿Cómo canjeo mis tokens MXNB a pesos mexicanos?',
    answer: 'Para canjear tus tokens MXNB a moneda fiduciaria, ve a tu \'Billetera\', selecciona \'Canjear MXNB\' y proporciona el monto y tu cuenta CLABE de destino. Gracias a nuestra integración con la tecnología blockchain y el sistema de pagos SPEI de México, la transferencia generalmente se completa en cuestión de minutos.',
  },
  {
    question: '¿Cuáles son las comisiones por enviar criptomonedas a una billetera externa?',
    answer: 'Cuando envías criptomonedas desde Kustodia a una billetera externa, solo pagas la tarifa de red estándar (o \'gas fee\') de esa blockchain (por ejemplo, Arbitrum, Ethereum). Kustodia no cobra ninguna tarifa de plataforma adicional por los retiros. La tarifa de red varía según la congestión de la red en tiempo real.',
  },
  {
    question: '¿Cómo funciona el escrow en Kustodia?',
    answer: 'Cuando se realiza un pago, los fondos se pueden colocar en un contrato de escrow seguro en la blockchain de Arbitrum. Los fondos se mantienen allí hasta que se cumplen las condiciones de liberación específicas, acordadas por el pagador y el beneficiario. Una vez que se cumplen las condiciones, los fondos se liberan automáticamente a la cuenta de pago designada del beneficiario.',
  },
  {
    question: '¿Qué significa el estado \'fondeado\' en mi pago?',
    answer: 'Un estado de \'fondeado\' significa que el pagador ha depositado con éxito los fondos para la transacción. Si el pago incluye un escrow, los fondos ahora están asegurados en el contrato inteligente. El siguiente paso es la liberación de los fondos o esperar a que finalice el período de custodia, según los términos del pago.',
  },
  {
    question: '¿Por qué necesito proporcionar una CLABE?',
    answer: 'Kustodia utiliza la CLABE para todos los pagos en moneda fiduciaria en México. Para recibir pagos en Pesos Mexicanos (MXN), debes proporcionar una CLABE válida de 18 dígitos para tu cuenta bancaria. Esto garantiza que los fondos se transfieran de forma segura y directa a ti.',
  },
  {
    question: '¿Qué son los \'Datos de la Regla de Viaje\' (Travel Rule)?',
    answer: 'La Regla de Viaje es una regulación financiera diseñada para prevenir el lavado de dinero. Para ciertas transacciones, Kustodia debe recopilar y compartir información sobre el originador (pagador) y el beneficiario (receptor). El campo de datos de la regla de viaje es donde se almacena esta información de cumplimiento.',
  },
];

type FAQ = {
  question: string;
  answer: string;
};

interface FAQItemProps {
  faq: FAQ;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ faq, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex justify-between items-center text-left text-gray-800 focus:outline-none"
        onClick={onClick}
      >
        <span className="font-semibold">{faq.question}</span>
        <span>{isOpen ? <FaChevronUp className="text-blue-500" /> : <FaChevronDown className="text-gray-500" />}</span>
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600 leading-relaxed">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 md:p-8 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Preguntas Frecuentes (FAQ)</h2>
      <div>
        {faqData.map((faq: FAQ, index: number) => (
          <FAQItem
            key={index}
            faq={faq}
            isOpen={openIndex === index}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
