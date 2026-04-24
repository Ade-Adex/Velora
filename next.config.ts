// next.config.ts

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Enable AVIF and WebP support for the Image component
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-1.kwcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig