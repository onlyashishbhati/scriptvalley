import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@opentelemetry/api", "@serwist/next"],
  turbopack: {
    rules: {
      "*.glb": {
        loaders: [],
        as: "*.bin",
      },
    },
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.glb$/,
      type: "asset/resource",
    });
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;