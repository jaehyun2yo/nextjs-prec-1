/**
 * 애플리케이션 상수 정의
 */

// 파일 크기 제한 (바이트)
export const FILE_SIZE_LIMITS = {
  ATTACHMENT: 10 * 1024 * 1024, // 10MB
  DRAWING: 50 * 1024 * 1024, // 50MB
  REFERENCE_PHOTO: 10 * 1024 * 1024, // 10MB
} as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 상태 값
export const CONTACT_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const COMPANY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// 유효성 검사
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9-]+$/,
} as const;

// 날짜 형식
export const DATE_FORMAT = {
  DISPLAY: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
} as const;



