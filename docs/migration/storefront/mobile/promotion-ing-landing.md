# 모바일 진행중 프로모션 랜딩 promotion_ing(무접미)

## 원본 (legacy mobile)

- 파일: `mobile/promotion/promotion_ing.html` (450줄). 더보기: `promotion_ajax.php`(POST {page,sort}).
- fetcher: `getPromotionIng(page, add_where, orderby, param, '30')` — is_promotion 고정 + 필터(cost 범위/platform/game_type/korean/genre/category) + sort, **30/page**.
- **thumb/list(promotion_ing_thumb/list, getGoodsList2+is_promotion, 60/page, MobileGameFilter offcanvas)와 별개** — 랜딩은 sort select만(offcanvas 없음)·검색형 카드.

## 화면·플로우

- 진입: `/promotion/promotion_ing.html?sort=&{필터}`.
- title "진행중인 프로모션".
- 총: N 개(콜론 포함) + **sort select**(::::정렬순서:::/출시일순 release/낮은가격순 pricedown/높은가격순 priceup/**높은할인률순 discount** — thumb/list·search와 달리 discount 옵션 유효). onChange → `/promotion/promotion_ing.html?sort={val}`(sort만 유지 quirk). default sort → release desc(sort="discount" 내부).
- 목록: `#goods_list` > **search 전용 카드**(`card row-card rounded-1 card-shadow border-0` — game_search 카드와 동일 마크업).
- 더보기: POST {page,sort} append(다른필터 드롭 quirk) + 마지막 alert.

## 데이터 / 재사용

- **재사용**: `entities/promotion-ing` `getPromotionIngList(page, filters)` + `PromotionIngResponse`(list/page/totalPages/total) — `/api/promotion/ing`(ProductFilterParams에 sort 포함). mock 기존. **증분 없음**.
- 카드: `MobileGameSearchCard` **재사용**(`@screens/mobile-game-search` 공개 API).
- **per-page 차이**: legacy 랜딩 30/page vs thumb/list 60/page — 백엔드 처리(계약 동일 `/api/promotion/ing`, 페이지 크기는 백엔드). caveat.

## 타겟 매핑

- middleware MOBILE_ROUTES: `/promotion/promotion_ing.html`
- 라우트: `app/m/promotion/promotion_ing.html/page.tsx`(server, theme#000, title "진행중인 프로모션", collectFilters(q/sort 포함)·getPromotionIngList)
- screen: `screens/mobile-promotion-ing-landing`
  - `MobilePromotionIngLandingScreen`: `MobileSubHeader("진행중인 프로모션")` + `#appCapsuleSub.full-height` + `총: N 개` + sort select + `MobilePromotionIngLandingItems`
  - items(client): `#goods_list` + `MobileGameSearchCard` + 더보기 서버액션 `loadMorePromotionIngLanding(nextPage, sort)`
- 재사용: `promotion-ing`, `product-thumb`, `mobile-sub-header`, `mobile-game-search`(카드). 신규 UI: sort select(discount 포함).

## Parity 체크리스트 (모바일 UA)

- [ ] title "진행중인 프로모션" / 총: N 개
- [ ] sort select(discount 포함), sort만 리셋 quirk
- [ ] search 카드 목록 + 더보기(sort만 quirk)
- [ ] head theme#000
- [ ] middleware rewrite
- caveat: 랜딩 30/page(백엔드)·offcanvas 없음(thumb/list와 다름)·더보기 sort만
