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
        source: "/events",
        destination: "/explore",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ticketer.africa" }],
        destination: "https://ticketer.africa/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
