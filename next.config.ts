import type { NextConfig } from "next";

function getR2Host() {
  try {
    const url = process.env.R2_PUBLIC_BASE_URL;
    if (!url) return undefined;
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

const r2Host = getR2Host();
const staticRemotePatterns = [
  { protocol: "https", hostname: "yjlaser.net" },
  { protocol: "http", hostname: "yjlaser.net" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일
    remotePatterns: [
      ...(r2Host
        ? [
            { protocol: "https", hostname: r2Host },
            { protocol: "http", hostname: r2Host },
          ]
        : []),
      ...staticRemotePatterns,
    ],
  },
};

export default nextConfig;
