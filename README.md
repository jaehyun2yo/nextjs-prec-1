# Next.js Prec-1 프로젝트

현대적인 웹 애플리케이션을 위한 Next.js 15 기반 프로젝트입니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [개발 스택](#개발-스택)
- [프로젝트 구조](#프로젝트-구조)
- [아키텍처 및 플로우](#아키텍처-및-플로우)
- [주요 기능](#주요-기능)
- [환경 설정](#환경-설정)
- [개발 가이드](#개발-가이드)

## 프로젝트 개요

이 프로젝트는 Next.js 15의 최신 기능들을 활용하여 구축된 풀스택 웹 애플리케이션입니다. 서버 컴포넌트, App Router, 그리고 최신 React 19 기능을 활용하여 성능 최적화와 개발자 경험을 모두 고려한 구조로 설계되었습니다.

### 주요 특징

- ⚡ **Next.js 15.5.5** - 최신 App Router 및 서버 컴포넌트
- 🎨 **Tailwind CSS 4** - 유틸리티 기반 스타일링
- 🌙 **다크 모드** - Zustand 기반 테마 관리
- 🔐 **인증 시스템** - 쿠키 기반 관리자 인증
- 📝 **Lexical 에디터** - 리치 텍스트 에디터 통합
- 🗄️ **Supabase** - 백엔드 및 데이터베이스
- 📊 **React Query** - 서버 상태 관리

## 개발 스택

### 코어 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15.5.5 | React 프레임워크, App Router |
| **React** | 19.1.0 | UI 라이브러리 |
| **TypeScript** | ^5 | 타입 안정성 |
| **Node.js** | ^20 | 런타임 환경 |

### 스타일링 및 UI

| 기술 | 버전 | 용도 |
|------|------|------|
| **Tailwind CSS** | ^4 | 유틸리티 CSS 프레임워크 |
| **Framer Motion** | ^12.23.24 | 애니메이션 라이브러리 |
| **Radix UI** | ^1.1.15, ^1.2.15 | 접근성 높은 UI 컴포넌트 |
| **Lucide React** | ^0.548.0 | 아이콘 라이브러리 |
| **React Icons** | ^5.5.0 | 아이콘 라이브러리 |
| **class-variance-authority** | ^0.7.1 | 컴포넌트 변형 관리 |

### 상태 관리

| 기술 | 버전 | 용도 |
|------|------|------|
| **Zustand** | ^5.0.8 | 클라이언트 전역 상태 관리 |
| **TanStack React Query** | ^5.90.5 | 서버 상태 관리 및 캐싱 |

### 폼 및 검증

| 기술 | 버전 | 용도 |
|------|------|------|
| **React Hook Form** | ^7.65.0 | 폼 상태 관리 |
| **Zod** | ^4.1.12 | 스키마 검증 |
| **@hookform/resolvers** | ^5.2.2 | React Hook Form + Zod 통합 |

### 백엔드 및 데이터베이스

| 기술 | 버전 | 용도 |
|------|------|------|
| **Supabase** | ^2.75.0 | 백엔드 및 데이터베이스 |
| **@supabase/ssr** | ^0.7.0 | SSR 지원 |

### 에디터

| 기술 | 버전 | 용도 |
|------|------|------|
| **Lexical** | ^0.37.0 | 리치 텍스트 에디터 프레임워크 |
| **@lexical/react** | ^0.37.0 | Lexical React 통합 |

### 유틸리티

| 기술 | 버전 | 용도 |
|------|------|------|
| **Sonner** | ^2.0.7 | 토스트 알림 |
| **clsx** | ^2.1.1 | 조건부 클래스명 유틸리티 |
| **Recharts** | ^3.3.0 | 차트 라이브러리 |

### 개발 도구

| 기술 | 버전 | 용도 |
|------|------|------|
| **ESLint** | ^9 | 코드 린팅 |
| **Turbopack** | 내장 | Next.js 번들러 |

## 프로젝트 구조

```
nextjs-prec-1/
├── public/                    # 정적 파일 (이미지, SVG 등)
│   ├── logoBox.svg
│   ├── mainLogo.svg
│   └── ...
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (admin)/          # 관리자 라우트 그룹
│   │   │   ├── admin/        # 관리자 대시보드
│   │   │   │   └── posts/    # 게시물 관리
│   │   │   │       ├── [id]/ # 동적 라우트
│   │   │   │       │   └── edit/
│   │   │   │       ├── new/
│   │   │   │       └── _actions/ # 서버 액션
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx    # 관리자 레이아웃
│   │   ├── about/            # 회사 소개 페이지
│   │   ├── blog/             # 블로그 페이지
│   │   │   ├── [id]/         # 블로그 상세
│   │   │   ├── loading.tsx   # 로딩 UI
│   │   │   └── page.tsx
│   │   ├── login/            # 로그인 페이지
│   │   ├── notice/           # 공지사항
│   │   │   ├── [slug]/       # 공지 상세
│   │   │   └── page.tsx
│   │   ├── globals.css       # 전역 스타일
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 홈페이지
│   │   └── providers.tsx     # Provider 컴포넌트
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── Editor.tsx        # Lexical 에디터
│   │   ├── Header.tsx        # 헤더 네비게이션
│   │   └── LexicalRenderer.tsx
│   ├── data/                 # 정적 데이터
│   │   └── post.ts
│   ├── lib/                  # 유틸리티 및 라이브러리
│   │   └── supabase/
│   │       └── server.ts     # Supabase 서버 클라이언트
│   ├── store/                # 상태 관리
│   │   └── useStore.ts       # Zustand 스토어
│   └── types/                # TypeScript 타입 정의
│       └── database.types.ts
├── middleware.ts             # Next.js 미들웨어 (인증 체크)
├── next.config.ts            # Next.js 설정
├── tsconfig.json             # TypeScript 설정
├── package.json              # 프로젝트 의존성
└── README.md                 # 프로젝트 문서
```

### 디렉토리 설명

- **`app/`**: Next.js App Router 기반 페이지 및 레이아웃
  - `(admin)`: 라우트 그룹 (URL에 반영되지 않음)
  - `[id]`, `[slug]`: 동적 라우트 세그먼트
  - `_actions`: 서버 액션 디렉토리
  
- **`components/`**: 재사용 가능한 React 컴포넌트
- **`lib/`**: 공통 유틸리티 함수 및 라이브러리 설정
- **`store/`**: 클라이언트 상태 관리 (Zustand)
- **`types/`**: TypeScript 타입 정의

## 아키텍처 및 플로우

### 전체 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                  Client (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   React 19   │  │   Zustand    │                │
│  │  Components  │  │   (State)    │                │
│  └──────────────┘  └──────────────┘                │
│         │                  │                         │
│         └────────┬─────────┘                         │
│                  │                                    │
│         ┌────────▼────────┐                         │
│         │  React Query    │                         │
│         │  (Server State) │                         │
│         └────────┬────────┘                         │
└──────────────────┼──────────────────────────────────┘
                   │ HTTP/Fetch
┌──────────────────▼──────────────────────────────────┐
│              Next.js Server                          │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Server     │  │  Middleware  │                │
│  │  Components  │  │  (Auth Check)│                │
│  └──────────────┘  └──────────────┘                │
│         │                  │                         │
│         └────────┬─────────┘                         │
│                  │                                    │
│         ┌────────▼────────┐                         │
│         │ Server Actions  │                         │
│         │  / API Routes   │                         │
│         └────────┬────────┘                         │
└──────────────────┼──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│                  Supabase                            │
│         (Database + Auth + Storage)                  │
└─────────────────────────────────────────────────────┘
```

### 데이터 플로우

1. **서버 컴포넌트 데이터 페칭**
   - 페이지 컴포넌트에서 직접 데이터 페칭
   - `async/await`를 사용한 서버 사이드 데이터 로딩
   - 예: `src/app/blog/page.tsx`

2. **클라이언트 상태 관리**
   - Zustand로 테마, 사용자 상태 등 관리
   - localStorage와 연동하여 상태 지속성 보장

3. **서버 상태 관리**
   - React Query로 서버 데이터 캐싱 및 동기화
   - 자동 재시도, 에러 처리, 캐시 관리

4. **인증 플로우**
   ```
   사용자 로그인 요청
   → /login 페이지 (Server Action)
   → 쿠키 설정 (admin-auth)
   → /admin 접근 시 middleware.ts에서 쿠키 확인
   → 인증되지 않으면 /login으로 리디렉션
   ```

### 렌더링 전략

- **Server Components (기본)**: 서버에서 렌더링되어 초기 로드 성능 최적화
- **Client Components (`'use client'`)**: 인터랙티브 기능이 필요한 경우에만 사용
- **Streaming SSR**: Next.js의 기본 스트리밍 렌더링

## 주요 기능

### 1. 인증 및 권한 관리

- **관리자 로그인**: 비밀번호 기반 인증
- **쿠키 기반 인증**: httpOnly 쿠키로 보안 강화
- **미들웨어 보호**: `/admin` 경로 자동 보호

### 2. 다크 모드

- Zustand로 테마 상태 관리
- localStorage에 테마 설정 저장
- 시스템 설정 감지 및 자동 전환 지원
- 부드러운 테마 전환 애니메이션

### 3. 리치 텍스트 에디터

- Lexical 기반 WYSIWYG 에디터
- 서버/클라이언트 모두에서 렌더링 가능
- 커스터마이징 가능한 플러그인 시스템

### 4. 관리자 대시보드

- 게시물 CRUD 기능
- 통계 및 차트 (Recharts 활용)
- 반응형 레이아웃

### 5. 블로그 시스템

- 서버 컴포넌트 기반 데이터 페칭
- 동적 라우팅을 통한 상세 페이지
- 로딩 상태 UI

## 환경 설정

### 필수 환경 변수

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 관리자 인증
ADMIN_PASSWORD=your_admin_password
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 체크
npm run lint
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 개발 가이드

### 코딩 컨벤션

1. **파일 명명 규칙**
   - 컴포넌트: PascalCase (`Header.tsx`)
   - 유틸리티: camelCase (`useStore.ts`)
   - 페이지: `page.tsx`, `layout.tsx`, `loading.tsx`

2. **컴포넌트 구조**
   - Server Component를 기본으로 사용
   - 인터랙티브 기능이 필요한 경우에만 `'use client'` 사용
   - 타입스크립트 타입 명시 필수

3. **스타일링**
   - Tailwind CSS 유틸리티 클래스 사용
   - 다크 모드: `dark:` 프리픽스 사용
   - 반응형: `sm:`, `md:`, `lg:` 브레이크포인트

### 상태 관리 패턴

- **전역 상태 (Zustand)**: 테마, 사용자 정보 등
- **서버 상태 (React Query)**: API 데이터, 캐시 관리
- **로컬 상태 (useState)**: 컴포넌트 내부 상태

### 데이터 페칭 패턴

**서버 컴포넌트에서 데이터 페칭:**
```typescript
async function getData() {
  const res = await fetch('...');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{/* ... */}</div>;
}
```

**클라이언트 컴포넌트에서 데이터 페칭:**
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export default function Component() {
  const { data } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData,
  });
  // ...
}
```

### 인증 체크

관리자 페이지 접근 시 자동으로 미들웨어가 인증을 확인합니다:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isAuth = request.cookies.get("admin-auth")?.value;
    if (isAuth !== "true") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}
```

### 새 페이지 추가하기

1. `src/app/` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 생성
3. 필요시 `layout.tsx`, `loading.tsx`, `error.tsx` 추가

```typescript
// src/app/새페이지/page.tsx
export default function NewPage() {
  return <div>새 페이지</div>;
}
```

### 새 컴포넌트 추가하기

1. `src/components/` 디렉토리에 컴포넌트 파일 생성
2. Server/Client 컴포넌트 구분
3. 타입스크립트 타입 정의

```typescript
// src/components/NewComponent.tsx
interface NewComponentProps {
  title: string;
}

export default function NewComponent({ title }: NewComponentProps) {
  return <div>{title}</div>;
}
```

## 추가 리소스

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Lexical 문서](https://lexical.dev)

---

**프로젝트 버전**: 0.1.0  
**마지막 업데이트**: 2025년 1월
