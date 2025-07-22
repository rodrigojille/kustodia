import { FaUsers } from 'react-icons/fa';

interface TeamMember {
  name: string;
  role: string;
  experience: string;
  photo?: string;
}

interface MexicanTeamProps {
  vertical?: string;
  members?: TeamMember[];
  title?: string;
  subtitle?: string;
}

const defaultMembers: TeamMember[] = [
  {
    name: "Carlos Rodríguez",
    role: "Director de Operaciones",
    experience: "15 años en banca mexicana"
  },
  {
    name: "María González", 
    role: "Especialista en Inmobiliaria",
    experience: "Corredora certificada CDMX"
  },
  {
    name: "Luis Hernández",
    role: "Soporte al Cliente", 
    experience: "Disponible 24/7"
  }
];

const verticalTitles = {
  freelancer: "Entendemos a los freelancers mexicanos",
  inmobiliarias: "Somos mexicanos como tú",
  marketplaces: "Protegemos compradores y vendedores",
  ecommerce: "Expertos en comercio mexicano",
  b2b: "Especialistas en empresas mexicanas"
};

const verticalSubtitles = {
  freelancer: "Nuestro equipo protege tus pagos como freelancer",
  inmobiliarias: "Nuestro equipo en Ciudad de México protege tu dinero como si fuera nuestro",
  marketplaces: "Conocemos los riesgos del comercio en línea en México",
  ecommerce: "Años de experiencia protegiendo tiendas mexicanas",
  b2b: "Entendemos las necesidades de las empresas mexicanas"
};

export default function MexicanTeam({ 
  vertical = 'inmobiliarias', 
  members = defaultMembers,
  title,
  subtitle 
}: MexicanTeamProps) {
  const displayTitle = title || verticalTitles[vertical as keyof typeof verticalTitles] || verticalTitles.inmobiliarias;
  const displaySubtitle = subtitle || verticalSubtitles[vertical as keyof typeof verticalSubtitles] || verticalSubtitles.inmobiliarias;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-blue-700 text-3xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {displayTitle}
        </h3>
        <p className="text-lg text-gray-600">
          {displaySubtitle}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {members.map((member, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden">
              {member.photo ? (
                <img 
                  src={member.photo} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200"></div>
              )}
            </div>
            <h4 className="font-semibold text-gray-900">{member.name}</h4>
            <p className="text-sm text-gray-600">{member.role}</p>
            <p className="text-xs text-gray-500 mt-1">{member.experience}</p>
          </div>
        ))}
      </div>
      
      {/* Trust indicators */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-center space-x-8 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-gray-900">100%</div>
            <div>Mexicanos</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">24/7</div>
            <div>Soporte</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">CDMX</div>
            <div>Oficinas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
