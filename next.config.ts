import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // PDOK Luchtfoto WMS — aerial photos per spot (lib/aerial.ts)
      { protocol: "https", hostname: "service.pdok.nl" },
    ],
  },
};

export default nextConfig;
