# 메인 2-2: 게임 리스트 3종 (추천·특집 / 인기게임 / 신규게임)

메인 `pc/index.php` 섹션 그룹 2-2. 공통 상품 카드(`thumb_inc.php`) + `card-list.css` 첫 도입.

## 원본
- 파일: `pc/index.php`
  - 추천·특집: `#recommand` (408–432) — `count($main_recommand)>0`일 때만
  - 인기게임: `#best_game` (434–460)
  - 신규게임: `#new_game` (463–477)
- 카드 마크업: `pc/game/thumb_inc.php` (drawThumb가 상품마다 include)
- 데이터: `Main::getMainRecommand()`(98) · `getBestTitle(12)`(231) · `getNewGame(8)`(297), 카드 조립 `Draw::getProductInfo()`(17)
- 참조: `docs/design-system/client.md`, `docs/migration/storefront/main/main-banner-notice.md`

## 화면·플로우
### 추천·특집 (`#recommand`)
- `count>0`일 때만 섹션 렌더. h2 "추천 및 특집"
- 각 recommand(article): `col-md-6` 배너(`recommand_banner` 이미지 + `recommand_banner_link`) / `col-md-6` `thumb_list`(recommand_goods 카드 = drawThumb)
- 각 article 뒤 `b-example-divider`

### 인기게임 (`#best_game`)
- h2 "인기게임", `d-grid` 안에 순위 카드
- 각 카드: 순위 뱃지(1부터) + 커버 이미지 `{domain}/upload/title/{title_id}/library/library_600x900.jpg` (onerror → `/assets/images/logo/H2_DG_BI_VERTICAL.svg`)
- 링크: `/game/game_view.html?product_id={sku}`
- **drawThumb 미사용**(자체 커버 카드)

### 신규게임 (`#new_game`)
- h2 "신규게임" + 전체보기 버튼(`/game/game_thumb.html?category_code=&sort=release`)
- `#thumb_list` = drawThumb(new_game 카드)

### 공통 상품 카드 (`thumb_inc.php`) — 재사용 핵심
- thumb-area: `{domain}/upload/product/{product_code}/header/header.jpg` (onerror 숨김)
- thumb-content-area:
  - 프로모션 종료일(`is_promotion=='Y'` → `{promotion_end} 종료`, text-danger)
  - 배지: 배송타입(1 코드/2 택배/3 코드+택배), 한국어(음성/인터페이스·자막/독점, 없고 delivery 1·3이면 "한국어 지원안함"), 예약구매, 특전(is_bonus), 네이버페이(is_naverpay_coupon), 추가적립(is_add_repay)
  - label_area: game_type/display_type별 GAME/에디션/멀티팩/DLC/Music/번들/본체
- content-area: 플랫폼 아이콘(1 steam/34 epic/35 rockstar/51 holomodels) + 상품명(text-truncate)
- 가격: `discount>0`이면 할인율 뱃지(`promotion_label`) + 원가 취소선, 판매가(`number_format`)
- 버튼: 위시리스트(`btn_wishlist`, `wishlist_chk` y/n 아이콘), 장바구니(`btn_cart`, `soldout=='Y'`면 "품절")

### 세션/권한 의존
- `wishlist_chk`: 로그인 회원의 위시 여부(비로그인 → 전부 "N"). **인증 미정 → 비로그인(N) 고정, 보류.**
- 위시/장바구니 버튼 클릭 = AJAX(`wishlist_proc.php`/`cart_proc.php`). **order/session 영역 → 마크업만 재현, 핸들러 보류**(2-1 배너와 동일 정책).

## SSR·SEO
- 세 섹션 모두 SSR 렌더(캐러셀 아님, `card-list.css`/`d-grid` 레이아웃 — Splide init 없음)
- 페이지 전용 자산: `card-list.css`(메인 screen에서 로드)

