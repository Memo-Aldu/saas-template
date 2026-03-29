import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@saas-template/contracts", "@saas-template/ui"],
};

export default nextConfig;
