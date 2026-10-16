# 홀로모델 상세 (holomodels_view)

## 원본
- 파일: `pc/game/holomodels_view.html` (1589줄, 라이브). **game_view와 데이터 shape 동일**(getTitleInfoSku/setTitleHit/media/getTitlePlatform/getEventGoodsInfo/getGoodsDescription/getRecommandTitle/promotion/wishlist). 옵션 리스트만 holomodels 버전(getTitleHolomodelsList/EditionList/DLCList + getTitleDLCBundleList).
- 선례: game_view(`entities/game-detail`·`widgets/product-detail`·`screens/game-detail`), holomodelsdlc_view(홀로모델 다운로드 카드).

## game_view와 차이 (parity 핵심)
1. 진입 URL/canonical/OG: `/game/holomodels_view.html`. 301(특수 product_id→goods_item_view) 동일.
2. 옵션 섹션 타이틀: **"홀로 모델 본체"**(기본게임) / "에디션" / **"확장 애니메이션"**(DLC) / "DLC번들".
3. 플랫폼 탭 아이콘: 51 → `holomodels.svg`(game_view는 51→holomodels_logo, 여기선 holomodels).
4. DLC 카드 링크 → `holomodelsdlc_view.html`.
5. DLC번들 "정보 보기" → `holomodels_view.html`(자기 페이지).
6. 옵션 카드 플랫폼 로고: case 51 → `Platform_logo_holomodels.svg`(PlatformLogo에 이미 반영).
7. content-right: **홀로모델 특화** — header + `nl2br(short_description)` + **출시일 dl만**(연령/등급·개발사/퍼블리셔/언어지원/장르/카테고리 없음) + **홀로모델 다운로드 카드**(하드코딩) + 추천(link holomodels_view) + 홀로모델 상품고시(5항목). **시스템 요구사항 섹션 없음**.
8. 상세설명: title **"상세설명"**(game_view "게임설명"), **전체보기 토글 없음**(항상 전체 노출). dgkr+description 병합은 동일.
9. GA4 view_item(item_list_id="game_view" copy-paste), JSON-LD 주석(미출력).

## API 계약
- `GET /api/game/holomodels-detail?product_id=&platform=` — 응답 스키마 **game-detail 동형**(`GameDetailResponse`). 백엔드가 holomodels 옵션 리스트로 조립. platform 빈 값 → 첫 플랫폼.

## 타겟 매핑
- 라우트: `app/(pc)/game/holomodels_view.html/page.tsx`(301 + generateMetadata + GA4). screen: `screens/game-holomodels-detail`. entity: `entities/game-detail` `getHolomodelsDetail` 재사용. mock: `holomodelsDetailFixture`(platform 51) + `/api/game/holomodels-detail`.
- 위젯 파라미터화(하위호환): `DlcSection`(title/dlcViewPath), `DlcBundleSection`(bundleViewPath), `RecommandCard`(viewPath). `GameEditionCard`·`MediaGallery`·`CartWishlistModals` 재사용.

## Parity 체크리스트
- [ ] 진입/301/is_view, 미디어·alert 6종·플랫폼탭(51→holomodels)
- [ ] 옵션 4종(타이틀 "홀로 모델 본체"/"확장 애니메이션", DLC→holomodelsdlc, 번들→holomodels_view)
- [ ] 이벤트·상세설명(토글 없음)·권리표기
- [ ] 우측: header+nl2br+출시일·홀로모델 다운로드 카드·추천(holomodels 링크)·홀로 상품고시. 연령/시스템요구사항 없음
- [ ] SEO title/desc/canonical/alternate/OG/amazonbot, GA4, JSON-LD 미출력
