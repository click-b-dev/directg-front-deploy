# 모바일 전체게임 목록 (game_thumb)

> 파일럿 단위. 기반은 `_foundation.md`. legacy 원본은 read-only.

## 원본
- 파일: `mobile/game/game_thumb.html`(SSR page1) + `mobile/game/thumb_inc.php`(카드 렌더) + `mobile/game/new_game_common.php`(필터/정렬 WHERE 조립) + `mobile/game/game_thumb_ajax.php`(더보기 page N) + `mobile/inc/sub_header.html`·`sub_bottom_menu.html`·`dialog_cart.html` + `mobile/inc/footer_common.html`(더보기 jQuery 핸들러 L55~82).
- 라이브: `mgate.php` `$url_check`에 `/game/game_thumb.html` 포함(모바일 bottom nav "모든게임" 진입점).
- 참조: `docs/design-system/client.md`, `../legacy-project/docs/PROJECT-OVERVIEW.md`, `SEO-CHANNEL.md`.

## 화면·플로우
- 진입 URL: `/game/game_thumb.html` (+ 필터/정렬 쿼리스트링). `page` 기본 1.
- 화면 요소:
  - `sub_header.html`: `.appHeader.bg-primary` — 뒤로가기(`goBack` `data-rel="back"`), `pageTitle` = "모든게임", 검색토글, 장바구니 링크(`/order/cart.html`). + 검색 오버레이(`#search`, GET `action="/game/game_search_thumb.html"`, input `q` minLength 2). `directgames` 앱 UA면 헤더 숨김(`$isApp`).
  - `#appCapsuleSub.full-height` → `game_filter.html`(offcanvas 필터, **범위 밖**) + `#goods_thumb`(thumb_inc 카드 목록) + `#btn_paging` 더보기 버튼.
  - `sub_bottom_menu.html`: appBottomMenu — 메뉴(offcanvas `#sidebarPanel`)/할인진행중/모든게임/PS액세서리 + (로그인 시 마이페이지 / 비로그인 시 회원가입).
  - `sidebar.html`(offcanvas, **범위 밖** — 동적 그룹데이터), `dialog_cart.html`(장바구니/위시리스트 알림 모달).
- 카드 마크업(`thumb_inc.php` L66~146): `div.card.thumb-card.card-shadow.border-0.rounded-0` — 상단 `product_name`(text-truncate), 이미지(`{domain}/upload/product/{product_code}/header/header.jpg`, view_url 링크) + game_type/display_type별 badge 오버레이(기본게임 bg-cinfo / 에디션 bg-cprimary / 멀티팩 bg-cwarning / DLC·Music bg-ccontent / 번들 bg-csuccess / holomodels 본체·DLC·에디션), 하단 `card-tail`: 할인율 badge(`{promotion_label}` bg-danger|미표시) + 정가 취소선(`consumer_price`) + 판매가(`price`). **PC thumb 카드와 마크업 다름 → 신규 컴포넌트.** (모바일 thumb에는 wishlist/cart 버튼·한국어/플랫폼 배지 없음 — list 카드에만 있음.)
- view_url 분기(thumb_inc L9~42): game→`game_view.html?product_id={sku}&sku={goods_sku}` / dlc(dlc_bundle→bundle_view / else dlc_view) / music→dlc_view / bundle→bundle_view / accessories→goods_item_view / holomodels 3분기. **파일럿은 목록만 — view 라우트 미이관, 링크만 legacy 동일 문자열 유지.**
- 분기/리다이렉트: 없음(목록). 세션 의존: wishlist_chk(로그인 시 위시 여부) — 모바일 thumb 카드에는 미표시라 파일럿 무관.

## SSR·SEO (legacy)
- `<title>` = "모든게임"(`$page_title`). description/keywords 빈값. canonical/OG 없음.
- viewport/apple-web-app/theme-color meta + manifest(`/manifest.json?2`) + favicon. → 모바일 브랜치 `<head>`에서 재현(`_foundation.md`).
- 렌더: page1 SSR, 이후 page CSR(더보기 AJAX).

