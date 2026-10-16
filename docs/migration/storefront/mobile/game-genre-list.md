# 모바일 장르별 게임 목록 list 뷰 (game_genre_list)

## 원본 (legacy mobile)

- 파일: `mobile/game/game_genre_list.html` (`.html`=PHP). 더보기: `game_genre_list_ajax.php`. 카드: `list_inc.php`. 필터 도출: `new_game_common.php`.
- PC 대응 단위: `docs/migration/storefront/game/game-genre.md`(엔티티) — mobile은 `game_genre_thumb`/`game_list` 선례 재사용.
- 자매(같은 데이터 thumb 뷰): `docs/migration/storefront/mobile/game-genre-thumb.md` ✅ / list 원형: `game-list.md`·`game-platform-list.md` ✅

`game_genre_list.html`은 `game_list.html`과 거의 동일하며 차이는:

| 항목 | game_list | game_genre_list |
|------|-----------|-----------------|
| `$aside['genre']` | 미설정(장르 블록 노출) | `"false"` (장르 블록 숨김) |
| `$page_name` | `"game"` | `"game_genre"` (더보기 ajax=game_genre_list_ajax.php) |
| `$page_title` | `"모든게임"` | `$goods->getPrimaryGenreName($genre_code)` (**백엔드 도출**, DB tbl_tags) |
| 필터 축 | 없음 | `genre_code` GET |
| `$search_label[5]`(장르 칩) | 유지 | **주석처리**(비노출, L51) |

`page_type="list"`, `#goods_list`, `list_inc.php` 동일. `game_genre_thumb.html`과는 include(list vs thumb)만 다름. where 기본 `find_in_set(a.game_type,'game,dlc,music,bundle')` + genre_code는 backend 필터.

**platform_list와 차이**: title이 백엔드 도출(getPrimaryGenreName)이라 정적 매핑 불가 → `getGameGenreList`(genreName 포함) 사용. PC의 **장르 베스트 캐러셀은 모바일 미사용**(genre_thumb과 동일). genre 칩은 legacy가 주석처리했고, 위젯 칩은 `genre_code_1~10` 기반이라 `?genre_code=`로는 애초에 칩 미생성 → parity 유지.

## 화면·플로우 (legacy mobile 기준)

- 진입 URL: `/game/game_genre_list.html?genre_code=G0001…G0010` (+ game_list 필터). genre_code **기본 주입 없음**(빈값이면 genreName 빈 title).
- title/pageTitle = `getPrimaryGenreName($genre_code)` (API `genreName`).
- 구성 = game_list와 동일: `MobileSubHeader` + `game_filter.html`(**장르 블록 숨김**) + `#goods_list`(list_inc.php) + 더보기(btn_paging).
- 세션/권한: 로그인 시 wishlist_chk(백엔드), 비로그인 N.

## 모바일 head / 앱셸

- viewport/theme #000/apple-web-app = game_list와 동일. title=동적(genreName). description 빈값.
- 앱셸: `MobileSubHeader(pageTitle=genreName)` + `MobileGameFilter(aside={genre:false})` + bottom-nav/dialogs(레이아웃).

## 데이터

- 재사용 엔티티: `entities/game-genre` `getGameGenreList(genreCode, page, filters)` + `GameGenreResponse`(list/page/totalPages/total/genreName/bestTitles). **증분 없음**(genre_thumb과 동일). bestTitles는 미사용.
- 카드: `entities/product-thumb` `MobileListCard` **재사용**.
- 더보기: `getGameGenreList(genreCode, nextPage, filters)` — game_list divergence 노트 동일 적용(전 페이지 `MobileListCard`).

## API 계약 (증분만)

증분 없음. `GET /api/game/genre?genre_code=&page=N&{필터}` (기존 계약, 백엔드 필터/정렬/60per-page/wishlist_chk/genreName).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_genre_list.html`
- 라우트: `app/m/game/game_genre_list.html/page.tsx` (genre_thumb page.tsx 구조 — `generateMetadata`=data.genreName, `resolveGenreCode`, `collectFilters`(genre_code 제외), screen만 list로 교체)
- screen: `screens/mobile-game-genre-list`
  - `MobileGameGenreListScreen`: `MobileSubHeader(genreName)` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={genre:false}, total, viewBasePath="/game/game_genre", pageType="list")` + `MobileGameGenreListItems`
  - `MobileGameGenreListItems`(client): `#goods_list` + `MobileListCard` + 더보기(footer_common 재현) + 서버액션 `loadMoreGameGenreList(genreCode, nextPage, filters)`
  - `api/load-more-game-genre-list.ts`: `getGameGenreList(genreCode, nextPage, filters)`
- 재사용: `game-genre`, `product-thumb`(MobileListCard), `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`
- 신규 UI: 없음. mock: 없음(기존 getGameGenreList mock).

## Parity 체크리스트 (모바일 UA)

- [ ] 화면 요소 (헤더 동적 genreName / 필터 **장르 블록 숨김** / list 카드 / 더보기)
- [ ] 필드/검증 (MobileListCard = list_inc.php)
- [ ] 분기/플로우 (genre_code 필터, 뷰전환 list↔thumb=`/game/game_genre_*`, 더보기, 장르 칩 미생성)
- [ ] head/viewport (theme #000, title=genreName)
- [ ] 증분 동작 (더보기 append + 마지막 alert) — 구형 카드 divergence는 game_list 승인 동일
- [ ] 엣지 (빈 genre_code→빈 title, 비로그인 wishlist_chk N, soldout 품절, bestTitles 미표시)
- [ ] middleware rewrite/폴백