## 데이터 (legacy)
- `getMainRecommand()`: `tbl_main_recommand`(is_del='N', is_view='Y', 기간 유효, recommand_sort asc). `recommand_goods_1~4` → `getGoodsItemDetail` → recommand_goods 배열
- `getBestTitle($n)`: `tbl_title_best`⋈`tbl_goods`(sales_status='S', is_view='Y', ranking not null, ranking asc, limit n). title_id/title_name/release_date/domain/sku
- `getNewGame($n)`: `tbl_goods`⋈`tbl_title_option`⋈`tbl_goods_item`(is_view='Y', status='0', game_type='game', display_type='basic', idx desc, limit n)
- `getProductInfo($datas, $m_no)` 조립: 위시(`getWishlistByProducts`), 프로모션(`getPromotionGoodsPriceByProducts` → sale_price>0이면 discount=discount_rate/price=sale_price/is_promotion=Y/label=bg-danger/promotion_end), 타이틀(`getGoodsOptionTitleInfoByProducts` → sku), 추가적립(`getAddrepayGoods`), view_url(game_type별)

## API 계약 (백엔드 전달)

### `GET /api/main/recommendations` — 추천·특집
- 응답: `{ "recommendations": [ { "idx", "recommand_name", "recommand_banner", "recommand_banner_link", "recommand_banner_target", "recommand_goods": ProductThumb[] } ] }`
- 백엔드: `tbl_main_recommand` 유효 목록 + recommand_goods_1~4 상품을 ProductThumb로 조립

### `GET /api/main/best-titles?limit=12` — 인기게임
- 응답: `{ "titles": [ { "title_id", "title_name", "release_date", "domain", "sku" } ] }`
- 백엔드: `tbl_title_best`⋈`tbl_goods`, ranking asc, limit

### `GET /api/main/new-games?limit=8` — 신규게임
- 응답: `{ "games": ProductThumb[] }`
- 백엔드: getNewGame 쿼리 + getProductInfo 조립

### ProductThumb (공통 카드 계약)
- `view_url, domain, product_code, product_name, goods_sku`
- `is_promotion('Y'|'N'), promotion_end, promotion_label('bg-danger'|'bg-primary'), discount(number), consumer_price(number), price(number)`
- `delivery_type('1'|'2'|'3'), spoken_korean, interface_korean, exclusive_korean, is_preorder, is_bonus, is_naverpay_coupon, is_add_repay, soldout ('Y'|'N')`
- `game_type, display_type, product_platform`
- `wishlist_chk('Y'|'N')` — 세션 의존(비로그인 N)
- 백엔드 책임: `getProductInfo` 조립(위시/프로모션/타이틀/적립/view_url)을 응답에 반영

## 타겟 매핑
- entities: `entities/product-thumb`(공통 `ProductThumb` 타입 + `ProductThumbCard` UI), `entities/main-recommand`, `entities/best-title`, `entities/new-game`
- widgets: `widgets/recommand-section`, `widgets/best-game-section`, `widgets/new-game-section`
- screen: `screens/home`에 3섹션 추가 + `card-list.css` 로드
- mock: fixtures 3 + handlers 3

## Parity 체크리스트
- [ ] 추천·특집: count>0 조건, 배너+카드4, divider
- [ ] 인기게임: 순위 뱃지, 커버 이미지 onerror fallback, game_view 링크
- [ ] 신규게임: 전체보기 버튼, thumb_list 카드
- [ ] 공통 카드: 배지(배송/한국어/예약/특전/네이버페이/적립), label(game_type), 플랫폼 아이콘, 가격/할인, 위시/장바구니 버튼(품절)
- [ ] view_url game_type별 분기
- [ ] number_format(콤마), discount 표기
- [ ] 엣지: recommand 0건(섹션 숨김), 카드 이미지 onerror, soldout 품절

## 보류/후속
- 위시/장바구니 버튼 AJAX, wishlist_chk 세션 → 인증/order 단위
- 이벤트배너/예약구매/한국어/퍼블리셔/플랫폼 → 2-3/2-4
- 카드 데이터 = fixture(MSW). ProductThumb 계약 확정.
