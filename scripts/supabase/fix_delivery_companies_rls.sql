-- delivery_companies 테이블 RLS 정책 수정
-- 기존 정책을 삭제하고 개발용 정책으로 교체
-- Supabase SQL Editor에서 실행하세요

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Companies can view their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS "Companies can insert their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS "Companies can update their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS "Companies can delete their own delivery companies" ON public.delivery_companies;
DROP POLICY IF EXISTS dev_anon_all ON public.delivery_companies;

-- 개발용 정책 생성 (서버 사이드에서도 작동)
CREATE POLICY dev_anon_all
  ON public.delivery_companies
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

