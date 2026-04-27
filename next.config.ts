// next.config.ts

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.cnet.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cellmart.pk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.stelrad.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.mgkente.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img-1.kwcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kokoroyale.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sm.pcmag.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
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