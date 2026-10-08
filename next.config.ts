import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Parent ~/package-lock.json otherwise becomes Turbopack's root and routes 404.
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/", destination: "/inkling", permanent: false },
      ...["/scrawl", "/writing"].flatMap((legacy) => [
        { source: legacy, destination: "/inkling", permanent: true },
        { source: `${legacy}/:path*`, destination: "/inkling/:path*", permanent: true },
      ]),
    ];
  },
};

export default nextConfig;
