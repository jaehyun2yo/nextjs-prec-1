-- Supabase Realtime 활성화 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. contacts 테이블을 Realtime publication에 추가
-- 이렇게 하면 contacts 테이블의 변경사항이 실시간으로 전송됩니다
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;

-- 2. (선택사항) 다른 테이블도 Realtime에 추가하려면 아래 주석을 해제하세요
-- ALTER PUBLICATION supabase_realtime ADD TABLE companies;
-- ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- 3. 현재 Realtime에 등록된 테이블 확인
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- 4. Realtime에서 테이블 제거가 필요한 경우 (필요시 사용)
-- ALTER PUBLICATION supabase_realtime DROP TABLE contacts;


