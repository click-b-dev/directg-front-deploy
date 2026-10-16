# 모바일 회원가입 - 가입완료 (join_step4)

## 원본 (legacy mobile)
- 파일: `mobile/member/join_step4.html`
- 선행: `join_step3.html`(가입 성공/해외차단 시 이동)
- **완전 정적**(가드/AJAX/entity 없음)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/member/join_step4.html`(GET), title "회원가입"
- 헤더: `appHeader.mt-0.bg-primary.text-light` goBack + "회원가입", 위저드(④가입완료 active checkmark)
- 본문 `#appCapsule.extra-header-active.mt-0`: `.wide-block > .card`(id=email_login)
  - card-header "인증대기"
  - card-body: `<h4>가입된 아이디(이메일)로 인증메일이 발송되었습니다.</h4>` + `<p>수신된 인증메일에서 [인증완료]를 눌러주세요.</p>` + `<form action="index.html">` > `<a href="/member/login.html">로그인</a>`(mdi mdi-login 아이콘)
  - **bottom_menu/sidebar 없음**
- 인터랙션: goBack(base.js)만. 로그인 = `/member/login.html` 링크
- ⚠️ `<i class="mdi mdi-login">` 아이콘: legacy mobile head에 mdi CSS 미로드 → **비표시(dead)**. verbatim 렌더(비표시 유지). `<form action=index.html>`은 submit 버튼 없어 inert

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "회원가입", Noto Sans KR
- 인라인 bg-primary 헤더, bottom_menu 없음 → 하단바 숨김. goBack base.js

## 데이터 / API 계약
- **없음**(정적). entity/mock 불필요

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/member/join_step4.html`
- 라우트: `app/m/member/join_step4.html/page.tsx`(title "회원가입", 하단바 숨김 style)
- screen: `screens/mobile-member-join-step4`(client — goBack) — 인라인 헤더+위저드(④)+인증대기 카드+로그인 링크
- 재사용: 없음

## 보존할 legacy quirk
- mdi-login 아이콘 dead(mdi CSS 미로드, 비표시) verbatim
- `<form action=index.html>` inert(submit 없음)
- 정적(가드 없음)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 헤더+위저드(④active)
- [x] "인증대기" 카드·안내문 2줄·로그인 링크(/member/login.html)
- [x] 하단 네비 숨김·title
- [x] middleware rewrite + 데스크톱 폴백(PC join_step5/완료)
- 승인 시 확인(개발자 수용): 완전 정적·mdi-login 아이콘 dead(mdi CSS 미로드) verbatim 유지.
