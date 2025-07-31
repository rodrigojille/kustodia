import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía Definitiva: Escrow Digital en México 2025 | Kustodia México',
  description: '🛡️ La guía más completa sobre escrow digital en México. Aprende todo sobre custodia de pagos, seguridad en transacciones y protección contra fraudes. ✅ Gratis y actualizada 2025.',
  keywords: [
    // Primary keywords
    'escrow digital México',
    'custodia de pagos México',
    'pagos seguros México',
    'escrow blockchain México',
    
    // Long-tail keywords
    'guía completa escrow digital',
    'cómo funciona escrow México',
    'servicios custodia pagos digitales',
    'protección contra fraudes online México',
    
    // Industry specific
    'escrow inmobiliario México',
    'escrow e-commerce México',
    'escrow freelancer México',
    'escrow marketplace México',
    
    // Technology keywords
    'blockchain escrow México',
    'smart contracts pagos',
    'tecnología escrow digital',
    'fintech escrow México',
    
    // Local keywords
    'escrow CDMX',
    'pagos seguros Guadalajara',
    'custodia pagos Monterrey',
    'escrow digital mexicano',
    
    // Problem-solving keywords
    'evitar fraudes online México',
    'protección estafas digitales',
    'seguridad transacciones online',
    'pagos sin riesgo México',
    
    // Authority keywords
    'Kustodia México',
    'expertos escrow digital',
    'líderes custodia pagos México'
  ],
  authors: [{ name: 'Kustodia México', url: 'https://kustodia.mx' }],
  creator: 'Kustodia México',
  publisher: 'Kustodia México',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'article',
    title: 'Guía Definitiva: Escrow Digital en México 2025',
    description: '🛡️ La guía más completa sobre escrow digital en México. Todo sobre custodia de pagos, seguridad y protección contra fraudes.',
    url: 'https://kustodia.mx/blog/guia-definitiva-escrow-digital-mexico-2025',
    siteName: 'Kustodia México',
    locale: 'es_MX',
    images: [
      {
        url: 'https://kustodia.mx/images/guia-escrow-digital-mexico-2025.jpg',
        width: 1200,
        height: 630,
        alt: 'Guía Definitiva Escrow Digital México 2025 - Kustodia',
      },
    ],
    authors: ['Kustodia México'],
    publishedTime: '2025-01-30T00:00:00.000Z',
    modifiedTime: '2025-01-30T00:00:00.000Z',
    section: 'Fintech',
    tags: ['Escrow', 'Pagos Seguros', 'Fintech México', 'Blockchain', 'Custodia Pagos'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía Definitiva: Escrow Digital en México 2025',
    description: '🛡️ La guía más completa sobre escrow digital en México. Todo sobre custodia de pagos y protección contra fraudes.',
    images: ['https://kustodia.mx/images/guia-escrow-digital-mexico-2025.jpg'],
    creator: '@kustodiaapp',
    site: '@kustodiaapp',
  },
  alternates: {
    canonical: 'https://kustodia.mx/blog/guia-definitiva-escrow-digital-mexico-2025',
    languages: {
      'es-MX': 'https://kustodia.mx/blog/guia-definitiva-escrow-digital-mexico-2025',
      'es': 'https://kustodia.mx/blog/guia-definitiva-escrow-digital-mexico-2025',
    },
  },
  category: 'Fintech',
  classification: 'Educational Content',
  other: {
    'article:author': 'Kustodia México',
    'article:section': 'Fintech Education',
    'article:tag': 'Escrow Digital, Pagos Seguros, Fintech México, Blockchain',
    'article:published_time': '2025-01-30T00:00:00.000Z',
    'article:modified_time': '2025-01-30T00:00:00.000Z',
  },
};

