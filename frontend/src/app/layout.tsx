import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardShell from "../components/DashboardShell";
import { CSPostHogProvider } from "../lib/posthog";
import PostHogSurvey from "../components/PostHogSurvey";
import AnalyticsProvider from "../components/AnalyticsProvider";
import CookieBanner from "../components/CookieBanner";
import { Providers } from "../components/Providers";
import FooterWithAnalytics from "../components/FooterWithAnalytics";
import CriticalCSS from "../components/CriticalCSS";

// Optimized font loading
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'], // Fallback fonts
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kustodia.mx'),
  title: "Kustodia México | Pagos en custodia seguros",
  description: "🛡️ Kustodia: Pagos 100% seguros en México. Escrow digital que protege tus transacciones - tu dinero se libera solo cuando todo sale bien. ✅ Sin fraudes ✅ Sin estafas ✅ Garantía total. Únete gratis.",
  keywords: [
    // Primary keywords
    "custodia de pagos",
    "escrow México",
    "pagos seguros México",
    "Kustodia México",
    // Fraud prevention keywords
    "evitar fraudes México",
    "protección contra estafas",
    "pagos sin riesgo",
    "seguridad en transacciones",
    // Industry-specific keywords
    "escrow inmobiliario",
    "pagos seguros freelancer",
    "protección compra venta",
    "escrow marketplace",
    "pagos seguros ecommerce",
    // Technology keywords
    "blockchain pagos",
    "tecnología escrow",
    "pagos inteligentes",
    "custodia digital",
    // Local market keywords
    "pagos seguros CDMX",
    "escrow Guadalajara",
    "pagos protegidos Monterrey"
  ],
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicon.png',
    },
  ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Critical CSS */}
        <CriticalCSS />
        
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Comprehensive favicon support for all devices */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#336be4" />

        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "Kustodia México",
              "alternateName": ["Kustodia.mx", "Kustodia Fintech", "Kustodia Escrow"],
              "description": "Kustodia México es la plataforma líder en servicios de escrow y custodia de pagos digitales en México. Protege transacciones con tecnología blockchain y garantiza pagos seguros sin fraudes.",
              "url": "https://kustodia.mx",
              "logo": "https://kustodia.mx/logo.png",
              "image": "https://kustodia.mx/og-image.png",
              "sameAs": [
                "https://twitter.com/kustodiaapp",
                "https://www.linkedin.com/company/kustodia-mx"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MX",
                "addressRegion": "México"
              },
              "serviceType": "Digital Escrow Service",
              "areaServed": {
                "@type": "Country",
                "name": "Mexico"
              },
              "foundingDate": "2024",
              "industry": "Financial Technology",
              "keywords": "escrow, custodia de pagos, pagos seguros, fintech México, blockchain",
              "knowsAbout": [
                "Escrow Services",
                "Payment Security",
                "Fraud Prevention",
                "Digital Payments",
                "Blockchain Technology"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de Custodia de Pagos",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Escrow Inmobiliario",
                      "description": "Custodia de pagos para transacciones inmobiliarias"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Escrow E-commerce",
                      "description": "Protección de pagos para tiendas online"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Escrow Freelancer",
                      "description": "Pagos seguros para servicios profesionales"
                    }
                  }
                ]
              }
            })
          }}
        />
        
        {/* FAQ Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Qué es Kustodia y cómo funciona?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kustodia es un servicio de escrow digital en México que protege tus transacciones. Tu dinero se mantiene seguro y solo se libera cuando ambas partes cumplen con el acuerdo. Elimina fraudes y estafas en compras, ventas y servicios."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Es seguro usar Kustodia para mis pagos?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sí, Kustodia es 100% seguro. Utilizamos tecnología blockchain y cumplimos con las regulaciones mexicanas. Tu dinero está protegido y solo se libera cuando se cumplen todas las condiciones del acuerdo."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Cuánto cuesta usar Kustodia?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kustodia cobra una pequeña comisión solo cuando la transacción se completa exitosamente. No hay costos ocultos ni tarifas por adelantado. Solo pagas cuando todo sale bien."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿En qué tipo de transacciones puedo usar Kustodia?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Puedes usar Kustodia para compra-venta de vehículos, transacciones inmobiliarias, servicios freelancer, e-commerce, marketplaces y cualquier transacción donde necesites protección contra fraudes."
                  }
                }
              ]
            })
          }}
        />
        
        {/* PostHog will be initialized by the CSPostHogProvider component */}
        
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'}');
            `,
          }}
        />
        
        {/* Google Analytics GA4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-5X4H87YHLT'}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-5X4H87YHLT'}', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-white`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'}"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <Providers>
          <CSPostHogProvider>
            <AnalyticsProvider>
              {children}
              <PostHogSurvey trigger="auto" />
            </AnalyticsProvider>
          </CSPostHogProvider>
        </Providers>
        <CookieBanner />
        <FooterWithAnalytics />
      </body>
    </html>
  );
}
