import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: [
    'https://c471-24-5-60-88.ngrok-free.app',
    'http://localhost:3000',
  ],
  reactStrictMode: false,
  
  // Remove complex webpack optimizations that might cause chunk loading issues
  experimental: {
    optimizePackageImports: ['@worldcoin/mini-apps-ui-kit-react'],
  },
  
  // Simplify webpack config for more reliable chunk loading
  webpack: (config, { isServer }) => {
    // Only apply basic optimizations
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
