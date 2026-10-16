# 모바일 비밀번호 찾기 — 재설정 완료 (member/find_password_complete)

## 원본 (legacy mobile)
- 파일: `mobile/member/find_password_complete.html`
- 선행: `find_password_reset.html`(재설정 성공 시 `location.href="find_password_complete.html"`)
- **완전 정적**(가드/AJAX/entity 없음. m_id POST 받으나 미사용)

## 화면·플로우 (legacy mobile 기준)
- 진입: `find_password_reset.html` 성공 후 이동(GET). 가드 없음
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "비밀번호 재설정"
- 본문: `#appCapsuleSub.mt-0`(style padding-top:56px) > `.login-form`
  - `.section.mt-2`: `<h4>비밀번호 재설정이 완료되었습니다.</h4>`
  - `.section.mt-2.mb-5`: `.form-button-group` > `<a href="login.html" class="btn btn-primary btn-block btn-lg">로그인</a>`
- 인터랙션: goBack(base.js)만. 로그인 버튼은 `login.html` 링크
- 페이지 `<style>`: `#appCapsuleSub{padding-top:56px}`. bottom_menu/sidebar 없음.

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000
- title "비밀번호 재설정", 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack base.js
- 로그인 링크는 `/member/login.html`

## 데이터 / API 계약
- **없음**(정적). entity/mock 불필요.

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/find_password_complete.html`
- 라우트: `app/m/member/find_password_complete.html/page.tsx`(하단바 숨김 style)
- screen: `screens/mobile-member-find-password-complete`(client — goBack 위해) — 헤더+완료 안내+로그인 버튼(`/member/login.html`)
- 재사용: 없음

## 보존할 legacy quirk
- 가드 없음(정적)·goBack(base.js)·로그인 링크 login.html

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 헤더(bg-primary goBack "비밀번호 재설정")
- [x] h4 "비밀번호 재설정이 완료되었습니다."
- [x] "로그인" 버튼 → /member/login.html
- [x] 페이지 style(padding-top:56px)·하단 네비 숨김
- [x] middleware rewrite + 데스크톱 폴백
