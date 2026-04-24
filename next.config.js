/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: "my-value",
  },
  images: {
    domains: [
      "localhost",
      "your-bunny-cdn-domain.com",
      "picsum.photos",
      "admin.phamanhchien.vn",
      "phamanhchien.vn",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bunnycdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "admin.phamanhchien.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "phamanhchien.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const apiBase = process.env.INTERNAL_API_URL || "http://127.0.0.1:8001/api";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
