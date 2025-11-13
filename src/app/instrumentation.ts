/**
 * Next.js Instrumentation 파일
 * 성능 모니터링 및 분석 초기화
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 서버 사이드 모니터링 초기화
    // 예: Sentry, DataDog 등
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge 런타임 모니터링 초기화
  }
}

