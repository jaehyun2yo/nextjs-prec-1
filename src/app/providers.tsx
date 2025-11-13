'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// 개발 ?�경?�서�?React Query DevTools ?�적 import
const ReactQueryDevtools = process.env.NODE_ENV === 'development'
  ? dynamic(
      () =>
        import('@tanstack/react-query-devtools')
          .then((mod) => mod.ReactQueryDevtools)
          .catch(() => {
            // DevTools�?로드?????�는 경우 �?컴포?�트 반환
            return () => null;
          }),
      { ssr: false }
    )
  : () => null;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분간 ?�이?��? stale?��? ?�게 ?��?
            staleTime: 5 * 60 * 1000,
            // 10분간 캐시 ?��?
            gcTime: 10 * 60 * 1000,
            // ?�러 발생 ??3�??�시??            retry: 3,
            // ?�트?�크 ?�러�??�시??            retryOnMount: true,
            // refetchOnWindowFocus: 개발 ?�경?�서�??�성??            refetchOnWindowFocus: process.env.NODE_ENV === 'development',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 ?�경?�서�?React Query DevTools ?�시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
