-- contacts 테이블의 실제 구조 확인
-- Supabase SQL Editor에서 실행하여 현재 테이블 구조를 확인하세요

-- 1. 테이블의 모든 컬럼 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'contacts'
ORDER BY ordinal_position;

-- 2. 필수 컬럼이 있는지 확인
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'EXISTS'
        ELSE 'MISSING'
    END as status,
    'company_name' as column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'contacts'
  AND column_name = 'company_name';

-- 3. 누락된 컬럼 확인 (예상되는 컬럼 목록과 비교)
SELECT 
    'MISSING' as status,
    'contact_type' as column_name
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'contacts'
      AND column_name = 'contact_type'
)
UNION ALL
SELECT 
    'MISSING' as status,
    'box_shape' as column_name
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'contacts'
      AND column_name = 'box_shape'
)
UNION ALL
SELECT 
    'MISSING' as status,
    'drawing_type' as column_name
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'contacts'
      AND column_name = 'drawing_type'
)
UNION ALL
SELECT 
    'MISSING' as status,
    'attachment_filename' as column_name
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'contacts'
      AND column_name = 'attachment_filename'
);

-- 4. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'contacts';

-- 5. RLS 활성화 여부 확인
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'contacts';

