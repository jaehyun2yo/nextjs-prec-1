# GitHub 커밋 및 업로드 가이드

## 한글 커밋 메시지 정상 저장을 위한 설정

### 1. Git 인코딩 설정 (최초 1회만 실행)

```bash
# 한글 경로 및 파일명 정상 표시
git config --global core.quotepath false

# 커밋 메시지 인코딩을 UTF-8로 설정
git config --global i18n.commitencoding utf-8

# 로그 출력 인코딩을 UTF-8로 설정
git config --global i18n.logoutputencoding utf-8
```

### 2. 커밋 메시지 작성 방법

#### 방법 1: 파일을 사용한 커밋 (권장)

1. `commit_message.txt` 파일 생성
2. 한글로 커밋 메시지 작성
3. 파일을 사용하여 커밋

```bash
# 파일 생성 후 커밋
git commit -F commit_message.txt

# 또는 amend 사용
git commit --amend -F commit_message.txt

# 파일 삭제
rm commit_message.txt
```

#### 방법 2: 직접 커밋 (PowerShell에서 한글 깨짐 가능)

```bash
git commit -m "feat: 기능 설명"
```

**주의**: Windows PowerShell에서는 한글이 깨질 수 있으므로 방법 1을 권장합니다.

### 3. 커밋 및 푸시 절차

```bash
# 1. 변경사항 확인
git status

# 2. 변경사항 스테이징
git add .

# 3. 커밋 메시지 파일 생성 (한글 작성)
# commit_message.txt 파일에 커밋 메시지 작성

# 4. 커밋
git commit -F commit_message.txt

# 5. GitHub에 푸시
git push origin master

# 6. 임시 파일 삭제
rm commit_message.txt
```

### 4. 커밋 메시지 작성 규칙

#### 커밋 타입
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등

#### 커밋 메시지 예시

```
feat: 납품업체 관리 기능 추가 및 UI 개선

- 납품업체 저장 후 폼 데이터 유지 기능 추가
- 문의 전송 확인 모달 스타일 개선 (버튼 가운데 정렬, 구분선 제거, 여백 조정)
- 성공 모달 체크 표시 애니메이션 추가
- StepIndicator 진행 바 차오르는 애니메이션 개선
- 납품업체 섹션 아이콘을 트럭 아이콘으로 변경
- 진행 바 애니메이션 재생 방지 로직 추가
- 납품업체 관리 API 및 데이터베이스 스키마 추가
```

### 5. 커밋 메시지 수정 (이미 푸시한 경우)

```bash
# 1. 커밋 메시지 파일 생성
# commit_message.txt 파일에 수정할 메시지 작성

# 2. 마지막 커밋 메시지 수정
git commit --amend -F commit_message.txt

# 3. 강제 푸시 (주의: 협업 시 팀원과 상의 필요)
git push origin master --force

# 4. 임시 파일 삭제
rm commit_message.txt
```

### 6. 커밋 메시지 확인

```bash
# 마지막 커밋 메시지 확인
git log -1 --pretty=format:"%s" --encoding=UTF-8

# 전체 커밋 히스토리 확인
git log --encoding=UTF-8
```

### 7. 주의사항

1. **한글 깨짐 방지**: 항상 파일을 사용하여 커밋 메시지를 작성하세요.
2. **Force Push 주의**: 이미 푸시한 커밋을 수정할 때는 `--force` 옵션을 사용하지만, 협업 시 팀원과 상의가 필요합니다.
3. **임시 파일 정리**: 커밋 후 `commit_message.txt` 파일은 반드시 삭제하세요.
4. **ESLint 오류**: 커밋 전에 ESLint 오류를 수정하거나 `--no-verify` 옵션을 사용할 수 있습니다 (권장하지 않음).

### 8. 빠른 커밋 스크립트 (선택사항)

Windows에서 사용할 수 있는 간단한 배치 스크립트:

```batch
@echo off
chcp 65001 >nul
echo 커밋 메시지를 입력하세요 (여러 줄 입력 가능, 빈 줄 입력 시 종료):
(
echo.
) > commit_message.txt
:input
set /p line=
if "%line%"=="" goto commit
echo %line% >> commit_message.txt
goto input
:commit
git commit -F commit_message.txt
del commit_message.txt
```

### 9. 문제 해결

#### 한글이 여전히 깨지는 경우

1. Git 설정 확인:
   ```bash
   git config --global --list | grep encoding
   ```

2. PowerShell 인코딩 설정:
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   ```

3. 파일 인코딩 확인: `commit_message.txt` 파일이 UTF-8로 저장되었는지 확인

#### 커밋이 거부되는 경우 (ESLint 오류)

```bash
# ESLint 오류 무시하고 커밋 (권장하지 않음)
git commit --no-verify -F commit_message.txt
```

---

**마지막 업데이트**: 2025-11-13


