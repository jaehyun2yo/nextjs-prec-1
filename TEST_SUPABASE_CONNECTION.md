# Supabase 연결 및 테이블 구조 확인 가이드

## 1. Supabase 테이블 구조 확인

Supabase SQL Editor에서 다음 쿼리를 실행하여 현재 테이블 구조를 확인하세요:

```sql
-- 현재 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
```

## 2. 필수 컬럼 추가

다음 SQL을 실행하여 누락된 컬럼을 추가하세요:

```sql
-- contacts 테이블 완전 수정 스크립트
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS contact_type TEXT,
ADD COLUMN IF NOT EXISTS service_mold_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS service_delivery_brokerage BOOLEAN DEFAULT FALSE;

-- 기존 데이터 업데이트
UPDATE contacts 
SET contact_type = 'company' 
WHERE contact_type IS NULL;

UPDATE contacts 
SET service_mold_request = FALSE 
WHERE service_mold_request IS NULL;

UPDATE contacts 
SET service_delivery_brokerage = FALSE 
WHERE service_delivery_brokerage IS NULL;
```

## 3. 테이블 구조 확인

다음은 contacts 테이블에 있어야 하는 모든 컬럼입니다:

### 연락처 정보
- `id` (BIGSERIAL PRIMARY KEY)
- `company_name` (TEXT NOT NULL)
- `name` (TEXT NOT NULL)
- `position` (TEXT NOT NULL)
- `phone` (TEXT NOT NULL)
- `email` (TEXT NOT NULL)
- `contact_type` (TEXT) ⭐ 추가 필요
- `service_mold_request` (BOOLEAN DEFAULT FALSE) ⭐ 추가 필요
- `service_delivery_brokerage` (BOOLEAN DEFAULT FALSE) ⭐ 추가 필요

### 도면 및 샘플 정보
- `drawing_type` (TEXT)
- `has_physical_sample` (BOOLEAN DEFAULT FALSE)
- `has_reference_photos` (BOOLEAN DEFAULT FALSE)
- `drawing_modification` (TEXT)
- `box_shape` (TEXT)
- `length` (TEXT)
- `width` (TEXT)
- `height` (TEXT)
- `material` (TEXT)
- `drawing_notes` (TEXT)
- `sample_notes` (TEXT)

### 일정 조율 정보
- `receipt_method` (TEXT)
- `visit_date` (TEXT)
- `visit_time_slot` (TEXT)
- `delivery_type` (TEXT)
- `delivery_address` (TEXT)
- `delivery_name` (TEXT)
- `delivery_phone` (TEXT)

### 기타
- `attachment_filename` (TEXT)
- `status` (TEXT DEFAULT 'new')
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE DEFAULT NOW())

## 4. 데이터 확인

테이블에 데이터가 있는지 확인:

```sql
-- 전체 데이터 개수 확인
SELECT COUNT(*) as total_count FROM contacts;

-- 최근 데이터 확인 (최대 5개)
SELECT 
    id,
    company_name,
    name,
    email,
    contact_type,
    service_mold_request,
    service_delivery_brokerage,
    status,
    created_at
FROM contacts
ORDER BY created_at DESC
LIMIT 5;
```

## 5. 문제 해결

### 문제: "column does not exist" 에러
- `supabase_contacts_table_fix.sql` 파일의 SQL을 실행하여 누락된 컬럼을 추가하세요.

### 문제: 데이터가 저장되지 않음
- 서버 로그에서 `[CONTACT] Database insert error:` 메시지를 확인하세요.
- 에러 메시지의 `hint`와 `details`를 확인하세요.

### 문제: 관리자 페이지에 데이터가 표시되지 않음
- 브라우저 콘솔에서 `[ADMIN CONTACTS]` 로그를 확인하세요.
- Supabase에서 직접 데이터가 있는지 확인하세요.

## 6. 테스트

1. 문의하기 폼 제출
2. 서버 로그에서 `[CONTACT] ✅ Contact saved to database successfully` 메시지 확인
3. Supabase에서 데이터 확인
4. 관리자 페이지에서 데이터 표시 확인

