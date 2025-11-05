# Cloudflare Email Routing 설정 가이드

## 개요
Cloudflare Email Routing을 사용하여 `service@yjlaser.net`으로 오는 모든 이메일을 `yjlaserbusiness@gmail.com`으로 자동 전달합니다.

## 설정 방법

### 1. Cloudflare 대시보드 접속
1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. `yjlaser.net` 도메인 선택

### 2. Email Routing 활성화
1. 좌측 메뉴에서 **Email** → **Email Routing** 선택
2. **Get started** 또는 **Enable Email Routing** 클릭

### 3. 받는 주소 설정 (Destination Address)
1. **Destination addresses** 탭에서 **Create address** 클릭
2. `yjlaserbusiness@gmail.com` 입력
3. Gmail에서 확인 이메일 발송 → 확인 링크 클릭하여 인증

### 4. 발신 주소 설정 (Custom Address)
1. **Routing rules** 탭에서 **Create address** 클릭
2. **Custom address** 선택
3. 입력:
   - **Address**: `service`
   - **Send to**: `yjlaserbusiness@gmail.com`
4. **Save** 클릭

### 5. DNS 레코드 확인
Cloudflare가 자동으로 다음 MX 레코드를 추가합니다:
```
Type: MX
Name: @ (또는 yjlaser.net)
Priority: 10
Target: route1.mx.cloudflare.net
```

```
Type: MX
Name: @ (또는 yjlaser.net)
Priority: 50
Target: route2.mx.cloudflare.net
```

### 6. 동작 확인
- 테스트 이메일을 `service@yjlaser.net`으로 보내기
- `yjlaserbusiness@gmail.com`으로 전달되는지 확인

## 환경 변수 설정

`.env.local` 파일:
```env
# SMTP 설정 (이메일 발송용)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yjlaserbusiness@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# 이메일 주소 설정
FROM_NAME=웹사이트 문의                  # 보낸 사람 이름
ADMIN_EMAIL=yjlaserbusiness@gmail.com   # 관리자 수신 이메일
REPLY_TO_EMAIL=service@yjlaser.net      # 답장 주소 (회사 공식 이메일, 기본값)
```

## 이메일 처리 방식

문의하기 폼에서 이메일을 전송할 때:

1. **보낸 사람 (`from`)**: `SMTP_USER` (SMTP 인증 계정과 동일)
   - Gmail 중복 제거 방지: Gmail은 SMTP 인증 계정과 받는 사람이 같으면 `from`이 달라도 중복 제거할 수 있습니다
   - 따라서 `from`을 SMTP 인증 계정과 동일하게 설정하여 Gmail이 정상적으로 수신하도록 합니다

2. **받는 사람 (`to`)**: `ADMIN_EMAIL` (기본값: `yjlaserbusiness@gmail.com`)
   - 관리자가 실제로 이메일을 받는 주소입니다

3. **답장 주소 (`replyTo`)**: `REPLY_TO_EMAIL` + 문의자 이메일
   - 관리자가 "답장" 버튼을 누르면 두 주소 중 선택하여 답장할 수 있습니다
   - 회사 공식 이메일(`service@yjlaser.net`)로 답장하면 Cloudflare Email Routing을 통해 처리됩니다
   - 문의자 이메일로 답장하면 문의자에게 직접 답장할 수 있습니다

4. **참고**: Cloudflare Email Routing은 외부 클라이언트가 `service@yjlaser.net`으로 보낼 때만 포워딩됩니다
   - SMTP를 직접 사용하는 경우는 `from`을 SMTP 인증 계정과 동일하게 설정해야 합니다

## 작동 방식

1. 웹사이트에서 문의 폼 제출
2. 코드에서 이메일 발송:
   - `from`: `SMTP_USER` (Gmail 계정, 중복 제거 방지)
   - `to`: `yjlaserbusiness@gmail.com` (관리자 이메일)
   - `replyTo`: `service@yjlaser.net` + 문의자 이메일
3. SMTP를 통해 Gmail 계정(`SMTP_USER`)으로 인증하여 이메일 전송
4. 관리자(`ADMIN_EMAIL`)가 이메일 수신
5. 관리자가 "답장"을 누르면:
   - 회사 공식 이메일(`service@yjlaser.net`)로 답장 가능 (Cloudflare Email Routing 사용)
   - 문의자 이메일로 직접 답장 가능

## Gmail 중복 제거 문제 해결

Gmail은 SMTP 인증 계정과 받는 사람이 같은 경우, `from` 필드가 달라도 자가 메일로 인식하여 중복 제거할 수 있습니다.

**해결 방법**: `from` 필드를 SMTP 인증 계정(`SMTP_USER`)과 동일하게 설정합니다.

이렇게 하면:
- Gmail이 이메일을 정상적으로 수신합니다
- 이메일이 중복 제거되지 않습니다
- `replyTo` 필드를 통해 회사 공식 이메일로 답장할 수 있습니다

## Cloudflare Email Routing 경고 해결

Cloudflare에서 다음과 같은 경고를 받을 수 있습니다:

> "Are you missing an email sent from yjlaserbusiness@gmail.com to service@yjlaser.net?"

### 경고 원인

이 경고는 다음과 같은 경우에 발생합니다:

1. **Cloudflare Email Routing 테스트 이메일**
   - Cloudflare 대시보드에서 테스트 이메일을 `yjlaserbusiness@gmail.com`에서 `service@yjlaser.net`으로 보낸 경우
   - 같은 계정에서 보낸 이메일은 Gmail이 중복 제거할 수 있음

2. **환경 변수 설정 문제**
   - `ADMIN_EMAIL=service@yjlaser.net`으로 설정된 경우
   - 코드에서는 `yjlaserbusiness@gmail.com`을 직접 사용하는 것이 권장됨

### 해결 방법

1. **Cloudflare 테스트 이메일**: 다른 이메일 주소(예: 다른 Gmail 계정)에서 테스트 이메일 보내기

2. **환경 변수 설정 확인**:
   ```env
   # ✅ 권장 설정
   ADMIN_EMAIL=yjlaserbusiness@gmail.com   # 직접 수신 주소 사용
   
   # ❌ 피해야 할 설정
   # ADMIN_EMAIL=service@yjlaser.net       # 이렇게 설정하면 Gmail 중복 제거 발생 가능
   ```

3. **현재 코드 동작**:
   - `to`: `ADMIN_EMAIL` (직접 수신 주소, 예: `yjlaserbusiness@gmail.com`)
   - `from`: `SMTP_USER` (SMTP 인증 계정, 예: `yjlaserbusiness@gmail.com`)
   - `replyTo`: `service@yjlaser.net` + 문의자 이메일
   - 이렇게 설정하면 Gmail 중복 제거 문제가 발생하지 않습니다

### 경고가 계속 나오는 경우

코드가 올바르게 설정되어 있다면, 경고는 Cloudflare Email Routing 테스트에서 나온 것일 수 있습니다. 
실제 웹사이트 문의 폼에서는 문제가 없으므로 무시해도 됩니다.

## 참고사항

- **무료**: Cloudflare Email Routing은 무료입니다
- **즉시 적용**: 설정 후 몇 분 내로 동작 시작
- **SPF/DKIM**: Cloudflare가 자동으로 관리
- **전송 제한**: 일일 1,000개 (무료 플랜 기준)

## 문제 해결

### 이메일이 전달되지 않는 경우
1. DNS 레코드 확인 (MX 레코드가 올바르게 설정되었는지)
2. Destination address 인증 확인
3. Gmail 스팸 폴더 확인
4. Cloudflare 대시보드에서 Email Routing 로그 확인

