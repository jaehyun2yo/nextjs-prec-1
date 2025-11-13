-- contacts 테이블에 납품업체 정보 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS delivery_method TEXT,
ADD COLUMN IF NOT EXISTS delivery_company_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_company_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_company_address TEXT;

-- 납품업체 정보 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_delivery_method ON contacts(delivery_method);

