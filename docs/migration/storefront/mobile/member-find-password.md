# 모바일 비밀번호 찾기 — 가입여부확인 (member/find_password)

## 원본 (legacy mobile)
- 파일: `mobile/member/find_password.html`
- 후속 POST 목적지: `mobile/member/user_certification.html`(회원존재 확인 `isMemberChk2` + 인증번호 발송 `authEmail`)
- PC 대응: `docs/migration/storefront/member/find-password.md`
- **PC와 흐름 차이**: PC는 이 화면에서 AJAX(`join_proc mode=findpassword`)로 OTP 발송 후 token/otp 확보. **모바일은 AJAX 없음** — email만 받아 `user_certification.html`로 단순 POST. 회원 확인·OTP 발송은 모바일 user_certification(server guard)이 담당. 따라서 이 단위는 **entity 재사용 없음**(폼 + client-state 네비게이션만).

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/member/login.html`의 "비밀번호 찾기" 링크 → `/member/find_password.html`(GET)
- 헤더: `div.appHeader.mt-0.bg-primary.text-light`(좌 goBack `ion-icon chevron-back-outline`, pageTitle "비밀번호 찾기", 우 빈칸)
- 본문: `#appCapsuleSub.mt-0` > `.login-form`
  - `.section.mt-2`: `<h1>비밀번호를 분실하셨나요?</h1>` + `<h4>가입한 회원아이디(이메일)를 입력해주세요.</h4>`
  - `.section.mt-2.mb-5`: `form[name=frm] method=POST action=user_certification.html`
    - `.form-group.boxed > .input-wrapper`: `input#m_id[name=m_id]` type=email, required, placeholder "가입한 회원아이디를 입력해 주세요." + `.clear-input`(ion-icon close-circle, base.js clear)
    - `.form-button-group`: `button[type=submit].btn.btn-primary.btn-block.btn-lg` "가입여부 확인"
- 검증: HTML5 required 외 없음(클라이언트 JS 없음)
- 제출: `POST user_certification.html`(m_id) — AJAX 아님. 회원 존재 여부·OTP 발송은 user_certification(후속 단위)
- 페이지 `<style>`: `#appCapsuleSub{padding-top:56px}`

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, mobile-web-app-capable
- title "비밀번호 찾기", description/keywords 빈값, Noto Sans KR link, favicon/manifest(레이아웃 제공)
- 앱셸: 인라인 커스텀 헤더(login과 유사 bg-primary goBack). **bottom_menu/sidebar 없음**(legacy 미포함) → page style로 `.appBottomMenu` 숨김
- base.js: goBack(history.back)·clear-input(입력 클리어) 재현

## 데이터 / API 계약
- **없음** — 이 화면은 폼 forward만. 회원확인/OTP 발송 계약은 모바일 user_certification 단위에서 도출.

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/find_password.html`
- 라우트: `app/m/member/find_password.html/page.tsx`(viewport/metadata)
- screen: `screens/mobile-member-find-password`(client) — 인라인 헤더 + login-form + email 폼. 제출 시 `sessionStorage['dg_mobile_pw_find']={m_id}` 저장 후 `/member/user_certification.html` 이동(legacy POST 대체, 후속 단위가 소비)
- 재사용: 없음(entity/mock 불필요)

## 보존할 legacy quirk
- 회원 존재 확인은 여기서 안 함(user_certification 책임)
- clear-input X 아이콘·goBack(base.js 동작 재현)
- bottom_menu/sidebar 없음

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 헤더(bg-primary goBack "비밀번호 찾기")
- [x] h1/h4 안내문·login-form 구조 일치
- [x] email 필드(required·placeholder)·clear-input·"가입여부 확인" 버튼
- [x] 제출 시 user_certification.html 이동(m_id 전달)
- [x] 페이지 style(padding-top:56px)·하단 네비 숨김
- [x] middleware rewrite + 데스크톱 폴백(PC find_password)
