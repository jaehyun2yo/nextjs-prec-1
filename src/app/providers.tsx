'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분간 데이터를 stale하지 않게 유지
            staleTime: 5 * 60 * 1000,
            // 10분간 캐시 유지
            gcTime: 10 * 60 * 1000,
            // 에러 발생 시 3번 재시도
            retry: 3,
            // 네트워크 에러만 재시도
            retryOnMount: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
