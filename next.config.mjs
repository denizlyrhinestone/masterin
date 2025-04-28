/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add redirects
  async redirects() {
    return [
      {
        source: '/_not-found',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/courses',
        destination: '/services',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