export default function GuiaEscrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Additional SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Guía Definitiva: Escrow Digital en México 2025',
            description: 'La guía más completa sobre servicios de custodia de pagos digitales en México. Todo lo que necesitas saber sobre escrow, seguridad en transacciones y protección contra fraudes.',
            image: 'https://kustodia.mx/images/guia-escrow-digital-mexico-2025.jpg',
            author: {
              '@type': 'Organization',
              name: 'Kustodia México',
              url: 'https://kustodia.mx',
              logo: 'https://kustodia.mx/logo.png',
              sameAs: [
                'https://twitter.com/kustodiaapp',
                'https://www.linkedin.com/company/kustodia-mx'
              ]
            },
            publisher: {
              '@type': 'Organization',
              name: 'Kustodia México',
              logo: {
                '@type': 'ImageObject',
                url: 'https://kustodia.mx/logo.png'
              }
            },
            datePublished: '2025-01-30T00:00:00.000Z',
            dateModified: '2025-01-30T00:00:00.000Z',
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://kustodia.mx/blog/guia-definitiva-escrow-digital-mexico-2025'
            },
            articleSection: 'Fintech Education',
            keywords: 'escrow digital México, custodia de pagos, pagos seguros, blockchain escrow, fintech México',
            wordCount: 5000,
            inLanguage: 'es-MX',
            about: [
              {
                '@type': 'Thing',
                name: 'Escrow Digital',
                description: 'Servicio de custodia de pagos digitales'
              },
              {
                '@type': 'Thing',
                name: 'Fintech México',
                description: 'Tecnología financiera en México'
              },
              {
                '@type': 'Thing',
                name: 'Blockchain',
                description: 'Tecnología de cadena de bloques para pagos seguros'
              }
            ],
            mentions: [
              {
                '@type': 'Organization',
                name: 'CNBV',
                description: 'Comisión Nacional Bancaria y de Valores'
              },
              {
                '@type': 'Organization',
                name: 'Banco de México',
                description: 'Banco central de México'
              }
            ]
          })
        }}
      />
      
      {/* FAQ Structured Data for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '¿Qué es el escrow digital y cómo funciona en México?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'El escrow digital es un servicio de custodia de pagos que actúa como intermediario neutral entre compradores y vendedores. En México, está regulado por la CNBV y Banxico, garantizando que el dinero se mantenga seguro hasta que ambas partes cumplan con los términos acordados.'
                }
              },
              {
                '@type': 'Question',
                name: '¿Es legal usar servicios de escrow digital en México?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Sí, los servicios de escrow digital son completamente legales en México. Están regulados por la Ley Fintech (2018), la CNBV, y deben cumplir con el marco regulatorio mexicano para servicios financieros digitales.'
                }
              },
              {
                '@type': 'Question',
                name: '¿Cuánto cuesta usar un servicio de escrow en México?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Los costos varían según el proveedor. Los servicios tradicionales cobran 3-8%, mientras que las plataformas blockchain como Kustodia México ofrecen tarifas del 1-2% gracias a la automatización y eficiencia tecnológica.'
                }
              },
              {
                '@type': 'Question',
                name: '¿Qué ventajas tiene el escrow blockchain sobre el tradicional?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'El escrow blockchain ofrece transparencia total, costos menores (1-2% vs 3-8%), procesamiento instantáneo, inmutabilidad de registros, y eliminación de intermediarios tradicionales, haciendo las transacciones más seguras y eficientes.'
                }
              }
            ]
          })
        }}
      />
      
      {/* HowTo Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Cómo usar escrow digital en México paso a paso',
            description: 'Guía completa para usar servicios de escrow digital de forma segura en México',
            image: 'https://kustodia.mx/images/como-usar-escrow-mexico.jpg',
            totalTime: 'PT30M',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'MXN',
              value: '100'
            },
            supply: [
              {
                '@type': 'HowToSupply',
                name: 'Cuenta en plataforma de escrow'
              },
              {
                '@type': 'HowToSupply',
                name: 'Método de pago válido'
              }
            ],
            tool: [
              {
                '@type': 'HowToTool',
                name: 'Kustodia México'
              }
            ],
            step: [
              {
                '@type': 'HowToStep',
                name: 'Crear acuerdo',
                text: 'Comprador y vendedor definen términos, precio y condiciones de la transacción.',
                image: 'https://kustodia.mx/images/step1-acuerdo.jpg'
              },
              {
                '@type': 'HowToStep',
                name: 'Depositar dinero',
                text: 'El comprador deposita el dinero en la cuenta de escrow segura.',
                image: 'https://kustodia.mx/images/step2-deposito.jpg'
              },
              {
                '@type': 'HowToStep',
                name: 'Cumplir condiciones',
                text: 'El vendedor entrega el producto o servicio según lo acordado.',
                image: 'https://kustodia.mx/images/step3-cumplimiento.jpg'
              },
              {
                '@type': 'HowToStep',
                name: 'Liberar pago',
                text: 'Una vez verificado el cumplimiento, el dinero se libera automáticamente.',
                image: 'https://kustodia.mx/images/step4-liberacion.jpg'
              }
            ]
          })
        }}
      />
      
      {children}
    </>
  );
}
