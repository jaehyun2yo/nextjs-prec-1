-- contacts 테이블 완전 수정 스크립트
-- Supabase SQL Editor에서 실행하세요
-- 이 스크립트는 기존 테이블에 누락된 모든 컬럼을 추가합니다

-- 1. contact_type, service_mold_request, service_delivery_brokerage 필드 추가
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT,
ADD COLUMN IF NOT EXISTS service_mold_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_delivery_brokerage BOOLEAN DEFAULT FALSE;

-- 2. 도면 및 샘플 정보 필드 추가
ALTER TABLE contacts 
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
ADD COLUMN IF NOT EXISTS sample_notes TEXT;

-- 3. 일정 조율 정보 필드 추가
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS receipt_method TEXT,
ADD COLUMN IF NOT EXISTS visit_date TEXT,
ADD COLUMN IF NOT EXISTS visit_time_slot TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT;

-- 4. 첨부 파일 필드 추가 (기존 attachment_filename 포함)
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS attachment_filename TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_name TEXT,
ADD COLUMN IF NOT EXISTS reference_photos_urls TEXT;

-- 5. 상태 필드 추가 (없는 경우)
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. 기존 데이터의 기본값 설정
UPDATE contacts 
SET contact_type = 'company' 
WHERE contact_type IS NULL;

UPDATE contacts 
SET service_mold_request = FALSE 
WHERE service_mold_request IS NULL;

UPDATE contacts 
SET service_delivery_brokerage = FALSE 
WHERE service_delivery_brokerage IS NULL;

UPDATE contacts 
SET has_physical_sample = FALSE 
WHERE has_physical_sample IS NULL;

UPDATE contacts 
SET has_reference_photos = FALSE 
WHERE has_reference_photos IS NULL;

UPDATE contacts 
SET status = 'new' 
WHERE status IS NULL;

-- 7. 모든 필드가 올바르게 설정되었는지 확인
-- SELECT 문으로 테이블 구조 확인 (실행 후 결과 확인)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

-- 5. 테이블에 데이터가 있는지 확인 (선택사항)
-- SELECT COUNT(*) FROM contacts;

