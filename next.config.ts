import type { NextConfig } from "next";
import path from 'node:path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['nodemailer'],
  // Native Next.js builds run on Vercel; local/Sites builds still use Vite.
  webpack(config, {webpack}) {
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /^@\/lib\/platform$/,
      path.resolve(process.cwd(), 'lib/platform.vercel.ts'),
    ));
    return config;
  },
  turbopack: {
    resolveAlias: {'@/lib/platform': './lib/platform.vercel.ts'},
  },
};

export default nextConfig;
