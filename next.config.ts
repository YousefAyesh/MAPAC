import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gallery photos MAPAC uploads through /studio are served from Sanity's CDN.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/pqx2s4kl/**' }],
  },
};

export default nextConfig;
