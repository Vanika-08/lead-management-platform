import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // mongoose ships server-only code; keep it out of the client/edge bundle
  serverExternalPackages: ['mongoose', 'bcryptjs'],
};

export default nextConfig;
