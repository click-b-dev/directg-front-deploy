# 모바일 마이페이지 - 회원등급 안내 (member_level_info)

## 원본 (legacy mobile)
- 파일: `mobile/mypage/member_level_info.html` (login_check 세션 가드, 데이터 조회 없음)
- PC 대응: `screens/mypage-member-level-info`(정적 등급표). **완전 정적** — entity 없음
- 진입: mypage_main "회원등급 안내" 링크

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/mypage/member_level_info.html`(GET), title "회원등급 안내". **세션 필수**(login_check)
- 헤더: `inc/sub_header.html` → `MobileSubHeader("회원등급 안내")`
- 본문 `#appCapsuleSub > .section.full.pt-2`:
  - `.section-title` "※ 다이렉트 게임즈 회원 등급별 혜택 안내"
  - `.col-12`: `<h3></h2>`(⚠️ 태그 불일치 빈 heading quirk) + table(등급/기준/포인트: 일반 0%·정회원 1%·VIP 3%) + 안내 p 4개
  - bottom_menu + sidebar(하단 네비 표시)
- 인터랙션: 없음(정적)

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "회원등급 안내"
- 앱셸: `MobileSubHeader` + `/m/layout` bottom-nav/sidebar(표시). screen = server 컴포넌트

## 데이터 / API 계약
- **없음**(정적). 세션 가드만(requireMemberSession)

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/mypage/member_level_info.html`
- 라우트: `app/m/mypage/member_level_info.html/page.tsx`(server, requireMemberSession 가드)
- screen: `screens/mobile-mypage-member-level-info`(server) — MobileSubHeader + section-title + 등급표 + 안내문
- 재사용: `member-auth` requireMemberSession, `widgets/mobile-sub-header`

## 보존할 legacy quirk
- `<h3></h2>` 태그 불일치 빈 heading → 빈 `<h3></h3>`로 렌더(auto-correct 동일)
- 등급 기준/혜택 문구 verbatim

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] 세션 가드(비로그인→로그인 이동)
- [x] MobileSubHeader("회원등급 안내")·section-title
- [x] 등급표 3행(일반/정회원/VIP, 기준·포인트)·안내 p 4개
- [x] 하단 네비 표시·title
- [x] middleware rewrite + 데스크톱 폴백
- 승인 시 확인(개발자 수용): 완전 정적·requireMemberSession 가드만·`<h3></h2>` 빈 heading→빈 h3.
