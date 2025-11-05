-- contacts 테이블의 모든 컬럼 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'contacts'
ORDER BY ordinal_position;

