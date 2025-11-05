-- RLS 정책 설정 (프로덕션 환경용)
-- ⚠️ 주의: 현재는 개발 중이므로 RLS를 비활성화해도 됩니다.
-- 프로덕션 환경에서는 이 정책들을 활성화하세요.

-- 1. RLS 활성화
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 2. 모든 사용자가 문의하기를 INSERT할 수 있도록 허용 (익명 사용자 포함)
CREATE POLICY "Allow public insert on contacts"
ON public.contacts
FOR INSERT
TO public
WITH CHECK (true);

-- 3. 관리자만 모든 데이터를 SELECT할 수 있도록 설정
-- (실제 구현에서는 인증된 사용자만 조회 가능하도록 수정 필요)
-- 예시: CREATE POLICY "Allow authenticated select" ON public.contacts
--       FOR SELECT TO authenticated USING (true);

-- 4. 관리자만 UPDATE할 수 있도록 설정
-- (실제 구현에서는 인증된 사용자만 업데이트 가능하도록 수정 필요)

-- 5. 관리자만 DELETE할 수 있도록 설정
-- (실제 구현에서는 인증된 사용자만 삭제 가능하도록 수정 필요)

-- 현재 개발 중이라면 RLS를 다시 비활성화:
-- ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;

