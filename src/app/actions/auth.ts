'use server';

import { destroySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

/**
 * 로그아웃 서버 액션
 */
export async function logoutAction() {
  await destroySession();
  redirect('/');
}

