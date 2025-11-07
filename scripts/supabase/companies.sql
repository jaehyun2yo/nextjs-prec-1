-- companies 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- companies 테이블 생성
CREATE TABLE IF NOT EXISTS public.companies (
  id BIGSERIAL PRIMARY KEY,
  
  -- 로그인 정보
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- 업체 정보
  company_name TEXT NOT NULL,
  business_registration_number TEXT NOT NULL,
  representative_name TEXT NOT NULL,
  business_type TEXT, -- 업태
  business_category TEXT, -- 업종
  business_address TEXT NOT NULL,
  business_registration_file_url TEXT, -- 사업자등록증 파일 URL
  business_registration_file_name TEXT, -- 사업자등록증 파일명
  
  -- 실무담당자 정보
  manager_name TEXT NOT NULL,
  manager_position TEXT NOT NULL,
  manager_phone TEXT NOT NULL,
  manager_email TEXT NOT NULL,
  
  -- 회계담당자 정보
  accountant_name TEXT,
  accountant_phone TEXT,
  accountant_email TEXT, -- 세금계산서 발행할 이메일
  accountant_fax TEXT, -- 팩스번호
  
  -- 견적서 제공받을 방법 (체크박스 - 여러 개 선택 가능)
  quote_method_email BOOLEAN DEFAULT FALSE,
  quote_method_fax BOOLEAN DEFAULT FALSE,
  quote_method_sms BOOLEAN DEFAULT FALSE,
  
  -- 상태 및 메타데이터
  status TEXT DEFAULT 'active', -- active, inactive, pending
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_companies_username ON public.companies(username);
CREATE INDEX IF NOT EXISTS idx_companies_company_name ON public.companies(company_name);
CREATE INDEX IF NOT EXISTS idx_companies_business_registration_number ON public.companies(business_registration_number);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at DESC);

-- updated_at 자동 업데이트 트리거 함수 (이미 존재하면 재사용)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 설정
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 개발용 정책 (모든 사용자가 읽기/쓰기 가능)
-- 프로덕션에서는 더 엄격한 정책으로 변경 필요
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'dev_anon_all'
  ) THEN
    CREATE POLICY dev_anon_all
      ON public.companies
      FOR ALL 
      USING (true) 
      WITH CHECK (true);
  END IF;
END $$;

