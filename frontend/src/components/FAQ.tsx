/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqData = [
  {
    question: '¿Cómo recibo mi dinero según el tipo de pago?',
    answer: 'Depende del tipo de pago que recibas: **Pagos Condicionales (Estándar y Premium)**: El dinero llega directamente a tu cuenta bancaria a través de tu CLABE de cobro una vez completadas las condiciones. Es automático y en pesos mexicanos. **Pagos Web3**: Los fondos llegan directamente a tu billetera digital y tú decides cuándo convertirlos a pesos y enviarlos a tu banco. Ambos métodos son seguros y están protegidos por contratos inteligentes.',
  },
  {
    question: '¿Qué tan seguro es usar Kustodia para mis pagos?',
    answer: 'Kustodia es extremadamente seguro porque está construido sobre la seguridad del sistema SPEI y blockchain. Todos los pagos tienen completa trazabilidad y transparencia. Utilizamos contratos inteligentes auditados que protegen tu dinero las 24 horas, y tus fondos están asegurados hasta que se cumplan exactamente las condiciones acordadas. Cumplimos con todas las regulaciones financieras mexicanas para tu total tranquilidad.',
  },
  {
    question: '¿Cómo funciona la protección de mis pagos?',
    answer: 'Cuando realizas un pago, tus fondos se guardan de forma segura hasta que el trabajo o servicio se complete correctamente. **Pagos Estándar**: Los fondos se liberan automáticamente cuando termina el plazo de custodia y no hay disputas. **Pagos Premium**: Requieren aprobación de ambas partes para liberar los fondos. Es como tener un mediador digital que protege tanto al comprador como al vendedor, eliminando el riesgo de fraude o incumplimiento.',
  },
  {
    question: '¿Qué significa cuando mi pago está "en custodia"?',
    answer: 'Significa que tu dinero está completamente seguro y protegido. "En custodia" quiere decir que los fondos ya están depositados y asegurados, esperando a que se cumplan las condiciones del acuerdo. **Pagos Estándar**: Los fondos se liberan automáticamente cuando termina el plazo de custodia y no hay disputas. **Pagos Premium**: Requieren aprobación dual para mayor seguridad. Es como tener tu dinero en una caja fuerte digital que se abre solo cuando todo está correcto.',
  },
  {
    question: '¿Por qué necesito registrar mi cuenta bancaria?',
    answer: 'Tu CLABE bancaria es tu dirección de entrega para recibir dinero en pesos mexicanos. Es como tu dirección postal, pero para transferencias bancarias. Kustodia la necesita para enviarte tus pagos de forma directa y segura a tu cuenta. Solo la registras una vez y puedes recibir todos tus pagos sin complicaciones.',
  },
  {
    question: '¿Cómo funcionan los pagos Web3 en mi billetera?',
    answer: 'Los pagos Web3 te dan control total sobre tus fondos. Cuando recibes un pago Web3, los MXNBs llegan directamente a tu billetera digital en Kustodia. Desde ahí puedes: 1) Mantenerlos como MXNBs para futuros pagos, 2) Convertirlos a pesos mexicanos y enviarlos a tu cuenta bancaria cuando quieras, o 3) Usarlos para realizar otros pagos Web3. Tú tienes el control completo.',
  },
  {
    question: '¿Qué es el sistema de aprobación dual en pagos en custodia Premium?',
    answer: 'El sistema de aprobación dual es exclusivo de los pagos en custodia Premium y ofrece la máxima seguridad. A diferencia de los pagos estándar que se liberan automáticamente al terminar el plazo, los pagos Premium requieren que tanto el pagador como el beneficiario confirmen que el trabajo se completó satisfactoriamente. Es como tener dos llaves para abrir la caja fuerte: ambas partes deben aprobar antes de liberar los fondos. Perfecto para transacciones importantes donde quieres máxima protección.',
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
