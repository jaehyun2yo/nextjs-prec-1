# Vercel GitHub 연결 가이드

## 문제
"Failed to link jaehyun2yo/nextjs-prec-1. You need to add a Login Connection to your GitHub account first." 에러 발생

## 해결 방법

### 1. Vercel 계정 설정에서 GitHub 연결

1. **Vercel 대시보드 접속**
   - https://vercel.com 에 로그인

2. **계정 설정으로 이동**
   - 우측 상단 프로필 아이콘 클릭
   - "Settings" 선택

3. **GitHub 연결 추가**
   - 좌측 메뉴에서 "Connections" 또는 "Git" 선택
   - "Add Git Provider" 또는 "Connect GitHub" 버튼 클릭
   - GitHub 인증 화면에서 "Authorize Vercel" 클릭

4. **저장소 접근 권한 확인**
   - 필요한 저장소에 대한 접근 권한을 허용
   - "All repositories" 또는 특정 저장소 선택

### 2. GitHub에서 직접 연결

1. **GitHub 저장소로 이동**
   - https://github.com/jaehyun2yo/nextjs-prec-1 접속

2. **Settings → Integrations → Vercel**
   - 저장소 Settings → Integrations → Vercel 선택
   - "Configure" 클릭하여 Vercel 연결

### 3. Vercel에서 프로젝트 다시 Import

1. **Vercel 대시보드로 돌아가기**
   - https://vercel.com/dashboard

2. **"Add New Project" 클릭**

3. **GitHub 저장소 선택**
   - 이제 연결된 GitHub 계정의 저장소 목록이 표시됨
   - `jaehyun2yo/nextjs-prec-1` 선택

4. **프로젝트 설정 및 배포**
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)

5. **환경 변수 설정**
   - 프로젝트 설정에서 Environment Variables 추가
   - (자세한 내용은 `VERCEL_DEPLOYMENT.md` 참고)

6. **"Deploy" 클릭**

## 문제 해결 체크리스트

- [ ] Vercel 계정에 GitHub 연결되어 있는지 확인
- [ ] GitHub에서 Vercel 앱에 저장소 접근 권한이 있는지 확인
- [ ] Vercel 대시보드에서 GitHub 저장소 목록이 보이는지 확인
- [ ] 저장소가 Private인 경우, Vercel Pro 플랜이 필요한지 확인

## 추가 참고사항

### Private 저장소의 경우
- Vercel Free 플랜: Public 저장소만 지원
- Vercel Pro 플랜: Private 저장소 지원

### 조직(Organization) 저장소의 경우
- GitHub 조직의 Settings → Third-party access에서 Vercel 앱 승인 필요
- 조직 관리자 권한이 필요할 수 있음

### 권한 문제 해결
1. GitHub Settings → Applications → Authorized OAuth Apps
2. Vercel 앱 찾기
3. "Revoke" 후 다시 연결 시도

## 대안: Vercel CLI 사용

GitHub 연결이 어려운 경우, Vercel CLI를 사용하여 배포할 수 있습니다:

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
cd C:\Users\jaehy\OneDrive\Desktop\dev\projects\nextjs-prec-1
vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SESSION_SECRET
# ... 기타 환경 변수

# 배포
vercel --prod
```

자세한 내용은 Vercel 공식 문서를 참고하세요:
- https://vercel.com/docs/concepts/git/vercel-for-github
- https://vercel.com/docs/cli

