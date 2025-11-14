-- 문의번호 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS inquiry_number TEXT;

-- 문의번호 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_inquiry_number ON contacts(inquiry_number);






