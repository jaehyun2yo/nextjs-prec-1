# Vercel 배포 가이드

## 1. Vercel 프로젝트 연결

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택 및 Import
4. 프로젝트 설정 확인

## 2. 환경 변수 설정

Vercel 대시보드에서 환경 변수를 설정해야 합니다.

### 필수 환경 변수

프로젝트 설정 → Environment Variables에서 다음 변수들을 추가하세요:

#### Supabase 설정 (필수)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**설정 방법:**
1. Supabase 대시보드 → Settings → API
2. `Project URL`을 `NEXT_PUBLIC_SUPABASE_URL`에 복사
3. `anon public` 키를 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사

#### 세션 보안 (프로덕션 필수)
```
SESSION_SECRET=your_secure_random_string_at_least_32_characters
```

**생성 방법:**
```bash
# Node.js로 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

또는 온라인 도구 사용:
- https://generate-secret.vercel.app/32

#### 관리자 인증 (선택, 프로덕션 권장)
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_hashed_password
```

**비밀번호 해시 생성 방법:**
```bash
# Node.js로 bcrypt 해시 생성
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(hash => console.log(hash))"
```

### 선택적 환경 변수

#### 이메일 설정 (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

#### Cloudflare R2 설정 (파일 업로드용)
```
R2_PUBLIC_BASE_URL=https://your-r2-domain.com
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

## 3. 환경별 설정

Vercel에서는 환경별로 다른 환경 변수를 설정할 수 있습니다:

- **Production**: 프로덕션 배포에 사용
- **Preview**: PR 및 브랜치 배포에 사용
- **Development**: 로컬 개발에 사용 (Vercel CLI)

각 환경에 맞게 변수를 설정하세요.

## 4. 배포 확인

1. 환경 변수 설정 후 "Deploy" 버튼 클릭
2. 배포 로그에서 환경 변수 로드 확인
3. 배포 완료 후 사이트 접속하여 동작 확인

## 5. 환경 변수 확인 방법

배포 후 다음 방법으로 환경 변수가 제대로 설정되었는지 확인:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 배포 로그에서 에러 메시지 확인
3. 애플리케이션에서 환경 변수 관련 에러 확인

## 6. 문제 해결

### 환경 변수가 로드되지 않는 경우

1. **변수명 확인**: 대소문자 정확히 일치하는지 확인
2. **재배포**: 환경 변수 변경 후 재배포 필요
3. **캐시 클리어**: Vercel 캐시 문제일 수 있음

### NEXT_PUBLIC_ 접두사

- `NEXT_PUBLIC_`로 시작하는 변수는 클라이언트에서도 접근 가능
- 민감한 정보는 `NEXT_PUBLIC_` 접두사 사용 금지
- Supabase URL과 Anon Key는 공개되어도 안전 (Row Level Security 사용)

### 보안 주의사항

- `SESSION_SECRET`은 반드시 강력한 랜덤 문자열 사용
- `ADMIN_PASSWORD_HASH`는 bcrypt로 해시된 값 사용
- 서비스 키나 비밀 키는 절대 `NEXT_PUBLIC_` 접두사 사용 금지

## 7. 로컬 개발 환경 변수

로컬 개발을 위한 `.env.local` 파일 예시:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 세션 보안
SESSION_SECRET=your_local_session_secret

# 관리자 인증 (선택)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$your_hashed_password

# 이메일 설정 (선택)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# R2 설정 (선택)
R2_PUBLIC_BASE_URL=https://your-r2-domain.com
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

**주의**: `.env.local` 파일은 Git에 커밋하지 마세요. `.gitignore`에 이미 포함되어 있습니다.

