import React from 'react';
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

interface ContactInfo {
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  hours?: {
    phone: string;
    whatsapp: string;
  };
}

interface HumanContactProps {
  vertical?: string;
  title?: string;
  subtitle?: string;
  contactInfo?: ContactInfo;
  showAddress?: boolean;
}

const defaultContactInfo: ContactInfo = {
  phone: "55-1234-5678",
  whatsapp: "55-9876-5432",
  email: "soporte@kustodia.mx",
  address: "Polanco, Ciudad de Mexico",
  hours: {
    phone: "Lunes a Viernes 9am-7pm",
    whatsapp: "Disponible 24/7"
  }
};

const verticalTitles: Record<string, string> = {
  freelancer: "Dudas sobre tus pagos? Habla con nosotros",
  inmobiliarias: "Tienes dudas? Habla con nosotros", 
  marketplaces: "Problemas con tu compra? Te ayudamos",
  ecommerce: "Necesitas ayuda con tu tienda? Llamanos",
  b2b: "Soporte empresarial personalizado"
};

const verticalSubtitles: Record<string, string> = {
  freelancer: "Nuestro equipo entiende los retos de los freelancers mexicanos",
  inmobiliarias: "Nuestro equipo mexicano esta disponible para ayudarte",
  marketplaces: "Especialistas en resolver problemas de compra-venta",
  ecommerce: "Expertos en e-commerce mexicano a tu disposicion",
  b2b: "Consultores especializados en soluciones empresariales"
};

export default function HumanContact(props: HumanContactProps) {
  const {
    vertical = 'inmobiliarias',
    title,
    subtitle,
    contactInfo = defaultContactInfo,
    showAddress = true
  } = props;

  const displayTitle = title || verticalTitles[vertical] || verticalTitles.inmobiliarias;
  const displaySubtitle = subtitle || verticalSubtitles[vertical] || verticalSubtitles.inmobiliarias;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, tengo dudas sobre Kustodia. Me pueden ayudar?');
    const phoneNumber = contactInfo.whatsapp.replace(/[-\s]/g, '');
    const url = 'https://wa.me/52' + phoneNumber + '?text=' + message;
    window.open(url, '_blank');
  };

  const handlePhoneClick = () => {
    const phoneNumber = contactInfo.phone.replace(/[-\s]/g, '');
    const url = 'tel:+52' + phoneNumber;
    window.open(url, '_self');
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-12 text-white">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">
          {displayTitle}
        </h3>
        <p className="text-lg mb-8 opacity-90">
          {displaySubtitle}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          <div 
            className="bg-white bg-opacity-20 rounded-xl p-6 cursor-pointer hover:bg-opacity-30 transition-all duration-300"
            onClick={handlePhoneClick}
          >
            <FaPhone className="text-3xl mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Llamanos</h4>
            <p className="text-xl font-bold">{contactInfo.phone}</p>
            <p className="text-sm opacity-80">{contactInfo.hours?.phone}</p>
          </div>
          
          <div 
            className="bg-white bg-opacity-20 rounded-xl p-6 cursor-pointer hover:bg-opacity-30 transition-all duration-300"
            onClick={handleWhatsAppClick}
          >
            <FaWhatsapp className="text-3xl mx-auto mb-3" />
            <h4 className="font-semibold mb-2">WhatsApp</h4>
            <p className="text-xl font-bold">{contactInfo.whatsapp}</p>
            <p className="text-sm opacity-80">{contactInfo.hours?.whatsapp}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-sm opacity-80">
          {contactInfo.email && (
            <div className="flex items-center justify-center">
              <FaEnvelope className="mr-2" />
              <span>{contactInfo.email}</span>
            </div>
          )}
          
          {showAddress && contactInfo.address && (
            <div className="flex items-center justify-center">
              <FaMapMarkerAlt className="mr-2" />
              <span>{contactInfo.address}</span>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white border-opacity-20">
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="font-semibold">Respuesta</div>
              <div className="opacity-80">2 horas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Idioma</div>
              <div className="opacity-80">Español 100%</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Ubicacion</div>
              <div className="opacity-80">CDMX</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
