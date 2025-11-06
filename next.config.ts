/** @type {import('next').NextConfig} */
// Define interfaces for configuration options
interface ImageConfig {
  domains: string[];
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
// ✅ Add eslint config type
interface ESLintConfig {
  ignoreDuringBuilds: boolean;
}

interface WebpackConfig {
  optimization?: {
    splitChunks: SplitChunksConfig;
  };
}

interface NextConfig {
  eslint: ESLintConfig;
  images: ImageConfig;
  compiler: CompilerConfig;
  experimental: ExperimentalConfig;
  reactStrictMode: boolean;
  swcMinify: boolean;
  compress: boolean;
  webpack: (
    config: WebpackConfig,
    context: { dev: boolean; isServer: boolean }
  ) => WebpackConfig;
}

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disable ESLint during builds
  },
  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  experimental: {
    optimizeCss: true,
  },

  reactStrictMode: true,
  swcMinify: true,

  compress: true,

  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.optimization = {
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: -10,
            },
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: "framer-motion",
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
