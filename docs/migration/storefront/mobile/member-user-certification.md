# 모바일 비밀번호 찾기 — 인증번호 발송 (member/user_certification)

## 원본 (legacy mobile)
- 파일: `mobile/member/user_certification.html`
- 선행: `find_password.html`(m_id POST). 후속: `user_certification_confirm.html`(m_id/token POST, 인증번호 입력·검증)
- OTP 발송 처리: `mobile/member/directsend_mail_api.php` `mode=authEmail`
- 데이터: `src/classes/Member.php` `isMemberChk2`(L101)·`getMemberOtp`/`setMemberOtp`/`updateMemberOtp`/`deleteMemberOtp`, `Otp`
- **PC 비번찾기와 별도 계약**: 모바일은 `isMemberChk2`(status='0' 활성 회원) 가드 + directsend `authEmail`(OTP 생성/갱신+메일)·`tbl_member_otp` 사용. PC의 join_proc(mode=findpassword/authConfirm) 계약과 다름 → **신규 계약**.

## 화면·플로우 (legacy mobile 기준)
- 진입: `find_password.html`에서 m_id POST. **서버 가드**: `isMemberChk2(m_id)!="OK"`(미가입/비활성) → `msg("일치하는 회원이 존재하지 않습니다.")` + `go("find_password.html")` + exit
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "비밀번호 찾기"
- 본문: `#appCapsuleSub.mt-0`(style padding-top:56px) > `.login-form`
  - `.section.mt-2`: `<h1>인증번호 발송</h1>` + `<h4>이메일(<m_id>)로 인증번호가 발송됩니다.</h4>`
  - `.section.mt-2.mb-5`: `form#formAuth POST action=user_certification_confirm.html` — hidden(mode=authEmail, authType=authEmail, m_id, token="", gubun=password) + `button#btn_auth[type=button]` "인증번호 받기"
- 제출: `#btn_auth` 클릭 → AJAX `POST directsend_mail_api.php`(formAuth serialize) → success `alert(data.msg)` + `#token=data.token` + `formAuth.submit()`(→ user_certification_confirm.html) / error `alert("에러")`
- 페이지 `<style>`: `#appCapsuleSub{padding-top:56px}`. bottom_menu/sidebar 없음.

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, mobile-web-app-capable
- title "비밀번호 찾기", 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 style 숨김. goBack base.js
- 진입 파라미터 m_id는 find_password가 `sessionStorage['dg_mobile_pw_find']={m_id}`로 전달

## 데이터 (legacy)
- `Member::isMemberChk2($m_id)` — `SELECT m_id FROM tbl_member WHERE m_id=:m_id AND status='0'` → "OK"/"NO MEMBER"
- directsend `authEmail`: `getMemberOtp(m_id)` → expire 지났으면 `deleteMemberOtp`+`setMemberOtp`(신규), 아니면 `updateMemberOtp`(otp/token/expire +1h 갱신). `tbl_member_otp`. `Otp::getOTP()`/`getToken()`. 메일 발송(DirectSend). 응답 `{msg, token}`

## API 계약 (신규, 백엔드 전달)

### `GET /api/member/exists?m_id=<email>` (isMemberChk2)
- 응답: `{ exists: boolean }` (legacy "OK"→true / "NO MEMBER"→false. status='0' 활성 회원만)
- 백엔드: `SELECT m_id FROM tbl_member WHERE m_id=:m_id AND status='0'`

### `POST /api/member/otp/send` (directsend authEmail)
- 요청: `{ m_id: string, gubun: string }` (gubun="password")
- 응답: `{ msg: string, token: string }` (msg=발송 안내, token=생성/갱신된 OTP 토큰)
- 백엔드: `tbl_member_otp` OTP 생성(만료 시 재생성)/갱신(expire +1h) + DirectSend 인증메일 발송. token 반환. legacy 응답 형식 유지.

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/user_certification.html`
- 라우트: `app/m/member/user_certification.html/page.tsx`(하단바 숨김 style)
- screen: `screens/mobile-member-user-certification`(client) — mount 시 `getMemberExists(m_id)` 가드(미존재→alert+`/member/find_password.html`), "인증번호 받기" 클릭→`postMemberOtpSend({m_id,gubun:"password"})`→alert(msg)+`sessionStorage['dg_mobile_pw_find']={m_id,token,gubun}` 저장→`/member/user_certification_confirm.html` 이동
- entity: `entities/member-auth` `getMemberExists`·`postMemberOtpSend` (+ 타입 2종) 신규
- mock: `GET /api/member/exists`(개발편의: "missing@directg.net"→false), `POST /api/member/otp/send`(→{msg,token})

## 보존할 legacy quirk
- 회원 가드 실패 문구 "일치하는 회원이 존재하지 않습니다." + find_password로 복귀
- AJAX 오류 시 alert "에러"
- gubun=password 고정, token 빈값으로 시작→발송 후 세팅

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 진입 가드(미존재→alert "일치하는 회원이 존재하지 않습니다."+find_password 이동)
- [x] 헤더/h1 "인증번호 발송"/h4 이메일 안내(m_id)
- [x] "인증번호 받기" → OTP 발송 → alert(msg) → token 담아 confirm 이동
- [x] AJAX 오류 alert "에러"
- [x] 페이지 style·하단 네비 숨김
- [x] middleware rewrite + 데스크톱 폴백(현재 PC user_certification은 별도 흐름)
- 승인 시 확인된 신규 계약(개발자 수용): `GET /api/member/exists`·`POST /api/member/otp/send`(모바일 비번찾기 별도 흐름, PC join_proc과 다름). 착지점 confirm은 후속 단위.
