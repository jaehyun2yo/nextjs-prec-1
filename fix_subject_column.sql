-- subject와 message 컬럼의 NOT NULL 제약 제거
-- ⚠️ 이 컬럼들은 폼에서 사용하지 않으므로 NULL 허용으로 변경

-- 1. subject 컬럼의 NOT NULL 제약 제거
ALTER TABLE public.contacts 
ALTER COLUMN subject DROP NOT NULL;

-- 2. message 컬럼의 NOT NULL 제약 제거 (있는 경우)
ALTER TABLE public.contacts 
ALTER COLUMN message DROP NOT NULL;

-- 3. 확인: 컬럼이 NULL 허용으로 변경되었는지 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'contacts'
  AND column_name IN ('subject', 'message')
ORDER BY column_name;

