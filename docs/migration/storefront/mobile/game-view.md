# 모바일 게임 상세 (game_view)

> legacy `mobile/game/game_view.html` → `/game/game_view.html`(모바일 UA) → `app/m/game/game_view.html`.
> PC 대응(`docs/migration/storefront/game/game-view.md`, `entities/game-detail`)의 계약을 **subset 재사용**.
> **모바일은 PC보다 대폭 단순**: 미디어 갤러리·DLC·DLC번들·추천상품·설명/요구사항 toggle·is_free alert **모두 없음**.

## 원본 (legacy mobile)
- 파일: `mobile/game/game_view.html` (라이브. `game_view_20260204.html`·`yjs_game_view.html`은 제외)
- 데이터: `getTitleInfoSku` · `getGoodsDescription` · `getTitlePlatform` · `getTitleGameList` · `getTitleEditionList` · `getTitleDLCList`(fetch하나 렌더는 주석) · `getEventGoodsInfo` · `getPromotionGoodsPrice`(옵션별). **미디어/추천/DLC번들 미fetch.**
- PC 대응 단위: `docs/migration/storefront/game/game-view.md` (계약 `GET /api/game/detail` 원천)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/game/game_view.html?product_id={title_sku}&sku={goods_sku}&platform={code}`. `platform` 빈 값 → 타이틀 첫 플랫폼 고정(백엔드).
- **301 리다이렉트**(하드코딩): `product_id=="b94b13ed-10c0-465d-9344-5aa5a5ff8cd2"` → `/game/goods_item_view.html?product_id=...&sku=82772041-...&platform=32` (legacy는 `m.directg.net` 절대, 단일도메인은 경로만). PC와 동일 대상.
- **is_view!="Y"** → `appCapsuleSub` 안에 **error-page**(ion-icon `alert-circle` + h1 "ERROR" + goods_status_msg). (PC는 alert 한 줄, 모바일은 error-page 레이아웃.)
- 셸: `sub_header`(pageTitle=title_name) + `appCapsuleSub` + bottom_menu + sidebar + dialog_cart (game_thumb 파일럿과 동일 서브페이지 셸; bottom/sidebar/dialog는 `app/m/layout.tsx` 소유).

### 본문 순서 (appCapsuleSub, is_view=Y)
1. **타이틀 카드**: `card mb-2 > card-header(title_name) + img.card-img-top(`{domain}/upload/title/{title_id}/header/{title_id}.jpg`, alt=title_name) + card-body(short_description)`
2. **안내 alert**(각 조건부, `section full mb-2 > wide-block px-2 mt-2 > alert ... rounded-0 > p.text-break.text-wrap.font-14.mb-0`):
   - `flags.only_multiplayer=="Y"` → alert-secondary "온라인/멀티플레이 전용 게임입니다. 싱글플레이는 지원하지 않습니다." (legacy strpos 버그로 사실상 거의 항상 N)
   - `flags.is_early_access=="Y"` → alert-secondary "정식 출시 전 앞서 해보기를 진행하는 상품입니다. …"
   - `title_info.drm_notice` → alert-secondary " 제 3자 DRM을 사용합니다. ({strip_tags(drm_notice)})"
   - `title_info.ext_user_account_notice` → alert-secondary {strip_tags(...)}
   - `goods_description.region_msg` → **alert-danger** {region_msg}
   - **is_free alert 없음**(PC엔 있으나 모바일 미포함)
3. **플랫폼 탭**(`section full mb-2 > section-title "플랫폼" > wide-block > ul.nav.nav-pills`): title_platform마다 `li.nav-item.col-4 > a[?product_id=&sku=&platform={code}].nav-link.rounded-0.p-0 > div.border{active?" active border-primary border-4":" border-2"} > img[/mobile-assets/images/platform/{steam|epic_w|rockstar_2}.svg?1].{active?"":"opacity-30"}.w-100`. 현재 platform=active. (switch: 1→steam, 34→epic_w, 35→rockstar_2. holomodels 없음.)
4. **기본게임**(`goods_item[platform].game` 있을 때, `section full mb-2 > section-title "기본게임" > wide-block p-0 > ul.listview.simple-listview`): 옵션마다 `li.p-0 > div.item.w-100 > div.card.p-0.mb-0`:
   - `h5.card-title.fs-5.p-2.mb-0`=product_name
   - `card-body > d-flex.justify-content-between`: discount>0면 `span.fs-5.badge.{promotion_label}.rounded-2.px-3.py-3.fw-bold.minus "{discount} %"` / 가격 `s.old-price.font-12.text-secondary.pe-1.won {number_format(consumer_price)}`(discount>0) + `span.fs-5.current-price.text-white.won {number_format(price)}`
   - `card-footer.px-3 > d-flex.justify-content-between`: `button.btn_wishlist.bg-danger[data-sku] > ion-icon heart-outline + 위시리스트` + (soldout=="N" → `button.btn_cart.bg-primary[data-sku,data-name,data-price] > ion-icon cart-outline + 장바구니` / else `span.badge.bg-secondary "품절"`)
   - promotion: `getPromotionGoodsPrice` sale_price>0 → discount/price 오버라이드 + is_promotion=Y + `promotion_label="bg-danger"`, else `bg-primary` (백엔드가 GameOption에 반영 = is_promotion/promotion_label/discount/price/promotion_end)
   - **카드에 배송/특전/예약/프로모션 배지·플랫폼 로고 없음**(PC와 다름, 간소)
5. **에디션**(`goods_item[platform].edition`): 기본게임과 동형 카드(`wide-block p-0 py-2`). (edition 카드 장바구니 버튼엔 data-name/price 없음 — 사소, 무시 가능)
6. **[DLC / DLC번들 없음]** (legacy 주석처리 → 미렌더)
7. **상품 정보 제공 고시**(`section full mb-2 > section-title "상품 정보 제공 고시 (디지털 콘텐츠)" > wide-block p-0 > ul.list-unstyled`): **정적 6항목**(제작자/이용조건/제공방식/시스템사양(#system_info 앵커)/청약철회(환불정책 링크)/소비자상담 1544-2367). 이용조건 링크 `store.steampowered.com` 텍스트는 legacy `$goods_info['platform']` 미정의라 **빈 텍스트**(quirk 보존).
8. **상세정보**(`section full mb-2 > section-title "상세정보" > wide-block p-0 > ul.list-unstyled`):
   - 출시일 `date("Y년 m월 d일", release_date)` (모바일은 coming_soon 미처리)
   - 개발사 developer
   - 퍼블리셔 publisher
   - 언어지원: spoken/interface/exclusive 중 하나라도 Y면 `li`에 **badge 3개 항상 렌더**(각 `{Y?"음성 한글"/"인터페이스/자막 한글"/"독점/한글패치":""}` — 빈 배지 quirk), 아니면 "한국어지원안함"
   - **퍼블리셔(중복 행)** — legacy 버그로 퍼블리셔가 한 번 더 렌더(quirk 보존)
   - 장르+카테고리 badges (`genre_names` + `category_names`, `badge bg-secondary font-12`)
   - 연령/등급 아이콘 `li`: age_limit(=="10"→`age_all.png`, else `age_{age_limit}.png`) + game_rate 문자열 각 자리 "1"이면 `grade{i+1}.png` (`/mobile-assets/images/game/*`)
9. **진행중인 이벤트**(`is_event_info=="Y"`, `section full > section-title "진행중인 이벤트" > wide-block > card`): `img.card-img-top(event_banner, alt=subject)` + `card-body > h5 "■ {subject}" + div.event_contents.font-12 > {contents_html} + hr + {event_notes_html}`
10. **상세설명**(`section full > section-title "상세설명" > wide-block > div.goods_detail_info`): `{description_html}` (dgkr+description 백엔드 렌더). **toggle 없음**(PC와 다름, 전체 표시).
11. **시스템 요구사항**(`#system_info` 앵커 위, `section-title "시스템 요구사항" > div.goods_detail_info`): `{requirements_html}`. toggle 없음.
12. **권리표기**(`section-title "권리표기" > div.goods_detail_info`): **`strip_tags(legal_html)`** — 태그 제거 텍스트(모바일 전용). toggle 없음.

### 세션/인터랙션
- **플랫폼 탭**: 서버 링크(페이지 리로드). JS 없음.
- **위시리스트/장바구니 버튼**: legacy는 `.btn_wishlist`/`.btn_cart` jQuery AJAX(`/order/wishlist_proc.php`·`/order/cart_proc.php`, mode add_wishlist/add_cart) → 성공 시 `#dialog_wishlist`/`#dialog_cart` 모달, add_to_cart gtag. **order/session 도메인** → 본 단위는 **마크업만 재현, 핸들러 보류**(PC game_view·이전 모바일 단위와 동일 정책). 모바일엔 `data-login` 없음(비로그인도 AJAX→백엔드 error_msg 의존).
- GA4 `view_item`(gtag): title_game 기준 ga4 배열. entity `ga4` 재사용(goods_status=Y일 때만).

## 모바일 head / 앱셸
- viewport: `width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover`, `theme-color #000000`, apple-web-app. (홈의 #fff와 달리 서브페이지 **#000**.)
- metadata: title=title_name, description=short_description, keywords="", canonical=`https://directg.net/game/game_view.html?product_id={sku}`, favicon, manifest. **OG/alternate/amazonbot/author 없음**(모바일 head는 PC보다 단순).
- 자산: 플랫폼 svg(steam/epic_w/rockstar_2)·연령/등급 png 모두 `public/mobile-assets/images/`에 **기존재**(복사 불필요).
- splide grid: 미사용(게임 상세엔 캐러셀 없음).

## 데이터 (재사용/증분)
- **재사용**: `entities/game-detail` `getGameDetail(productId, platform)`(쿠키 포워딩) + `GameDetailResponse`. 모바일은 필드 **subset** 사용: goods_status, goods_status_msg, platform, title_info, goods_description(short_description/region_msg), title_platform, goods_item[platform].game/edition, flags, is_event_info, event_data, genre_names, category_names, description_html, requirements_html, legal_html, ga4.
- **미사용 필드**(모바일 렌더 안 함): media_list, goods_item.dlc/dlc_bundle, recommand_title, is_login(버튼 보류라 불필요), platform_name(고시 링크 빈텍스트 quirk).
- **증분**: **없음**. legal은 `legal_html`를 프론트에서 `strip_tags`(=`<[^>]*>` 제거) 후 텍스트 렌더 → 계약 변경 불요.
- **모바일 전용 동작**: 없음(SSR 1회, AJAX 보류).

## API 계약 (증분)
- **없음**. `GET /api/game/detail`(2-2 game_view 확정 계약) 그대로 재사용. mock(`shared/mocks/fixtures/game-detail.ts` + handler) 재사용.

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `"/game/game_view.html"` **추가**(신규 경로 — 없으면 모바일 UA도 PC 폴백).
- **라우트**: `app/m/game/game_view.html/page.tsx`(server) — searchParams(product_id/sku/platform), 301 permanentRedirect(특수 id), viewport(theme #000), generateMetadata(title/description/canonical/manifest/favicon), GA4 `<Script>`(goods_status=Y), `getGameDetail` → `MobileGameViewScreen`.
- **screen**: `screens/mobile-game-view`(server) — `MobileSubHeader(pageTitle=title_name)` + `appCapsuleSub`(is_view 분기: error-page / 본문 섹션들). 옵션 카드 `mobile-game-option-card.tsx`(server, GameOption, game+edition 공용).
- **위젯**: 신규 위젯 불필요(섹션이 단순 서버 마크업). MobileSubHeader/bottom/sidebar/dialog 기존 셸 재사용.
- **재사용 entities**: game-detail(+ shared/types product-detail GameOption/RecommandItem/MediaItem).
- **mock**: 기존 game-detail fixture/handler 재사용(edition/event/genre/age/grade 케이스 확인, 부족 시 보강).

## Parity 체크리스트 (모바일 UA)
- [ ] 진입 파라미터·301 redirect·is_view=N error-page
- [ ] 타이틀 카드(header/img/short_description)
- [ ] 안내 alert(멀티전용/앞서해보기/DRM/ext_account/region) — is_free 없음
- [ ] 플랫폼 탭(아이콘·active/opacity-30·링크)
- [ ] 기본게임/에디션 카드(이름·할인%·원가/판매가·위시/장바구니 버튼·품절) — 배지/로고 없음
- [ ] DLC/추천/미디어 **없음**(미렌더)
- [ ] 상품 정보 제공 고시(정적 6항목·이용조건 빈 링크텍스트 quirk)
- [ ] 상세정보(출시일/개발사/퍼블리셔/언어지원 빈배지/**퍼블리셔 중복**/장르·카테고리/연령·등급 아이콘)
- [ ] 이벤트(banner/subject/contents_html/event_notes_html)
- [ ] 상세설명/시스템요구사항 = *_html(toggle 없음), 권리표기 = strip_tags(legal_html)
- [ ] number_format(콤마), 프로모션가 오버라이드
- [ ] 위시/장바구니 = 마크업만(order 도메인 이월)
- [ ] middleware `/game/game_view.html` rewrite(모바일 UA→/m) / 데스크톱 PC 유지
- [ ] head: title/description/canonical/theme #000, GA4 view_item

## 보류/후속
- 위시리스트·장바구니 AJAX + dialog 연동: order/session 도메인 단위로 이월(비로그인/로그인 런타임 포함).
- coming_soon 출시일 분기: 모바일 legacy 미처리(release_date만) → 그대로.
- DLC/추천/미디어: legacy 모바일에 없음 → 범위 밖(legacy가 활성화하면 재검토).
