# 모바일 홀로모델 상세 (holomodels_view)

> legacy `mobile/game/holomodels_view.html` → `/game/holomodels_view.html`(모바일 UA) → `app/m/game/holomodels_view.html`.
> PC 대응(`docs/migration/storefront/game/holomodels-view.md`, `entities/game-detail` `getHolomodelsDetail`) **계약 재사용**. 선례: 모바일 game_view(`docs/migration/storefront/mobile/game-view.md`).
> **모바일 홀로모델은 모바일 game_view보다도 더 단순한 subset** + 홀로모델 특화(플랫폼 51, 디지털 고시 5항목, 상세정보=출시일만, 홀로모델 다운로드 배지).

## 원본 (legacy mobile)
- 파일: `mobile/game/holomodels_view.html` (704줄, 라이브). `getTitleInfoSku` + `getGoodsDescription` + `getTitlePlatform` + `getTitleHolomodelsList`(game) + `getTitleHolomodelsEditionList`(edition) + `getTitleHolomodelsDLCList`(dlc, **렌더 주석처리**) + `getEventGoodsInfo` + `getPromotionGoodsPrice`(옵션별).
- PC 대응: `entities/game-detail` `getHolomodelsDetail(productId, platform)` + `GameDetailResponse`(game-detail 동형).

