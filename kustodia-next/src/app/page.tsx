'use client';
import Head from 'next/head';
import { useState } from 'react';
import { FaShieldAlt, FaHeadset, FaRocket, FaLock, FaCheckCircle } from 'react-icons/fa';
import { ArcadeEmbed } from '../components/ArcadeEmbed';
import ApiSneakPeek from '../components/ApiSneakPeek';
import CasosDeUso from '../components/CasosDeUso';
import Header from '../components/Header';
import MXNBSection from '../components/MXNBSection';
import InstagramSection from '../components/InstagramSection';
import SmartContractInfo from '../components/SmartContractInfo';
import EarlyAccessCounter from '../components/EarlyAccessCounter';
import EarlyAccessForm from '../components/EarlyAccessForm';
import UrgencyNotice from '../components/UrgencyNotice';

const benefits = [
  {
    title: "Tan fácil como un SPEI, pero con tus condiciones",
    icon: <FaRocket className="text-blue-700 text-3xl" />,
    description: "Haz pagos como siempre. No necesitas aprender nada nuevo.",
    subtext: '',
  },
  {
    title: 'Control total',
    description: 'Tú decides cuándo se libera el dinero. Protege cada paso de tu operación.',
    icon: <FaShieldAlt size={38} className="text-blue-600 mb-2" />,
    subtext: '',
  },
  {
    title: 'Seguridad real',
    description: 'Protege anticipos, apartados y rentas: el dinero solo se libera cuando se cumplen las condiciones del pago.',
    icon: <FaLock size={38} className="text-blue-600 mb-2" />,
    subtext: '',
  },
  {
    title: 'Soporte humano',
    description: 'Te acompañamos en cada paso. Cualquier duda, estamos aquí.',
    icon: <FaHeadset size={38} className="text-blue-600 mb-2" />,
    subtext: '',
  },
];

export default function LandingPage() {
  // TODO: Replace with real auth state
  const isAuthenticated = false;
  const userName = '';
  return (
    <>
       <Head>
        <title>Kustodia - Pagos Inteligentes, Custodia y SPEI Seguro con Blockchain</title>
        <meta name="description" content="Kustodia: pagos inteligentes, custodia y SPEI seguro con tecnología blockchain. Protege tus operaciones y paga solo cuando todo sale bien. ¡Regístrate gratis!" />
        <meta property="og:title" content="Kustodia - Pagos Inteligentes, Custodia y SPEI Seguro con Blockchain" />
        <meta property="og:description" content="Kustodia: pagos inteligentes, custodia y SPEI seguro con tecnología blockchain. Protege tus operaciones y paga solo cuando todo sale bien." />
        <meta property="og:image" content="/kustodia-og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kustodia.mx/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Kustodia - Pagos Inteligentes y Seguros en México" />
        <meta name="twitter:description" content="Kustodia es la plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien." />
        <meta name="twitter:image" content="/kustodia-og.png" />
        <link rel="canonical" href="https://kustodia.mx/" />
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Kustodia',
          url: 'https://kustodia.mx/',
          logo: '/kustodia-og.png',
          sameAs: [
            'https://x.com/Kustodia_mx',
            'https://www.linkedin.com/company/kustodia-mx',
            'https://www.instagram.com/kustodia.mx/#'
          ],
          description: 'Plataforma líder en pagos seguros y custodia en México.'
        }) }} />
      </Head>
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
      />
      <main className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20">
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-20 mt-16">
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-col items-center justify-center text-center w-full max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-[1.1] max-w-4xl mx-auto text-center">
                Pagos en Kustodia seguros: 
                <span className="text-blue-600"> tu dinero solo se libera</span> cuando se cumple el trato.
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-normal leading-relaxed text-center">
                Protege compras, ventas o servicios con tecnología blockchain.
              </p>
              
              <a href="#early-access" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
                Probar gratis
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Kustodia?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La forma más segura y simple de proteger tus pagos en México
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <div key={b.title} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-blue-50 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:scale-105 group">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{b.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{b.title}</h3>
                {b.subtext && <div className="text-base text-blue-600 mb-3 font-medium">{b.subtext}</div>}
                <p className="text-gray-600 text-base leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Casos de Uso Section */}
        <CasosDeUso />


        <section id="early-access" className="w-full max-w-screen-xl px-4 mx-auto my-24">
          <div className="flex justify-center w-full mb-10">
            <div className="max-w-4xl w-full">
              <UrgencyNotice />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border border-blue-100 p-12 flex flex-col items-center max-w-2xl w-full mx-auto text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <span className="text-4xl mb-4 block">🚀</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Acceso Anticipado a Kustodia
                </h2>
                <p className="text-xl text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
                  Únete a la lista de espera y sé de los primeros en probar la plataforma de pagos seguros más avanzada de México.
                </p>
              </div>
              
              <EarlyAccessCounter />
              <EarlyAccessForm />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    Acceso prioritario
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    0% comisión
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    Soporte dedicado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Contracts Info Section */}
        <SmartContractInfo />
      </main>
      <section className="w-full flex flex-col items-center my-0 py-6 bg-white">
        <div className="flex flex-row flex-wrap gap-8 justify-center items-center w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <FaShieldAlt className="text-blue-500 text-3xl mb-1" />
            <span className="text-xs text-black text-center">Protección de fondos</span>
          </div>
          <div className="flex flex-col items-center">
            <FaLock className="text-blue-500 text-3xl mb-1" />
            <span className="text-xs text-black text-center">Verificado por blockchain</span>
          </div>
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-blue-500 text-3xl mb-1" />
            <span className="text-xs text-black text-center">Cumple con normativas</span>
          </div>
        </div>
      </section>
      <section className="w-full flex flex-col items-center my-8">
        <a href="#early-access" className="inline-block bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition w-full max-w-xs sm:max-w-none sm:w-auto text-center">Regístrate gratis</a>
      </section>
    </>
  );
}
