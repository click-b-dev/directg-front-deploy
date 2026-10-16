# 모바일 전체게임 목록 list 뷰 (game_list)

## 원본 (legacy mobile)

- 파일: `mobile/game/game_list.html` (라이브: `.html`이 PHP로 처리됨 — mobile/.htaccess에 `.html→.php` rewrite 없음, 서버 핸들러가 .html을 PHP 실행). 193줄.
- 더보기 증분: `mobile/game/game_list_ajax.php` (10.6K)
- 초기 카드 include: `mobile/game/list_inc.php` (8.4K)
- 필터 도출: `mobile/game/new_game_common.php` (orderby/param/add_where)
- 오프캔버스 필터: `mobile/inc/game_filter.html`
- 더보기 JS: `mobile/inc/footer_common.html` (btn_paging append)
- PC 대응 단위: `docs/migration/storefront/game/game-list.md` (재사용 엔티티 출처)
- 모바일 자매(같은 데이터, thumb 뷰): `docs/migration/storefront/mobile/game-thumb.md` (파일럿 — 구현 패턴 원본)

`game_list.html`은 `game_thumb.html`과 거의 동일하며 유일한 차이는:
`$page_type="list"` (thumb은 "thumb") + `#goods_list` + `list_inc.php` (thumb은 `#goods_thumb` + `thumb_inc.php`).
즉 **전체게임 목록의 "리스트 뷰"** — 오프캔버스 필터 위젯의 뷰전환(list ↔ thumb) 링크가 가리키는 대상.

## 화면·플로우 (legacy mobile 기준)

- 진입 URL/파라미터 (.html 경로): `/game/game_list.html` — GET 필터 다수(platform, genre_code_1~10, game_type_*, platform_1/34/35, interface/spoken/exclusive_korean, min/max_price, is_bonus/preorder/repay/promotion/soldout, sort, page). 필터 없이 진입 시 전체.
- 기본 where: `find_in_set(a.game_type,'game,dlc,music,bundle')` (thumb과 동일).
- 페이지당 60개(`getGoodsList2(page, add_where, orderby, param, 60)`). page 빈값→1.
- 화면 요소 / 마크업 조각:
  - `inc/sub_header.html` → `MobileSubHeader`(검색토글/뒤로/장바구니). pageTitle="모든게임"(`$page_title`).
  - `inc/game_filter.html` → `MobileGameFilter`(공용 오프캔버스 필터). **aside 미설정 → 5블록 전부 노출(프로모션 체크박스 포함)**.
  - `#appCapsuleSub.full-height` > `.section.full` > `.wide-block` > `#goods_list`(`list_inc.php` 카드 반복) + 더보기 버튼(`btn_paging`, `data-page`/`data-total`, `( page / total ) 더보기`, class `btn btn-secondary btn-block`).
  - `inc/sub_bottom_menu.html`·`sidebar.html`·`dialog_cart.html` — `/m/layout.tsx` 앱셸 소유.
- 카드(`list_inc.php`, 가로형): img(col-5) + product-info(col-7). badge(position **bottom-0**) game_type/display_type별(기본게임/에디션/멀티팩/DLC/Music/번들/본체/holomodels DLC·에디션). product_name text-truncate + delivery/promotion/preorder/bonus 배지 + 한국어(음성/인터페이스/독점) dot 배지 + 플랫폼 로고(1 Steam/34 Epic/35 Rockstar/51 holomodels, width 1.25rem) + naverpay(0.5rem) + is_add_repay 추가적립 배지. card-tail: 할인% (promotion_label, `percent minus`) + 정가 취소선 + 판매가(won ₩) + 위시버튼(비로그인 wishlist_chk **N**) + soldout≠Y 장바구니버튼 / soldout=Y "품절" 배지.
- 분기/리다이렉트: 없음(공개 목록).
- 세션/권한 의존: 로그인 시 각 상품 wishlist_chk 판정(백엔드, `getWishlistItem`). 비로그인이면 N.

## 모바일 head / 앱셸

- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`. theme-color `#000000`. apple-web-app capable + black-translucent. (game_thumb.html/page.tsx와 동일 — 그대로 재사용)
- title: "모든게임", description 빈값.
- 사용 앱셸: `MobileSubHeader(pageTitle="모든게임")` + bottom-nav(레이아웃 소유) + dialogs(레이아웃 소유). `MobileGameFilter` 오프캔버스.
- 페이지별 mobile-assets CSS: 없음(공통 style/dg_style/styleguide, 레이아웃 소유). 플랫폼/아이콘/로고 svg는 `mobile-assets` 기존 복사분 재사용.

## 데이터

- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)` (server-only, 세션쿠키 전달, 60/page) + `GameListResponse`(list/page/totalPages/total). **thumb 파일럿과 동일 데이터 — 증분 없음.**
- 카드: `entities/product-thumb` `MobileListCard` (promotion_ing_list 단위가 생성, `list_inc.php`와 field-for-field 일치). **재사용, 증분 없음.**
- 모바일 전용 동작(증분/AJAX): 더보기 = `game_list_ajax.php`(page+1 조회). getGameList로 대체.

### ⚠️ Parity 노트 — 더보기 증분 카드 divergence (게이트 결정 대상)

legacy에서 초기 페이지는 `list_inc.php`, 더보기 증분은 `game_list_ajax.php`가 **인라인 구형 카드**를 렌더 → 두 카드가 다르다:

| 항목 | 초기(`list_inc.php`) | 더보기(`game_list_ajax.php` 인라인) |
|------|----------------------|-------------------------------------|
| badge 위치 | `bottom-0` | `top-0` |
| holomodels/accessories view_url | 있음 | 없음 |
| 플랫폼 51(holomodels) | 있음 | 없음 |
| is_add_repay 추가적립 배지 | 있음 | 없음 |
| soldout=Y 처리 | "품절" 배지(장바구니 숨김) | 없음(항상 장바구니) |
| 비로그인 wishlist_chk | "N" | "Y" |
| naverpay 로고 | 0.5rem | 0.75rem, fs-6 |
| 플랫폼 로고 크기 | width 1.25rem | h-100 |
| percent 배지 | `minus` 클래스 | 없음 |

이는 legacy 내부 drift(같은 프로젝트에서 `promotion_ing_list_ajax.php`는 `/game/list_inc.php`를 include하도록 이미 갱신됨 — 유지보수 방향은 "ajax도 list_inc 재사용"). `game_list_ajax.php`만 미갱신된 구형 카피.

**결정**: 백엔드 API 계약은 단일 `ProductThumb` shape + 단일 `getGameList`이며, 구형 인라인 카드는 데이터 형태부터 재현 불가(가짜 필드 차이 필요). 파일럿(game_thumb — thumb ajax는 thumb_inc include로 동일)·promotion_ing_list 선례 모두 "전 페이지 단일 카드"를 채택. 따라서 **모든 페이지에 `MobileListCard`(=`list_inc.php`) 렌더**로 통일한다. legacy 페이지 2+ 구형 카드와의 미세 시각차는 **게이트에서 개발자 승인 대상**으로 명시.

## API 계약 (증분만, 백엔드 전달)

증분 없음. `GET /api/game/list?page=N&{필터}` (PC/thumb 단위에서 이미 계약 확정). 필터/정렬/60per-page/wishlist_chk는 백엔드.

## 타겟 매핑

- middleware MOBILE_ROUTES 추가 경로: `/game/game_list.html`
- 라우트: `app/m/game/game_list.html/page.tsx` (game_thumb.html/page.tsx와 동일 구조 — viewport/metadata/collectFilters/getGameList, screen만 교체)
- screen: `screens/mobile-game-list`
  - `MobileGameListScreen`: `MobileSubHeader("모든게임")` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={}, total, viewBasePath="/game/game", pageType="list")` + `MobileGameListItems`
  - `MobileGameListItems`(client): `#goods_list` + `MobileListCard` 반복 + 더보기(footer_common 핸들러 재현: data-page==total→alert "마지막페이지입니다", 아니면 nextPage append) + 서버액션 `loadMoreGameList`
  - `api/load-more-game-list.ts`(server action): `getGameList(nextPage, filters)` → list 반환 (game_thumb load-more와 동일 로직)
- 재사용 entities: `game-list`(getGameList/GameListResponse), `product-thumb`(MobileListCard/ProductThumb), `promotion-ing`(ProductFilterParams 타입)
- 재사용 widgets: `mobile-sub-header`(MobileSubHeader), `mobile-game-filter`(MobileGameFilter)
- 신규 UI: 없음(MobileListCard 재사용)
- mock: 없음(getGameList mock 기존 — thumb 파일럿 재사용)

## Parity 체크리스트 (모바일 UA)

- [ ] 화면 요소 일치 (헤더/필터/list 카드/더보기)
- [ ] 필드/검증 일치 (카드 배지·가격·위시/장바구니·soldout, list_inc.php와 대조)
- [ ] 분기/플로우 일치 (필터 GET, 뷰전환 list↔thumb 링크, 더보기 증분)
- [ ] 모바일 head/viewport 일치 (theme #000, 모든게임)
- [ ] 증분/AJAX 동작 일치 (더보기 append + 마지막 alert) — ⚠️ 구형 카드 divergence는 게이트 결정
- [ ] 엣지케이스 (빈목록, 비로그인 wishlist_chk N, soldout 품절)
- [ ] middleware rewrite/폴백 (모바일 UA→/m, 데스크톱→PC game_list.html)
