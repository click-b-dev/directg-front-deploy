# 모바일 로그인 (member/login)

## 원본 (legacy mobile)
- 파일: `mobile/member/login.html`, 처리 `mobile/member/login_proc.php`(= PC와 동일 계약)
- PC 대응 단위: `docs/migration/storefront/member/login.md`(`screens/member-login`, `entities/member-auth`)
- SNS: `mobile/api/{naver,kakao,payco}/*_login.php`
- **entity/계약 전부 PC 재사용**(로그인·SNS·세션·hCaptcha 계약 동일)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/member/login.html`(GET, 모바일 UA)
- **return_url 로직(PC와 차이)**: `HTTP_REFERER`가 `https://m.directg.net` 포함 시 referer, 아니면 "/". 단 referer에 `/member/login.html` 포함 시 "/". + `sessionStorage.LastUrl` 미설정 시 return_url로 초기화(모바일 전용)
- 헤더: **커스텀** `div.appHeader.bg-cprimary.text-light`(좌 goBack `ion-icon chevron-back-outline`, pageTitle "로그인", 우 빈칸) — MobileSubHeader/SimpleSubHeader와 다른 변형 → 인라인
- 본문: `#appCapsuleSub.full-height > .section` > `.login_form.text-center`
  - "기존회원 로그인"(fs-19)
  - `form#loginFrm`(method POST): hidden `return_url` + `input#m_id`(email, required, placeholder "아이디(이메일)", autocomplete off, bg-clight fs-13) + `input#m_pwd`(password, required, placeholder "비밀번호") + `#hcaptcha-container` + `button#btn_login.btn-cprimary`("로그인")
  - 링크: 비밀번호 찾기(`/member/find_password.html`)·`bar`·회원가입(`/member/join_step1.html`) (fs-13 text-csecondary)
  - `bar_horizon` 구분선
  - "간편로그인"(fs-16) + `.sns-login`: 네이버/카카오/페이코(svg + fs-12 라벨) + "휴대폰간편로그인/로그인플러스유료서비스광고AD"(`safelogin.kr` target _blank, btn-outline-cprimary)
  - bottom_menu + sidebar(layout chrome)
- 폼 검증(legacy 그대로): m_id 빈값 → alert "아이디를 입력해주세요." / m_pwd 빈값 → alert "비밀번호를 입력해주세요." / 통과 시 `runCaptcha()` → `onCaptchaSuccess(token)`
- 제출: `POST login_proc.php`(JSON) `{m_id, m_pwd, return_url, 'h-captcha-response': token}` → 성공(`error_code=="0" || error_msg=="OK"`) `location.href = return_url||"/"` / 실패 `alert(error_msg)` + `hcaptcha.reset` / error `alert("로그인 처리 중 오류가 발생했습니다.")` + reset
- SNS: 버튼 클릭 → `POST /api/{provider}/{provider}_login.php {mode}` → 응답 URL → `window.open` 팝업(치수 legacy). 콜백→`join_naver/kakao/payco()`→`join_step2.html`는 **후속(가입 단위)**

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, apple-web-app
- title "로그인", description/keywords 빈값, **canonical `https://directg.net/member/login.html`**(m 아님 — legacy quirk), Noto Sans KR link, favicon/manifest(레이아웃 제공)
- 페이지 `<style>`: 모바일 login_form(% 폭·rem 패딩)·bg 색·placeholder 색·`main{min-height:450px}`
- 앱셸: 인라인 커스텀 헤더 + `/m/layout` bottom-nav/sidebar(표시). goBack은 base.js(history.back) 재현

## 데이터
- 재사용 엔티티: `entities/member-auth` `postMemberLogin`(`POST /api/member/login`)·`openSnsLoginPopup`/`postSnsLoginUrl`(`POST /api/member/sns/:provider/login-url`)·`SnsProvider`
- 세션: 백엔드 httpOnly 쿠키(성공 시 서버 set) — PC 계약 동일
- hCaptcha: PC 선례대로 개발 단계 **stub 토큰**(실제 위젯/키는 백엔드 연동 시)

## API 계약 (증분)
- **없음** — PC login 계약(`/api/member/login`, `/api/member/sns/:provider/login-url`) 재사용. mock 기존분 사용.

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/login.html`
- 라우트: `app/m/member/login.html/page.tsx`(viewport/metadata canonical)
- screen: `screens/mobile-member-login`(client) — 인라인 헤더 + 모바일 login_form + SNS
- 재사용: `entities/member-auth`(postMemberLogin/openSnsLoginPopup), SNS svg `public/mobile-assets/images/member/*.svg`(복사 완료)
- mock: 기존 `POST /api/member/login`·`POST /api/member/sns/:provider/login-url`

## 보존할 legacy quirk
- return_url 기본 "/"(PC는 "")·login.html→"/"·sessionStorage LastUrl 초기화
- canonical이 `directg.net`(m 아님)
- SNS 팝업 카카오 창 이름 `login_naver`(openSnsLoginPopup에 이미 반영)
- 휴대폰간편로그인 로그인플러스 외부 광고 배너

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 커스텀 헤더(bg-cprimary, goBack, pageTitle "로그인") + full-height
- [x] 폼 필드/placeholder/필수/타입·btn-cprimary·hcaptcha-container 일치
- [x] 검증 alert 문구·순서, 성공 return_url||"/" 이동, 실패 alert 일치
- [x] SNS 3종(svg+라벨) 팝업 + 로그인플러스 광고 배너
- [x] 링크(비밀번호 찾기/회원가입) 일치
- [x] return_url/LastUrl 로직·canonical(directg.net) 일치
- [x] 페이지 style·모바일 head·하단 네비 표시
- [x] middleware rewrite + 데스크톱 폴백(PC login)
- 승인 시 확인된 이탈(개발자 수용): hCaptcha stub(PC 선례)·return_url host 판정 "directg.net"(legacy 리터럴 m.directg.net)·외부 광고 rel=noreferrer(관행)·SNS 콜백/가입 후속.
