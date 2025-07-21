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

import CookieBanner from "../components/CookieBanner";
import { Providers } from "./providers";
import AnalyticsProvider from "../components/AnalyticsProvider";
import { CSPostHogProvider } from "../lib/posthog";
import PostHogSurvey from "../components/PostHogSurvey";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* PostHog Analytics with Session Replay */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}', {
                  api_host: 'https://us.i.posthog.com',
                  person_profiles: 'always',
                  capture_pageview: true,
                  capture_pageleave: true,
                  debug: true,
                  autocapture: true,
                  session_recording: {
                      recordCrossOriginIframes: true
                  }
              });
              
              // Send a test event to verify PostHog is working
              setTimeout(() => {
                  posthog.capture('app_loaded', {
                      timestamp: new Date().toISOString(),
                      page: 'layout_init',
                      debug: true
                  });
                  console.log('[PostHog] Test event sent: app_loaded');
              }, 1000);
            `,
          }}
        />
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
      <body className={`${inter.variable} antialiased bg-white`}>
        <Providers>
          <CSPostHogProvider>
            <AnalyticsProvider>
              {children}
              <PostHogSurvey trigger="auto" />
            </AnalyticsProvider>
          </CSPostHogProvider>
        </Providers>
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
