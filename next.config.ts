import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['i.scdn.co'], // Spotify's CDN for profile images
  },
};

export default nextConfig;
