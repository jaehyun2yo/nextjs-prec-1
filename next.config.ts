import type { NextConfig } from 'next';

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
const staticRemotePatterns: Array<{ protocol: 'https' | 'http'; hostname: string }> = [
  { protocol: 'https', hostname: 'yjlaser.net' },
  { protocol: 'http', hostname: 'yjlaser.net' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
];

const nextConfig: NextConfig = {
  // 성능 모니터링은 instrumentation.ts 파일로 자동 활성화됨 (Next.js 15+)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일
    remotePatterns: [
      ...(r2Host
        ? [
            { protocol: 'https' as const, hostname: r2Host },
            { protocol: 'http' as const, hostname: r2Host },
          ]
        : []),
      ...staticRemotePatterns,
    ],
  },
  serverActions: {
    bodySizeLimit: '10mb', // 파일 업로드를 위해 10MB로 설정
  },
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
