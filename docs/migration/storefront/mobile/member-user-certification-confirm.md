# 모바일 비밀번호 찾기 — 인증번호 입력 (member/user_certification_confirm)

## 원본 (legacy mobile)
- 파일: `mobile/member/user_certification_confirm.html`
- 선행: `user_certification.html`(m_id/token POST). 후속: `find_password_reset.html`(m_id/token/auth_code POST, 새 비밀번호)
- 검증 처리: `mobile/member/user_certification_proc.php` `mode=authConfirm`
- 데이터: `src/classes/Member.php` `chkAuthConfirm`·`authComplete`
- **PC와 별도 계약**(모바일 `tbl_member_otp` chkAuthConfirm). 신규 계약.

## 화면·플로우 (legacy mobile 기준)
- 진입: `user_certification.html`에서 m_id/token POST. **서버 가드**: `token==""` → `msg("잘못된 접근입니다.")` + `go("user_certification.html")` + exit
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "비밀번호 찾기"
- 본문: `#appCapsuleSub.mt-0`(style padding-top:56px) > `.login-form`
  - `.section.mt-2`: `<h1>인증번호 입력</h1>` + `<h4>수신된 이메일의 인증번호를 입력해 주세요.</h4>`
  - `.section.mt-2.mb-5`: `form#formAuthConfirm` — hidden(token, m_id) + `.form-group.boxed`>`input#auth_code`(text, required, placeholder "") + clear-input + `button#btn_auth_confirm[type=button]` "확인"
- 제출: `#btn_auth_confirm` 클릭 **또는 Enter(keyCode 13)** → `auth_code` 빈값 alert "인증번호를 입력하세요." → AJAX `POST user_certification_proc.php {mode:authConfirm, auth_code, token, m_id}`
  - success `data.code=="ok"` → form action=`find_password_reset.html` + submit(→ 재설정, token/m_id/auth_code 전달)
  - `code!="ok"` → `alert(data.message)`
  - error → `alert("에러")`
- 페이지 `<style>`: `#appCapsuleSub{padding-top:56px}`. bottom_menu/sidebar 없음.

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000
- title "비밀번호 찾기", 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack·clear-input base.js 재현
- 진입 파라미터 m_id/token은 `sessionStorage['dg_mobile_pw_find']`(user_certification이 저장)

## 데이터 (legacy) — `user_certification_proc.php mode=authConfirm`
- `Member::chkAuthConfirm($m_id,$auth_code)` → row {token, otp}. `data.token==token && data.otp==auth_code` → `authComplete($m_id)` + `{code:"ok", message:"인증 성공"}`. 아니면 `{code:"error", message:"잘못된 인증번호 입니다. 다시 입력해 주세요."}`

## API 계약 (신규, 백엔드 전달)

### `POST /api/member/otp/verify` (authConfirm)
- 요청: `{ m_id: string, token: string, auth_code: string }`
- 응답: `{ code: "ok" | "error", message: string }`
- 성공: `{code:"ok", message:"인증 성공"}` (+ 백엔드는 `authComplete`로 인증완료 마킹)
- 실패: `{code:"error", message:"잘못된 인증번호 입니다. 다시 입력해 주세요."}`
- 백엔드: `tbl_member_otp` token·otp 대조, 성공 시 인증완료 상태 갱신. (legacy 응답의 token1/token2 debug 필드는 미사용 — 생략)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/user_certification_confirm.html`
- 라우트: `app/m/member/user_certification_confirm.html/page.tsx`(하단바 숨김 style)
- screen: `screens/mobile-member-user-certification-confirm`(client) — mount token 가드(빈값→alert+`/member/user_certification.html`), 확인/Enter→`postMemberOtpVerify({m_id,token,auth_code})`→code=="ok"면 `sessionStorage['dg_mobile_pw_find']={m_id,token,auth_code}` 저장 후 `/member/find_password_reset.html` 이동, 아니면 alert(message)
- entity: `entities/member-auth` `postMemberOtpVerify` (+ 타입 2종) 신규
- mock: `POST /api/member/otp/verify`(개발편의: auth_code "123456"→ok, 그 외 error)

## 보존할 legacy quirk
- 가드 실패 "잘못된 접근입니다." + user_certification 복귀
- auth_code 빈값 "인증번호를 입력하세요." / 실패 message / AJAX 오류 "에러"
- Enter(13) 제출도 동일 동작

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] token 가드(빈값→alert "잘못된 접근입니다."+user_certification 이동)
- [x] 헤더/h1 "인증번호 입력"/h4 안내
- [x] auth_code 필드(required)+clear-input+"확인" 버튼, Enter 제출
- [x] 검증: 빈값 alert / ok→find_password_reset 이동(token/m_id/auth_code) / error alert(message) / AJAX 오류 "에러"
- [x] 페이지 style·하단 네비 숨김
- [x] middleware rewrite + 데스크톱 폴백
- 승인 시 확인된 신규 계약(개발자 수용): `POST /api/member/otp/verify`(authConfirm, code/message). 착지점 find_password_reset은 후속 단위.
