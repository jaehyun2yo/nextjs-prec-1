# 문의하기 폼 테스트 가이드

## 1. Supabase 스키마 업데이트 (필수)

먼저 Supabase SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- contacts 테이블에 누락된 필드 추가
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT,
ADD COLUMN IF NOT EXISTS service_mold_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_delivery_brokerage BOOLEAN DEFAULT FALSE;

-- 기존 데이터의 contact_type을 'company'로 설정
UPDATE contacts 
SET contact_type = 'company' 
WHERE contact_type IS NULL;
```

## 2. 개발 서버 실행 확인

터미널에서 다음 명령어로 서버가 실행 중인지 확인:
```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행되어야 합니다.

## 3. 테스트 시나리오

### 시나리오 1: 기본 문의하기 (업체)
1. 브라우저에서 http://localhost:3000/contact 접속
2. **Step 1: 연락처 정보**
   - 문의 유형: "업체" 선택
   - 업체명: "테스트 회사"
   - 담당자명: "홍길동"
   - 직책: "대표"
   - 연락처: "010-1234-5678"
   - 이메일: "test@example.com"
   - "다음 단계" 클릭

3. **Step 2: 도면 및 샘플**
   - 필요한 사항: "도면 제작이 필요합니다" 선택
   - "다음 단계" 클릭

4. **Step 3: 일정 조율**
   - 샘플 완료후 수령방법: "방문 수령" 선택
   - 날짜 선택 (현재 날짜 + 2일 이후 평일)
   - 시간 선택 (12:00-13:00 제외)
   - "다음 단계" 클릭

5. **Step 4: 내용 확인**
   - 모든 정보 확인
   - "문의하기" 클릭

### 시나리오 2: 개인 문의하기
1. Step 1에서 문의 유형: "개인" 선택
2. 이름: "김개인"
3. "목형 제작 의뢰" 체크박스 선택
4. 나머지는 위와 동일하게 진행

### 시나리오 3: 도면 보유한 경우
1. Step 2에서 "도면을 가지고 있습니다" 선택
2. "도면의 수정이 필요합니다" 선택
3. 도면 파일 업로드
4. 나머지 진행

## 4. 확인 사항

### ✅ 성공 시
- "/contact?success=1"로 리디렉션
- 성공 메시지 표시
- 이메일 전송 확인
- 관리자 페이지(/admin/contacts)에서 문의 확인 가능

### ❌ 에러 발생 시
- 브라우저 콘솔 확인 (F12)
- 서버 터미널 로그 확인
- 에러 메시지 확인:
  - `db_failed`: DB 저장 실패
  - `email_failed`: 이메일 전송 실패
  - `both_failed`: 둘 다 실패

## 5. 로그 확인

서버 터미널에서 다음 로그를 확인:
- `[CONTACT] Attempting to insert contact data:`
- `[CONTACT] Contact saved to database successfully:`
- `[CONTACT] Database insert error:` (에러 시)

## 6. 관리자 페이지 확인

1. http://localhost:3000/admin/contacts 접속
2. 새로 등록된 문의 확인
3. 상세보기 클릭하여 모든 정보 확인
4. "읽음" 버튼으로 상태 변경 테스트

## 7. 문제 해결

### DB 저장 실패
- Supabase SQL이 실행되었는지 확인
- Supabase 연결 설정 확인 (.env.local)
- 서버 로그의 에러 메시지 확인

### 이메일 전송 실패
- .env.local의 SMTP 설정 확인
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD 확인

### 폼 검증 실패
- 브라우저 콘솔에서 에러 메시지 확인
- 필수 필드가 모두 입력되었는지 확인

