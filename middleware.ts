// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // /admin 또는 /company 경로로 접근을 시도하는지 확인합니다.
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/company")) {
    // 서명된 세션 쿠키가 있는지 확인합니다.
    const sessionCookie = request.cookies.get("admin-session")?.value;

    // 세션 쿠키가 없으면 로그인 페이지로 리디렉션합니다.
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 세션 토큰의 기본 구조 검증 (간단한 체크)
    // 실제 검증은 서버 컴포넌트에서 수행됩니다.
    const parts = sessionCookie.split(".");
    if (parts.length !== 2) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 경로 정보를 헤더에 추가 (레이아웃에서 사용)
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);

  // 인증되었거나 보호된 경로가 아니면, 요청을 그대로 통과시킵니다.
  return response;
}

// 미들웨어가 어떤 경로에서 실행될지 지정합니다.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