## 데이터 (legacy)
- 도메인: `Goods::getGoodsList2($page, $add_where, $orderby, $param, 60)` — **60/page**. `find_in_set(a.game_type,'game,dlc,music,bundle')` 기본 WHERE. category_code/genre_code/q 없음(전체게임).
- 정렬(`new_game_common.php` L220~248): sort=release(release_date desc, 기본)/name/name_en/pricedown/priceup/discount. q 있으면 score desc.
- 필터: `new_game_common.php`의 filter/type/platform/korean/genre/price WHERE — **offcanvas 필터 UI는 범위 밖**, 백엔드 계약에 파라미터 verbatim 기술.
- 더보기(`game_thumb_ajax.php`): `$page = $page+1` 후 `getGoodsList2($page,...,60)` → `thumb_inc.php` HTML 반환. **off-by-one은 의도**(핸들러가 현재 data-page를 보내고 서버가 +1).
- 더보기 핸들러(`footer_common.html` L55~82): 클릭 시 `data-page==data-total`이면 `alert("마지막페이지입니다")`; else GET `game_thumb_ajax.php?{query_without_page}&page={data-page}` → 결과를 `#goods_thumb`에 **append**, `data-page`·`#current_page` +1. 요청 중 버튼 disabled.

## API 계약 (백엔드 전달)
- **재사용**: 기존 `entities/game-list` `getGameList(page, filters)` → `GET /api/game/list?page=N&{필터}` → `GameListResponse { list: ProductThumb[]; page; totalPages; total }`. 60/page. PC game-list와 동일 엔드포인트/계약(`docs/migration/storefront/game/game-list.md`). **신규 계약 없음.**
- 더보기는 동일 엔드포인트를 page N+1로 호출(서버액션 경유). 별도 `*_ajax` 엔드포인트 불필요(HTML 대신 JSON+클라 렌더).

## 타겟 매핑
- 라우트: `app/m/game/game_thumb.html/page.tsx` (미들웨어 rewrite로 `/game/game_thumb.html` 모바일 UA 진입).
- screen: `screens/mobile-game-thumb` — SSR page1(`getGameList(1)`) + `MobileGameThumbList`(client) 조립.
- entities: `entities/game-list`(재사용) + `entities/product-thumb`(타입 `ProductThumb` 재사용).
- 신규 카드: `entities/product-thumb/ui/mobile-thumb-card.tsx`(또는 screen 내부) — `thumb_inc.php` 마크업 재현.
- 더보기: 서버액션 `loadMoreGames(nextPage, filters)` → `getGameList` 호출 → `ProductThumb[]` 반환, 클라이언트 append + `alert` 재현.
- mock: 기존 `game/list` MSW handler 재사용(있으면), 60개 fixture 확인.

## 범위 제외 (후속 단위 — parity 보고서에 명기)
- offcanvas 필터(`game_filter.html`)·정렬(`offcanvas_sort.html`)
- sidebar offcanvas(`sidebar.html`, 동적 그룹데이터)
- 상세 view 라우트(game_view/dlc_view/bundle_view 등)
- 위시리스트/장바구니 mutation(`wishlist_proc`/cart)
- 검색 결과 화면(`game_search_thumb.html`)

## Parity 체크리스트
- [ ] appHeader(뒤로/타이틀 "모든게임"/검색/장바구니) 일치
- [ ] thumb 카드 마크업·badge 분기·가격/할인 표시 일치
- [ ] 60/page, release_date desc 기본 정렬 일치
- [ ] 더보기: append 증분, data-page/current_page +1, 마지막 alert 일치
- [ ] bottom nav(로그인 분기 포함) 일치
- [ ] `<title>`="모든게임", viewport/manifest meta 일치
- [ ] view_url 링크 문자열 legacy 동일(라우트 미이관 상태)
