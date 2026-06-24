import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  experimental: {
    // Life gallery uploads can include many images; default proxy buffer is 10MB.
    proxyClientMaxBodySize: "150mb",
    middlewareClientMaxBodySize: "150mb",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "103.174.102.70",
        port: "5000",
      },
    ],
  },
};

export default nextConfig;