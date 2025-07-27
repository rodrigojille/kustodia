'use client';

import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function FooterWithAnalytics() {
  // Use analytics context only on client side to prevent SSR issues
  const trackUserAction = (eventName: string, properties: any) => {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(eventName, properties);
    }
  };

  const handleLegalLinkClick = (linkText: string, href: string) => {
    trackUserAction('footer_legal_link_click', {
      button_text: linkText,
      target_url: href,
      link_category: 'legal',
      engagement_level: 'medium'
    });
  };

  const handleSocialLinkClick = (platform: string, href: string) => {
    trackUserAction('footer_social_link_click', {
      platform: platform,
      target_url: href,
      link_category: 'social',
      engagement_level: 'high',
      external_link: true
    });
  };

  return (
    <footer className="w-full py-8 mt-12 border-t border-blue-100 bg-white text-sm text-gray-600 px-4">
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-center w-full md:w-auto text-center">
          <span className="font-semibold text-blue-700 mr-0 md:mr-4">Kustodia.mx © {new Date().getFullYear()}</span>
          <Link 
            href="/terminos" 
            className="hover:underline text-blue-700 mx-1"
            onClick={() => handleLegalLinkClick('Términos y Condiciones', '/terminos')}
          >
            Términos y Condiciones
          </Link>
          <Link 
            href="/privacidad" 
            className="hover:underline text-blue-700 mx-1"
            onClick={() => handleLegalLinkClick('Aviso de Privacidad', '/privacidad')}
          >
            Aviso de Privacidad
          </Link>
          <Link 
            href="/cookies" 
            className="hover:underline text-blue-700 mx-1"
            onClick={() => handleLegalLinkClick('Cookies', '/cookies')}
          >
            Cookies
          </Link>
          <Link 
            href="/riesgos" 
            className="hover:underline text-yellow-700 mx-1"
            onClick={() => handleLegalLinkClick('Riesgos', '/riesgos')}
          >
            Riesgos
          </Link>
          <Link 
            href="/seguridad" 
            className="hover:underline text-green-700 mx-1"
            onClick={() => handleLegalLinkClick('Seguridad', '/seguridad')}
          >
            Seguridad
          </Link>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <a 
            href="https://x.com/Kustodia_mx" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="X" 
            title="X (antes Twitter)"
            onClick={() => handleSocialLinkClick('X (Twitter)', 'https://x.com/Kustodia_mx')}
          >
            <FaTwitter className="w-6 h-6 text-blue-500 hover:text-blue-700 transition" />
          </a>
          <a 
            href="https://www.linkedin.com/company/kustodia-mx" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="LinkedIn" 
            title="LinkedIn"
            onClick={() => handleSocialLinkClick('LinkedIn', 'https://www.linkedin.com/company/kustodia-mx')}
          >
            <FaLinkedin className="w-6 h-6 text-blue-700 hover:text-blue-900 transition" />
          </a>
          <a 
            href="https://www.instagram.com/kustodia.mx/#" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Instagram" 
            title="Instagram"
            onClick={() => handleSocialLinkClick('Instagram', 'https://www.instagram.com/kustodia.mx/#')}
          >
            <FaInstagram className="w-6 h-6 text-pink-500 hover:text-pink-700 transition" />
          </a>
        </div>
      </div>
    </footer>
  );
}