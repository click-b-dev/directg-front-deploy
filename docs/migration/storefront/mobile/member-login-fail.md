# 모바일 로그인 (login_fail 변형)

## 원본 (legacy mobile)
- 파일: `mobile/member/login_fail.html` (이름은 fail이나 실제 **카드형 로그인 페이지 변형**, title "로그인")
- PC 대응: `screens/member-login`(login.html). login_fail은 모바일 카드형 대체 화면
- SNS: `mobile/api/{naver,kakao,payco}/*_login.php` — PC `openSnsLoginPopup` 재사용

## ⚠️ legacy 버그 (verbatim 보존)
- JS가 `$("#btn_login").click`에 바인딩하나 로그인 버튼에 **`id="btn_login"`이 없음**(버튼은 `type=submit` class만) → **이메일 로그인 핸들러 전체가 dead**(m_id/m_pwd 검증·`login_proc.php` AJAX 미실행). 클릭 시 form(action 없음)이 self-submit → 페이지 재로드만. 이메일 로그인은 사실상 비동작.
  - 이관: 405 회피 위해 form onSubmit no-op(preventDefault). 이메일 로그인 비동작 유지(검증/alert 없음). **개발자 게이트 확인**.
- 카카오 팝업 창 이름 `login_naver`(복붙 버그, openSnsLoginPopup에 이미 반영)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/member/login_fail.html`(GET), title "로그인"
- 헤더: `appHeader.bg-primary.text-light` goBack + "로그인"
- 본문: `#appCapsuleSub.full-height`
  - 카드 `#email_login` "기존회원 로그인": `form#loginFrm`(POST) — m_id(email req, placeholder "가입한 이메일주소를 입력해주세요.") + m_pwd(password req, placeholder "비밀번호를 입력해 주세요") + "비밀번호를 잃어버렸다면? 비밀번호 재설정"(`/member/find_password.html`) + 로그인 버튼(submit) + "다이렉트 게임즈 계정이 없다면? 회원가입"(`/member/join_step1.html`)
  - 카드 `#sns_login` "간편로그인": naver/kakao/payco 풀버튼(icon_*.png + "NAVER/KAKAO/PAYCO 로그인", 페이지 style bg색 naver #1EC800·kakao #FFE500·payco #FF2233)
  - bottom_menu + sidebar 포함(하단 네비 표시)
- 이메일 로그인: **dead 핸들러**(위 버그) → no-op
- SNS: 버튼 클릭 → AJAX 팝업(openSnsLoginPopup 재사용)
- 페이지 `<style>`: SNS 버튼 bg색·img float

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000
- title "로그인", Noto Sans KR, 인라인 bg-primary 헤더, bottom_menu 표시(숨김 아님). goBack base.js
- SNS 아이콘 `/mobile-assets/images/member/icon_{naver,kakao,payco}.png`(복사 완료)

## 데이터 / API 계약
- SNS: `entities/member-auth` `openSnsLoginPopup`/`postSnsLoginUrl` **재사용**(`POST /api/member/sns/:provider/login-url`)
- 이메일 로그인: dead(계약 없음). **증분 없음**

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/login_fail.html`
- 라우트: `app/m/member/login_fail.html/page.tsx`(title "로그인")
- screen: `screens/mobile-member-login-fail`(client) — 인라인 헤더 + 2카드 + 페이지 style. 이메일 form onSubmit no-op(dead 버그), SNS `openSnsLoginPopup`
- 재사용: `entities/member-auth`, SNS icon png(복사분)
- mock: 기존 SNS login-url

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 헤더(bg-primary goBack "로그인") + full-height
- [x] 이메일 카드(필드/placeholder/링크 2종) — 이메일 로그인 dead(no-op) 유지
- [x] SNS 카드(3종 풀버튼+bg색+icon) 팝업 동작
- [x] 비밀번호 재설정/회원가입 링크
- [x] 페이지 style(SNS 색)·하단 네비 표시
- [x] middleware rewrite + 데스크톱 폴백
- 승인 시 확인된 이탈(개발자 수용): 이메일 로그인 dead 핸들러(`#btn_login` 선택자 버그) 보존 — legacy self-submit 재로드 대신 no-op(결과 동일). SNS openSnsLoginPopup 재사용.
