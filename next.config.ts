import type { NextConfig } from "next";

// No `images.remotePatterns`: PDOK aerials are served through /api/aerial, which
// already gets them from the origin at their final size. Leaving the pattern out
// makes any future <Image src="https://service.pdok.nl/..."> fail loudly rather
// than quietly reintroducing a billed transformation per spot per size.
const nextConfig: NextConfig = {};

export default nextConfig;
