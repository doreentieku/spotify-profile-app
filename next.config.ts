import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://172.31.8.101/3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co", // spotify images url
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
