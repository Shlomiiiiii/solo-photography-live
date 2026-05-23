/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "**.firebasestorage.app"
      },
      {
        protocol: "https",
        hostname: "**.firebaseapp.com"
      }
    ]
  },
  poweredByHeader: false,
  reactStrictMode: true
};

export default nextConfig;

