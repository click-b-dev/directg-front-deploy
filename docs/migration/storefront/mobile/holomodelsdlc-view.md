# 모바일 홀로모델 DLC 상세 (holomodelsdlc_view)

> legacy `mobile/game/holomodelsdlc_view.html` → `/m/game/holomodelsdlc_view.html`. PC 대응(`docs/migration/storefront/game/holomodelsdlc-view.md`, `entities/dlc-detail` `getHolomodelsDlcDetail`) **subset 재사용**(증분 없음). 선례: 모바일 dlc_view + 모바일 holomodels_view.
> **모바일 dlc_view와 데이터 동일**(getGoodsItemDetailSku 계열, DlcDetailResponse) — 섹션 내용/순서만 홀로모델 특화.

## 원본 (legacy mobile)
- 파일: `mobile/game/holomodelsdlc_view.html` (452줄). `getGoodsItemDetailSku(sku)`=dlc_info + `getTitleDetail(product_code)`=title_info + `getGoodsOptionDescription(product_code)`=goods_description + `getSteamAppInfo`(fetch하나 미렌더) + `getGoodsOptionPackageInfo`=package_info. status=="0" → Y.
- PC 대응: `entities/dlc-detail` `getHolomodelsDlcDetail(sku)` + `DlcDetailResponse`(dlc-detail 동형).

## 모바일 dlc_view와 차이 (parity 핵심)
1. 데이터 fetcher만 `getHolomodelsDlcDetail`(엔드포인트 `/api/game/holomodelsdlc-detail`) — 응답 타입 동일.
2. 헤더 카드 소개문: `nl2br(short_description)`(dlc는 plain).
3. **alert #1**: "확장 애니메이션(DLC)에 대한 안내 페이지입니다." (**title_name 링크 없음**, 짧은 문장. dlc는 게임정보 링크 포함.)
4. **alert #2**: "플레이하려면 [{title_name}](**holomodels_view**?product_id={product_id}) **홀로 모델 본체**가 필요합니다." (**holomodels_view.html 링크**, "홀로 모델 본체" 문구, **platform_name 없음**. dlc는 game_view 링크 + platform_name "기본 게임".)
5. **상품 정보 제공 고시 (디지털 콘텐츠)**: 홀로모델 **5항목**(이용조건/제공방식/**필수 소프트웨어=HoloModeLink**/청약철회/소비자상담) — holomodels_view와 동일. **위치도 상세정보 앞**(dlc는 6항목·페이지 끝).
6. **상세정보 = 출시일 1개만**(dlc는 출시일/개발사/퍼블리셔/언어지원).
7. **홀로 모델 다운로드 섹션 신규**(하드코딩 배지 2개, 상세설명 뒤·권리표기 앞).
8. 연령/등급·구성정보 상세·상세설명·권리표기(strip_tags)는 dlc와 동일.

## 화면·플로우 (legacy mobile 기준)
- 진입: `/game/holomodelsdlc_view.html?sku={goods_sku}` (sku만, product_id는 미사용).
- 상태: `dlc_info.is_view=="Y" && status=="0"` → Y, else N("판매중인 상품이 아닙니다") → error-page.
- 셸: `sub_header`(pageTitle=product_name) + `appCapsuleSub full-height mt-0`.

### 본문 순서 (goods_status=Y)
1. **헤더 카드**(`card`): `img.card-img-top rounded-0`(`{domain}/upload/product/{product_code}/header/header.jpg`, alt=product_name) + `div.p-2.text-white.font-14`(**nl2br(short_description)**) + `.divider`.
2. **alert #1**(`section full > wide-block px-2 mt-2 > alert alert-warning border-0 font-14 rounded-0`): `<i.fa-solid.fa-triangle-exclamation>` + " 확장 애니메이션(DLC)에 대한 안내 페이지입니다."
3. **alert #2**(`section full mb-2 > … alert alert-warning border-0 font-14 rounded-0`): `<i.bi.bi-info-circle>` + " 플레이하려면 " + `a[/game/holomodels_view.html?product_id={product_id}].alert-link {title_name}` + " 홀로 모델 본체가 필요합니다."
4. **region_msg**(있을 때, alert-danger).
5. `.divider`
6. **DLC 카드**(`card shadow-none p-1 > card-body text-white p-1`): `h2.mb-1.pb-0 {product_name} ` + `div.mb-1 > small.font-12 [{product_name_en}]` + 가격 row(promotion.sale_price>0 → bg-danger discount_rate% + consumer_price s + sale_price; else discount>0 → bg-primary discount% + consumer_price s + price) + card-footer(`btn_wishlist[data-sku, data-agelimit={age_limit}]` + soldout N → `btn_cart[data-sku, data-agelimit]` / "품절"). **위시·장바구니 order 이월(마크업만)**.
7. **연령/등급**(`section full > wide-block pt-1 pb-1 > d-flex flex-row`): age(age_limit 10→age_all, else age_{n}) + game_rate 각 "1"→grade{i+1} (`/mobile-assets/images/game/*`).
8. **상품 정보 제공 고시 (디지털 콘텐츠)**: 정적 5항목(홀로모델 버전).
9. **상세정보**(section-title): 출시일 `date("Y년 m월 d일", release_date)` **1개만**.
10. **구성정보 상세**(package_info>0): `listview simple-listview border-0 > li.border-1.border-bottom.border-opacity-25 > h4.font-12 {unit_name}`.
11. **상세설명**(section-title): `goods_detail_info` + description_html(version2 raw, else Parsedown). 토글 없음.
12. **홀로 모델 다운로드**(section-title): `wide-block pt-2 pb-2 row > a[col-6]×2`(구글플레이/앱스토어, 하드코딩 URL·이미지 `image.directg.net/x87niyypzY`·`X87niyl2MK`).
13. **권리표기**(`a#copyright` + section-title): **strip_tags(legal_html)**.

