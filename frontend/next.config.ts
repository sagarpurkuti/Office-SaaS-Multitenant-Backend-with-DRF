import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow any *.localhost tenant host in local multi-tenant dev (HMR / assets).
  allowedDevOrigins: ["*.localhost"],
};

export default nextConfig;
