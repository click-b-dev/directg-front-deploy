# 할인진행중 (promotion/promotion-ing-thumb) — 목록+카드+페이지네이션

> **범위(개발자 승인)**: 이번 단위는 **상품 목록 + 카드(drawThumb) + 페이지네이션**만 이관. **필터(game_filter)·정렬(game_filter_order)·장바구니(cart)·breadcrumb은 후속 단위**로 분리(필터 로직 filter_include.php 441줄은 game 도메인 공통 인프라). 필터 누락은 parity 잠정 미완성으로 명시.

## 원본
- 파일: `pc/promotion/promotion_ing_thumb.html` (**라이브** — `pc/inc/header.html:88` 할인프로모션 드롭다운 "할인진행중" → `?is_promotion=Y`)
- **DB**: 리뉴얼 DB(`$dsn`) + `Goods::getGoodsList2`(상품 목록) + `Draw::drawThumb`(카드 렌더 = `game/thumb_inc.php` include)
- 세션: 공개(비로그인 열람). `wishlist_chk`만 세션 의존(로그인 시 Y/N).
- 참조: `docs/design-system/client.md`, `docs/migration/storefront/main/game-lists.md`(ProductThumb 카드 계약)
- 선례: `entities/product-thumb`(`ProductThumbCard` — thumb_inc.php 재현, **그대로 재사용**), `card-list.css`(#thumb_list 그리드), `shared/ui/server-pagination`

## 화면·플로우 (이번 범위)
- 진입 URL: `/promotion/promotion_ing_thumb.html` (GET `?is_promotion=Y`이나 legacy PHP가 `$is_promotion="Y"` 하드코딩 — URL 파라미터 무관 Y). `?page=N`.
- 레이아웃: `div.wrap`(layout) > header > `container my-3 pb-5` > main > [game_filter — **후속**] > `section#content.content.rounded-0` > [game_filter_order — **후속**] > `#thumb_list`(카드 반복) > `#pagination`.
- `#thumb_list`: `Draw::drawThumb($result, m_no)` → 각 상품 `game/thumb_inc.php` = **`ProductThumbCard`**(재사용). `getGoodsList2` 성공 시에만 렌더.
- 페이지네이션: `$goods_list->links_html` — 60건/page(`result_per_page=60`).
- 후속 제외: game_filter(필터 UI 131줄)·game_filter_order(정렬 28줄)·cart.html(장바구니 모달, order 단위 연기)·breadcrumb(sub_title, game_filter 내).

## SSR·SEO (legacy)
- head: `<title>할인진행중</title>`, `description=""`, `author=""`(빈값), **`<meta name="amazonbot" content="noarchive">`**. favicon. canonical/OG 없음.
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- CSS: `card-list.css`(#thumb_list 그리드 — screen `<link>` 로드, home/board-dataroom 선례). Bootstrap/FA/Noto(layout 전역).
- 목록 SSR, 카드 버튼(wishlist/cart)은 client(동작은 후속).

## 데이터 (legacy)
- **리뉴얼 DB** `Goods::getGoodsList2($page, $add_where, $orderby, $param, $result_per_page=60, $q)`:
  - `$add_where`: filter_include.php 생성(이번엔 필터 미적용 → `is_promotion='Y'` 기본만). $orderby: 기본 정렬. $q: 검색어(없음).
  - 결과 product_code[] → `Draw::getProductInfo(product_codes, m_no)` → 카드 필드(ProductThumb, `game-lists.md` 계약과 동일)
- 카드 필드: `game-lists.md`/`entities/product-thumb` ProductThumb (view_url, domain, product_code, product_name, goods_sku, is_promotion, promotion_end, promotion_label, discount, consumer_price, price, delivery_type, spoken/interface/exclusive_korean, is_preorder/bonus/naverpay_coupon/add_repay, soldout, game_type, display_type, product_platform, wishlist_chk)

## API 계약 (백엔드 전달)
- `GET /api/promotion/ing?page=N` (optional 세션 쿠키 — wishlist_chk용) → `{ list: ProductThumb[]; page; totalPages }`
  - 백엔드: `getGoodsList2` + **`is_promotion='Y'` 고정**, 60건/page, 기본 정렬(orderby). `getProductInfo`로 카드 필드 구성. wishlist_chk는 세션 m_no 기준(비로그인 N).
  - **필터/검색/정렬 파라미터는 후속**(이번엔 page만). filter_include.php 441줄 로직은 game 도메인 공통 계약으로 후속 도출.
- 응답 타입: `entities/product-thumb` `ProductThumb` 재사용. 목록 응답은 `entities/promotion-ing/model/types.ts`.

## 타겟 매핑
- 라우트: `app/promotion/promotion_ing_thumb.html/page.tsx` → `/promotion/promotion_ing_thumb.html` (public, `getPromotionIngList(page)`, metadata title="할인진행중" + author 빈 + amazonbot noarchive)
- screen: `screens/promotion-ing-thumb/ui/promotion-ing-thumb-screen.tsx` (server) — card-list.css `<link>` + section#content + #thumb_list(`ProductThumbCard` 반복) + ServerPagination. 필터/정렬/cart 미포함(후속).
- entities: `entities/promotion-ing` 신규 (`getPromotionIngList` server + `PromotionIngResponse` 타입, ProductThumb 재사용)
- mock: `shared/mocks/fixtures/promotion-ing.ts`(ProductThumb[], is_promotion=Y·discount>0) + handler `GET */api/promotion/ing`

## Parity 체크리스트 (이번 범위)
- [ ] #thumb_list 카드 그리드(ProductThumbCard 재사용) + 60건/page + 페이지네이션
- [ ] 카드 필드/뱃지/할인율/가격/위시·장바구니 버튼 마크업(product-thumb 재사용) + card-list.css
- [ ] is_promotion=Y 고정(백엔드) + wishlist_chk 세션
- [ ] SEO(title 할인진행중/description 빈/author 빈/amazonbot noarchive/viewport)
- [ ] **후속 명시**: 필터(game_filter)·정렬(game_filter_order)·cart 모달·breadcrumb
