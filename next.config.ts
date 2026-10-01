import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  allowedDevOrigins: ['192.168.0.163', 'http://192.168.0.163:3000'],
};

export default nextConfig;