'use server';

import { destroySession, createSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/security';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/utils/logger';

/**
 * 로그아웃 서버 액션
 */
export async function logoutAction() {
  await destroySession();
  redirect('/');
}

/**
 * 로그인 서버 액션 (관리자 및 기업 모두 지원)
 */
export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/login?error=invalid");
  }

  try {
    // 1. 먼저 관리자 계정 확인
    const testAdminUsername = process.env.TEST_ADMIN_USERNAME;
    const testAdminPasswordHashB64 = process.env.TEST_ADMIN_PASSWORD_HASH_B64;
    const testAdminPasswordHash = testAdminPasswordHashB64 
      ? Buffer.from(testAdminPasswordHashB64, 'base64').toString('utf8')
      : undefined;
    const adminUsername = process.env.ADMIN_USERNAME || "test";
    const adminPasswordHash =
      process.env.ADMIN_PASSWORD_HASH ||
      "$2b$12$ynu9sCHlJmOe4FyRn4h1/Ov.5VD.OWUH.QM2a2ZfqNWmxaUywEQpq";

    const currentAdminUsername = testAdminUsername || adminUsername;
    const currentAdminPasswordHash = testAdminPasswordHash || adminPasswordHash;

    // 관리자 계정 확인
    if (username.trim() === currentAdminUsername) {
      const isValidPassword = await verifyPassword(password, currentAdminPasswordHash);
      if (isValidPassword) {
        await createSession('admin');
        redirect("/admin");
      }
    }

    // 2. 기업 계정 확인 (companies 테이블)
    const supabase = await createSupabaseServerClient();
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, username, password_hash, status, company_name')
      .eq('username', username.trim())
      .single();

    const authLogger = logger.createLogger('AUTH');
    if (error || !company) {
      authLogger.debug("Company not found", { username });
      redirect("/login?error=invalid");
    }

    // 계정 상태 확인
    if (company.status !== 'active') {
      redirect("/login?error=inactive");
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, company.password_hash);
    if (!isValidPassword) {
      authLogger.debug("Invalid password for company", { username });
      redirect("/login?error=invalid");
    }

    // 로그인 성공 - 기업 세션 생성
    await createSession('company', company.id);

    // 기업 대시보드로 리디렉션
    redirect("/company/dashboard");
  } catch (error: unknown) {
    // Next.js의 redirect()는 NEXT_REDIRECT 에러를 throw하므로 다시 throw
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    
    const authLogger = logger.createLogger('AUTH');
    authLogger.error("Login error", error);
    redirect("/login?error=server");
  }
}
