/** @type {import('next').NextConfig} */

const path = require("path");

/** GitHub Pages project sites live at /{repo}/ — set empty when using a root custom domain. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "node_modules/react/jsx-runtime.js",
      ),
      "react/jsx-dev-runtime": path.resolve(
        __dirname,
        "node_modules/react/jsx-dev-runtime.js",
      ),
    };
    return config;
  },
  eslint: {
    dirs: ["pages", "components", "lib", "constants", "scripts"],
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
