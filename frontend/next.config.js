/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/volume/:path*/",
        destination: `http://localhost:8080/:path*/`,
      },
    ];
  },
  trailingSlash: true,
};

module.exports = nextConfig;
