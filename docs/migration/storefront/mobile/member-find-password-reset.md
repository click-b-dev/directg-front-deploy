# 모바일 비밀번호 찾기 — 재설정 (member/find_password_reset)

## 원본 (legacy mobile)
- 파일: `mobile/member/find_password_reset.html`, 처리 `mobile/member/find_password_reset_proc.php`
- 선행: `user_certification_confirm.html`(m_id/token POST). 후속: `find_password_complete.html`(완료)
- 데이터: `src/classes/Member.php` `memberPwdReset`
- **PC와 별도 계약**(모바일 `memberPwdReset`, 필드 new_pwd). 신규 계약.

## 화면·플로우 (legacy mobile 기준)
- 진입: `user_certification_confirm.html`에서 m_id/token POST. **서버 가드**: `token==""` → `msg("잘못된 접근입니다.")` + `go("find_password.html")` + exit
- `<body class="bg-white dark-mode-active">` — **흰 배경**(다른 모바일 화면과 차이)
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "비밀번호 재설정"
- 본문: `#appCapsuleSub.mt-0`(style padding-top:56px) > `.login-form` > `.section.mt-2.mb-5`
  - `form#formReset action=find_password_reset_proc.php` — hidden(m_id, token)
    - `input#new_pwd`(password, required, placeholder "영문대/소문자, 숫자, 특수문자 중 2가지 이상 조합하세요", `bg-white text-dark`) + clear-input
    - `input#new_pwd_re`(password, required, placeholder "새 비밀번호 확인", `bg-white text-dark`) + clear-input
    - `button#btn_reset[type=button]` "확인"
- 검증(legacy, PC보다 단순 — 정규식 없음): new_pwd 빈값 → alert "변경할 비밀번호를 입력하세요." / new_pwd_re 빈값 → alert "새 비밀번호 확인을 입력하세요." / 불일치 → alert "변경할 비밀번호와 새 비밀번호 확인이 일치하지 않습니다."
- 제출: AJAX `POST find_password_reset_proc.php`(serialize) → `data.code=="ok"` → `location.href="find_password_complete.html"` / 아니면 `alert(data.message)` / error → `alert("에러")`
- 페이지 `<style>`: `#appCapsuleSub{padding-top:56px}`. bottom_menu/sidebar 없음.

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000
- title "비밀번호 재설정", **body bg-white**, 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack·clear-input base.js
- 진입 파라미터 m_id/token은 `sessionStorage['dg_mobile_pw_find']`(confirm이 저장)

## 데이터 (legacy) — `find_password_reset_proc.php`
- `Member::memberPwdReset($m_id,$new_pwd)` — 비밀번호 갱신. **token 재검증 없음**(가드는 페이지 진입 단만, legacy 그대로). 응답 `{code:"ok", message:"비밀번호 재설정이 완료되었습니다."}`(mode 분기 없음)

## API 계약 (신규, 백엔드 전달)

### `POST /api/member/password/reset` (memberPwdReset)
- 요청: `{ m_id: string, token: string, new_pwd: string, new_pwd_re: string }`
- 응답: `{ code: "ok" | string, message: string }`
- 성공: `{code:"ok", message:"비밀번호 재설정이 완료되었습니다."}`
- 백엔드: `tbl_member.m_pwd` 갱신(`memberPwdReset`). legacy는 OTP/token 재검증 없음(가드 부재) 그대로. 실패 시 code!="ok" + message.

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/find_password_reset.html`
- 라우트: `app/m/member/find_password_reset.html/page.tsx`(body bg-white + 하단바 숨김 style)
- screen: `screens/mobile-member-find-password-reset`(client) — token 가드(빈값→alert+`/member/find_password.html`), 확인→검증 3종→`postMemberPasswordReset({m_id,token,new_pwd,new_pwd_re})`→code=="ok"면 `/member/find_password_complete.html` 이동, 아니면 alert(message)
- entity: `entities/member-auth` `postMemberPasswordReset` (+ 타입 2종) 신규
- mock: `POST /api/member/password/reset`(→{code:"ok", message})

## 보존할 legacy quirk
- body bg-white(흰 배경)·입력 bg-white text-dark
- 가드 실패 "잘못된 접근입니다." + find_password 복귀
- 검증 정규식 없음(PC와 차이)·필드명 new_pwd/new_pwd_re
- proc token 재검증 없음
- AJAX 오류 alert "에러"

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] token 가드(빈값→alert "잘못된 접근입니다."+find_password 이동)
- [x] body bg-white·헤더·new_pwd/new_pwd_re(placeholder·bg-white text-dark)+clear-input+"확인"
- [x] 검증 3종(빈값/빈값/불일치) alert 문구·순서
- [x] ok→find_password_complete 이동 / 실패 alert(message) / AJAX 오류 "에러"
- [x] 페이지 style·하단 네비 숨김
- [x] middleware rewrite + 데스크톱 폴백
- 승인 시 확인된 신규 계약(개발자 수용): `POST /api/member/password/reset`(memberPwdReset, token 재검증 없음). body bg-white는 라우트 style로 재현. 착지점 complete는 후속 단위.
