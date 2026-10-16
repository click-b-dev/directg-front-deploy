# 모바일 홈 앱셸 (main_header / main_footer / sidebar / app_search)

> 모바일 **메인 홈**(`mobile/index.php`) 이관의 1단위. 홈이 요구하는 **미구현 공유 chrome**만 담당한다.
> 홈 **본문**(main_banner 캐러셀·공지티커·추천및특집·인기게임·신규게임·예약구매·퍼블리셔 등 appCapsule 내부)은 다음 단위(`home-body.md`)로 분리(개발자 승인 2026-09-11).

## 원본 (legacy mobile)

- 라이브 홈: `mobile/index.php` (index_dev/kdy/yjs/index20260120은 비라이브 변형). `/` (root) 서빙.
- chrome include (index.php 하단):
  - `inc/main_header.html` — App Header (메뉴/로고/검색토글/장바구니) + `#search` 검색폼
  - `inc/main_footer.html` — renewal 푸터(브랜드 로고·소셜·회사정보). **완전 정적**(PHP 0)
  - `inc/bottom_menu.html` — 홈 하단 고정 메뉴 (서브의 `sub_bottom_menu.html` variant)
  - `inc/sidebar.html` — `#sidebarPanel` 좌측 offcanvas 모달 (세션분기 + `getPromotionGroupList()` 동적)
  - `inc/app_search.html` — `#offcanvas-search` offcanvas (**트리거 부재 = 죽은 offcanvas**)
- PC 대응: 홈 chrome은 PC `widgets/site-header`·`site-footer`와 다른 별도 모바일 마크업. 데이터는 PC `entities/promotion-group`·`member-auth` 재사용.

## chrome 조각별 분석

### 1) main_header.html (App Header)
- `$isApp = strpos(UA,'directgames')!==false` → 앱 웹뷰면 헤더 **미출력**. (legacy 그대로 이식; UA 분기는 미들웨어/세션 아닌 마크업 조건)
- 구조: `.appHeader` > `.left`(메뉴버튼 `data-bs-toggle=modal data-bs-target=#sidebarPanel`, `menu_icon_white.svg`) / `.pageTitle`(로고 `img/logo_v2.png`) / `.right`(검색토글 `.toggle-searchbox` + `search_icon_white.svg`, 장바구니 `/order/cart.html` + `basket_icon_white.svg`)
- 검색 컴포넌트: `#search.appHeader` > `form.search-form method=GET action=/game/game_search_thumb.html` > input `#q name=q minLength=2 required` + close `.toggle-searchbox`
- 인터랙션(base.js `.toggle-searchbox`): 클릭 시 `#search` `.show` 토글 + `.form-control` focus. → 서브헤더(`MobileSubHeader`)와 동일 React state 재현.

### 2) main_footer.html (App Footer)
- **완전 정적**(`<?php`/`<?=`/`_SESSION`/`foreach` = 0). `div.appFooter.renewal-m-footer`.
- 영역: ① 브랜드 패밀리 로고(H2/H2MALL/케이블가이즈 등, **base64 인라인 SVG/PNG** — 외부 자산 없음) ② 소셜 버튼(유튜브/페북/카카오/인스타 — 인라인 SVG) ③ 회사정보(고객센터 1544-2367, 운영시간, 사업자 206-86-35756, 통신판매 2013-서울강서-0758, 대표 허준하, 개인정보관리책임자 김지훈, 호스팅 카페24) ④ 정책 링크(회사소개/사업자정보확인 등) ⑤ 하단 여백 `div[height:80px;bg#050C1A]`.
- 이식: 정적 JSX 전사. base64 자산 인라인 유지(외부 파일 복사 불필요). 외부 img src 발견 시에만 `mobile-assets` 복사.

### 3) bottom_menu.html (홈 하단 메뉴)
- 서브(`sub_bottom_menu.html`) 대비 차이: 래퍼 `div.section.full.mt-0#appBottomMenu`(홈) vs `div.section.full.mt-2`(서브) + `$isApp` 가드 + 주석처리된 "홈" 링크. 메뉴 항목(메뉴/할인진행중/모든게임/PS액세서리/마이페이지·회원가입)은 **동일**.
- 기존 `widgets/mobile-bottom-nav`(sub 기반, `mt-2`)가 shared layout에서 렌더 중. 홈은 `mt-0`+`id=appBottomMenu`+`$isApp` variant 필요 → `MobileBottomNav`에 variant prop 추가(기본=sub).

