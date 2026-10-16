# 모바일 번들 상세 (bundle_view)

> legacy `mobile/game/bundle_view.html` → `/m/game/bundle_view.html`. PC 대응(`docs/migration/storefront/game/bundle-view.md`, `entities/bundle-detail`) **subset 재사용**.
> **모바일은 PC보다 단순**: 상세설명·권리표기·연령/등급·언어지원 **없음**. title 고정 "상세정보".

## 원본 (legacy mobile)
- 파일: `mobile/game/bundle_view.html` (392줄). `getGoodsItemDetailSku(sku)` + `getGoodsOptionDescription`(region_msg) + `getGoodsOptionPackageList` + appid별 steam JSON(header_image/short_description/release_date/developers/publishers).
- PC 대응: `entities/bundle-detail` `getBundleDetail(sku)` + `BundleDetailResponse`.

## 화면·플로우 (legacy mobile 기준)
- 진입: `/game/bundle_view.html?sku={goods_sku}`. 상태: is_view=="Y" && status=="0" → Y, else N(error-page).
- 셸: `sub_header`(pageTitle 고정 "상세정보") + `appCapsuleSub full-height mt-0`.

### 본문 순서 (goods_status=Y)
1. **헤더 카드**(`card mb-2`): `img.card-img-top(/upload/product/{product_code}/header/header.jpg)` (legacy는 domain 없이 상대경로 — 타겟은 `{domain}/upload/...`로 통일, fixture domain 빈값이면 동일). alt는 legacy `$title_info` 미정의라 빈값 → `alt=""`.
2. **region_msg** alert-danger(있을 때).
3. **번들 상품 카드**(`section full mb-2 > wide-block p-0 > ul.listview.simple-listview > li > item > card`): `h5 product_name` + 가격 row(promotion.discount_rate>0 → bg-danger, else discount>0 → bg-primary; consumer_price 취소선(discount>0 || discount_rate>0); sale_price>0 ? sale_price : price) + card-footer(`btn_wishlist[data-sku]` + soldout N `btn_cart[data-sku]` / "품절"). **배지(예약/특전/프로모션) 없음, data-agelimit 없음**(dlc보다 간소). 위시·장바구니 order 이월(마크업만).
4. **번들 상세정보**(display_type in `game_bundle`/`dlc_bundle`/`etc_bundle`, `section-title "번들 상세정보"`): `listview > li > row(col-4: header_image img + "출시일: {release_date}") + col-8(h4 item_name + short_description)`. package_items(steam JSON 해소). 출시일은 **항상 표시**(빈값이어도).
5. **상세정보**(section-title "상세정보"): 출시일(goods_item.release_date), 개발사(goods_item.developer), 퍼블리셔(goods_item.publisher). **언어지원/장르/연령등급 없음**.
6. **상품 정보 제공 고시**(section-title): 정적 6항목. 이용조건 링크 텍스트 = `platform_name`(getPlatform(product_platform)). 청약철회 → `/service/refund_policy.html`.

### 세션/인터랙션
- wishlist/cart 버튼(order 도메인 이월, 마크업만). 그 외 정적 → 전부 서버 렌더.

## 모바일 head / 앱셸
- viewport: device-width, scale 1 고정, viewport-fit=cover, theme #000. `mobile-web-app-capable`.
- metadata: **title 고정 "상세정보"**(product_name 아님), description/keywords 빈값, canonical `https://directg.net/game/bundle_view.html?sku={sku}`, manifest. **OG/GA4/JSON-LD 없음**.
- 페이지 style: `.goods_detail_info *`·`.nav-pills active`·`#appCapsuleSub{padding-top:56px !important}`(legacy head 주입). (상세설명 미렌더지만 legacy head 스타일 그대로.)
- 자산: 신규 없음.

## 데이터 (재사용/증분)
- **재사용**: `entities/bundle-detail` `getBundleDetail(sku)` + BundleDetailResponse. subset: goods_status/msg, goods_item, region_msg, package_items, display_type.
- **증분**: **`BundleDetailResponse.platform_name`** — 모바일 상품고시 이용조건 링크(`getPlatform(product_platform)`)용. PC bundle엔 상품고시가 없어 미보유 → 모바일 이관 증분. 백엔드 `GET /api/game/bundle-detail` 응답에 추가. fixture에 platform_name 추가.
- **미사용**: show_description/description_html(상세설명 미렌더), max_rating(연령 미렌더).

## API 계약 (증분)
- `GET /api/game/bundle-detail?sku=` 응답에 **`platform_name`** 추가(getPlatform(product_platform)). 나머지 재사용. mock(bundle-detail fixture)에 platform_name 추가.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/game/bundle_view.html"` **추가**.
- **라우트**: `app/m/game/bundle_view.html/page.tsx`(server) — searchParams.sku, viewport(theme#000), metadata(title 고정 "상세정보"/canonical), 페이지 style, `getBundleDetail(sku)` → `MobileBundleViewScreen`.
- **screen**: `screens/mobile-bundle-view`(server) — `MobileSubHeader("상세정보")` + appCapsuleSub(is_view 분기).
- **재사용 entities**: bundle-detail(+ platform_name 증분).
- **mock**: bundle-detail fixture에 platform_name.

## Parity 체크리스트 (모바일 UA)
- [ ] sku 진입·is_view/status N error-page
- [ ] 헤더 카드·region
- [ ] 번들 상품 카드(product_name/프로모션·할인 가격/위시·장바구니 or 품절, 배지 없음)
- [ ] 번들 상세정보(display_type 분기, header_image/출시일 항상/item_name/short_description)
- [ ] 상세정보(출시일/개발사/퍼블리셔) — 언어지원/연령 없음
- [ ] 상품고시(platform_name 링크)
- [ ] head: title "상세정보"/theme #000
- [ ] middleware `/game/bundle_view.html` rewrite / 데스크톱 PC 유지
- [ ] 위시/장바구니 마크업만(order 이월)

## 보류/후속
- 위시리스트·장바구니 AJAX + dialog → order/session 도메인 이월.
- 상세설명/권리표기/연령등급/언어지원: legacy 모바일 미렌더(범위 밖).
