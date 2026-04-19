/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for production deployment
  // output: "export",

  // Enable trailing slashes for static hosting compatibility
  trailingSlash: true,

  // Image optimization configuration
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Page extensions
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  // Compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
  },

  // Compress output
  compress: true,

  // Optimize production builds
  swcMinify: true,

  // Reduce bundle size
  reactStrictMode: true,

  // Disable powered by header
  poweredByHeader: false,

  // Generate standalone output for better static hosting
  distDir: '.next',

  // Note: async headers() and redirects() are not supported with output: 'export'
  // These would need to be configured on your hosting platform (e.g., Netlify, Vercel, etc.)
};

export default nextConfig;
