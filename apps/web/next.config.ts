import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@opentelemetry/api", "@serwist/next"],

  // Required for the Lanyard component (src/app/u/[username]/_components/Lanyard.tsx),
  // which imports card.glb directly: `import cardGLB from './card.glb'`.
  //
  // You're running --turbo, so the webpack() function below is IGNORED at
  // dev/build time — Turbopack reads its own `turbopack.rules` key instead.
  // Keeping webpack() too is harmless and future-proofs you if you ever run
  // a plain `next build` without --turbo (e.g. some CI setups still do).
  turbopack: {
    rules: {
      "*.glb": {
        loaders: [],
        as: "*.bin", // treat as a raw binary asset, not JS — same effect as asset/resource below
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
};

export default nextConfig;