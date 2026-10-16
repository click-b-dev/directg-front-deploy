# 모바일 회원가입 - 가입방법 선택 (join_step1)

## 원본 (legacy mobile)
- 파일: `mobile/member/join_step1.html`
- PC 대응: `screens/member-join-step1`(가입방법 선택). SNS는 PC `openSnsLoginPopup` 재사용
- 후속: `join_step2.html`(약관동의/정보입력) — SNS 콜백(`join_naver/kakao/payco`→join_step2)은 후속 OAuth 단위

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/member/join_step1.html`(GET), title "회원가입"
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "회원가입"
- 위저드(`extraHeader > form-wizard-section`): 4단계 — ① 가입방법 선택(active, checkmark, text-primary) / ② 약관동의 / ③ 정보입력 / ④ 가입완료(2~4는 숫자)
- 본문 `#appCapsule.extra-header-active.mt-0`:
  - `.section-title2` "가입방법 선택"
  - `.wide-block > .d-grid.gap-3`: naver/kakao/payco 회원가입 버튼(icon_*.png + "NAVER/KAKAO/PAYCO로 회원가입", 페이지 style bg색) + "이메일주소로 회원가입"(`/member/join_step2.html`, btn-secondary)
  - **bottom_menu/sidebar 없음**
- SNS: 버튼 클릭 → AJAX 팝업(openSnsLoginPopup 재사용). 콜백→join_step2는 후속
- 이메일: `join_step2.html` 링크
- 페이지 `<style>`: SNS 버튼 bg색·img float(login_fail와 동일)
- ⚠️ dead `#btn_login` 핸들러 cruft(이 화면엔 로그인 폼 없음) → 미이식
- LastUrl 미설정 시 "/"로 초기화

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000
- title "회원가입", Noto Sans KR, 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack base.js
- SNS 아이콘 `/mobile-assets/images/member/icon_{naver,kakao,payco}.png`(복사 완료)

## 데이터 / API 계약
- SNS: `entities/member-auth` `openSnsLoginPopup` **재사용**(`POST /api/member/sns/:provider/login-url`). **증분 없음**
- 이메일: 링크만(계약 없음)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/join_step1.html`
- 라우트: `app/m/member/join_step1.html/page.tsx`(title "회원가입", 하단바 숨김 style)
- screen: `screens/mobile-member-join-step1`(client) — 인라인 헤더 + 위저드(인라인) + 가입방법 선택. SNS `openSnsLoginPopup`, 이메일 join_step2 링크. 페이지 style
- 재사용: `entities/member-auth`, SNS icon png(복사분)
- mock: 기존 SNS login-url
- 참고: 4단계 위저드는 join_step2~4에서 재사용 가능 → step2 착수 시 `widgets/mobile-join-wizard`(activeStep prop) 추출 검토(현재 step1 인라인)

## 보존할 legacy quirk
- dead `#btn_login` cruft 미이식(폼 없음)
- SNS 콜백→join_step2는 후속
- 카카오 팝업 창 이름은 openSnsLoginPopup 반영

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 헤더(bg-primary goBack "회원가입") + 4단계 위저드(①active)
- [x] "가입방법 선택" + SNS 3종 버튼(icon+색)+이메일주소로 회원가입(join_step2 링크)
- [x] SNS 팝업 동작
- [x] 페이지 style(SNS 색)·하단 네비 숨김
- [x] middleware rewrite + 데스크톱 폴백(PC join_step1)
- 승인 시 확인(개발자 수용): SNS openSnsLoginPopup 재사용(콜백→join_step2 후속)·dead #btn_login cruft 미이식·위저드 인라인(step2~4 추출 검토).
