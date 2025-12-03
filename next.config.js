/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'react-markdown',
      'i18next',
      'react-i18next',
      'clsx',
    ],
  },
  // Faster dev experience
  reactStrictMode: false,
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
