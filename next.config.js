/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed '// Removed 'output: export to enable API routes to enable API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

module.exports = nextConfig;
