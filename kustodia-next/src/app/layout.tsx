import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
