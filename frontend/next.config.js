/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/api/:path*',
        },
      ];
    }
    // Production: forward to Heroku backend
    return [
      {
        source: '/api/:path*',
        destination: 'https://kustodia-backend-f991a7cb1824.herokuapp.com/api/:path*',
      },
    ];
  },
  
  // SEO and Performance Optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security Headers for better SEO ranking
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // SEO-friendly redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/inicio',
        destination: '/',
        permanent: true,
      },
      // Blog redirects for old URLs
      {
        source: '/blog/fraudes-marketplace',
        destination: '/blog/evitar-fraudes-marketplace',
        permanent: true,
      },
    ];
  },
  
  // Image optimization for better Core Web Vitals
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable experimental features for better performance
  experimental: {
    scrollRestoration: true,
  },
  
  // Metadata base URL for Open Graph images
  env: {
    NEXT_PUBLIC_METADATA_BASE: 'https://kustodia.mx',
  },
};

module.exports = nextConfig;
