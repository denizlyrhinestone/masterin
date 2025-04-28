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
  // Disable the built-in 404 page
  async redirects() {
    return [
      {
        source: '/_not-found',
        destination: '/404',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
