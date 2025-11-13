# API 문서

이 문서는 Next.js Prec-1 프로젝트의 API 엔드포인트와 서버 액션에 대한 문서입니다.

## 목차

- [API 라우트](#api-라우트)
- [서버 액션](#서버-액션)
- [에러 처리](#에러-처리)
- [인증](#인증)

## API 라우트

### 문의(Contact) API

#### GET /api/contacts/[id]

문의 상세 정보를 조회합니다.

**인증**: 필수 (세션 쿠키)

**파라미터**:
- `id` (path): 문의 ID

**응답**:
```json
{
  "id": 1,
  "company_name": "회사명",
  "name": "담당자명",
  "email": "email@example.com",
  // ... 기타 필드
}
```

**에러 응답**:
- `401`: 인증되지 않음
- `404`: 문의를 찾을 수 없음
- `500`: 서버 오류

---

#### DELETE /api/contacts/[id]

문의를 삭제합니다.

**인증**: 필수 (세션 쿠키)

**파라미터**:
- `id` (path): 문의 ID

**요청 본문** (선택):
```json
{
  "permanent": true  // 영구 삭제 여부 (기본값: false)
}
```

**응답**:
```json
{
  "success": true
}
```

**에러 응답**:
- `401`: 인증되지 않음
- `500`: 서버 오류

---

#### PATCH /api/contacts/[id]/status

문의 상태를 업데이트합니다.

**인증**: 필수 (세션 쿠키)

**파라미터**:
- `id` (path): 문의 ID

**요청 본문**:
```json
{
  "status": "read"  // new, read, in_progress, revision_in_progress, completed, on_hold, replied, deleting
}
```

**응답**:
```json
{
  "success": true
}
```

---

#### POST /api/contacts/[id]/revision-request

수정 요청을 생성합니다.

**인증**: 필수 (세션 쿠키)

**파라미터**:
- `id` (path): 문의 ID

**요청 본문** (FormData):
- `title`: 수정 요청 제목
- `content`: 수정 요청 내용
- `file`: 첨부 파일 (선택)

**응답**:
```json
{
  "success": true
}
```

---

### 관리자 API

#### GET /api/admin/contacts

문의 목록을 조회합니다 (관리자용).

**인증**: 필수 (세션 쿠키)

**쿼리 파라미터**:
- `status` (선택): 상태 필터 (all, new, read, in_progress, ...)
- `page` (선택): 페이지 번호 (기본값: 1)
- `search` (선택): 검색어 (문의번호로 검색)

**응답**:
```json
{
  "contacts": [...],
  "totalCount": 100,
  "hasMore": true
}
```

---

### 회사(Company) API

#### POST /api/company/profile

회사 프로필을 업데이트합니다.

**인증**: 필수 (세션 쿠키, company 타입)

**요청 본문** (FormData):
- 회사 정보 필드들
- `logo`: 로고 이미지 파일 (선택)

**응답**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 서버 액션

### 문의 관련

#### submitContact

문의 폼을 제출합니다.

**위치**: `src/app/actions/contact.ts`

**파라미터**:
- `formData`: FormData 객체

**반환값**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**사용 예시**:
```typescript
const formData = new FormData();
formData.append('inquiry_title', '문의 제목');
formData.append('company_name', '회사명');
// ... 기타 필드

const result = await submitContact(formData);
```

---

### 인증 관련

#### loginAction

로그인을 처리합니다.

**위치**: `src/app/actions/auth.ts`

**파라미터**:
- `formData`: FormData 객체 (username, password 포함)

**동작**:
- 관리자 계정 또는 기업 계정 확인
- 성공 시 세션 쿠키 설정 및 리디렉션

---

#### logoutAction

로그아웃을 처리합니다.

**위치**: `src/app/actions/auth.ts`

**동작**:
- 세션 쿠키 삭제
- 홈페이지로 리디렉션

---

### 회사 등록

#### registerCompany

회사 등록을 처리합니다.

**위치**: `src/app/actions/register.ts`

**파라미터**:
- `formData`: FormData 객체 (회사 정보 포함)

**동작**:
- 회사 정보 검증
- 비밀번호 해시화
- 데이터베이스에 저장
- 로그인 페이지로 리디렉션

---

## 에러 처리

모든 API는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": { ... }  // 선택사항
}
```

### 에러 코드

- `VALIDATION_ERROR` (400): 입력값 검증 실패
- `AUTHENTICATION_ERROR` (401): 인증 실패
- `AUTHORIZATION_ERROR` (403): 권한 없음
- `DATABASE_ERROR` (500): 데이터베이스 오류
- `UNKNOWN_ERROR` (500): 알 수 없는 오류

---

## 인증

대부분의 API는 세션 기반 인증을 사용합니다.

**인증 방법**:
1. `/login` 페이지에서 로그인
2. 서버에서 `admin-session` 쿠키 설정
3. 이후 요청에서 쿠키 자동 전송

**인증 확인**:
- API 라우트: `verifySession()` 함수 사용
- 미들웨어: `/admin`, `/company` 경로 자동 보호

---

## 참고

- 모든 API는 TypeScript로 타입이 정의되어 있습니다.
- 에러 처리는 `src/lib/utils/errors.ts`의 에러 클래스를 사용합니다.
- 로깅은 `src/lib/utils/logger.ts`의 logger를 사용합니다.

