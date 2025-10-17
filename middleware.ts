// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. /admin 경로로 접근을 시도하는지 확인합니다.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // 2. 요청에 인증 쿠키가 있는지 확인합니다.
    const isAuth = request.cookies.get("admin-auth")?.value;

    // 3. 인증 쿠키 값이 'true'가 아니면 로그인 페이지로 보냅니다.
    if (isAuth !== "true") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 4. 인증되었거나 /admin 경로가 아니면, 요청을 그대로 통과시킵니다.
  return NextResponse.next();
}

// 미들웨어가 어떤 경로에서 실행될지 지정합니다.
export const config = {
  matcher: "/admin/:path*",
};
