-- contacts 테이블에 R2 파일 URL 필드 추가
-- Supabase SQL Editor에서 실행하세요

-- 첨부 파일 URL 필드 추가
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_url TEXT,
ADD COLUMN IF NOT EXISTS drawing_file_name TEXT,
ADD COLUMN IF NOT EXISTS reference_photos_urls TEXT;

-- 참고: reference_photos_urls는 JSON 배열로 저장됩니다
-- 예: ["https://r2.example.com/contacts/reference-photos/123-photo1.jpg", "https://r2.example.com/contacts/reference-photos/123-photo2.jpg"]

