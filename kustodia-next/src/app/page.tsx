'use client';
import Head from 'next/head';
import { useState } from 'react';
import { FaShieldAlt, FaHeadset, FaRocket, FaLock, FaCheckCircle } from 'react-icons/fa';
import { ArcadeEmbed } from '../components/ArcadeEmbed';
import ApiSneakPeek from '../components/ApiSneakPeek';
import CasosDeUso from '../components/CasosDeUso';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MXNBSection from '../components/MXNBSection';
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
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-16 mt-10">
  <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 flex flex-col items-center max-w-2xl mx-auto text-center">
    <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-6 leading-tight">Pagos <span className="text-blue-700">inteligentes y seguros</span> para todos</h1>
    <p className="text-lg sm:text-xl text-black mb-8">Tan fácil y rápido como un SPEI, pero con una capa de seguridad e inteligencia adicional. Paga o cobra con la misma sencillez de siempre, pero con la protección de la tecnología blockchain. Solución de pagos inteligentes, custodia y SPEI seguro con tecnología blockchain.</p>
    <a href="#early-access" className="inline-block bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition w-full max-w-xs sm:max-w-none sm:w-auto text-center">Regístrate gratis</a>
  </div>
        </section>

        <section className="w-full max-w-screen-xl px-4 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {benefits.map((b, i) => (
            <div key={b.title} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-blue-100 hover:shadow-xl transition">
              <div>{b.icon}</div>
              <div className="text-lg font-bold text-black mb-2 mt-2">{b.title}</div>
              <div className="text-base text-gray-500 mb-4">{b.subtext}</div>
              <div className="text-black text-base">{b.description}</div>
            </div>
          ))}
        </section>

        {/* Casos de Uso Section */}
        <CasosDeUso />


        <section id="early-access" className="w-full max-w-screen-xl px-4 mx-auto my-20">
          <div className="flex justify-center w-full mb-8">
            <div className="max-w-screen-xl w-full">
              <UrgencyNotice />
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-10 flex flex-col items-center max-w-lg w-full mx-auto text-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Acceso Anticipado a Kustodia</h2>
            <p className="text-gray-700 mb-2">Únete a la lista de espera y sé de los primeros en probar Kustodia.</p>
            <EarlyAccessCounter />
            <EarlyAccessForm />
            <a href="#early-access" className="mt-6 inline-block bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 transition w-full max-w-xs sm:max-w-none sm:w-auto text-center">Regístrate gratis</a>
          </div>
        </section>

        {/* ¿Por qué elegir Kustodia? */}
        <section className="max-w-2xl text-center">
          {/* Section intentionally left blank as content was moved above Early Access */}
        </section>

        {/* Arcade Demo Section */}
        <section className="w-full max-w-screen-xl px-4 mx-auto mt-20 mb-20 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">Demo Interactiva</h2>
          <div className="flex justify-center w-full">
            <ArcadeEmbed />
          </div>
        </section>
        {/* Sneak Peek API Section */}
        {/* Smart Contracts Info Section */}
        <SmartContractInfo />
        <section className="w-full max-w-screen-xl px-4 mx-auto mb-20">
          <ApiSneakPeek />
        </section>
        <div className="flex justify-center w-full my-10">
          <div className="max-w-screen-xl w-full">
            <UrgencyNotice />
          </div>
        </div>
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
      <Footer />
    </>
  );
}
