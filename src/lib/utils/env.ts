/**
 * 환경 변수 검증 유틸리티
 * Zod를 사용한 런타임 환경 변수 검증
 */

import { z } from 'zod';
import { logger } from './logger';

const envLogger = logger.createLogger('ENV');

/**
 * 환경 변수 스키마 정의
 */
const envSchema = z.object({
  // Supabase 설정
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // 세션 보안 (프로덕션 필수)
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),

  // 관리자 인증
  ADMIN_USERNAME: z.string().min(1).optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  TEST_ADMIN_USERNAME: z.string().optional(),
  TEST_ADMIN_PASSWORD_HASH: z.string().optional(),
  TEST_ADMIN_PASSWORD_HASH_B64: z.string().optional(),

  // 이메일 설정 (선택)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // R2/Cloudflare 설정 (선택)
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // Node 환경
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * 환경 변수 타입
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 환경 변수를 검증하고 반환합니다
 * 프로덕션 환경에서는 필수 변수가 없으면 에러를 throw합니다
 */
export function validateEnv(): Env {
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    // 기본 검증
    const parsed = envSchema.parse(process.env);

    // 프로덕션 환경에서 추가 검증
    if (isProduction) {
      const errors: string[] = [];

      // SESSION_SECRET은 프로덕션에서 필수
      if (!parsed.SESSION_SECRET || parsed.SESSION_SECRET === 'change-this-in-production') {
        errors.push('SESSION_SECRET must be set in production and must not be the default value');
      }

      // 관리자 인증 정보는 하나 이상 필요
      const hasAdminAuth =
        (parsed.ADMIN_USERNAME && parsed.ADMIN_PASSWORD_HASH) ||
        (parsed.TEST_ADMIN_USERNAME &&
          (parsed.TEST_ADMIN_PASSWORD_HASH || parsed.TEST_ADMIN_PASSWORD_HASH_B64));

      if (!hasAdminAuth) {
        errors.push('At least one admin authentication method must be configured in production');
      }

      if (errors.length > 0) {
        const errorMessage = `Environment validation failed in production:\n${errors.join('\n')}`;
        envLogger.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    // 개발 환경에서 경고만 출력
    if (!isProduction) {
      if (!parsed.SESSION_SECRET || parsed.SESSION_SECRET === 'change-this-in-production') {
        envLogger.warn(
          'SESSION_SECRET is not set or using default value. This is insecure for production.'
        );
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      const errorMessage = `Environment variable validation failed:\n${errorMessages}`;
      envLogger.error(errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * 안전하게 환경 변수를 가져옵니다
 * 검증 실패 시 개발 환경에서는 경고만, 프로덕션에서는 에러를 throw합니다
 */
export function getEnv(): Env {
  try {
    return validateEnv();
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    // 개발 환경에서는 경고만 출력하고 계속 진행
    envLogger.warn('Environment validation failed, but continuing in development mode', error);
    return process.env as unknown as Env;
  }
}

/**
 * SESSION_SECRET을 안전하게 가져옵니다
 * 프로덕션에서는 반드시 설정되어 있어야 합니다
 */
export function getSessionSecret(): string {
  const env = getEnv();
  const secret = env.SESSION_SECRET;

  if (!secret || secret === 'change-this-in-production') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SESSION_SECRET must be set in production environment. ' +
          'Please set a secure random string (at least 32 characters) in your environment variables.'
      );
    }
    // 개발 환경에서는 경고만 출력하고 기본값 사용 (보안 위험 있음)
    envLogger.warn(
      'SESSION_SECRET is not set or using default value. ' +
        'This is insecure and should not be used in production.'
    );
    return 'change-this-in-production';
  }

  return secret;
}
