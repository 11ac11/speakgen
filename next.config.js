/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },

      {
        protocol: "https",
        hostname: "**.pexels.com",
      },

      {
        protocol: "https",
        hostname: "**.football4football.com",
      },
    ],
  },
};

module.exports = nextConfig;