### 4) sidebar.html (#sidebarPanel offcanvas)
- shared chrome: **서브페이지(game_thumb 등)도 include** → `app/m/layout.tsx`에 배치(모든 모바일 페이지 공유). 기존 `mobile-bottom-nav`·`main_header`의 메뉴 버튼이 `#sidebarPanel` 모달을 연다(Bootstrap 네이티브).
- 세션분기: 로그인 시 `[name]님` + 로그아웃 버튼(`/member/logout.php`), 비로그인 시 "로그인을 해주세요." + 로그인 버튼(`/member/login.html`). → `getMemberSession` 재사용.
- 상단 버튼: 로그인/로그아웃 · 마이페이지 · 위시리스트 · 장바구니.
- 메뉴: 홈 / 서비스소개 / **할인프로모션 아코디언**(할인진행중·주말특가·[기간게이트]2026여름프로모션·`getPromotionGroupList()` 동적 그룹) / 이벤트 / 공지사항 / 모든게임 / PS액세서리 / 홀로모델 / 예약구매 / **플랫폼별·장르별·퍼블리셔별·한국어지원·이용안내·고객지원 아코디언**(정적 링크).
- 동적 데이터: `getPromotionGroupList()` → PC `entities/promotion-group` `getPromotionGroups()` **재사용**(`idx`/`subject`). 아코디언 항목 `/game/group_thumb.html?idx=`+`subject`.
- 기간게이트: "2026 여름 프로모션" 링크 `2026-06-25 16:00:00`~`2026-07-09 16:00:00` (현재 만료 — 로직 verbatim 이식).
- 아코디언: Bootstrap collapse 네이티브(`data-bs-toggle=collapse`).
- material-icons `close`(닫기) — 레이아웃 Material Icons 폰트 이미 로드됨.

### 5) app_search.html (#offcanvas-search)
- `div.offcanvas.offcanvas-end#offcanvas-search` — 제목 "검색" + 검색폼(비기능, action 없음).
- **죽은 offcanvas**: 여는 트리거 `#btn_search`(index.php inline JS `$("#offcanvas-search").show()`)의 대상 요소가 홈 마크업에 **부재**. `#btn_searchbox_close`도 부재. → DOM parity용 정적 마크업만 이식, 동작 없음(legacy 죽은 코드 그대로).

## 모바일 head / viewport (홈)
- title `다이렉트 게임즈`, description(회사 소개문), Keywords(다이렉트 게임즈/다렉/H2…), canonical `https://directg.net`, favicon `/favicon/favicon-32x32.png`.
- viewport `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`.
- `mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`, **theme-color `#ffffff`**(게임목록 `#000`과 상이).
- 추가 head: font-awesome 6.7.2 CDN, `manifest.json`, Material Icons, Noto Sans KR. gtag/Clarity는 layout이 이미 담당.
- 인라인 `<style>`: `#appCapsule{padding-bottom:56px}` (하단 nav 여백), `.adbox.fixed{width:320px}`, `.adbox-320-55 img{320x55}` — adbox는 본문 단위, `#appCapsule` padding은 셸에 포함.

## 데이터 (재사용)
- `entities/promotion-group` `getPromotionGroups()` — sidebar 할인프로모션 아코디언. PC `(pc)/layout.tsx`와 동일하게 서버에서 페치해 prop 주입.
- `entities/member-auth` `getMemberSession()` — sidebar/bottom_menu 세션분기(layout이 이미 호출 중, prop 확장).
- **신규 API 계약 없음.**

## 타겟 매핑
- middleware `MOBILE_ROUTES`: `"/"` 추가.
- 라우트: `app/m/page.tsx` — 서버 컴포넌트(viewport/metadata + font-awesome/manifest head). `screens/mobile-home` 셸 렌더.
- screen 셸: `screens/mobile-home` — `MobileMainHeader` + `<div id="appCapsule" class="full-height">`(본문=다음 단위 자리) + `MobileMainFooter` + `MobileAppSearch`.
- widgets:
  - `widgets/mobile-main-header`(client — toggle-searchbox state)
  - `widgets/mobile-main-footer`(server 정적)
  - `widgets/mobile-app-search`(server 정적, 죽은 offcanvas)
  - `widgets/mobile-sidebar`(server, props: isLoggedIn·memberName·promotionGroups) → `app/m/layout.tsx` 배선
  - `widgets/mobile-bottom-nav` variant prop 추가(home: mt-0/id/appUA)
- 자산: 대부분 `public/mobile-assets/`에 기존재(menu/search/basket icon, logo_v2, login/logout/wishlist/basket-icon, user-icon). footer base64 인라인. 부족분만 legacy에서 무수정 복사.

## Parity 체크리스트 (모바일 UA)
- [ ] main_header: 메뉴→sidebar 모달, 로고, 검색토글(#search show/focus), 장바구니 링크
- [ ] main_footer: 브랜드 로고·소셜·회사정보·정책링크·하단여백 DOM 일치
- [ ] sidebar: 세션분기(로그인/비로그인) · 상단버튼 · 메뉴 · 할인프로모션 동적(group) · 아코디언 6종 · 기간게이트 링크
- [ ] app_search: `#offcanvas-search` DOM 존재(비기능)
- [ ] bottom_menu 홈 variant(mt-0/id/appUA)
- [ ] head/viewport/theme-color(#fff) 일치, `#appCapsule` padding-bottom
- [ ] middleware `/` → `/m` rewrite(모바일 UA) / 데스크톱 PC 유지
- [ ] 서브페이지(game_thumb)에서도 sidebar 모달 동작(공유 chrome)
