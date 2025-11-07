-- contacts 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- contacts 테이블 생성
CREATE TABLE IF NOT EXISTS contacts (
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

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- 보안을 위해 RLS를 활성화하려면 아래 주석을 해제하세요

-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 데이터 조회 가능 (필요시 수정)
-- CREATE POLICY "관리자는 모든 문의 조회 가능" ON contacts
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

-- 모든 사용자는 문의 작성 가능
-- CREATE POLICY "모든 사용자는 문의 작성 가능" ON contacts
--   FOR INSERT
--   WITH CHECK (true);
