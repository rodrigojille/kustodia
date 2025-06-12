import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import "./globals.css";
import DashboardShell from "../components/DashboardShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kustodia - Pagos Inteligentes y Seguros en México",
  description: "Kustodia es la plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien. ¡Regístrate gratis!",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Kustodia - Pagos Inteligentes y Seguros en México",
    description: "Kustodia es la plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien.",
    url: "https://kustodia.mx/",
    siteName: "Kustodia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kustodia - Pagos Inteligentes y Seguros en México"
      }
    ],
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    title: "Kustodia - Pagos Inteligentes y Seguros en México",
    description: "Kustodia es la plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien.",
    card: "summary_large_image",
    site: "@kustodiaapp",
    images: ["/og-image.png"]
  },
  alternates: {
    canonical: "https://kustodia.mx/"
  }
};

import CookieBanner from "../components/CookieBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Google Analytics GA4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5X4H87YHLT"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5X4H87YHLT', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <CookieBanner />
        <footer className="w-full py-8 mt-12 border-t border-blue-100 bg-white text-sm text-gray-600 px-4">
  <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
    <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-center w-full md:w-auto text-center">
      <span className="font-semibold text-blue-700 mr-0 md:mr-4">Kustodia.mx © {new Date().getFullYear()}</span>
      <Link href="/terminos" className="hover:underline text-blue-700 mx-1">Términos y Condiciones</Link>
      <Link href="/privacidad" className="hover:underline text-blue-700 mx-1">Aviso de Privacidad</Link>
      <Link href="/cookies" className="hover:underline text-blue-700 mx-1">Cookies</Link>
      <Link href="/riesgos" className="hover:underline text-yellow-700 mx-1">Riesgos</Link>
      <Link href="/seguridad" className="hover:underline text-green-700 mx-1">Seguridad</Link>
    </div>
    <div className="flex items-center justify-center md:justify-end gap-4 mt-4 md:mt-0 w-full md:w-auto">
      <a href="https://x.com/Kustodia_mx" target="_blank" rel="noopener noreferrer" aria-label="X" title="X (antes Twitter)">
  <FaTwitter className="w-6 h-6 text-blue-500 hover:text-blue-700 transition" />
</a>
<a href="https://www.linkedin.com/company/kustodia-mx" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
  <FaLinkedin className="w-6 h-6 text-blue-700 hover:text-blue-900 transition" />
</a>
<a href="https://www.instagram.com/kustodia.mx/#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
  <FaInstagram className="w-6 h-6 text-pink-500 hover:text-pink-700 transition" />
</a>
    </div>
  </div>

        </footer>
      </body>
    </html>
  );
}
