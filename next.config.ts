import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Add this for Docker optimization
  reactStrictMode: false, // Temporarily disable to avoid third-party warnings
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.mediastack.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.criptonoticias.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.wsj.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.reuters.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.bbc.co.uk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.bbc.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.nytimes.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ft.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.elmundo.es',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.elpais.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.abc.es',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**',
      }
    ],    unoptimized: true
  },
};

export default nextConfig;
