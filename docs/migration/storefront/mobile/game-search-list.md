# 모바일 통합검색 게임 목록 list 뷰 (game_search_list)

## 원본 (legacy mobile)

- 파일: `mobile/game/game_search_list.html` (`.html`=PHP). 더보기: `game_search_list_ajax.php`. 카드: `list_inc.php`. 필터 도출: `new_game_common.php`.
- PC 대응 단위: `docs/migration/storefront/game/game-search.md`(엔티티는 game-list 공유) — mobile은 `game_search_thumb`/`game_list` 선례 재사용.
- 자매(같은 데이터 thumb 뷰): `docs/migration/storefront/mobile/game-search-thumb.md` ✅ / list 원형: `game-list.md` ✅

`game_search_list.html`은 `game_list.html`과 거의 동일하며 차이는:

| 항목 | game_list | game_search_list |
|------|-----------|------------------|
| `$aside` | 미설정(전체 블록) | 미설정(전체 블록) — **동일** |
| `$page_name` | `"game"` | `"game_search"` (더보기 ajax=game_search_list_ajax.php) |
| `$page_title` | `"모든게임"` | `"통합검색 - ".$q` (정적 템플릿) |
| 필터 축 | 없음 | `q` GET (getGoodsList2 추가 인자) |
| `$search_label[5]`(장르 칩) | 유지 | 유지 — **동일**(genre 칩 정상) |

`page_type="list"`, `#goods_list`, `list_inc.php` 동일. `game_search_thumb.html`과는 include(list vs thumb)만 다름. where 기본 `find_in_set(a.game_type,'game,dlc,music,bundle')` + q는 백엔드 검색.

**platform_list/genre_list와 차이**: aside 미설정(필터 블록 전부 노출, game_list와 동일). title은 `통합검색 - ${q}` **정적 템플릿**(백엔드 도출 아님 → getGameList 재사용, 별도 엔티티 불필요 — platform과 유사).

## 화면·플로우 (legacy mobile 기준)

- 진입 URL: `/game/game_search_list.html?q=검색어` (+ game_list 필터). q는 검색박스(MobileSubHeader/메인헤더) 제출 목적지.
- title/pageTitle = `"통합검색 - " + q` (q 빈값이면 `"통합검색 - "`).
- 구성 = game_list와 동일: `MobileSubHeader`(검색박스 보유) + `game_filter.html`(전체 블록) + `#goods_list`(list_inc.php) + 더보기(btn_paging).
- 세션/권한: 로그인 시 wishlist_chk(백엔드), 비로그인 N.

## 모바일 head / 앱셸

- viewport/theme #000/apple-web-app = game_list와 동일. title=`통합검색 - ${q}` 동적. description 빈값.
- 앱셸: `MobileSubHeader(pageTitle)` + `MobileGameFilter(aside={})` + bottom-nav/dialogs(레이아웃).

## 데이터

- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)`(q 필터 포함) + `GameListResponse`. **증분 없음**(search_thumb/game_list과 동일 데이터).
- 카드: `entities/product-thumb` `MobileListCard` **재사용**.
- 더보기: `getGameList(nextPage, filters)`(q는 filters에 포함) — game_list divergence 노트 동일 적용.

## API 계약 (증분만)

증분 없음. `GET /api/game/list?q=&page=N&{필터}` (기존 계약, 백엔드 검색/필터/정렬/60per-page/wishlist_chk).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_search_list.html`
- 라우트: `app/m/game/game_search_list.html/page.tsx` (search_thumb page.tsx 구조 — `generateMetadata`=`통합검색 - ${q}`, collectFilters(q 포함), screen만 list로 교체)
- screen: `screens/mobile-game-search-list`
  - `MobileGameSearchListScreen`: `MobileSubHeader(pageTitle)` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={}, total, viewBasePath="/game/game_search", pageType="list")` + `MobileGameSearchListItems`
  - `MobileGameSearchListItems`(client): `#goods_list` + `MobileListCard` + 더보기(footer_common 재현) + 서버액션 `loadMoreGameSearchList`
  - `api/load-more-game-search-list.ts`: `getGameList(nextPage, filters)`
- 재사용: `game-list`, `product-thumb`(MobileListCard), `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`
- 신규 UI: 없음. mock: 없음(기존 getGameList mock).

## Parity 체크리스트 (모바일 UA)

- [ ] 화면 요소 (헤더 `통합검색 - {q}` / 필터 **전체 블록** / list 카드 / 더보기)
- [ ] 필드/검증 (MobileListCard = list_inc.php)
- [ ] 분기/플로우 (q 검색, 뷰전환 list↔thumb=`/game/game_search_*`, 더보기, 장르 칩 정상)
- [ ] head/viewport (theme #000, title=통합검색 - q)
- [ ] 증분 동작 (더보기 append + 마지막 alert) — 구형 카드 divergence는 game_list 승인 동일
- [ ] 엣지 (빈 q→"통합검색 - ", 비로그인 wishlist_chk N, soldout 품절)
- [ ] middleware rewrite/폴백
