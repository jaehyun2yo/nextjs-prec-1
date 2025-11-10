-- contacts 테이블에 deleted_at 컬럼 추가 (휴지통 기능)
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- deleted_at 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at ON contacts(deleted_at);

-- 기존 데이터는 deleted_at이 null이므로 삭제되지 않은 것으로 간주

