import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dyxerplat/shared"],
  serverExternalPackages: ["argon2", "@prisma/client", "prisma"],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
