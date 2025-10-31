// 환경 변수 테스트용 API 엔드포인트
import { NextResponse } from 'next/server';

export async function GET() {
  // 보안을 위해 실제 값은 숨기고 존재 여부만 확인
  return NextResponse.json({
    TEST_ADMIN_USERNAME: process.env.TEST_ADMIN_USERNAME ? '✅ Set' : '❌ Not set',
    TEST_ADMIN_PASSWORD_HASH: process.env.TEST_ADMIN_PASSWORD_HASH ? '✅ Set' : '❌ Not set',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Not set',
    // 해시의 앞부분만 표시 (길이 확인용)
    TEST_ADMIN_PASSWORD_HASH_LENGTH: process.env.TEST_ADMIN_PASSWORD_HASH?.length || 0,
    TEST_ADMIN_PASSWORD_HASH_PREFIX: process.env.TEST_ADMIN_PASSWORD_HASH?.substring(0, 20) || 'N/A',
  });
}

