-- contacts 테이블에 수정요청 관련 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS revision_request_title TEXT,
ADD COLUMN IF NOT EXISTS revision_request_content TEXT,
ADD COLUMN IF NOT EXISTS revision_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revision_request_file_url TEXT,
ADD COLUMN IF NOT EXISTS revision_request_file_name TEXT,
ADD COLUMN IF NOT EXISTS revision_request_history JSONB DEFAULT '[]'::jsonb;

-- 수정요청 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_revision_requested_at ON contacts(revision_requested_at DESC);

