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
 * 로그인 서버 액션
 *
 * 관리자 및 기업 계정 로그인을 처리합니다.
 *
 * @param formData - FormData 객체 (username, password 포함)
 *
 * @remarks
 * - 관리자 계정: 환경 변수에서 확인
 * - 기업 계정: companies 테이블에서 확인
 * - 성공 시 세션 쿠키 설정 및 리디렉션
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('username', 'admin');
 * formData.append('password', 'password123');
 *
 * await loginAction(formData);
 * ```
 */
export async function loginAction(formData: FormData) {
  'use server';

  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    redirect('/login?error=invalid');
  }

  const authLogger = logger.createLogger('AUTH');

  try {
    // 1. 먼저 관리자 계정 확인
    const testAdminUsername = process.env.TEST_ADMIN_USERNAME;
    const testAdminPasswordHashB64 = process.env.TEST_ADMIN_PASSWORD_HASH_B64;
    const testAdminPasswordHash = testAdminPasswordHashB64
      ? Buffer.from(testAdminPasswordHashB64, 'base64').toString('utf8')
      : undefined;
    const adminUsername = process.env.ADMIN_USERNAME || 'test';
    const adminPasswordHash =
      process.env.ADMIN_PASSWORD_HASH ||
      '$2b$12$ynu9sCHlJmOe4FyRn4h1/Ov.5VD.OWUH.QM2a2ZfqNWmxaUywEQpq';

    const currentAdminUsername = testAdminUsername || adminUsername;
    const currentAdminPasswordHash = testAdminPasswordHash || adminPasswordHash;

    // 관리자 계정 확인
    if (username.trim() === currentAdminUsername) {
      const isValidPassword = await verifyPassword(password, currentAdminPasswordHash);
      if (isValidPassword) {
        try {
          await createSession('admin');
          authLogger.info('Admin login successful', { username });
          redirect('/admin');
        } catch (sessionError) {
          authLogger.error('Session creation failed', sessionError);
          redirect('/login?error=server');
        }
      } else {
        authLogger.debug('Invalid admin password', { username });
      }
    }

    // 2. 기업 계정 확인 (companies 테이블)
    const supabase = await createSupabaseServerClient();
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, username, password_hash, status, company_name')
      .eq('username', username.trim())
      .single();

    if (error || !company) {
      authLogger.debug('Company not found', { username, error: error?.message });
      redirect('/login?error=invalid');
    }

    // 계정 상태 확인
    if (company.status !== 'active') {
      authLogger.debug('Company account inactive', { username, status: company.status });
      redirect('/login?error=inactive');
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, company.password_hash);
    if (!isValidPassword) {
      authLogger.debug('Invalid password for company', { username });
      redirect('/login?error=invalid');
    }

    // 로그인 성공 - 기업 세션 생성
    try {
      await createSession('company', company.id);
      authLogger.info('Company login successful', { username, companyId: company.id });
      redirect('/company/dashboard');
    } catch (sessionError) {
      authLogger.error('Session creation failed', sessionError);
      redirect('/login?error=server');
    }
  } catch (error: unknown) {
    // Next.js의 redirect()는 NEXT_REDIRECT 에러를 throw합니다.
    // 이것은 정상적인 동작이므로 다시 throw해야 합니다.
    // Next.js가 이를 자동으로 처리하여 리다이렉트를 수행합니다.
    if (error instanceof Error) {
      const errorDigest = (error as { digest?: string }).digest;
      // NEXT_REDIRECT는 Next.js가 내부적으로 처리하는 특수 에러입니다.
      // 이것을 다시 throw하면 Next.js가 리다이렉트를 처리합니다.
      if (error.message === 'NEXT_REDIRECT' || errorDigest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
    }

    // 다른 에러는 로깅하고 서버 에러로 리다이렉트
    if (authLogger) {
      authLogger.error('Login error', error);
    }
    redirect('/login?error=server');
  }
}
