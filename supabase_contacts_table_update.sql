-- contacts 테이블에 누락된 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- contact_type, service_mold_request, service_delivery_brokerage 필드 추가
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT,
ADD COLUMN IF NOT EXISTS service_mold_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_delivery_brokerage BOOLEAN DEFAULT FALSE;

-- 기존 데이터의 contact_type을 'company'로 설정 (기본값)
UPDATE contacts 
SET contact_type = 'company' 
WHERE contact_type IS NULL;

