// 로그인 시도 제한 (Rate Limiting)

interface AttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// 메모리 기반 저장 (프로덕션에서는 Redis 등 사용 권장)
const attempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분
const RESET_DURATION = 60 * 60 * 1000; // 1시간

/**
 * IP 주소를 추출합니다
 */
function getClientIdentifier(request: Request): string {
  // 실제 프로덕션에서는 헤더에서 IP를 추출
  // 여기서는 간단하게 구현
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

/**
 * 로그인 시도를 기록하고 제한을 확인합니다
 */
export function recordLoginAttempt(request: Request): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
} {
  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const record = attempts.get(identifier);

  // 레코드가 없거나 리셋 기간이 지났으면 초기화
  if (!record || (now - record.lastAttempt) > RESET_DURATION) {
    attempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - 1,
    };
  }

  // 잠금 상태 확인
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
    };
  }

  // 잠금이 해제되었으면 초기화
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.count = 0;
    delete record.lockedUntil;
  }

  // 시도 횟수 증가
  record.count++;
  record.lastAttempt = now;

  // 최대 시도 횟수 초과 시 잠금
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    attempts.set(identifier, record);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
    };
  }

  attempts.set(identifier, record);
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

/**
 * 성공한 로그인 시도 기록을 초기화합니다
 */
export function resetLoginAttempts(request: Request): void {
  const identifier = getClientIdentifier(request);
  attempts.delete(identifier);
}