## 모바일 game_view와 차이 (parity 핵심)
1. 데이터: holomodels 옵션 리스트(getHolomodels*) → 백엔드가 `getHolomodelsDetail`로 조립(GameDetailResponse). platform 빈 값 → 첫 플랫폼(백엔드).
2. 플랫폼 탭 아이콘 switch에 **case 51 → `holomodels.svg`** 추가(game_view는 1/34/35만).
3. 옵션 섹션 타이틀은 game_view와 **동일** "기본게임"/"에디션"(PC의 "홀로 모델 본체"/"확장 애니메이션"과 다름 — 모바일은 game_view copy).
4. **DLC 섹션 없음**(legacy 주석처리 — game_view와 동일).
5. 카드 body 소개문: `nl2br(short_description)` — **줄바꿈→`<br>`**(game_view는 plain).
6. **상품 정보 제공 고시 (디지털 콘텐츠)**: 홀로모델 5항목(이용조건/제공방식/**필수 소프트웨어**="스마트폰・태블릿 iOS/Android App 또는 HoloModeLink"/청약철회 환불정책 링크/소비자상담 1544-2367). game_view의 6항목(제작자·시스템사양 #system_info)과 다름.
7. **상세정보 섹션 = 출시일 1개만**(release_date). 개발사/퍼블리셔/언어지원/장르/카테고리/연령·등급 **전부 없음**.
8. **시스템 요구사항 섹션 없음**(#system_info 앵커 없음).
9. **홀로 모델 다운로드 섹션 신규**(홀로모델 특화): `section full > section-title "홀로 모델 다운로드" > wide-block pt-2 pb-2 row > a[col-6]×2`(구글플레이/앱스토어, **하드코딩 URL·이미지** `image.directg.net/x87niyypzY`·`X87niyl2MK`). 위에 주석처리된 holomodels-info 카드 버전은 미이관.
10. 상세설명: title "상세설명"(dgkr+description → description_html, 토글 없음). 권리표기: strip_tags(legal_html). game_view와 동일.

## 화면·플로우 (legacy mobile 기준)
- 진입: `/game/holomodels_view.html?product_id={title_sku}&sku={goods_sku}&platform={code}`.
- **301 리다이렉트**(하드코딩): `product_id=="b94b13ed-10c0-465d-9344-5aa5a5ff8cd2"` → `/game/goods_item_view.html?product_id=...&sku=82772041-...&platform=32`(game_view와 동일 대상).
- **is_view!="Y"** → `appCapsuleSub full-height` 안 error-page(ion-icon alert-circle + h1 ERROR + goods_status_msg, `.text.mb-5.font-16`).
- 셸: `sub_header`(pageTitle=title_name) + `appCapsuleSub full-height` + bottom/sidebar/dialog(`app/m/layout` 소유).

### 본문 순서 (is_view=Y)
1. **타이틀 카드**(`card mb-2`): `card-header(title_name)` + `img.card-img-top rounded-0`(`{domain}/upload/title/{title_id}/header/{title_id}.jpg`, alt=title_name) + `card-body.text-white.font-14.p-2`(**nl2br(short_description)**).
2. **안내 alert**(조건부, `section full mb-2 > wide-block px-2 mt-2 > alert rounded-0 > p.text-break.text-wrap.font-14.mb-0`): only_multiplayer(flags, `Y`)·is_early_access(flags, `Y`) → alert-secondary; `title_info.drm_notice` → " 제 3자 DRM을 사용합니다. ({strip_tags})"; `ext_user_account_notice` → strip_tags; `goods_description.region_msg` → **alert-danger**. (모바일 game_view와 동일 판정.)
3. **플랫폼 탭**(`section full mb-2 > section-title "플랫폼" > wide-block px-2 mt-2 > ul.nav.nav-pills`): title_platform마다 `li.nav-item.col-4 > a[/game/game_view.html?product_id=&sku=&platform={code}].nav-link.rounded-0.p-0`(**링크 대상 game_view.html — legacy quirk 보존**) > `div.border{active?" active border-primary border-4":" border-2"}` > `img[/mobile-assets/images/platform/{file}.svg?1]{active?"":"opacity-30"}.w-100`. switch: 1→steam·34→epic_w·35→rockstar_2·**51→holomodels**.
4. **기본게임**(`goods_item[platform].game` 있을 때): `section full mb-2 > section-title "기본게임" > wide-block p-0 > ul.listview.simple-listview` + `MobileGameOptionCard`(재사용).
5. **에디션**(`goods_item[platform].edition`): `wide-block p-0 py-2` + `MobileGameOptionCard`(재사용).
6. **[DLC 없음]**(주석처리).
7. **상품 정보 제공 고시 (디지털 콘텐츠)**: 정적 5항목(홀로모델 버전).
8. **상세정보**: 출시일 `date("Y년 m월 d일", release_date)` **1개만**.
9. **진행중인 이벤트**(`is_event_info=="Y"` && event_data): `section full > section-title "진행중인 이벤트" > wide-block mb-2 border-0 > card`(event_banner img + h5 "■ {subject}" + `div.event_contents.font-12`(`contents_html<hr>event_notes_html`)).
10. **상세설명**(`section full > section-title "상세설명" > wide-block > div.goods_detail_info`): description_html(dangerouslySetInnerHTML, 토글 없음).
11. **홀로 모델 다운로드**(`section full > section-title "홀로 모델 다운로드" > wide-block pt-2 pb-2 row`): 하드코딩 배지 2개(구글플레이/앱스토어).
12. **권리표기**(`a#copyright` + `section full > section-title "권리표기" > div.goods_detail_info`): **strip_tags(legal_html)**.

### 세션/인터랙션
- 플랫폼 탭: 서버 링크(리로드). 위시/장바구니 버튼: order/session 도메인 이월(마크업만, `MobileGameOptionCard` 내). GA4 `view_item`(data.ga4, goods_status=Y).

## 모바일 head / 앱셸
- viewport: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000, apple-web-app.
- metadata: title=title_name, description=short_description, keywords="", canonical=`https://directg.net/game/game_view.html?product_id={sku}`(**game_view.html — legacy quirk 보존**), favicon(32x32), manifest. **OG/alternate/amazonbot 없음**.
- 페이지 style: nav-pills active·goods_detail_info(img max-width/height·video·ul)·event_contents(모바일 game_view와 동일 규칙). legacy head `}}` 오타는 정상 CSS로 정리(렌더 결과 동일).
- 자산: 플랫폼 svg(steam/epic_w/rockstar_2/**holomodels**)는 `public/mobile-assets/images/platform/`에 기존재 확인 필요. 홀로모델 다운로드 배지는 백엔드 CDN(image.directg.net) 하드코딩 → 자산 복사 없음.

## 데이터 (재사용/증분)
- **재사용**: `entities/game-detail` `getHolomodelsDetail(productId, platform)` + `GameDetailResponse`. subset: goods_status/msg, platform, title_info(title_name/title_id/domain/sku/release_date), goods_description(short_description/region_msg), title_platform, goods_item[platform].game/edition, flags, is_event_info, event_data, description_html, legal_html, ga4.
- **미사용 필드**(모바일 홀로모델 렌더 안 함): media_list, goods_item.dlc/dlc_bundle, recommand_title, requirements_html, genre_names/category_names, developer/publisher/언어/연령·등급, platform_name, is_login.
- **증분 없음**: 엔티티/타입/fetcher/mock(holomodels-detail fixture + `/api/game/holomodels-detail`) 전부 PC 것 그대로.

## API 계약 (증분)
- 없음. `GET /api/game/holomodels-detail?product_id=&platform=`(PC holomodels 계약, GameDetailResponse 동형) 그대로. mock 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/game/holomodels_view.html"` **추가**.
- **공용 카드 재배치**: `MobileGameOptionCard`를 `screens/mobile-game-view/ui/` → **`entities/game-detail/ui/`**로 이동(GameOption 렌더 UI, FSD상 엔티티 소유 — 선례 `entities/product-thumb` `MobileThumbCard`). `entities/game-detail` index에서 export, `mobile-game-view` import 경로만 갱신(동작 불변). 두 상세 screen이 공유.
- **라우트**: `app/m/game/holomodels_view.html/page.tsx`(server) — searchParams(product_id/sku/platform), 301 permanentRedirect(특수 id), viewport(theme#000), generateMetadata(title/description/canonical/favicon/manifest), GA4 `<Script>`(goods_status=Y), `getHolomodelsDetail` → `MobileHolomodelsViewScreen`.
- **screen**: `screens/mobile-holomodels-view`(server) — `MobileSubHeader(title_name)` + appCapsuleSub(is_view 분기) + 섹션들. 플랫폼 51 포함 로컬 PLATFORM_FILE. `MobileGameOptionCard`(엔티티) 재사용.
- **재사용 entities**: game-detail(getHolomodelsDetail, MobileGameOptionCard, GameOption).
- **mock**: holomodels-detail fixture/handler 재사용(신규 없음).

## Parity 체크리스트 (모바일 UA)
- [ ] 진입 파라미터·301 redirect·is_view=N error-page
- [ ] 타이틀 카드(header/img/**nl2br** short_description)
- [ ] 안내 alert(멀티전용/앞서해보기/DRM/ext_account/region)
- [ ] 플랫폼 탭(1/34/35/**51 holomodels**·active/opacity·**game_view.html 링크 quirk**)
- [ ] 기본게임/에디션 카드(이름·할인%·원가/판매가·위시/장바구니·품절)
- [ ] DLC/시스템요구사항/미디어/추천 **없음**
- [ ] 디지털 고시 5항목(홀로모델 버전·필수 소프트웨어)
- [ ] 상세정보 = 출시일 1개만
- [ ] 이벤트(banner/subject/contents_html<hr>event_notes_html)
- [ ] 상세설명 = description_html(토글 없음)
- [ ] 홀로 모델 다운로드 배지 2개(하드코딩)
- [ ] 권리표기 = strip_tags(legal_html)
- [ ] head: title/description/canonical(game_view.html quirk)/theme#000·GA4 view_item
- [ ] middleware `/game/holomodels_view.html` rewrite / 데스크톱 PC 유지

## 보류/후속
- 위시리스트·장바구니 AJAX + dialog → order/session 도메인 이월(마크업만).
- 홀로모델 다운로드 주석 카드 버전(holomodels-info)·DLC 섹션: legacy 미렌더(범위 밖).
