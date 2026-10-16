# 모바일 통합검색 게임 목록 (game_search_thumb)

## 원본 (legacy mobile)
- 파일: `mobile/game/game_search_thumb.html` (라이브 — **검색박스 제출 목적지**: `inc/sub_header.html` L54·`main_header.html` L37·`header.html` L23 모두 `<form method="GET" action="/game/game_search_thumb.html">`)
- 더보기 증분: `mobile/game/game_search_thumb_ajax.php`
- 필터/정렬 조립: `mobile/game/new_game_common.php` (page 화면과 ajax 공용)
- 카드 조각: `mobile/game/thumb_inc.php` (파일럿 `game_thumb`과 동일)
- 더보기 핸들러: `mobile/inc/footer_common.html`
- PC 대응 단위: `docs/migration/storefront/game/game-search.md` (재사용 출처)
- **주의**: `mobile/game/game_search.html`(16KB)은 별개 페이지 — 사이드바 2번째 섹션 "한국어지원" 링크(`?interface_korean=Y` 등) 전용, page_title이 한국어지원 종류로 바뀌는 변형. **본 단위(검색박스 통합검색)는 `game_search_thumb.html`** 이며 `game_search.html`은 후속(별도 판단).

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/game/game_search_thumb.html?q=<검색어>` (검색박스 GET 제출). 그 외 필터 파라미터(sort, is_*, game_type_*, platform, genre_code, min/max_price)도 모두 수용하나 UI(offcanvas 필터)는 후속.
- 검색어 처리: legacy는 `MATCH(a.product_name, a.product_name_en, a.keyword) AGAINST ('<q>*' IN BOOLEAN MODE)` + `getGoodsList2(..., 60, $q)` 6번째 인자로 q 전달(검색 relevance). → 프론트는 q를 필터 파라미터로 백엔드에 전달만.
- 화면 요소:
  - `sub_header.html` (뒤로/pageTitle/검색토글/장바구니) — `MobileSubHeader` 재사용. 검색 form action = `/game/game_search_thumb.html`(이미 위젯에 반영됨).
  - `game_filter.html` (offcanvas 필터) — **후속 범위**(platform/genre/game_thumb과 동일하게 미이관)
  - `#appCapsuleSub.full-height > .section.full`
    - `.wide-block.pt-2.pb-2.px-2 > #goods_thumb` : thumb 카드 반복 (`thumb_inc.php`)
    - `.wide-block.pt-2.pb-2.border-0.dg_bg > #btn_paging` : `( page / total_pages ) 더보기` 버튼
  - (하단 divider `arrow-down`은 legacy 주석처리 → 미렌더)
- 폼 필드/검증: 검색 form(minLength=2, name=q) — 위젯 `MobileSubHeader`가 이미 보유. 목록 화면 자체 폼은 없음.
- 분기/리다이렉트: 없음. (q 빈값이어도 화면 렌더 — title "통합검색 - ")
- 세션/권한 의존: 공개. `getGoodsList2`가 wishlist_chk 위해 세션 쿠키 참조 → `getGameList` 이미 쿠키 포워딩.

### page_title 파생
- legacy: `$page_title = "통합검색 - ".$q` (정적 템플릿). head `<title>`·`sub_header` `.pageTitle` 공용.
- q 빈값 → "통합검색 - " (trailing "- ") 그대로. **정적 매핑/백엔드 조회 불필요.**

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover` / theme-color `#000000` / apple-mobile-web-app-capable yes / status-bar black-translucent — 파일럿·platform·genre와 동일.
- head title: `통합검색 - ${q}` 동적, description 빈값.
- 사용 앱셸: `MobileSubHeader(pageTitle="통합검색 - "+q)` (재사용) / bottom-nav·sidebar·dialog는 `app/m/layout.tsx` 공유.
- 페이지별 mobile-assets CSS: 파일럿과 동일(layout에서 로드). thumb 카드 CSS 재사용.

## 데이터
- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)` → `GET /api/game/list?page=N&q=<검색어>&{필터}` (60/page). q는 필터 파라미터일 뿐 — **증분 없음**(PC game-search 선례와 동일, platform/genre와 동형).
- 카드: `entities/product-thumb` `MobileThumbCard` (파일럿 재사용).
- 모바일 전용 동작: "더보기" 증분 — `game_search_thumb_ajax.php`는 page+1 후 동일 `getGoodsList2`+q 재호출. → 서버액션이 `getGameList(nextPage, filters)` 호출(filters에 q 포함).

## API 계약 (증분만, 백엔드 전달)
- 없음. `GET /api/game/list` (game-list 단위 계약)를 q 필터 파라미터와 함께 재사용. `MATCH(...) AGAINST('<q>*' IN BOOLEAN MODE)` 검색 조건은 백엔드.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `"/game/game_search_thumb.html"`
- 라우트: `app/m/game/game_search_thumb.html/page.tsx` (서버 컴포넌트, `generateMetadata` title=`통합검색 - ${q}`)
- screen: `screens/mobile-game-search-thumb`
  - `ui/mobile-game-search-thumb-screen.tsx` — `MobileSubHeader(pageTitle)` + `#appCapsuleSub` + 목록
  - `ui/mobile-game-search-thumb-list.tsx` (client) — thumb 목록 + 더보기
  - `api/load-more-search-games.ts` (server action) — `getGameList(nextPage, filters).list`
- 재사용 entities: `game-list`(getGameList) · `product-thumb`(MobileThumbCard)
- 신규 UI: 검색 전용 카드 없음(thumb 카드 재사용). 정적 lib 없음(title 템플릿).
- mock: 기존 `/api/game/list` MSW 핸들러 재사용 — 신규 없음.

## Parity 체크리스트 (모바일 UA)
- [ ] 검색박스(sub_header) 제출 → `/game/game_search_thumb.html?q=` 진입
- [ ] 화면 요소 일치 (sub_header + appCapsuleSub + #goods_thumb + 더보기 버튼)
- [ ] page_title = `통합검색 - ${q}` (q 빈값 시 "통합검색 - ")
- [ ] head `<title>` = pageTitle 동일
- [ ] q 필터가 getGameList로 전달 (MATCH AGAINST 백엔드)
- [ ] 더보기 증분: `( page / total )` 표기, 마지막 페이지 alert("마지막페이지입니다"), append 동작
- [ ] 모바일 head/viewport 일치(theme #000, viewport-fit=cover, apple-web-app)
- [ ] offcanvas 필터 미렌더(후속)
- [ ] middleware rewrite(모바일 UA→/m) / 데스크톱 UA 폴백(PC game_search_thumb) 확인
