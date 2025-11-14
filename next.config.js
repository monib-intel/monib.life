/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    mdxRs: true,
  },
  async rewrites() {
    return [
      {
        source: '/resume.pdf',
        destination: '/api/resume/download'
      }
    ];
  },
}

module.exports = nextConfig