import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: parent directories contain unrelated lockfiles, and
  // Next would otherwise infer the wrong root. This file's directory is correct.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
