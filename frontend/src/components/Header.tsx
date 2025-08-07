'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAnalyticsContext } from './AnalyticsProvider';

interface HeaderProps {
  className?: string;
  isAuthenticated: boolean;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "", isAuthenticated, userName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { trackUserAction } = useAnalyticsContext();

  const useCases = [
    { title: "Inmobiliarias y agentes", icon: "🏠", href: "/inmobiliarias" },
    { title: "Freelancers y servicios", icon: "💻", href: "/freelancer" },
    { title: "E-commerce y ventas online", icon: "🛒", href: "/ecommerce" },
    { title: "Compra-venta entre particulares", icon: "🤝", href: "/compra-venta" },
    { title: "Empresas B2B y control de entregas", icon: "🏢", href: "/b2b" },
    { title: "Marketplaces de servicios", icon: "🌐", href: "/marketplaces" },
  ];

  const scrollToUseCases = () => {
    // Track navigation event
    trackUserAction('header_navigation_click', {
      button_text: 'Ver todos los casos de uso',
      target_url: '/#use-cases',
      current_page: window.location.pathname,
      engagement_level: 'high'
    });

    // Check if we're already on the home page
    if (window.location.pathname === '/') {
      // We're on home page, just scroll to the section
      const element = document.getElementById('use-cases-heading');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // We're on a different page, navigate to home page with hash
      window.location.href = '/#use-cases';
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className={`sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between ${className}`}>
      {/* Logo Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link 
          href="/" 
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          onClick={() => trackUserAction('header_logo_click', {
            button_text: 'Kustodia Logo',
            target_url: '/',
            current_page: window.location.pathname
          })}
        >
          <Image 
            src="/kustodia-logo.png" 
            alt="Kustodia Logo" 
            width={32} 
            height={32} 
            className="h-7 w-7 sm:h-8 sm:w-8" 
            priority 
          />
          <span className="font-bold text-lg sm:text-xl tracking-tight text-blue-700">
            Kustodia
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex items-center gap-1 sm:gap-3 lg:gap-6">
        {/* Casos de uso dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              trackUserAction('header_dropdown_toggle', {
                button_text: 'Casos de uso',
                dropdown_state: !isDropdownOpen ? 'opening' : 'closing',
                current_page: window.location.pathname
              });
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-2 text-gray-700 hover:text-blue-700 font-medium transition-colors duration-200 rounded-lg hover:bg-blue-50"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <span className="text-xs sm:text-sm md:text-base">Casos de uso</span>
            <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
              />
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                <button
                  onClick={scrollToUseCases}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <div className="font-semibold text-gray-900">Ver todos los casos de uso</div>
                      <div className="text-sm text-gray-500">Explora todas las soluciones</div>
                    </div>
                  </div>
                </button>
                
                {useCases.map((useCase) => (
                  <Link
                    key={useCase.title}
                    href={useCase.href}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => {
                      trackUserAction('header_use_case_click', {
                        button_text: useCase.title,
                        target_url: useCase.href,
                        current_page: window.location.pathname,
                        engagement_level: 'high',
                        fraud_category: useCase.title.includes('Inmobiliarias') ? 'real_estate' : 
                                       useCase.title.includes('Freelancer') ? 'services' :
                                       useCase.title.includes('E-commerce') ? 'ecommerce' :
                                       useCase.title.includes('Compra-venta') ? 'marketplace' :
                                       useCase.title.includes('B2B') ? 'b2b' : 'other'
                      });
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{useCase.icon}</span>
                      <div className="font-medium text-gray-900 text-sm leading-tight">
                        {useCase.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FAQ Link - Hidden on mobile to save space */}
        <Link 
          href="/faq" 
          className="hidden md:flex text-gray-700 hover:text-blue-700 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 text-base"
          onClick={() => trackUserAction('header_faq_click', {
            button_text: 'FAQ',
            target_url: '/faq',
            current_page: window.location.pathname
          })}
        >
          Preguntas Frecuentes
        </Link>

        {/* User section */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 hidden sm:inline">
              {userName || 'Usuario'}
            </span>
            <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm" aria-label="Menú usuario">
              {(userName && userName[0]?.toUpperCase()) || 'U'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-blue-700 font-medium transition-colors duration-200 px-1 sm:px-3 py-2 rounded-lg hover:bg-blue-50 text-xs sm:text-sm"
              onClick={() => trackUserAction('header_login_click', {
                button_text: 'Iniciar sesión',
                target_url: '/login',
                current_page: window.location.pathname
              })}
            >
              <span className="hidden sm:inline">Iniciar sesión</span>
              <span className="sm:hidden">Login</span>
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white font-medium px-2 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-xs sm:text-sm"
              onClick={() => trackUserAction('header_register_click', {
                button_text: 'Registrarse',
                target_url: '/register',
                current_page: window.location.pathname,
                engagement_level: 'high'
              })}
            >
              <span className="hidden sm:inline">Registrarse</span>
              <span className="sm:hidden">Registro</span>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
