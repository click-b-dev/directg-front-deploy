# 비밀번호 찾기 — 가입여부확인

## 원본
- 파일: `pc/member/find_password.html`
- 처리: `pc/member/join_proc.php` `mode=findpassword`
- 후속 POST 목적지: `pc/member/user_certification.html`
- 참조: `../legacy-project/docs/MEMBER-LIFECYCLE.md`

## 화면·플로우
- 진입 URL: `/member/find_password.html` (GET)
- `<title>`: `비밀번호 재설정`
- 본문:
  - 카드 제목: `비밀번호 찾기 - 가입여부확인`
  - 안내문: `가입한 회원아이디(이메일)을 입력하시면 임시비밀번호를 발급하여 메일로 보내드립니다.`
  - `form#passwordFrm` POST action `/member/join_proc.php`
    - hidden `mode=findpassword`
    - `input#email[name=email]` type=email, required, placeholder `가입한 아이디(이메일주소)를 입력해주세요`
    - submit 버튼 `확인`
  - legacy에는 숨김 `form#memberFrm`이 별도 존재하고 성공 시 `m_id`/`token`을 채운 뒤 `/member/user_certification.html`로 POST한다.
- 제출:
  - AJAX `POST /member/join_proc.php` form serialize
  - 성공(`error_code=="0"`) → `alert(data.msg)` → hidden form POST `/member/user_certification.html`
  - 실패(`error_code!="0"`) → legacy는 별도 alert 없음
  - AJAX error → `alert('비밀번호찾기 중 오류가 발생했습니다. ' + error)`

## Legacy 데이터·로직
- `Member::memberChk($email,"","")`
  - `error_code=="NOT_FOUND"` → `{ error_code:"1", msg:"일치하는 회원이 존재하지 않습니다." }`
- 존재 회원:
  - `Otp::getToken()`, `Otp::getOTP()`
  - `Mypage::setOtp($email,$token,$certificationCode)`
    - `tbl_otp` 기존 row 만료 시 delete 후 insert, 미만료면 update
    - `auth='0'`, `expire=DATE_ADD(NOW(), INTERVAL 1 HOUR)`
  - `email_findpassword.php` 템플릿의 `[certificationCode]`, `[m_id]` 치환
  - `DirectSendMail::sendMail(..., "password")`
  - 성공 → `{ error_code:"0", m_id:email, token, otp:certificationCode, msg:"인증번호가 전송되었습니다." }`
  - 메일 실패 → `{ error_code:"1", msg:"메일발송 실패" }`

## API 계약

### `POST /api/member/find-password`
- 요청:
  - `email: string`
- 응답(legacy JSON 형식 유지):
  - `error_code: string`
  - `msg: string`
  - `m_id?: string`
  - `token?: string`
  - `otp?: string`
- 성공:
  - `{ error_code:"0", m_id, token, otp, msg:"인증번호가 전송되었습니다." }`
- 실패 메시지 원문:
  - `일치하는 회원이 존재하지 않습니다.`
  - `메일발송 실패`
- 백엔드 책임:
  - 회원 존재 확인
  - OTP token/code 생성·저장
  - DirectSend 비밀번호 찾기 메일 발송
  - legacy 응답 필드 유지

## 타겟 매핑
- route: `app/(pc)/member/find_password.html/page.tsx`
- screen: `screens/member-find-password`
- entity: `entities/member-auth` `postMemberFindPassword`
- mock: `POST /api/member/find-password`
- 후속: `user_certification.html`, `find_password_reset.html`, `join_proc.php mode=authConfirm/resetpassword`

## Parity 체크리스트
- [x] URL·title·viewport·author 일치
- [x] 카드 제목·안내문·폼 필드·placeholder 일치
- [x] 성공 alert 후 `/member/user_certification.html` POST 이동 일치
- [x] 실패 응답 alert 없음 유지
- [x] AJAX error alert 접두 문구 일치
- [x] `main{min-height:450px}` page style 유지