### 세션/인터랙션
- wishlist/cart 버튼(order 도메인 이월, 마크업만). 그 외 정적 → 전부 서버 렌더.

## 모바일 head / 앱셸
- viewport: device-width, scale 1 고정, viewport-fit=cover, theme #000. `mobile-web-app-capable`.
- metadata: title=product_name, description=short_description, keywords="", canonical=`https://directg.net/game/dlc_view.html?sku={goods_sku}`(**dlc_view.html — legacy quirk 보존**), favicon(32x32), manifest. **OG/amazonbot/GA4/JSON-LD 없음**.
- 페이지 style: dlc_view와 **동일 규칙**(nav-pills active·goods_detail_info(img/video/bb_paragraph/ul/h1~h6 색상 #0dcaf0)·`#appCapsuleSub{padding-top:56px}`). legacy head `}}`·stray `text-align` 오타는 정상 CSS로 정리.
- 자산: age/grade png 기존 `mobile-assets` 재사용. 홀로모델 다운로드 배지는 백엔드 CDN 하드코딩.

## 데이터 (재사용/증분)
- **재사용**: `entities/dlc-detail` `getHolomodelsDlcDetail(sku)` + `DlcDetailResponse`. subset: goods_status/msg, dlc_info(product_code/name/name_en/goods_sku/domain/consumer_price/price/discount/promotion/soldout/release_date), title_info(product_id/title_name/age_limit/game_rate), goods_description(short/region), description_html, legal_html, package_info.
- **미사용 필드**: platform_name(alert #2가 platform 미사용), media_list, steam_info, genre_names/category_names, is_preorder_notice, title_info.developer/publisher, dlc_info 언어필드.
- **증분 없음**: 엔티티/타입/fetcher/mock(holomodelsDlcDetailFixture + `/api/game/holomodelsdlc-detail`) 전부 PC 것 그대로.

## API 계약 (증분)
- 없음. `GET /api/game/holomodelsdlc-detail?sku=`(PC 계약, DlcDetailResponse 동형) 그대로. mock 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/game/holomodelsdlc_view.html"` **추가**.
- **라우트**: `app/m/game/holomodelsdlc_view.html/page.tsx`(server) — searchParams.sku, viewport(theme#000), generateMetadata(title=product_name/canonical dlc_view quirk/favicon), 페이지 style, `getHolomodelsDlcDetail(sku)` → `MobileHolomodelsDlcViewScreen`.
- **screen**: `screens/mobile-holomodelsdlc-view`(server) — `MobileSubHeader(product_name)` + appCapsuleSub(goods_status 분기) + 섹션들.
- **재사용 entities**: dlc-detail(getHolomodelsDlcDetail).
- **mock**: holomodelsDlcDetailFixture/handler 재사용(신규 없음).

## Parity 체크리스트 (모바일 UA)
- [ ] sku 진입·goods_status N error-page
- [ ] 헤더 카드(header 이미지/**nl2br** short_description)·divider
- [ ] alert #1(확장 애니메이션, 링크 없음)·alert #2(**holomodels_view 링크**·홀로 모델 본체·platform_name 없음)·region
- [ ] DLC 카드(product_name/영문명/프로모션·할인 가격/위시·장바구니 or 품절)
- [ ] 연령/등급 아이콘
- [ ] 디지털 고시 5항목(HoloModeLink)·상세정보=출시일만·구성정보·상세설명(토글 없음)·홀로모델 다운로드 배지·권리표기(strip_tags)
- [ ] number_format 콤마
- [ ] head: title=product_name/canonical(dlc_view quirk)/theme #000
- [ ] middleware `/game/holomodelsdlc_view.html` rewrite / 데스크톱 PC 유지
- [ ] 위시/장바구니 마크업만(order 이월)

## 보류/후속
- 위시리스트·장바구니 AJAX + dialog → order/session 도메인 이월.
- 미디어/steam_info/장르·카테고리: legacy 모바일 미렌더(범위 밖).
