import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      "*.txt": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({ test: /\.txt$/, type: "asset/source" });
    return config;
  },
};

export default nextConfig;
