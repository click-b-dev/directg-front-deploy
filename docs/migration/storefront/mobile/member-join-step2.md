# 모바일 회원가입 - 약관동의 (join_step2)

## 원본 (legacy mobile)
- 파일: `mobile/member/join_step2.html`
- 선행: `join_step1.html`("이메일주소로 회원가입" 링크). 후속: `join_step3.html`(정보입력) — form POST
- 약관 텍스트: `conf/agreement_20250701.txt`(= public 복사분 `agreement_250701.txt`, PC service-agreement/join_step2 선례)
- PC 대응: `screens/member-join-step2`(마크업 상이 — PC 테이블/`<pre>`, 모바일 ol/textarea). 약관 txt readFile prop 전달 방식 재사용

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/member/join_step2.html`(GET), title "회원가입"
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "회원가입"
- 위저드(`extraHeader > form-wizard-section`): ①가입방법 선택(숫자 1)·②약관동의(active checkmark)·③정보입력(숫자)·④가입완료(숫자). **step1과 달리 numbered `<a>`에 font-12 없음**(legacy 불일치 → 인라인 유지)
- 본문 `#appCapsule.extra-header-active.mt-0`: `.section-title2` "약관동의" + `.wide-block > form[method=post action=/member/join_step3.html]`
  - 카드1 [필수] 개인정보 수집 및 이용: 안내 p + ol(3항목: 본인확인/재화·서비스/문의상담, 각 ul) + footer "위 개인정보 수집 이용에 동의합니다.(필수)" + checkbox `is_private`(Y, required) "동의함"
  - 카드2 [필수] 이용약관: `textarea[readonly rows=10]`(agreement_250701.txt 내용) + footer "이용약관에 동의합니다.(필수)" + checkbox `is_agreement`(Y, required) "동의함"
  - 카드3 [선택] 홍보 및 마케팅: table(뉴스레터→`is_mailling`/SMS→`is_sms`/이벤트→`is_event`, 각 Y) + footer: `input[type=button] "이전"`(**dead, 핸들러 없음**) + `input[type=submit] "다음"`
  - **bottom_menu/sidebar 없음**
- 제출: required 통과 시 form POST → join_step3.html (동의/마케팅 값 전달)
- ⚠️ "이전" 버튼은 legacy JS 핸들러 없음 → dead(no-op)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "회원가입", Noto Sans KR
- 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack base.js

## 데이터 / API 계약
- **없음**(정적 폼). 약관 텍스트는 `public/service/agreement_250701.txt` readFile(SSR). 동의값은 client-state로 join_step3 전달

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/join_step2.html`
- 라우트: `app/m/member/join_step2.html/page.tsx`(server, readFile agreement_250701.txt → prop, 하단바 숨김 style)
- screen: `screens/mobile-member-join-step2`(client) — 인라인 헤더+위저드(step2)+3카드. 제출 시 `sessionStorage['dg_mobile_join']={is_private,is_agreement,is_mailling,is_sms,is_event}` 저장 후 `/member/join_step3.html` 이동. "이전" dead(no-op)
- 재사용: `public/service/agreement_250701.txt`(PC 복사분). entity/mock 없음

## 보존할 legacy quirk
- 위저드 numbered 항목 font-12 없음(step1과 불일치)
- "이전" 버튼 dead(핸들러 없음)
- textarea readonly에 약관 raw 텍스트(HTML 미렌더)
- bottom_menu 없음

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 헤더+위저드(②active) 일치
- [x] 카드1(개인정보 ol+is_private required)·카드2(약관 textarea+is_agreement required)·카드3(마케팅 3체크)
- [x] 이전(dead)·다음(submit→join_step3, 동의값 전달)
- [x] agreement_250701.txt textarea 내용
- [x] 하단 네비 숨김·title
- [x] middleware rewrite + 데스크톱 폴백(PC join_step2)
- 승인 시 확인(개발자 수용): "이전" dead 보존·동의값 client-state(dg_mobile_join)로 join_step3 전달·약관 txt는 PC agreement_250701.txt 재사용.
