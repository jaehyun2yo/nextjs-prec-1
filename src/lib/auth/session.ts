// 세션 관리 유틸리티

import { cookies } from 'next/headers';
import { generateSessionToken } from './security';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 1일
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-in-production';

/**
 * 세션 토큰을 생성하고 쿠키에 저장합니다
 */
export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const cookieStore = await cookies();

  // 토큰을 서명하여 저장 (간단한 해시 기반 서명)
  const signedToken = signToken(token);

  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
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
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256')
    .update(token + SESSION_SECRET)
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

