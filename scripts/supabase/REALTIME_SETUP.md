# Supabase Realtime 활성화 가이드

## 방법 1: SQL Editor 사용 (권장)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - `New query` 버튼 클릭

3. **Realtime 활성화 SQL 실행**
   - `scripts/supabase/enable_realtime.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - `Run` 버튼 클릭 (또는 `Ctrl + Enter`)

4. **확인**
   - 쿼리 결과에서 `contacts` 테이블이 `supabase_realtime` publication에 추가되었는지 확인

## 방법 2: Database > Replication 메뉴 사용

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **Database > Replication 메뉴**
   - 왼쪽 메뉴에서 `Database` 클릭
   - `Replication` 탭 클릭

3. **테이블 활성화**
   - `contacts` 테이블 찾기
   - 토글 스위치를 켜서 활성화

## 확인 방법

### SQL로 확인
```sql
-- 현재 Realtime에 등록된 테이블 확인
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

### 브라우저 콘솔에서 확인
업체 대시보드 페이지를 열고 브라우저 개발자 도구(F12)의 콘솔 탭에서:
- `Subscribed to contacts changes` 메시지가 보이면 성공
- `Channel error, falling back to polling` 메시지가 보이면 Realtime이 비활성화된 상태

## 문제 해결

### Realtime이 작동하지 않는 경우

1. **Publication 확인**
   ```sql
   SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
   ```

2. **테이블이 publication에 추가되었는지 확인**
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'contacts';
   ```

3. **RLS (Row Level Security) 확인**
   - RLS가 활성화되어 있으면 적절한 정책이 필요할 수 있습니다
   - 현재 코드는 RLS를 사용하지 않으므로 문제없어야 합니다

4. **폴링 백업**
   - Realtime이 작동하지 않아도 30초마다 자동으로 데이터가 새로고침됩니다
   - 이는 백업 메커니즘으로 작동합니다

## 참고사항

- Realtime은 INSERT, UPDATE, DELETE 이벤트를 실시간으로 전송합니다
- 필터링은 클라이언트 측에서 수행됩니다 (`company_name` 기준)
- Realtime이 활성화되면 변경사항이 즉시 반영됩니다 (보통 1-2초 이내)
- Realtime이 비활성화되어 있으면 30초 폴링이 백업으로 작동합니다


