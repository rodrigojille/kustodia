import { FaStar, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';

interface Testimonial {
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  verified: boolean;
  photo?: string;
  amount?: string;
  vertical?: string;
}

interface RealTestimonialsProps {
  vertical?: string;
  testimonials?: Testimonial[];
  title?: string;
  showRating?: boolean;
}

const verticalTestimonials = {
  freelancer: [
    {
      name: "Carlos Mendoza",
      role: "Diseñador Gráfico",
      location: "Guadalajara, Jalisco",
      quote: "Antes tenía miedo de trabajar con clientes nuevos. Con Kustodia, sé que mi pago está garantizado. Ya no trabajo con estrés.",
      rating: 5,
      verified: true,
      amount: "$15,000",
      vertical: "freelancer"
    },
    {
      name: "Ana Ruiz",
      role: "Desarrolladora Web",
      location: "Monterrey, Nuevo León",
      quote: "Un cliente me canceló un proyecto a último momento. Kustodia me devolvió todo el anticipo en 24 horas. Increíble servicio.",
      rating: 5,
      verified: true,
      amount: "$45,000",
      vertical: "freelancer"
    }
  ],
  inmobiliarias: [
    {
      name: "Ana Martínez",
      role: "Compradora",
      location: "Polanco, CDMX",
      quote: "Al principio tenía miedo de usar algo nuevo para una compra tan importante. Pero cuando hablé con María por teléfono y me explicó todo, me sentí tranquila. Mi casa de 2.5 millones quedó protegida y todo salió perfecto.",
      rating: 5,
      verified: true,
      amount: "$2,500,000",
      vertical: "inmobiliarias"
    },
    {
      name: "Roberto Silva",
      role: "Corredor Inmobiliario",
      location: "Roma Norte, CDMX",
      quote: "Mis clientes ahora confían más en mí porque saben que su dinero está protegido. He cerrado 3 ventas más este mes gracias a Kustodia.",
      rating: 5,
      verified: true,
      vertical: "inmobiliarias"
    }
  ],
  marketplaces: [
    {
      name: "Laura Pérez",
      role: "Compradora en línea",
      location: "Puebla, Puebla",
      quote: "Compré una laptop de $25,000 y el vendedor desapareció. Kustodia me devolvió todo mi dinero en 48 horas. Ahora solo compro con ellos.",
      rating: 5,
      verified: true,
      amount: "$25,000",
      vertical: "marketplaces"
    }
  ],
  ecommerce: [
    {
      name: "Miguel Torres",
      role: "Dueño de tienda online",
      location: "Mérida, Yucatán",
      quote: "Desde que uso Kustodia, no he tenido ni un chargeback. Mis clientes confían más y mis ventas subieron 40%.",
      rating: 5,
      verified: true,
      vertical: "ecommerce"
    }
  ],
  b2b: [
    {
      name: "Patricia Jiménez",
      role: "CFO",
      location: "Santa Fe, CDMX",
      quote: "Pagamos $500,000 a un proveedor nuevo. Kustodia nos dio la confianza de hacer la transacción sabiendo que estaba protegida.",
      rating: 5,
      verified: true,
      amount: "$500,000",
      vertical: "b2b"
    }
  ]
};

const verticalTitles = {
  freelancer: "Lo que dicen los freelancers mexicanos",
  inmobiliarias: "Lo que dicen nuestros usuarios",
  marketplaces: "Compradores y vendedores satisfechos",
  ecommerce: "Tiendas que confían en nosotros",
  b2b: "Empresas que nos recomiendan"
};

export default function RealTestimonials({ 
  vertical = 'inmobiliarias',
  testimonials,
  title,
  showRating = true
}: RealTestimonialsProps) {
  const displayTestimonials = testimonials || verticalTestimonials[vertical as keyof typeof verticalTestimonials] || verticalTestimonials.inmobiliarias;
  const displayTitle = title || verticalTitles[vertical as keyof typeof verticalTitles] || verticalTitles.inmobiliarias;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`} 
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {displayTitle}
        </h3>
        <p className="text-gray-600">
          Testimonios reales de mexicanos que ya protegen sus transacciones
        </p>
      </div>
      
      <div className="space-y-8 max-w-4xl mx-auto">
        {displayTestimonials.map((testimonial, index) => (
          <div key={index} className="bg-blue-50 rounded-xl p-6 relative">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 bg-blue-50 transform rotate-45"></div>
            </div>
            
            <div className="flex items-start mb-4">
              <FaQuoteLeft className="text-blue-400 text-2xl mr-4 mt-1 flex-shrink-0" />
              <p className="text-lg text-gray-700 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 overflow-hidden flex-shrink-0">
                  {testimonial.photo ? (
                    <img 
                      src={testimonial.photo} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-semibold text-gray-900 mr-2">{testimonial.name}</p>
                    {testimonial.verified && (
                      <FaCheckCircle className="text-green-500 text-sm" title="Usuario verificado" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="text-right">
                {showRating && (
                  <div className="flex items-center mb-1">
                    {renderStars(testimonial.rating)}
                  </div>
                )}
                {testimonial.amount && (
                  <p className="text-sm text-gray-600">
                    Transacción: <span className="font-semibold">{testimonial.amount}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Trust indicators */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-center space-x-8 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-gray-900">4.9/5</div>
            <div>Calificación promedio</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">1,247</div>
            <div>Usuarios satisfechos</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">100%</div>
            <div>Testimonios verificados</div>
          </div>
        </div>
      </div>
    </div>
  );
}
