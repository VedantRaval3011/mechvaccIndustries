/** @type {import('next').NextConfig} */

// Define interfaces for configuration options
interface ImageConfig {
  remotePatterns: {
    protocol: string;
    hostname: string;
  }[];
  formats: string[];
  minimumCacheTTL: number;
}

interface CompilerConfig {
  removeConsole: boolean;
}

interface ExperimentalConfig {
  optimizeCss: boolean;
}

interface CacheGroupConfig {
  test: RegExp;
  name: string;
  chunks: string;
  priority: number;
}

interface SplitChunksConfig {
  chunks: string;
  cacheGroups: {
    vendor: CacheGroupConfig;
    framerMotion: CacheGroupConfig;
  };
}

interface WebpackConfig {
  optimization?: {
    splitChunks: SplitChunksConfig;
  };
}

interface NextConfig {
  images: ImageConfig;
  compiler: CompilerConfig;
  experimental?: ExperimentalConfig;
  reactStrictMode: boolean;
  compress: boolean;
  eslint: {
    ignoreDuringBuilds?: boolean;
  };
  typescript?: {
    ignoreBuildErrors?: boolean;
  };
  webpack?: (
    config: WebpackConfig,
    context: { dev: boolean; isServer: boolean }
  ) => WebpackConfig;
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ Updated image config
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Disabled optimizeCss due to build issues with terser-webpack-plugin
  // experimental: {
  //   optimizeCss: true,
  // },

  reactStrictMode: true,
  compress: true,
};

export default nextConfig;