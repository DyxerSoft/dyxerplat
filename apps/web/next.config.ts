import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dyxerplat/shared"],
  typedRoutes: true
};

export default nextConfig;
