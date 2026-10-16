# 모바일 DLC 상세 (dlc_view)

> legacy `mobile/game/dlc_view.html` → `/m/game/dlc_view.html`. PC 대응(`docs/migration/storefront/game/dlc-view.md`, `entities/dlc-detail`) **subset 재사용**(증분 없음).
> **모바일은 PC보다 단순**: 미디어 갤러리·steam_info alert·장르/카테고리·상세설명 toggle·is_preorder_notice alert **없음**.

## 원본 (legacy mobile)
- 파일: `mobile/game/dlc_view.html` (478줄). `getGoodsItemDetailSku(sku)` + `getTitleDetail` + `getGoodsOptionDescription` + `getGoodsOptionPackageInfo`(+ `getSteamAppInfo` fetch하나 미렌더).
- PC 대응: `entities/dlc-detail` `getDlcDetail(sku)` + `DlcDetailResponse`.

## 화면·플로우 (legacy mobile 기준)
- 진입: `/game/dlc_view.html?sku={goods_sku}` (sku만).
- 상태: `dlc_info.is_view=="Y" && status=="0"` → "Y", else "N"(error-page).
- 셸: `sub_header`(pageTitle=product_name) + `appCapsuleSub full-height mt-0`.
- **is_view/status N** → `error-page`(ion-icon alert-circle + h1 "ERROR" + goods_status_msg).

### 본문 순서 (goods_status=Y)
1. **헤더 카드**: `card > img.card-img-top(`{domain}/upload/product/{product_code}/header/header.jpg`, alt=product_name) + div.p-2.text-white.font-14(short_description)` + `.divider`
2. **alert-warning #1**(고정, `section full > wide-block px-2 mt-2 > alert alert-warning border-0 font-14 rounded-0`): fa-triangle-exclamation + "추가 콘텐츠(DLC) 대한 안내 페이지입니다. 전체 게임의 정보는 [{title_name}](game_view?product_id={title_info.product_id})에서 확인해 주시기 바랍니다."
3. **alert-warning #2**(고정, `section full mb-2`): bi-info-circle + "플레이하려면 {platform_name} 버전인 [{title_name}](game_view?product_id={product_id}) 기본 게임이 필요합니다."
   - **is_preorder_notice alert 없음**(PC엔 있으나 모바일 미포함).
4. **region_msg** alert-danger(있을 때).
5. `.divider`
6. **DLC 카드**(`card shadow-none p-1 > card-body`): `h2 {product_name}` + `[{product_name_en}]` + 가격 row:
   - `promotion.sale_price>0` → `badge bg-danger "{discount_rate} %"` + `s consumer_price` + sale_price
   - else → discount>0면 `badge bg-primary "{discount} %"` + discount>0면 `s consumer_price` + price
   - card-footer: `btn_wishlist bg-danger[data-sku, data-agelimit]` + (soldout N → `btn_cart bg-primary[data-sku, data-agelimit]` / else "품절"). **위시/장바구니 = order 도메인 이월(마크업만)**.
7. **연령/등급**(`section full > wide-block pt-1 pb-1 > d-flex flex-row`): age(title_info.age_limit 10→age_all, else age_{n}) + game_rate 각 "1"→grade{i+1} (`/mobile-assets/images/game/*`). (legacy age `?t=time()` 캐시버스트 → 정적 경로로 이관.)
8. **상세정보**(section-title "상세정보"): 출시일(dlc_info.release_date), 개발사(title_info.developer), 퍼블리셔(title_info.publisher), 언어지원(dlc_info spoken/interface/exclusive 3배지 or 한국어지원안함). **장르/카테고리 없음**(PC와 다름).
9. **구성정보 상세**(package_info>0, section-title "구성정보 상세"): `listview simple-listview border-0 > li > h4.font-12 {unit_name}`.
10. **상세설명**(section-title "상세설명"): `goods_detail_info` + description_html(version2→raw, else Parsedown). **toggle 없음**.
11. **권리표기**(`<a name="copyright">` + section-title): `strip_tags(legal_html)` 텍스트.
12. **상품 정보 제공 고시**(section-title): 정적 6항목. 이용조건 링크 텍스트 = `platform_name`(PC의 빈링크 버그와 달리 모바일은 platform 표시). 청약철회 → `/service/refund_policy.html`.

### 세션/인터랙션
- wishlist/cart 버튼(order 도메인 이월, 마크업만). 그 외 정적 → 전부 서버 렌더.

## 모바일 head / 앱셸
- viewport: device-width, scale 1 고정, viewport-fit=cover, theme #000. `mobile-web-app-capable`.
- metadata: title=product_name, description=short_description, canonical `https://directg.net/game/dlc_view.html?sku={goods_sku}`, manifest, favicon. **OG/amazonbot/GA4/JSON-LD 없음**.
- 페이지 style: `.nav-pills active`·`.goods_detail_info *`·`#appCapsuleSub{padding-top:56px}` 등(legacy head 주입).
- 자산: age/grade png 기존 `mobile-assets` 재사용.

## 데이터 (재사용/증분)
- **재사용**: `entities/dlc-detail` `getDlcDetail(sku)` + DlcDetailResponse. subset 사용: goods_status/msg, platform_name, dlc_info, title_info, goods_description(short/region), description_html, legal_html, package_info.
- **미사용**: media_list, steam_info, genre_names/category_names, is_preorder_notice.
- **증분**: **없음**. legal은 `strip_tags(legal_html)` 프론트 처리.

## API 계약 (증분)
- **없음**. `GET /api/game/dlc-detail?sku=` 재사용. mock(dlc-detail fixture/handler) 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/game/dlc_view.html"` **추가**.
- **라우트**: `app/m/game/dlc_view.html/page.tsx`(server) — searchParams.sku, viewport(theme#000), generateMetadata(title=product_name/canonical), 페이지 style, `getDlcDetail(sku)` → `MobileDlcViewScreen`.
- **screen**: `screens/mobile-dlc-view`(server) — `MobileSubHeader(pageTitle=product_name)` + appCapsuleSub(is_view 분기: error-page / 본문). 연령/등급·상세정보·고시는 game_view 이관 패턴 재사용.
- **재사용 entities**: dlc-detail.
- **mock**: 기존 재사용.

## Parity 체크리스트 (모바일 UA)
- [ ] sku 진입·is_view/status N error-page
- [ ] 헤더 카드(header 이미지/short_description)·divider
- [ ] alert-warning 2종(DLC 안내·기본게임 필요, game_view 링크)·region
- [ ] DLC 카드(product_name/영문명/프로모션·할인 가격/위시·장바구니 or 품절)
- [ ] 연령/등급 아이콘·상세정보(출시일/개발사/퍼블리셔/언어지원)·구성정보·상세설명(toggle 없음)·권리표기(strip_tags)·상품고시(platform_name 링크)
- [ ] number_format 콤마
- [ ] middleware `/game/dlc_view.html` rewrite / 데스크톱 PC 유지
- [ ] 위시/장바구니 마크업만(order 이월)
- [ ] head: title=product_name/theme #000

## 보류/후속
- 위시리스트·장바구니 AJAX + dialog → order/session 도메인 이월.
- 미디어/steam_info/장르·카테고리: legacy 모바일 미렌더(범위 밖).
