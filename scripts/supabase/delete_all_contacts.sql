-- 모든 문의 삭제 SQL
-- 주의: 이 스크립트는 모든 문의 데이터를 영구적으로 삭제합니다.
-- 실행 전에 반드시 백업을 확인하세요.

BEGIN;

-- 1. 관련 예약 먼저 삭제 (CASCADE가 설정되어 있어도 명시적으로 삭제)
DELETE FROM visit_bookings;

-- 2. 모든 문의 삭제
DELETE FROM contacts;

-- 트랜잭션 확인
-- 문제가 없으면 COMMIT, 문제가 있으면 ROLLBACK
COMMIT;

-- 삭제된 데이터 확인
SELECT COUNT(*) as remaining_contacts FROM contacts;
SELECT COUNT(*) as remaining_bookings FROM visit_bookings;

