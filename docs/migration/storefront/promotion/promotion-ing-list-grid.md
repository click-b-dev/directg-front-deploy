# 할인진행중 list/grid 뷰 (promotion/promotion-ing-list-grid)

> promotion_ing_thumb(완료)의 뷰 변형. **동일 데이터·필터·정렬**, 카드 컨테이너/카드 레이아웃만 다름. 공통 screen(viewType)으로 통합.

## 원본
- 파일: `pc/promotion/promotion_ing_list.html`(`#card_list` + `Draw::drawList` → `game/list_inc.php` 171줄), `pc/promotion/promotion_ing_grid.html`(`#grid_list` + `Draw::drawGrid` → `game/grid_inc.php` 94줄)
- 데이터/세션/필터: promotion_ing_thumb와 **완전 동일**(getGoodsList2 + is_promotion=Y, filter_include, 60/page, wishlist_chk 세션). PHP head/aside 동일, `$page_type`만 list/grid.
- 선례: `screens/promotion-ing-thumb`(thumb 뷰, 공통화 대상), `entities/product-thumb`(ProductThumbCard·ProductThumb 타입), `widgets/game-filter`·`game-filter-order`(재사용), `card-list.css`(#card_list/#grid_list 그리드 존재)

## 카드 레이아웃 (thumb 대비 차이)
- **list_inc**(가로형): `<div class="col"><div class="card ... flex-row">` — 썸네일(좌) + [플랫폼 아이콘(platform 1/34/35/51)] + content-area(제목 h5 / badge_area / price_area) + button-area(위시+장바구니). 뱃지 클래스 `bg-none-40`(thumb는 `bg-light-50`). 가격영역에 `[프로모션: {promotion_end} 종료]` 텍스트. **장바구니 버튼에 "장바구니" 텍스트**(thumb는 아이콘만).
- **grid_inc**(그리드형, 간단): `<div class="card">` — 썸네일 + label_area + content-area(title_area / purchase-area: 할인율/가격/**위시만**). 장바구니 버튼 없음.
- **라벨(label_area)**: 3카드 공통 game_type/display_type switch. 단 클래스 미세차(list multi=`bg-warning`(no rounded/font), grid multi=`bg-warning rounded-0 font-12 fw-bold`, thumb multi=`bg-warning`+렌더시 rounded-0 font-12) → **각 카드 verbatim**.
- 공통 필드: ProductThumb 타입 재사용(view_url/domain/product_code/product_name/goods_sku/게임타입/플랫폼/한국어/뱃지/할인/가격/wishlist_chk 등).

## 뷰 전환 (game_filter_order, 이미 이관)
- list/thumb/grid 아이콘 링크 = `/promotion/promotion_ing_{type}.html?{qs}`. thumb 이관 시 list/grid는 죽은 링크였음 → **이번에 list/grid 라우트 생성으로 활성화**.

## SSR·SEO
- head: promotion_ing_thumb와 동일(`title=할인진행중`, description 빈, author 빈, amazonbot noarchive, viewport). 각 라우트 metadata 동일.
- CSS: card-list.css(#card_list/#grid_list 그리드 이미 존재, screen `<link>`). directg/styleguide(layout 전역, 필터 CSS 포함).

## API 계약
- 신규 없음. `GET /api/promotion/ing` (getPromotionIngList) **재사용**. list/grid도 동일 응답(ProductThumb[] + total). 뷰는 프론트 렌더 차이.

## 타겟 매핑
- entities: `entities/product-thumb`에 **`ProductListCard`**(list_inc 재현, col>card 가로형) + **`ProductGridCard`**(grid_inc 재현) 추가 + index export. ProductThumb 타입 재사용.
- screen: `screens/promotion-ing/ui/promotion-ing-screen.tsx` 공통 (viewType prop). 컨테이너 id(thumb_list/card_list/grid_list) + 카드(ProductThumbCard/ListCard/GridCard) 분기 + GameFilterOrder pageType 전달. 기존 `screens/promotion-ing-thumb`는 이 공통으로 대체(thumb 동작 동일 유지).
- 라우트: `app/promotion/promotion_ing_list.html/page.tsx`(viewType=list) + `promotion_ing_grid.html/page.tsx`(viewType=grid) 신규. 기존 `promotion_ing_thumb.html`은 공통 screen(viewType=thumb)으로 전환. 3개 동일 metadata/필터파싱/getPromotionIngList.
- mock: 재사용(변경 없음).

## Parity 체크리스트
- [ ] list 카드(col>card 가로, 썸네일+플랫폼+제목h5+뱃지+가격+[프로모션 종료]+위시/장바구니 텍스트버튼) verbatim
- [ ] grid 카드(썸네일+label+제목+할인율/가격/위시만) verbatim
- [ ] 라벨 game_type/display_type 각 카드 verbatim(멀티팩 클래스 차이)
- [ ] 컨테이너 #card_list/#grid_list + card-list.css + 뷰전환 링크 활성화(list/thumb/grid active)
- [ ] thumb 뷰 동작 동일 유지(공통 screen 전환) + 필터/정렬/페이지네이션 3뷰 공유
- [ ] SEO(동일 metadata) / getPromotionIngList 재사용
