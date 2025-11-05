/**
 * Supabase 연결 및 테이블 구조 테스트 스크립트
 */

// 이 스크립트는 Node.js 환경에서 실행할 수 없습니다 (환경 변수 필요)
// 대신 서버 로그를 확인하거나, 아래 SQL을 Supabase에서 직접 실행하세요

console.log(`
=== Supabase 연결 및 테이블 구조 확인 가이드 ===

1. Supabase SQL Editor에서 다음 SQL을 실행하여 테이블 구조 확인:

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;

2. 필수 컬럼이 모두 있는지 확인:
   - contact_type
   - service_mold_request
   - service_delivery_brokerage
   - attachment_url
   - drawing_file_url
   - drawing_file_name
   - reference_photos_urls

3. RLS (Row Level Security) 확인:
   - RLS가 활성화되어 있으면 INSERT 권한이 필요할 수 있습니다
   - 다음 SQL로 확인:

SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'contacts';

4. 테스트 INSERT 실행:

INSERT INTO contacts (
  company_name, name, position, phone, email, status
) VALUES (
  '테스트', '테스트', '테스트', '010-1234-5678', 'test@test.com', 'new'
);

5. 최근 데이터 확인:

SELECT id, company_name, email, status, created_at 
FROM contacts 
ORDER BY created_at DESC 
LIMIT 5;

`);

