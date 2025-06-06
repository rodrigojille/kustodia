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
};

module.exports = nextConfig;
