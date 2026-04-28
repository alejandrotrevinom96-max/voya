/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permitir imágenes externas de Unsplash
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // No bloquear el build por warnings de eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
