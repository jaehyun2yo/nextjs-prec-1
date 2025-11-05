-- contacts 테이블 완전 생성 스크립트
-- ⚠️ 주의: 기존 테이블이 있으면 삭제됩니다! (데이터 백업 필수)
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블 삭제 (데이터가 있으면 백업 먼저!)
-- DROP TABLE IF EXISTS public.contacts CASCADE;

-- 2. contacts 테이블 생성 (public 스키마)
CREATE TABLE IF NOT EXISTS public.contacts (
  id BIGSERIAL PRIMARY KEY,
  
  -- 연락처 정보
  company_name TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_type TEXT,
  service_mold_request BOOLEAN DEFAULT FALSE,
  service_delivery_brokerage BOOLEAN DEFAULT FALSE,
  
  -- 도면 및 샘플 정보
  drawing_type TEXT,
  has_physical_sample BOOLEAN DEFAULT FALSE,
  has_reference_photos BOOLEAN DEFAULT FALSE,
  drawing_modification TEXT,
  box_shape TEXT,
  length TEXT,
  width TEXT,
  height TEXT,
  material TEXT,
  drawing_notes TEXT,
  sample_notes TEXT,
  
  -- 일정 조율 정보
  receipt_method TEXT,
  visit_date TEXT,
  visit_time_slot TEXT,
  delivery_type TEXT,
  delivery_address TEXT,
  delivery_name TEXT,
  delivery_phone TEXT,
  
  -- 첨부 파일
  attachment_filename TEXT,
  attachment_url TEXT,
  drawing_file_url TEXT,
  drawing_file_name TEXT,
  reference_photos_urls TEXT,
  
  -- 상태 및 메타데이터
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);

-- 4. updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS (Row Level Security) 설정
-- ⚠️ 개발 중에는 RLS를 비활성화하거나 모든 작업을 허용하는 정책을 추가하세요

-- RLS 비활성화 (개발용)
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;

-- 또는 모든 작업을 허용하는 정책 생성 (RLS 활성화 시)
-- ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on contacts" ON public.contacts
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- 7. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'contacts'
ORDER BY ordinal_position;

-- 8. 테이블이 정상적으로 생성되었는지 확인
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'contacts';

