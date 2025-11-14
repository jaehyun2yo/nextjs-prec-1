// src/app/login/page.tsx

import { redirect } from 'next/navigation';
import { verifySession, getSessionUser } from '@/lib/auth/session';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { INPUT_STYLES, BUTTON_STYLES, LINK_STYLES } from '@/lib/styles';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // 이미 로그인된 경우 적절한 페이지로 리디렉션
  const isAuthenticated = await verifySession();
  if (isAuthenticated) {
    const user = await getSessionUser();
    if (user?.userType === 'company') {
      redirect('/company/dashboard');
    } else {
      redirect('/admin');
    }
  }

  const params = await searchParams;
  const error = params?.error;
  let errorMessage = '';

  if (error === 'invalid') {
    errorMessage = '아이디 또는 비밀번호가 올바르지 않습니다.';
  } else if (error === 'server') {
    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } else if (error === 'locked') {
    errorMessage = '너무 많은 로그인 시도로 인해 계정이 일시적으로 잠겼습니다.';
  } else if (error === 'inactive') {
    errorMessage = '계정이 비활성화되어 있습니다. 관리자에게 문의하세요.';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          기업 로그인
        </h1>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{errorMessage}</p>
          </div>
        )}
        <LoginForm loginAction={loginAction} />
        <div className="mt-4 text-center">
          <Link href="/register" className={`text-sm ${LINK_STYLES.primary}`}>
            업체등록
          </Link>
        </div>
      </div>
    </div>
  );
}
