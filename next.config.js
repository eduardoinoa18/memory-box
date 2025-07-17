/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  experimental: {
    // Enable app directory for better performance
    appDir: false, // Keep pages directory for now
    
    // Optimize images and fonts
    optimizeFonts: true,
    optimizeImages: true,
    
    // Enable SWC minification for better performance
    swcMinify: true,
    
    // Enable ISR for static generation
    isrMemoryCacheSize: 50 * 1024 * 1024, // 50MB
  },

  // Image optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile pictures
      'avatars.githubusercontent.com', // GitHub avatars
      'api.prizeout.com', // Prizeout logos
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts',
            chunks: 'all',
          },
        },
      };
    }

    // Add alias for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/services': path.resolve(__dirname, 'services'),
      '@/pages': path.resolve(__dirname, 'pages'),
    };

    return config;
  },

  // Compression and performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/admin/login',
        permanent: false,
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_TIME: new Date().toISOString(),
  },

  // Static optimization
  trailingSlash: false,
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Build optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance monitoring
  analyticsId: process.env.VERCEL_ANALYTICS_ID,
};

const path = require('path');
module.exports = nextConfig;
