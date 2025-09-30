/** @type {import('next').NextConfig} */
import { fileURLToPath } from "node:url";

const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    const resolvePath = (relativePath) =>
      fileURLToPath(new URL(relativePath, import.meta.url));
    config.resolve.alias = {
      ...config.resolve.alias,
      "@config": resolvePath("./config"),
      "@modules": resolvePath("./modules"),
      "@components": resolvePath("./src/components"),
      "@lib": resolvePath("./src/lib"),
    };
    return config;
  },
};

export default nextConfig;
