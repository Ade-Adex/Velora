// next.config.ts

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-1.kwcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uk.pcmag.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.techradar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www-konga-com-res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.thewirecutter.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig