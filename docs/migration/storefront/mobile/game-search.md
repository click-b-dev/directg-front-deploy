# 모바일 통합검색 game_search (한국어지원 변형 검색)

## 원본 (legacy mobile)

- 파일: `mobile/game/game_search.html` (477줄). 더보기: `game_search_ajax.php`(POST {page,q,sort}).
- fetcher: `getGoodsSearch(page,add_where,orderby,param,is_bonus,q)` / **is_promotion=Y면 `getGoodsPromotionSearch`**. q는 `MATCH(product_name,product_name_en,keyword) AGAINST('q*' BOOLEAN)`.
- 필터: q, search_platform, genre_code(match b.tags), is_promotion, interface/spoken/exclusive_korean, is_preorder, is_bonus, game_type. sort: release/pricedown/priceup(+match/discount) — is_promotion 여부로 컬럼 분기(백엔드).
- **game_search_thumb/list(getGameList q)와 별개** — 전용 검색 fetcher + 전용 카드.

## 화면·플로우

- 진입: `/game/game_search.html?q=&sort=&{필터}` (검색/필터 목적지).
- title 동적: `통합검색` / interface_korean=Y→`자막 한국어지원` / spoken_korean=Y→`음성 한국어지원` / exclusive_korean=Y→`독점 한국어지원` (분기 순서상 exclusive가 최종 우선).
- 상단: `총 N 개` + **sort select**(::::정렬순서:::/출시일순 release/낮은가격순 pricedown/높은가격순 priceup; discount는 legacy 주석). select onChange → `location.href="/game/game_search.html?q={q}&sort={val}"` (**q·sort만 유지, 다른 필터 드롭 — legacy quirk**).
- 목록: `#goods_list` > **search 전용 카드**(`card row-card rounded-1 card-shadow border-0`): img(col-5, badge top-0 game/dlc/music/bundle) + product-info(col-7, 한국어 badge 3종 + product_name) + card-tail(delivery/promotion/preorder/bonus badge + 할인%/정가/판매가).
- 더보기: POST {page,q,sort} append + 마지막 alert.
- offcanvas 필터/정렬(btn_filter/btn_sort) JS는 대상 요소 부재 → **dead**(미이식).

## 데이터 / 계약 (신규)

- **신규 엔티티** `entities/game-search` — `getGameSearch(page, filters, sort)` + `GameSearchResponse { list: ProductThumb[]; page; totalPages; total }`(카드 필드 ProductThumb 재사용, view_url·가격·배지 백엔드 제공).
- **신규 계약** `GET /api/game/search?q=&sort=&{필터}`(getGoodsSearch/getGoodsPromotionSearch + MATCH + sort 컬럼분기). mock `game/search` 핸들러(gameListFixture 재사용).
- **신규 UI** `MobileGameSearchCard`(search 전용 카드 — thumb/list_inc와 다른 3번째 변형, legacy 마크업 전사).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_search.html`
- 라우트: `app/m/game/game_search.html/page.tsx`(server, theme#000, `generateMetadata` title 동적(interface/spoken/exclusive), collectFilters(q+필터+sort), getGameSearch)
- screen: `screens/mobile-game-search`
  - `MobileGameSearchScreen`: `MobileSubHeader(title)` + `#appCapsuleSub.full-height` + `총 N 개` + `MobileGameSearchSort`(client select, q+sort 리셋) + `MobileGameSearchItems`
  - `MobileGameSearchItems`(client): `#goods_list` + `MobileGameSearchCard` + 더보기 서버액션 `loadMoreGameSearch(page, filters, sort)`
  - `MobileGameSearchCard`(신규 카드)
  - `api/load-more-game-search.ts`
- 재사용: `product-thumb`(ProductThumb), `mobile-sub-header`. 신규: entity/mock/카드.

## Parity 체크리스트 (모바일 UA)

- [ ] title 동적(통합검색/자막/음성/독점)
- [ ] 총 N 개 + sort select(q+sort 리셋 quirk)
- [ ] search 카드(badge/한국어/가격/delivery) 일치
- [ ] 더보기 append + 마지막 alert
- [ ] head/viewport theme#000
- [ ] middleware rewrite
- caveat: offcanvas 필터/정렬 dead 미이식, is_promotion 시 promotion 검색 fetcher(백엔드), 더보기 구형 divergence 무관(자체 카드 단일)
