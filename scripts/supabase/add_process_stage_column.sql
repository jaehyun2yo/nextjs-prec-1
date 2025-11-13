-- contacts 테이블에 process_stage 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS process_stage TEXT;

-- process_stage 가능한 값:
-- 'drawing' - 도면작업
-- 'sample' - 샘플제작 및 확인
-- 'drawing_confirmed' - 도면 확정 및 목형의뢰
-- 'laser' - 레이저 가공
-- 'cutting' - 칼 / 오시 작업
-- 'inspection' - 검수
-- 'delivery' - 납품
-- NULL - 공정 시작 전





