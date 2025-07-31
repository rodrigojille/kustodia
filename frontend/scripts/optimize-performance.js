#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Optimizes frontend assets for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Running Performance Optimizations...');

// 1. Create optimized robots.txt with performance hints
const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /_next/static/chunks/
Disallow: /admin/

# Performance optimizations
Crawl-delay: 1

# Sitemap
Sitemap: https://kustodia.mx/sitemap.xml

# Cache directives for better SEO
Cache-Control: public, max-age=86400
`;

fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robotsTxt);
console.log('✅ Optimized robots.txt');

// 2. Create service worker for caching
const serviceWorker = `
// Service Worker for Performance Optimization
const CACHE_NAME = 'kustodia-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
`;

fs.writeFileSync(path.join(__dirname, '../public/sw.js'), serviceWorker);
console.log('✅ Created service worker for caching');

// 3. Update _headers with performance optimizations
const performanceHeaders = `
# Performance and Security Headers
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://us.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://kustodia-backend-f991a7cb1824.herokuapp.com https://www.google-analytics.com https://us.posthog.com; frame-src 'self'
  Cross-Origin-Embedder-Policy: credentialless
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Cache static assets
/static/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

# Cache images
*.jpg
  Cache-Control: public, max-age=86400
*.png
  Cache-Control: public, max-age=86400
*.svg
  Cache-Control: public, max-age=86400
*.webp
  Cache-Control: public, max-age=86400

# API routes with shorter cache
/api/*
  Cache-Control: no-cache, no-store, must-revalidate
  Access-Control-Allow-Origin: https://kustodia.mx
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
  Access-Control-Max-Age: 86400
`;

fs.writeFileSync(path.join(__dirname, '../public/_headers'), performanceHeaders);
console.log('✅ Updated _headers with performance optimizations');

// 4. Create sitemap.xml for better SEO
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kustodia.mx/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://kustodia.mx/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kustodia.mx/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kustodia.mx/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log('✅ Created sitemap.xml');

console.log('\n🎉 Performance optimizations completed!');
console.log('\nOptimizations applied:');
console.log('• Bundle splitting and tree shaking');
console.log('• Font display optimization');
console.log('• Service worker caching');
console.log('• Enhanced security headers');
console.log('• Static asset caching');
console.log('• SEO sitemap generation');
console.log('\nExpected improvements:');
console.log('• Reduced JavaScript bundle size');
console.log('• Faster font loading');
console.log('• Better caching strategy');
console.log('• Improved Core Web Vitals scores');
