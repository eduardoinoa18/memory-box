/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    outputStandalone: true,
  },
  // Ensure proper routing for admin dashboard
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
