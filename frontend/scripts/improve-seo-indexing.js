#!/usr/bin/env node

/**
 * SEO Indexing Improvement Script
 * Helps improve Google Search Console indexing
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Improving SEO Indexing for Google Search Console...');

// 1. Create structured data for better indexing
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kustodia México",
  "description": "Pagos en custodia seguros para México. Escrow digital que protege tus transacciones.",
  "url": "https://kustodia.mx",
  "logo": "https://kustodia.mx/logo.png",
  "sameAs": [
    "https://twitter.com/kustodiamx",
    "https://linkedin.com/company/kustodia"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+52-55-1234-5678",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "MX",
    "addressLocality": "Ciudad de México"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de Escrow",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Escrow para Ecommerce",
          "description": "Pagos seguros para tiendas en línea"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Escrow para Freelancers",
          "description": "Protección de pagos para trabajadores independientes"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Escrow Inmobiliario",
          "description": "Custodia segura para transacciones inmobiliarias"
        }
      }
    ]
  }
};

// Save structured data
fs.writeFileSync(
  path.join(__dirname, '../public/structured-data.json'), 
  JSON.stringify(structuredData, null, 2)
);
console.log('✅ Created structured data JSON-LD');

// 2. Create a comprehensive meta tags template
const metaTemplate = `
<!-- Essential Meta Tags for SEO -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="googlebot" content="index, follow">

<!-- Open Graph Meta Tags -->
<meta property="og:locale" content="es_MX">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kustodia México">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@kustodiamx">

<!-- Additional SEO Meta Tags -->
<meta name="author" content="Kustodia México">
<meta name="publisher" content="Kustodia México">
<meta name="language" content="Spanish">
<meta name="geo.region" content="MX">
<meta name="geo.country" content="Mexico">

<!-- Canonical URL (to be set per page) -->
<link rel="canonical" href="https://kustodia.mx/">

<!-- Structured Data -->
<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>
`;

fs.writeFileSync(
  path.join(__dirname, '../public/meta-template.html'), 
  metaTemplate
);
console.log('✅ Created meta tags template');

// 3. Create a Google Search Console verification file (placeholder)
const gscVerification = `google-site-verification: google[VERIFICATION_CODE].html`;
fs.writeFileSync(
  path.join(__dirname, '../public/google-site-verification.html'), 
  `<html><head><title>Google Site Verification</title></head><body>${gscVerification}</body></html>`
);
console.log('✅ Created Google Search Console verification template');

// 4. Create internal linking suggestions
const internalLinkingSuggestions = {
  "homepage": [
    "/compra-venta",
    "/inmobiliarias", 
    "/freelancer",
    "/ecommerce",
    "/blog"
  ],
  "blog": [
    "/blog/guia-definitiva-escrow-digital-mexico-2025",
    "/blog/evitar-fraudes-ecommerce",
    "/blog/evitar-fraudes-freelancer",
    "/compra-venta",
    "/inmobiliarias"
  ],
  "service_pages": [
    "/pricing",
    "/about",
    "/contact",
    "/api-docs"
  ]
};

fs.writeFileSync(
  path.join(__dirname, '../public/internal-linking.json'), 
  JSON.stringify(internalLinkingSuggestions, null, 2)
);
console.log('✅ Created internal linking suggestions');

console.log('\n🎉 SEO Indexing improvements completed!');
console.log('\n📋 Next Steps for Google Search Console:');
console.log('1. Submit updated sitemap.xml to Google Search Console');
console.log('2. Submit blog-sitemap.xml as additional sitemap');
console.log('3. Request indexing for key pages manually');
console.log('4. Monitor "Coverage" report for indexing issues');
console.log('5. Use "URL Inspection" tool to test individual pages');
console.log('\n🔗 Key URLs to submit for indexing:');
console.log('• https://kustodia.mx/');
console.log('• https://kustodia.mx/compra-venta');
console.log('• https://kustodia.mx/compra-venta/vehiculos');
console.log('• https://kustodia.mx/inmobiliarias');
console.log('• https://kustodia.mx/inmobiliarias/brokers');
console.log('• https://kustodia.mx/freelancer');
console.log('• https://kustodia.mx/ecommerce');
console.log('• https://kustodia.mx/b2b');
console.log('• https://kustodia.mx/marketplace');
console.log('• https://kustodia.mx/about');
console.log('• https://kustodia.mx/pricing');
console.log('• https://kustodia.mx/contact');
console.log('• https://kustodia.mx/api-docs');

console.log('\n⚡ Expected Results:');
console.log('• Improved page discovery by Google');
console.log('• Better structured data recognition');
console.log('• Enhanced search result snippets');
console.log('• Increased organic search visibility');
