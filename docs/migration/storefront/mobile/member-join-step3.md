# 모바일 회원가입 - 정보입력 (join_step3)

## 원본 (legacy mobile)
- 파일: `mobile/member/join_step3.html`, 처리 `mobile/member/join_proc.php`(mode=idChk/join = PC 공통 계약)
- 선행: `join_step2.html`(약관동의 값 POST). 후속: `join_step4.html`(가입완료)
- PC 대응: `screens/member-join-step3`(마크업 상이). **postMemberCheckId·postMemberJoin·비번검증·hCaptcha stub·visitorId "" 전부 재사용**

## 화면·플로우 (legacy mobile 기준)
- 진입: `join_step2.html`에서 동의값 POST. **서버 가드**: `is_private<>"Y" && is_agreement<>"Y"`(둘 다 Y 아니면) → "잘못된 접근입니다." exit (⚠️ AND 조건 — 하나라도 Y면 통과, legacy 그대로)
- 헤더: `appHeader.mt-0.bg-primary` goBack + "회원가입", 위저드(③정보입력 active)
- 본문 `#appCapsule.extra-header-active`: 카드 "정보입력" > `form#form_auth`
  - hidden: mode=join, is_mailling/is_sms/is_event(step2 값), id_chk="", visitorId=""
  - m_id(email req) + `#btn_id_chk` "아이디 중복확인"(input-group)
  - m_pwd(password req) / m_pwd_re(password req)
  - `#hcaptcha-container` + "회원가입" submit
  - **bottom_menu/sidebar 없음**
- 아이디 중복확인: 빈값 alert "아이디를 입력하세요." / AJAX join_proc idChk → error_code=="1" alert(msg)+id_chk·m_id clear / else id_chk="1"+alert "등록이 가능한 아이디입니다."
- 제출: preventDefault → 검증(id_chk 빈값 "아이디 중복확인을 하세요." / 비번 5종: length 8~16·num·eng·spe·공백·불가문자·pwd!=pwd_re, PC와 동일 정규식) → `runCaptcha()` → onCaptchaSuccess(token) → AJAX join_proc join
  - error_code==0 → join_step4 이동
  - **error_code==2(해외차단) → alert(msg) + join_step4 이동**(quirk — 차단인데도 진행)
  - else → alert(msg) + hcaptcha reset
- visitorId: Fingerprint2 해시(vendor). **PC 선례대로 stub("")** (Fingerprint2 미도입)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "회원가입", Noto Sans KR
- 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack base.js
- hCaptcha: PC 선례 stub("dev-stub"), 실제 위젯은 백엔드 연동 시

## 데이터 / API 계약
- **재사용(증분 없음)**: `postMemberCheckId`(`POST /api/member/check-id`, idChk)·`postMemberJoin`(`POST /api/member/join`, join). 응답 {error_code, msg}
- is_sms: step2에서 수집하나 join_proc join 생성엔 미사용(legacy setMemberAuth는 is_mailling만) → postMemberJoin에 미전송(hidden DOM만 유지)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/join_step3.html`
- 라우트: `app/m/member/join_step3.html/page.tsx`(title "회원가입", 하단바 숨김 style)
- screen: `screens/mobile-member-join-step3`(client) — client 가드(dg_mobile_join is_private&&is_agreement 둘 다 Y 아니면 "잘못된 접근입니다.") + idChk + 비번검증 + join. 성공/error_code2 → join_step4 이동. visitorId·hCaptcha stub
- 재사용: `entities/member-auth`(postMemberCheckId/postMemberJoin), 기존 mock(check-id/join)
- mock: 기존 재사용

## 보존할 legacy quirk
- 가드 AND 조건(둘 다 Y 아닐 때만 차단)
- error_code==2도 join_step4 진행
- is_sms 미사용(hidden DOM만)
- 비번 help text 없음(PC와 달리 span 없음)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 가드(dg_mobile_join 둘 다 Y 아니면 "잘못된 접근입니다.")
- [x] 헤더+위저드(③active)+정보입력 카드
- [x] 아이디 중복확인(빈값/error_code1 clear/성공 alert)
- [x] 비번 검증 5종·id_chk 미확인 alert
- [x] join 성공/error_code2 → join_step4, else alert+reset
- [x] 하단 네비 숨김·title
- [x] middleware rewrite + 데스크톱 폴백(PC join_step3)
- 승인 시 확인(개발자 수용): idChk/join postMemberCheckId·postMemberJoin 재사용·hCaptcha·visitorId stub·error_code2도 step4 진행 quirk·is_sms join 미전송.
