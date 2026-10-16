# 모바일 액세서리/실물 상품 상세 (goods_item_view)

> legacy `mobile/game/goods_item_view.html` → `/m/game/goods_item_view.html`. PC 대응(`docs/migration/storefront/game/goods-item-view.md`, `entities/goods-item-detail`) **subset 재사용**.
> **모바일은 PC보다 단순**: 미디어(youtube/스크린샷)·우측 관련상품 steam 게임정보 **없음**. title은 product_name(고정 아님).

## 원본 (legacy mobile)
- 파일: `mobile/game/goods_item_view.html` (523줄). `getTitleInfoSku(product_id)` + `getGoodsItemDetailSku(sku)` + `getAttributeInfo(title_id)` + `getGoodsOptionDescription(product_code)` + `getGoodsItemDeliveryList`(연령체크 — **화면 미표시**, `<?//=$age_limit;?>` 주석) + is_package_view SQL 조립(description_html, 백엔드).
- PC 대응: `entities/goods-item-detail` `getGoodsItemDetail(productId, sku)` + `GoodsItemDetailResponse`.

## 화면·플로우 (legacy mobile 기준)
- 진입: `/game/goods_item_view.html?product_id={title_sku}&sku={goods_sku}`.
- 상태: `option_item.is_view=="Y"` → Y, else 사무실 IP(112.216.231.146)면 Y·아니면 N("판매중인 상품이 아닙니다"). **공개 동작 = goods_status N → error-page**(백엔드 goods_status/msg 재사용).
- 셸: `sub_header`(pageTitle = **product_name**, N 케이스도 동일) + `appCapsuleSub full-height`(**mt-0 없음**).

### 본문 순서 (goods_status=Y)
1. **헤더 카드**(`card mb-2`): `img.card-img-top rounded-0(src={domain}/upload/product/{product_code}/header/header.jpg, alt=title_name)` + `card-body`: `[product_name_en]`(small font-12) + `h2 product_name`(trailing space) + `무료배송` badge(text-bg-danger) + 가격 row.
   - 가격 row(`d-flex justify-content-between`): promotion.sale_price>0 → **bg-danger** discount_rate% badge(font-14 py-2 minus) + consumer_price 취소선(won) + sale_price(current-price). else → discount>0일 때만 **bg-primary** discount% badge(minus) + consumer_price 취소선 + price. (badge/취소선 모두 discount>0 조건 하)
2. **card-footer**(px-3): `btn_wishlist[data-sku=goods_sku]`(bg-danger, "위시리스트") + soldout=="N" → `btn_cart[data-sku]`(bg-primary, "장바구니") / else `품절` badge(bg-secondary py-3 px-2). **위시·장바구니 order 도메인 이월(마크업만, onClick 없음)**.
3. **배송 안내**(`section inset mb-2`): `alert alert-outline-warning` 고정 4문구(실물배송/적립금 미지급/이미지 차이/발송시간).
4. **상품설명**(`section full`, **mb-2 없음**): `section-title "상품설명"` + `wide-block pt-2 pb-2 > .goods_detail_info`(description_html, `dangerouslySetInnerHTML`, **토글 없음**).
5. **상품정보 제공고시**(`section full mb-2`): `ul.list-unstyled` 13항목 — 품명/모델명/KC(rra 링크)/정격전압/소비전력/출시년월/제조자수입자/제조국/크기mm/무게kg/주요사양/품질보증기준/AS책임자. 전부 `attribute_info`.
6. **거래조건에 관한 정보**(`section full mb-2`): 10항목 — 배송방법(`delivery_method_info` 동적)·배송기간(고정)·청약철회기한(고정)·단순변심반품비용(고정)·청약철회불가사유(고정)·교환반품보증(고정)·AS전화(`as_information2` 동적)·환불방법/지연배상금(고정)·소비자피해보상(고정)·약관(고정).
7. **교환/반품 정보**(`section full mb-2`): 6항목 전부 고정 — 비용/주소지/연락처/가능기간(ul)/불가기준(ul)/PS하드웨어 초기불량(ul, playstation 링크).

