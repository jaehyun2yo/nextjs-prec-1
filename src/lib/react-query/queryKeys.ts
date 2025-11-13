/**
 * React Query 캐시 키 표준화 유틸리티
 * 일관된 쿼리 키 네이밍 컨벤션을 제공합니다.
 */

/**
 * 쿼리 키 팩토리 패턴
 * 각 도메인별로 쿼리 키를 생성하는 함수를 제공합니다.
 */
export const queryKeys = {
  /**
   * 문의(Contact) 관련 쿼리 키
   */
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (filters?: { status?: string; page?: number; search?: string }) =>
      [...queryKeys.contacts.lists(), filters] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.contacts.details(), id] as const,
    status: (id: number | string) => [...queryKeys.contacts.detail(id), 'status'] as const,
  },

  /**
   * 회사(Company) 관련 쿼리 키
   */
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters?: { status?: string; page?: number }) =>
      [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.companies.details(), id] as const,
    profile: (id: number | string) => [...queryKeys.companies.detail(id), 'profile'] as const,
  },

  /**
   * 포트폴리오 관련 쿼리 키
   */
  portfolio: {
    all: ['portfolio'] as const,
    lists: () => [...queryKeys.portfolio.all, 'list'] as const,
    list: (filters?: { tag?: string; page?: number }) =>
      [...queryKeys.portfolio.lists(), filters] as const,
    details: () => [...queryKeys.portfolio.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.portfolio.details(), id] as const,
  },

  /**
   * 게시물(Post) 관련 쿼리 키
   */
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters?: { page?: number; category?: string }) =>
      [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.posts.details(), id] as const,
  },

  /**
   * 대시보드 통계 관련 쿼리 키
   */
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    contacts: {
      daily: () => [...queryKeys.dashboard.all, 'contacts', 'daily'] as const,
      status: () => [...queryKeys.dashboard.all, 'contacts', 'status'] as const,
      referral: () => [...queryKeys.dashboard.all, 'contacts', 'referral'] as const,
    },
    companies: {
      new: () => [...queryKeys.dashboard.all, 'companies', 'new'] as const,
    },
  },
} as const;

/**
 * 쿼리 키 타입 추출 헬퍼
 */
export type QueryKey = typeof queryKeys;

