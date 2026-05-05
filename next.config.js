const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // export əvəzinə
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bravoadmin.uplms.org",
      },
      {
        protocol: "http",
        hostname: "100.42.179.27",
        port: "7198",
        pathname: "/appuser/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "www.myalmet.com",
        pathname: "/media/**",
      },
    ],
    unoptimized: true,
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;