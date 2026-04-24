// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-1.kwcdn.com',
        port: '',
        pathname: '/**',
      },
      // If you plan to use images from other sources like Cloudinary later, add them here too
    ],
  },
}

export default nextConfig
