// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com'],
  },
  webpack: (config, { isServer }) => {
    // Empêche les modules Node.js de s'exécuter côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        pg: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;