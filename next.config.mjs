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

  async redirects() {
    return [
      {
        source: '/events',
        destination: '/explore',
        permanent: true, // 308 redirect, good for SEO
      },
    ];
  },
};

export default nextConfig;
