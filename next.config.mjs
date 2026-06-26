/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // maplibre-gl ships its own worker; transpile nothing extra needed.
  experimental: {
    // keep server actions off; we use route handlers for clarity and to hold the key server-side.
  },
};

export default nextConfig;
