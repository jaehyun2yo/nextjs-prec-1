-- contacts 테이블에 누락된 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS inquiry_title TEXT,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
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
ADD COLUMN IF NOT EXISTS visit_location TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
ADD COLUMN IF NOT EXISTS attachment_filename TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_name TEXT,
ADD COLUMN IF NOT EXISTS reference_photos_urls TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS process_stage TEXT,
ADD COLUMN IF NOT EXISTS inquiry_number TEXT;

-- 문의번호 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_inquiry_number ON contacts(inquiry_number);

