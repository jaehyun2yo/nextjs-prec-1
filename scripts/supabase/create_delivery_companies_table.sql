-- delivery_companies 테이블 생성
-- 업체별로 납품업체 정보를 저장하는 테이블
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS public.delivery_companies (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_delivery_companies_company_id ON public.delivery_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_delivery_companies_created_at ON public.delivery_companies(created_at DESC);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_delivery_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_delivery_companies_updated_at ON public.delivery_companies;
CREATE TRIGGER update_delivery_companies_updated_at
  BEFORE UPDATE ON public.delivery_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_companies_updated_at();

-- RLS (Row Level Security) 설정
ALTER TABLE public.delivery_companies ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Companies can view their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS "Companies can insert their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS "Companies can update their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS "Companies can delete their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS dev_anon_all ON public.delivery_companies;

-- 개발용 정책 (모든 사용자가 읽기/쓰기 가능)
-- 프로덕션에서는 더 엄격한 정책으로 변경 필요
-- 서버 사이드에서도 작동하도록 USING (true) WITH CHECK (true) 사용
CREATE POLICY dev_anon_all
  ON public.delivery_companies
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

