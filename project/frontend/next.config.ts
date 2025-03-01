import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }

    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: "worker-loader",
      options: {
        name: "static/[hash].worker.js",
        publicPath: "/_next/",
      },
    });

    return config;
  },
};

module.exports = nextConfig;
