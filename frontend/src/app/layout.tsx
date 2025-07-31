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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kustodia.mx'),
  title: "Kustodia México | Pagos en custodia seguros",
  description: "Kustodia es un servicio digital de custodia de pagos (escrow) en México. Protege tus compras, ventas y servicios con tecnología blockchain. Tu dinero solo se libera cuando se cumple el trato. Sin fraudes, sin riesgos.",
  keywords: [
    "custodia de pagos",
    "escrow México",
    "seguridad digital",
    "Kustodia seguridad",
    "blockchain pagos",
    "pagos seguros México",
    "protección de dinero",
    "pagos protegidos",
    "Kustodia México"
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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "Kustodia",
              "description": "Plataforma líder en pagos inteligentes y seguros de dinero en México. Protege tus operaciones y paga solo cuando todo sale bien.",
              "url": "https://kustodia.mx",
              "logo": "https://kustodia.mx/logo.png",
              "sameAs": [
                "https://twitter.com/kustodiaapp"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MX"
              },
              "serviceType": "Escrow Service",
              "areaServed": "Mexico"
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
