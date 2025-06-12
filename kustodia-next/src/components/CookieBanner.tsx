"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_KEY = "kustodia_cookie_consent";

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(COOKIE_KEY);
      setVisible(!consent);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center px-4 py-3 bg-white border-t border-blue-100 shadow-lg animate-fadein">
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 max-w-3xl w-full md:w-auto">
        <span className="text-gray-800 text-sm md:text-base">
          Usamos cookies para mejorar tu experiencia y analizar el uso del sitio. Lee nuestra{' '}
          <Link href="/cookies" className="underline text-blue-700 font-medium hover:text-blue-900" target="_blank">Política de Cookies</Link>.
        </span>
        <button
          onClick={acceptCookies}
          className="bg-blue-700 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Aceptar cookies"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
