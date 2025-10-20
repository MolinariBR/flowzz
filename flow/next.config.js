/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now the default in Next.js 14
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
