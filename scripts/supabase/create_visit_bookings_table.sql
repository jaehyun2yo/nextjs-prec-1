-- visit_bookings 테이블 생성 SQL
-- 일정 조율 예약 관리 테이블
-- Supabase SQL Editor에서 실행하세요

-- 기존 테이블이 있다면 삭제 (주의: 데이터가 모두 삭제됩니다)
DROP TABLE IF EXISTS visit_bookings CASCADE;

-- visit_bookings 테이블 생성
CREATE TABLE visit_bookings (
  id BIGSERIAL PRIMARY KEY,
  
  -- 예약 정보
  visit_date DATE NOT NULL,
  visit_time_slot TEXT NOT NULL, -- 예: "9:00~10:00"
  company_name TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- 예약 상태
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled
  notes TEXT,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT, -- 예약 생성자 (admin 또는 company)
  
  -- 중복 예약 방지: 같은 날짜, 시간, 업체명 조합은 유일해야 함
  UNIQUE(visit_date, visit_time_slot, company_name, contact_id)
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_visit_bookings_date ON visit_bookings(visit_date);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_time_slot ON visit_bookings(visit_time_slot);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_company_name ON visit_bookings(company_name);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_contact_id ON visit_bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_status ON visit_bookings(status);
CREATE INDEX IF NOT EXISTS idx_visit_bookings_date_time ON visit_bookings(visit_date, visit_time_slot);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_visit_bookings_updated_at ON visit_bookings;
CREATE TRIGGER update_visit_bookings_updated_at
  BEFORE UPDATE ON visit_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 예약 가능 여부 확인 함수 (타임당 최대 2건)
CREATE OR REPLACE FUNCTION check_booking_availability(
  p_visit_date DATE,
  p_visit_time_slot TEXT
)
RETURNS INTEGER AS $$
DECLARE
  booking_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO booking_count
  FROM visit_bookings
  WHERE visit_date = p_visit_date
    AND visit_time_slot = p_visit_time_slot
    AND status = 'confirmed';
  
  RETURN booking_count;
END;
$$ LANGUAGE plpgsql;

-- 예약 가능 여부 확인 (2건 미만이면 예약 가능)
CREATE OR REPLACE FUNCTION is_booking_available(
  p_visit_date DATE,
  p_visit_time_slot TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  booking_count INTEGER;
BEGIN
  SELECT check_booking_availability(p_visit_date, p_visit_time_slot) INTO booking_count;
  RETURN booking_count < 2;
END;
$$ LANGUAGE plpgsql;

