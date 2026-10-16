# 번들 상세 (bundle_view)

## 원본
- 파일: `pc/game/bundle_view.html` (564줄, 라이브 — game_view DLC번들 "정보 보기" 링크 진입). 선례: dlc_view/game_view, `widgets/product-detail`.

## 화면·플로우
- 진입: `/game/bundle_view.html?sku=`. 상태: is_view=="Y" && status=="0" → Y.
- 레이아웃 812/460. **cart/wishlist 게이트 없음**. #btn_buy 핸들러 있으나 트리거 엘리먼트 없음 → 미재현.
- **display_type**(edition/game_bundle/dlc_bundle/etc_bundle)에 따라 섹션 분기.

### content-left
1. region_msg alert.
2. 번들 상품 카드: 플랫폼 로고(1/34/35), 프로모션 종료일 바(promotion.sale_price>0), 상단 badge(**프로모션 badge는 `$value` 오타로 미노출 — 버그 재현**, 예약구매(is_preorder), 특전(is_bonus, px-3)), 할인율(promotion.discount_rate>0→bg-danger, else discount>0→bg-primary), 소비자가 취소선, 판매가, wishlist/cart(게이트 없음).
3. 상세설명(`show_description` — display_type in edition/dlc_bundle/game_bundle && description): ToggleSection(game variant, 800).
4. 번들 상세정보(`show_bundle_items` — display_type in game_bundle/dlc_bundle/etc_bundle && package>0): 각 구성품 `col-3`(header_image + "출시일: {release_date}"(있을 때만)) + `col-9`(item_name + short_description(raw HTML)).

### content-right
- 헤더 이미지(short_description 텍스트 없음).
- 연령: `max_rating`(package ratings.kgrb 최대) → 10→age_all, 18→age_19, else age_{n}. **game_rate 이미지는 `$title_info` 미정의로 미노출(버그 재현)**.
- 정보 dl: 출시일(coming_soon?coming_soon_date:release_date), 개발사(goods_item.developer || package developers), 퍼블리셔(동일). **한국어지원 row는 `$title_info` 미정의로 미노출(버그 재현)**.
- **상품 정보 제공 고시 없음**.

## SSR·SEO
- title=product_name, **description=""**, **author="다이렉트 게임즈"**, amazonbot noarchive.
- canonical/alternate: bundle_view.html?sku={goods_sku}.
- OG: title, **type=website**, url=`?sku={raw sku}`(canonical과 달리 raw 파라미터), image(+type image/jpeg +alt), locale ko_KR, site_name="다이렉트 게임즈".
- favicon shortcut. GA4·JSON-LD 없음. viewport.

## 데이터 (백엔드 책임)
- `Goods::getGoodsItemDetailSku($sku)` → goods_item(+promotion, display_type, developer/publisher, coming_soon).
- `Goods::getGoodsOptionDescription` → region_msg/description.
- `Goods::getGoodsOptionPackageList` → 구성품(appid/item_name/coming_soon). 각 appid의 **steam JSON**(`/upload/apps/apps_{appid}[_coming].json`)에서 header_image/short_description/release_date/developers/publishers/ratings.kgrb 해소 — **백엔드가 조립**해 package_items·max_rating·developer/publisher fallback 제공.
- `Mypage2::getWishlistItem` → wishlist_chk.

### AJAX (order 이월)
- `.btn_cart`/`.btn_wishlist` → cart_proc/wishlist_proc(게이트 없음). cart-modal title "장바구니 안내".

## API 계약
### `GET /api/game/bundle-detail?sku={goods_sku}`
- 세션 쿠키. 응답: `goods_status`, `goods_status_msg`, `goods_item`{...promotion, display_type, developer, publisher, coming_soon...}, `region_msg`, `show_description`("Y"/"N"), `description_html`, `show_bundle_items`("Y"/"N"), `package_items`[{header_image,item_name,short_description,release_date}], `max_rating`.

## 타겟 매핑
- 라우트: `app/(pc)/game/bundle_view.html/page.tsx`. screen: `screens/game-bundle`. entity: `entities/bundle-detail`(`getBundleDetail`). mock: `bundleDetailFixture` + `/api/game/bundle-detail`.

## Parity 체크리스트
- [ ] sku·is_view/status, 번들 카드(프로모션 badge 버그·게이트 없음)
- [ ] display_type별 상세설명/번들 상세정보 분기, package 렌더(출시일 조건)
- [ ] 우측 age(max_rating)·game_rate 미노출·정보dl·한국어지원 미노출
- [ ] SEO title/desc빈/author/canonical/OG(website, url raw sku)
