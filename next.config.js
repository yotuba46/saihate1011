/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        url: 'url',
        zlib: 'browserify-zlib',
        http: 'stream-http',
        https: 'https-browserify',
        assert: 'assert',
        os: 'os-browserify/browser',
        path: 'path-browserify',
        process: 'process/browser',
      };
    }
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    });
    return config;
  },
  transpilePackages: ['firebase', '@firebase/auth', '@firebase/app'],
};

module.exports = nextConfig;