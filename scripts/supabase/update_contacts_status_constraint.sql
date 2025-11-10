-- contacts 테이블의 status 컬럼 CHECK 제약 조건 업데이트
-- Supabase SQL Editor에서 실행하세요.

-- 1. 먼저 현재 제약 조건 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.contacts'::regclass
  AND contype = 'c'
  AND conname LIKE '%status%';

-- 2. 기존 CHECK 제약 조건 제거 (모든 가능한 이름 확인 후 제거)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.contacts'::regclass
          AND contype = 'c'
          AND (
            conname LIKE '%status%' 
            OR pg_get_constraintdef(oid) LIKE '%status%'
          )
    ) LOOP
        EXECUTE 'ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- 3. 새로운 CHECK 제약 조건 추가 (7가지 상태 + replied + deleting 허용)
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_status_check 
CHECK (status IN ('new', 'read', 'in_progress', 'revision_in_progress', 'completed', 'on_hold', 'replied', 'deleting'));

-- 4. 제약 조건 확인
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.contacts'::regclass
  AND contype = 'c'
  AND conname = 'contacts_status_check';
