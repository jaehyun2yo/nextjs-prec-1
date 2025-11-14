-- 모든 예약 일정 삭제 SQL
-- 주의: 이 스크립트는 모든 예약 데이터를 영구적으로 삭제합니다.
-- 실행 전에 반드시 백업을 확인하세요.

BEGIN;

-- 모든 예약 삭제
DELETE FROM visit_bookings;

-- 트랜잭션 확인
-- 문제가 없으면 COMMIT, 문제가 있으면 ROLLBACK
COMMIT;

-- 삭제된 데이터 확인
SELECT COUNT(*) as remaining_bookings FROM visit_bookings;

-- 삭제 전 예약 개수 확인 (참고용)
-- 실행 전에 이 쿼리로 현재 예약 개수를 확인할 수 있습니다:
-- SELECT COUNT(*) as current_bookings FROM visit_bookings;

