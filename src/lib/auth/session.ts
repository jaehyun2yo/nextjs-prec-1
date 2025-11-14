// 세션 관리 유틸리티

import { cookies } from 'next/headers';
import { generateSessionToken } from './security';
import { getSessionSecret } from '@/lib/utils/env';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 1일

/**
 * 세션 토큰을 생성하고 쿠키에 저장합니다
 * @param userType - 사용자 타입 ('admin' | 'company')
 * @param userId - 사용자 ID (company의 경우 company id)
 */
export async function createSession(
  userType: 'admin' | 'company' = 'admin',
  userId?: number
): Promise<string> {
  const token = generateSessionToken();
  const cookieStore = await cookies();

  // 토큰에 사용자 타입과 ID를 포함하여 서명
  const sessionData = JSON.stringify({ userType, userId });
  const signedToken = signToken(`${token}:${sessionData}`);

  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    // secure는 HTTPS에서만 쿠키를 전송하므로, 로컬 개발이나 HTTP에서는 false
    // 프로덕션에서도 HTTPS가 아닌 경우를 고려하여 환경 변수로 제어 가능
    secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES !== 'false',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

/**
 * 세션에서 사용자 타입과 ID를 가져옵니다
 */
export async function getSessionUser(): Promise<{
  userType: 'admin' | 'company';
  userId?: number;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const isValid = verifySignedToken(sessionCookie.value);
    if (!isValid) {
      return null;
    }

    // 토큰에서 사용자 정보 추출
    const [token] = sessionCookie.value.split('.');
    if (!token) return null;

    const parts = token.split(':');
    if (parts.length < 2) {
      // 기존 세션 (userType 정보 없음) - admin으로 간주
      return { userType: 'admin' };
    }

    const sessionData = JSON.parse(parts.slice(1).join(':'));
    return {
      userType: sessionData.userType || 'admin',
      userId: sessionData.userId,
    };
  } catch {
    return null;
  }
}

/**
 * 세션 토큰을 검증합니다
 */
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return false;
  }

  try {
    const isValid = verifySignedToken(sessionCookie.value);
    return isValid;
  } catch {
    return false;
  }
}

/**
 * 세션을 삭제합니다 (로그아웃)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * 토큰에 서명을 추가합니다 (간단한 해시 기반)
 */
function signToken(token: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  const sessionSecret = getSessionSecret();
  const hash = crypto
    .createHash('sha256')
    .update(token + sessionSecret)
    .digest('hex');

  return `${token}.${hash}`;
}

/**
 * 서명된 토큰을 검증합니다
 */
function verifySignedToken(signedToken: string): boolean {
  const [token, signature] = signedToken.split('.');

  if (!token || !signature) {
    return false;
  }

  // 같은 토큰과 SECRET으로 해시를 생성하여 비교
  const expectedSignature = signToken(token).split('.')[1];
  return signature === expectedSignature;
}