### 세션/인터랙션
- wishlist/cart 버튼(order 도메인 이월, 마크업만). 나머지 전부 정적 → **전 화면 서버 렌더**.

## 모바일 head / 앱셸
- viewport: width=device-width, initial/min/max-scale 1 고정, viewport-fit=cover, theme-color #000. `apple-mobile-web-app-capable`.
- metadata: **title = product_name**(option_item.product_name, N 케이스도 동일), description/keywords 빈값, manifest. **canonical/alternate/OG/GA4/JSON-LD 없음**(bundle과 달리 canonical 없음).
- 페이지 style(legacy head 주입): `.nav-pills active{background:#464f5b}`·`.goods_detail_info{font-size:12px}`·`.goods_detail_info p{font-size:12px}`·`.goods_detail_info img{width:100%}`·`.goods_detail_info ul{margin-bottom:1rem}`. (bundle과 달리 `#appCapsuleSub padding-top` override 없음, video 규칙 없음.)
- 사용 앱셸: `MobileSubHeader(pageTitle=product_name)` / bottom-menu·sidebar·dialog_cart는 `app/m/layout` 공유.
- 자산: 신규 없음(header 이미지는 백엔드 domain).

## 데이터 (재사용/증분)
- **재사용**: `entities/goods-item-detail` `getGoodsItemDetail(productId, sku)` + `GoodsItemDetailResponse`. subset: goods_status/msg, option_item(product_code/product_name/product_name_en/goods_sku/domain/soldout/consumer_price/price/discount/promotion), title_info.title_name, attribute_info(15필드), description_html.
- **증분 없음**: 엔티티/타입/fetcher/mock 전부 PC 것 그대로. 모바일 미사용 필드(media_list/show_game_info/steam_game_info/delivery_type/steam_appid/wishlist_chk)는 응답에 있어도 무시.

## API 계약 (증분)
- 없음. `GET /api/game/goods-item-detail?product_id=&sku=` PC 계약 그대로. mock(goods-item-detail fixture) 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/game/goods_item_view.html"` **추가**.
- **라우트**: `app/m/game/goods_item_view.html/page.tsx`(server) — searchParams product_id/sku, viewport(theme#000), generateMetadata(title=product_name, canonical 없음), 페이지 style, `getGoodsItemDetail` → `MobileGoodsItemViewScreen`.
- **screen**: `screens/mobile-goods-item-view`(server) — `MobileSubHeader(product_name)` + appCapsuleSub(goods_status 분기) + 헤더카드/배송안내/상품설명/상품고시/거래조건/교환반품.
- **재사용 entities**: goods-item-detail(증분 없음).
- **mock**: goods-item-detail fixture 재사용(신규 없음).

## Parity 체크리스트 (모바일 UA)
- [ ] product_id+sku 진입·goods_status N → error-page
- [ ] 헤더 카드(이미지/en/product_name/무료배송/프로모션·할인 가격)
- [ ] card-footer(위시리스트/장바구니 or 품절, 마크업만)
- [ ] 배송안내 alert 4문구
- [ ] 상품설명(description_html, 토글 없음)
- [ ] 상품고시 13항목(KC rra 링크 포함)
- [ ] 거래조건 10항목(delivery_method_info/as_information2 동적)
- [ ] 교환/반품 6항목(PS 링크 포함)
- [ ] head: title=product_name / theme #000 / canonical 없음
- [ ] middleware `/game/goods_item_view.html` rewrite / 데스크톱 PC 유지

## 보류/후속
- 위시리스트·장바구니 AJAX + dialog_cart/wishlist 모달 → order/session 도메인 이월.
- 미디어(youtube/스크린샷)·우측 관련상품 steam 게임정보: legacy 모바일 미렌더(범위 밖, PC 전용).
