# 모바일 패키지 옵션 상세 game_package_view

## 원본 (legacy mobile)

- 파일: `mobile/game/game_package_view.html` (415줄). **구성정보 안내 상세 페이지** — 전체 게임은 game_view로 링크.
- 데이터(백엔드 조립):
  - `getGoodsItemDetailSku($sku)` → goods_item(product_code/product_name/domain/goods_sku/soldout/release_date/consumer_price/price/discount/promotion{sale_price,discount_rate}/is_view/status)
  - `getTitleDetail(product_code)` → title_info(product_id/title_id/title_name/developer/publisher/genre/category/age_limit/game_rate/spoken·interface·exclusive_korean)
  - `getGoodsDescription(title_id)` → short_description, region_msg
  - `getGoodsOptionDescription(product_code)` → dgkr_description, description(Parsedown, `##`→`###`)
  - `getGoodsOptionPackageInfo(product_code)` → package_info[]{unit_name}
- status: `is_view=Y && status=0` → Y, 아니면 N("판매중인 상품이 아닙니다").
- **bundle-detail과 다름**: title_info 리치(장르/카테고리/연령/개발사/퍼블리셔/언어), 구성정보=unit_name 단순 리스트, short_description 헤더, dgkr+description 상세설명 → **신규 엔티티**.

## 화면·플로우

- 진입: `/game/game_package_view.html?sku=&product_id=` (product_id는 미사용 — sku만 조회).
- status=N → `error-page`(alert-circle + "ERROR" + goods_status_msg).
- status=Y 섹션:
  1. 헤더 카드: header.jpg + short_description
  2. region_msg alert(있을 때, alert-danger)
  3. 상품 카드: product_name + 할인 badge(promotion.discount_rate 우선/else discount) + 정가 취소선 + 판매가(promotion.sale_price 우선/else price) + 위시리스트/장바구니 버튼(soldout=N) 또는 품절 badge
  4. 구성정보 안내 alert(light): game_view 링크 `?product_id={title_info.product_id}` [title_name] + 플랫폼 차이 안내
  5. 구성정보 상세(package_info>0): unit_name 리스트(h4.font-12)
  6. 상세정보: 출시일(substr10)·개발사·언어지원(음성/자막/독점 badge 또는 "한국어지원안함")·퍼블리셔·장르+카테고리(getTagName 백엔드 resolve)·연령(age img + game_rate grade img)
  7. 상세설명: dgkr_description + description(Parsedown) → description_html
- 위시/장바구니 = **order 도메인 이월(마크업만)** — add_cart/add_wishlist 핸들러 후속(dialog_cart/wishlist).
- head `#appCapsuleSub{padding-top:56px}` inline style 유지.

## 데이터 / 계약 (신규)

- **신규 엔티티** `entities/game-package-detail` — `getGamePackageDetail(sku)` + `GamePackageDetailResponse`.
- **신규 계약** `GET /api/game/package-detail?sku=X`:
  - `goods_status`/`goods_status_msg`
  - `goods_item{ product_code, product_name, domain, goods_sku, soldout, release_date, consumer_price, price, discount, promotion{sale_price,discount_rate} }`
  - `title_info{ product_id, title_name, developer, publisher, age_limit, game_rate, spoken_korean, interface_korean, exclusive_korean }`
  - `short_description`, `region_msg`
  - `package_units: string[]`(unit_name)
  - `genre_tags: string[]`·`category_tags: string[]`(getTagName 백엔드 resolve)
  - `description_html`(dgkr+description Parsedown 결합)
  - mock `game/package-detail` 핸들러+fixture.

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_package_view.html`
- 라우트: `app/m/game/game_package_view.html/page.tsx`(server, theme#000·padding-top56 style, title=goods_item.product_name, getGamePackageDetail(sku))
- screen: `screens/mobile-game-package-view` `MobileGamePackageViewScreen`(server; status=N error-page / else 7섹션). 연령/등급 이미지·언어 badge·가격 로직 전사.
- 재사용: `MobileSubHeader`. 신규: entity/mock.
- 신규 UI: screen 내부 섹션(별도 카드 컴포넌트 불필요, 단일 상세).

## Parity 체크리스트 (모바일 UA)

- [ ] status=N error-page
- [ ] 헤더/short_description/region_msg
- [ ] 상품 카드 가격(promotion 우선)·위시/장바구니(soldout 분기)
- [ ] 구성정보 안내 game_view 링크 / 구성정보 상세(unit_name)
- [ ] 상세정보(출시일/개발사/언어/퍼블리셔/장르·카테고리/연령·등급 이미지)
- [ ] 상세설명 description_html
- [ ] head theme#000, padding-top56, title=product_name
- [ ] middleware rewrite
- caveat: 위시/장바구니 order 이월(마크업만), product_id 파라미터 미사용(sku만), genre/category·연령이미지 백엔드/자산 의존
