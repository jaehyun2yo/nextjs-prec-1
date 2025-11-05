-- contacts 테이블에 누락된 필수 컬럼 추가
-- ⚠️ 중요: company_name, position, phone 컬럼이 없어서 에러가 발생합니다!

-- 1. 필수 연락처 정보 컬럼 추가 (가장 중요!)
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. 기타 필수 컬럼 추가
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT,
ADD COLUMN IF NOT EXISTS service_mold_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_delivery_brokerage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drawing_type TEXT,
ADD COLUMN IF NOT EXISTS has_physical_sample BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_reference_photos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drawing_modification TEXT,
ADD COLUMN IF NOT EXISTS box_shape TEXT,
ADD COLUMN IF NOT EXISTS length TEXT,
ADD COLUMN IF NOT EXISTS width TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS drawing_notes TEXT,
ADD COLUMN IF NOT EXISTS sample_notes TEXT,
ADD COLUMN IF NOT EXISTS receipt_method TEXT,
ADD COLUMN IF NOT EXISTS visit_date TEXT,
ADD COLUMN IF NOT EXISTS visit_time_slot TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
ADD COLUMN IF NOT EXISTS attachment_filename TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_name TEXT,
ADD COLUMN IF NOT EXISTS reference_photos_urls TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

