import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://172.31.8.101:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.spotifycdn.com", // ✅ all Spotify image CDNs
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
