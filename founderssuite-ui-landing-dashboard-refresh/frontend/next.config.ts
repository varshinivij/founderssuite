import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",  // use only for Docker/server deploys; next start works without it
  productionBrowserSourceMaps: false,  // no source maps in prod = less memory + disk
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@livekit/components-react",
      "livekit-client",
      "sonner",
    ],
  },
};

export default nextConfig;
