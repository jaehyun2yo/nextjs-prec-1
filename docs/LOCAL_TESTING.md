# 로컬 배포 테스트 가이드

Vercel 배포 전에 로컬에서 프로덕션 빌드를 테스트하는 방법입니다.

## 빠른 테스트 방법

### 1. 로컬 프로덕션 빌드 테스트 (가장 빠름)

```bash
# 빌드 + 프로덕션 서버 실행
npm run build:test
```

이 명령어는:

1. 프로덕션 빌드를 실행 (`npm run build`)
2. 현재 플랫폼용 sharp 재빌드 (`npm rebuild sharp`) - Windows/Linux 호환성 보장
3. 프로덕션 서버를 시작 (`npm start`)
4. `http://localhost:3000`에서 프로덕션 모드로 테스트 가능

**장점:**

- Vercel 배포 없이 즉시 테스트 가능
- 빌드 에러를 빠르게 확인
- 로컬 환경에서 프로덕션 빌드 동작 확인
- Windows에서도 sharp가 정상 작동

**단점:**

- Vercel 환경과 약간 다를 수 있음
- 환경 변수는 `.env.local` 사용

**참고:** Windows에서 테스트할 때 sharp 관련 에러가 발생하면 `npm run rebuild:sharp`를 실행하세요.

### 2. Vercel CLI를 사용한 로컬 프리뷰 (Vercel 환경과 동일)

#### Vercel CLI 설치

```bash
# 전역 설치
npm i -g vercel

# 또는 프로젝트에 설치
npm install -D vercel
```

#### Vercel 로컬 개발 서버 실행

```bash
# Vercel 환경과 동일하게 로컬에서 실행
npm run vercel:dev
# 또는
vercel dev
```

**장점:**

- Vercel 환경과 거의 동일한 환경
- Vercel 환경 변수 자동 로드
- Serverless Functions 테스트 가능

**단점:**

- 초기 설정 필요 (Vercel 로그인)
- 첫 실행 시 약간 느릴 수 있음

#### Vercel 로컬 빌드 테스트

```bash
# Vercel 빌드 프로세스 시뮬레이션
npm run vercel:build
# 또는
vercel build
```

## 테스트 체크리스트

배포 전에 다음을 확인하세요:

### 1. 빌드 테스트

```bash
npm run build
```

- [ ] 빌드가 성공적으로 완료되는가?
- [ ] TypeScript 에러가 없는가?
- [ ] 린트 에러가 없는가?

### 2. 프로덕션 서버 테스트

```bash
npm run build:test
```

- [ ] 서버가 정상적으로 시작되는가?
- [ ] 페이지가 정상적으로 로드되는가?
- [ ] 이미지가 정상적으로 표시되는가?

### 3. 주요 기능 테스트

- [ ] 로그인 기능
- [ ] 포트폴리오 업로드
- [ ] 이미지 업로드
- [ ] 폼 제출
- [ ] API 라우트 동작

### 4. 환경 변수 확인

- [ ] `.env.local`에 필요한 환경 변수가 모두 설정되어 있는가?
- [ ] Vercel 환경 변수와 일치하는가?

## 빠른 개발 워크플로우

### 개발 중

```bash
# 개발 서버 실행 (빠른 핫 리로드)
npm run dev
```

### 배포 전 테스트

```bash
# 1. 빌드 테스트
npm run build

# 2. 프로덕션 서버 테스트
npm run build:test
# 브라우저에서 http://localhost:3000 접속하여 테스트
```

### 배포

```bash
# Git에 커밋 및 푸시
git add .
git commit -m "변경사항"
git push origin master

# Vercel이 자동으로 배포 시작
```

## Vercel CLI 초기 설정

처음 사용하는 경우:

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 연결 (프로젝트 루트에서 실행)
vercel link

# 4. 환경 변수 동기화 (선택사항)
vercel env pull .env.local
```

## 문제 해결

### 빌드 에러가 발생하는 경우

1. **TypeScript 에러 확인**

   ```bash
   npm run build 2>&1 | findstr /i "error"
   ```

2. **린트 에러 확인**

   ```bash
   npm run lint
   ```

3. **의존성 문제 확인**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Vercel CLI 에러가 발생하는 경우

1. **Vercel CLI 재설치**

   ```bash
   npm uninstall -g vercel
   npm i -g vercel
   ```

2. **프로젝트 재연결**
   ```bash
   vercel unlink
   vercel link
   ```

## 추천 워크플로우

1. **개발**: `npm run dev`로 개발
2. **로컬 테스트**: `npm run build:test`로 프로덕션 빌드 테스트
3. **커밋**: 변경사항 커밋 및 푸시
4. **Vercel 배포**: 자동 배포 대기 (필요시 Vercel CLI로 수동 배포)

이렇게 하면 Vercel 배포 전에 대부분의 문제를 로컬에서 발견할 수 있습니다!
