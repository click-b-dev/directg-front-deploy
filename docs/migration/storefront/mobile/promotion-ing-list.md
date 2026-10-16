# 모바일 할인진행중 list 뷰 (promotion/promotion_ing_list)

> 모바일 할인진행중 목록의 **list 뷰**. thumb 뷰(`promotion_ing_thumb.html`)는 이미 🟢 이관됨. 데이터/더보기/필터연기 전략은 thumb과 동일하고, **카드만 `list_inc.php`(가로형 list 카드)로 다름**. 이 단위에서 공용 `MobileListCard`(여러 게임 목록 페이지 공유)를 도입한다.

## 원본 (legacy mobile)
- 파일: `mobile/promotion/promotion_ing_list.html`(page_name=promotion_ing, page_type=list) + `mobile/game/list_inc.php`(카드) + `promotion_ing_list_ajax.php`(더보기) + `inc/footer_common.html`(더보기 버튼)
- PC 대응: `docs/migration/storefront/promotion/promotion-ing-list-grid.md`
- 모바일 선례: `screens/mobile-promotion-ing-thumb`(동일 데이터/더보기 구조), `entities/product-thumb` `MobileThumbCard`(thumb 카드)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/promotion/promotion_ing_list.html` (+ 필터 파라미터 platform/genre_code/category_code/sort/is_*/price/game_type_* — thumb과 동일 파라미터셋).
- page_title="진행중인 프로모션", is_promotion="Y" 고정, `getGoodsList2(page, ..., 60)`.
- 레이아웃: sub_header + `#appCapsuleSub.full-height` > game_filter(offcanvas) + `section full` > `wide-block pt-2 pb-2 px-2 > #goods_list`(list_inc 카드 반복) + `wide-block ... #btn_paging`(더보기).
- **더보기**: `#btn_paging`(data-page/data-total) → ajax append, 현재/전체 페이지 카운터, 마지막 페이지 시 "마지막페이지입니다" alert (thumb과 동일 `footer_common.html`).
- **offcanvas 필터(game_filter.html)**: thumb과 동일하게 **후속 연기**(모바일 공통 단위).

### list_inc.php 카드 (가로형, `card row-card card-shadow border-0`)
- `card-body d-flex`: 좌측 `img col-5`(view_url 링크 + header.jpg + game_type/display_type 배지 bg-c* 좌하단) + 우측 `product-info col-7`:
  - product_name(text-truncate)
  - 배지행1: delivery_type(코드/택배/코드+택배) + is_promotion(프로모션) + is_preorder(예약) + is_bonus(특전) — `badge-outline-secondary opacity-50 fs-7`
  - 배지행2(한국어): spoken_korean(음성 한국어)/interface_korean(인터페이스/자막 한글)/exclusive_korean(독점 한국어) — `dot`
  - 배지행3: product_platform 로고(1 steam/34 epic/35 rockstar/51 holomodels) + is_naverpay_coupon(포인트 지급) + is_add_repay(추가 적립)
- `card-tail`: 좌 할인율 배지(`{promotion_label} percent minus`)+정가취소선/판매가(num won) / 우 **위시버튼 + 장바구니버튼**(soldout이면 품절 배지).

### 위시/장바구니 (order 도메인)
- `btn_wishlist`(wishlist_chk Y→outline-cdanger+아이콘_y / N→outline-csecondary+아이콘_n) · `btn_cart`(soldout≠Y) — legacy는 base.js AJAX. **order 도메인 이월 → 마크업만 렌더(핸들러 없음), 비로그인 wishlist_chk="N"**. 다른 모바일 상세(game_view 등) "위시·장바구니 order 이월(마크업만)" 선례 준수.

## 모바일 head / 앱셸
- viewport theme#000(thumb과 동일), title="진행중인 프로모션". description/keywords 빈값.
- 앱셸: MobileSubHeader("진행중인 프로모션") / bottom-nav / dialog_cart(레이아웃 전역).
- 자산: platform 로고·wishlist/basket/point 아이콘·npaybk 로고 전부 `public/mobile-assets`에 기존 복사분 존재(추가 복사 불필요).

## 데이터
- **재사용 엔티티**: `entities/promotion-ing` `getPromotionIngList(page, filters)`(server) + `ProductFilterParams`/`PromotionIngResponse` — thumb이 도입, list 동일 데이터(is_promotion=Y, 60/page).
- **더보기**: 얇은 server action `loadMorePromotionIng`(thumb의 것과 동일 로직 — list 스크린 로컬에 동일 작성, cross-screen import 회피).

## API 계약 (증분만)
- 증분 없음. thumb과 동일 `GET /api/promotion/ing`(getPromotionIngList) 재사용. list_ajax도 동일 데이터라 별도 계약 불필요.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가: `"/promotion/promotion_ing_list.html"`.
- 라우트: `app/m/promotion/promotion_ing_list.html/page.tsx`(server, viewport theme#000, getPromotionIngList(page1, filters)).
- screen: `screens/mobile-promotion-ing-list/ui/mobile-promotion-ing-list-screen.tsx`(server 셸, MobileSubHeader + appCapsuleSub) + `mobile-promotion-ing-list-list.tsx`(client, `#goods_list` + `MobileListCard` + 더보기) + `api/load-more-promotion-ing.ts`(server action).
- 신규 UI: `entities/product-thumb` `MobileListCard`(list_inc.php 공용 카드).
- 재사용 entities: `entities/promotion-ing`(getPromotionIngList/타입), `entities/product-thumb`.
- mock: 기존 promotion-ing handler 재사용(증분 없음).

## Parity 체크리스트 (모바일 UA)
- [ ] list 카드(가로형 row-card, img col-5 + info col-7) 마크업 일치
- [ ] 배지(타입/delivery/promotion/preorder/bonus/한국어/플랫폼/naverpay/add_repay) 일치
- [ ] 위시/장바구니 버튼(wishlist_chk 상태·soldout 품절) 마크업 일치(핸들러 없음)
- [ ] 가격(할인율 배지/정가취소선/판매가) 일치
- [ ] 더보기 증분/페이지 카운터/마지막 alert 일치
- [ ] title/viewport/theme#000 일치
- [ ] middleware rewrite/폴백, offcanvas 필터 후속 연기(thumb 동일)
