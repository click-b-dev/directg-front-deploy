# 홀로모델 DLC 상세 (holomodelsdlc_view)

## 원본
- 파일: `pc/game/holomodelsdlc_view.html` (700줄, 라이브). dlc_view와 **데이터 레이어 동일**(getGoodsItemDetailSku/getTitleDetail/getGoodsOptionDescription/getSteamAppInfo/screenshot/getGoodsOptionPackageInfo).
- 선례: dlc_view(`entities/dlc-detail` 재사용), `widgets/product-detail`.

## dlc_view와 차이 (parity 핵심)
1. 진입 URL: `/game/holomodelsdlc_view.html?sku=`. canonical/OG도 holomodelsdlc.
2. alert 2종: (a) "확장 애니메이션(DLC)에 대한 안내 페이지입니다."(링크 없음), (b) "플레이하려면 [title_name](holomodels_view?product_id=) 홀로 모델 본체가 필요합니다."(platform 없음). + preorder notice(동일).
3. DLC 카드: 플랫폼 로고에 **case 51 → Platform_logo_holomodels.svg** 추가.
4. 상세설명: **전체보기 토글 버튼 없음**(legacy는 `<div class="text-end mb-3"><hr></div>`만 — max-height 미적용, 항상 전체 노출). ToggleSection 미사용, 평문 카드.
5. content-right: **홀로모델 특화**.
   - title_info 카드: 헤더 이미지 + `nl2br(short_description)` + 출시일 dl(카드 내부). **연령/등급·개발사/퍼블리셔/언어지원/장르/카테고리·steam alert 없음**.
   - **홀로모델 다운로드 카드**(`.holomodels-info`): "XR(AR/VR) 디지털 피규어" + 하드코딩 image.directg.net 이미지 + Google Play/App Store 링크(하드코딩 URL).
   - 상품고시: 홀로모델용 5항목(이용조건(링크 없음)/상품제공방식/필수소프트웨어(스마트폰・태블릿 iOS/Android App 또는 HoloModeLink)/청약철회(refund_policy.html)/소비자상담). 제작자·최소시스템사양 항목 없음. `$goods_dlc_info` 오타 스위치는 dlc와 동일하나 이용조건에 링크 자체가 없음.
6. 스타일: `.holomodels-info` 추가.

## API 계약
- `GET /api/game/holomodelsdlc-detail?sku=` — 응답 스키마는 **dlc-detail과 동형**(`DlcDetailResponse`). 백엔드 데이터 메서드 동일(getGoodsItemDetailSku 계열). platform_name/genre_names/category_names/steam_info/title_info 상세필드는 이 화면에서 미사용(무시).

## 타겟 매핑
- 라우트: `app/(pc)/game/holomodelsdlc_view.html/page.tsx` — `getHolomodelsDlcDetail(sku)`.
- screen: `screens/game-holomodelsdlc` (`GameHolomodelsDlcScreen`) — `entities/dlc-detail` 재사용 + `widgets/product-detail`(MediaGallery·WishlistButton/CartButton(게이트 없음)·CartWishlistModals(cartTitle="장바구니 안내")·PlatformLogo(51 추가)). 상세설명 평문 카드, 홀로모델 다운로드 카드 하드코딩.
- mock: `holomodelsDlcDetailFixture`(platform 51) + `/api/game/holomodelsdlc-detail`.
- 자산: `Platform_logo_holomodels.svg` 복사.

## Parity 체크리스트
- [ ] sku 진입·is_view/status 분기
- [ ] alert 2종(홀로문구)·preorder·DLC카드(51 로고)·구성정보·상세설명(토글 없음)·Copyright
- [ ] 우측 title_info(nl2br+출시일)·홀로모델 다운로드 카드·상품고시(5항목)
- [ ] SEO title/canonical/alternate/OG, GA4·JSON-LD 없음
