# 게임 상세 (game_view)

## 원본

- 파일: `pc/game/game_view.html` (라이브 — 게임 카드/추천/publisher 등 전 화면이 `/game/game_view.html?product_id=` 로 링크하는 상세 진입점). `game_view_20260204.html`(날짜 백업)·`yjs_game_view.html`(작업본)은 **제외**.
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/PROJECT-OVERVIEW.md`, `../legacy-project/docs/SEO-CHANNEL.md`, `ORDER-WORKFLOW-AUDIT.md`(cart), `MEMBER-LIFECYCLE.md`(session/wishlist)
- 선례: `entities/product-thumb`(추천 카드 참고 — 단 본 화면 추천 카드는 title 기반 전용), `entities/game-list`(쿠키 포워딩 fetcher), `screens/game-list`(SSR 구조), `widgets/breadcrumb` 미사용(상세는 breadcrumb 없음).

## 화면·플로우

- 진입 URL/파라미터: `/game/game_view.html?product_id={title_sku}&sku={goods_sku}&platform={platform_code}`
  - `product_id` = **타이틀 sku**(대표상품 조회 키). `sku` = 옵션 goods_sku(플랫폼 탭 링크 유지용, 화면 로직엔 미사용). `platform` = 플랫폼 코드(빈 값이면 타이틀 첫 플랫폼으로 고정).
- **301 리다이렉트**(하드코딩): `product_id=="b94b13ed-10c0-465d-9344-5aa5a5ff8cd2"` → `https://directg.net/game/goods_item_view.html?product_id=b94b13ed-10c0-465d-9344-5aa5a5ff8cd2&sku=82772041-85b0-4a94-b18f-2efcd754cef5&platform=32` (Moved Permanently, exit). verbatim 재현.
- **조회수 업데이트**: `setTitleHit($product_id, $ip)` — 진입 시 IP 기준 타이틀 hit 증가(부수효과, **백엔드 책임**).
- **판매 상태 분기**: `title_info['is_view']!="Y"` → 본문 대신 `alert alert-danger` "판매중인 상품이 아닙니다" 만 출력(`goods_status="N"`).
- 레이아웃: `.container{width:1320px}` 고정, 2단 grid `grid-template-columns: 812px 460px` (content-left / content-right).

### content-left (812px)
1. **미디어**(media_list>0일 때만): 메인 블록(첫 항목 — video면 iframe, image면 img) + 하단 썸네일 스트립(`#media_list` overflow-x-scroll). 썸네일 클릭 시 메인 교체(video: `//youtube.com/embed/{id}`, image: media_url). video 썸네일엔 유튜브 아이콘 오버레이.
   - media_list = youtube_list(getGoodsMediaList) + screenshot_list(getGoodsScreenshotList) 순서 병합. youtube 썸네일 = `https://img.youtube.com/vi/{youtube_media_id}/mqdefault.jpg`. 스크린샷은 domain=="https://image.directg.net"이면 `image.directg.net` prefix 부착.
2. **안내 alert**(조건부, 각각 독립):
   - `only_multiplayer=="Y"`: "온라인/멀티플레이 전용 게임입니다..." (category에 "멀티플레이어" 포함 && "싱글 플레이어" 미포함 — **legacy `strpos()===true` 버그 그대로**: `strpos`는 true를 반환하지 않으므로 사실상 거의 항상 false. verbatim 이식)
   - `is_early_access=="Y"`: 앞서해보기 안내 (genre에 `G0001004` 포함)
   - `title_info['drm_notice']`: "제 3자 DRM을 사용합니다. (…strip_tags…)"
   - `title_info['ext_user_account_notice']`: strip_tags 출력
   - `is_free=="Y"`: "…스팀(Steam)을 통해 무료 다운로드…" (genre에 "무료" 포함, bg-info)
   - `goods_description['region_msg']`: 지역제한 등 안내(bg-danger)
3. **플랫폼 탭**(title_platform>0): nav-pills. 각 플랫폼 아이콘(steam/epic_w/rockstar_2/holomodels_logo `.svg`), 활성=현재 platform(`active border-primary border-4`), 비활성=`opacity-30`. 링크 `?product_id=&sku=&platform={code}`.
4. **옵션상품 섹션**(현재 platform 기준 `goods_item[platform]`):
   - **기본게임**(`game`): 카드별 — product_name, 플랫폼 로고(Platform_logo_steam/epic/rockstar.png), 프로모션이면 "프로모션 종료일" 바, 배송타입 뱃지(코드/택배/코드+택배발송), 특전/프로모션/예약구매 뱃지, 할인율 뱃지(promotion_label), 소비자가 취소선 + 판매가, **wishlist 버튼**·**장바구니 버튼**(soldout=="N") 또는 "품절" 뱃지.
   - **에디션**(`edition`): 기본게임과 동형 카드.
   - **DLC**(`dlc`): 간소 카드(가로형, product_name은 `/game/dlc_view.html?sku=` 링크, target=_blank). **처음 3개**는 항상 표시, 4번째부터 `.collapse.multi-collapse #multiCollapseDLC{key}`로 감춤. 3개 초과 시 하단 "전체보기"(`#dlc_btn`, bootstrap collapse `.multi-collapse`) 노출, 열림/닫힘에 따라 버튼 텍스트 "닫기"↔"전체보기" 토글.
   - **DLC번들**(`dlc_bundle`): 카드 + "정보 보기"(`/game/bundle_view.html?product_id=&goods_sku=`) 링크. (주석: "DLC번들은 game_view엔 없음" — 데이터 있으면 렌더)
5. **진행중인 이벤트**(is_event_info=="Y"): 배너 링크(event_link_url/target) + subject + Parsedown(contents, event_notes htmlspecialchars_decode).
6. **게임설명**(`#description_html`): dgkr_description(있으면 Parsedown) + description(version=="2"면 description_v2 raw echo, 아니면 `##`→`\r\n\r\n###` 치환 후 Parsedown). "전체보기" toggle(maxheight 800).
7. **시스템 요구사항**(`#requirements_html`): Parsedown(requirements). "전체보기" toggle(maxheight 400).
8. **권리표기**(`#legal_text`): Parsedown(legal_text).

### content-right (460px)
1. **타이틀 헤더**: `{domain}/upload/title/{title_id}/header/{title_id}.jpg` + short_description.
2. **연령/게임등급 아이콘**: age_limit(10→age_all, else age_{age_limit}.png) + game_rate 문자열 각 자리 "1"이면 `grade{i+1}.png`.
3. **정보 dl**: 출시일(coming_soon=="Y"→coming_soon_date, else `date("Y년 m월 d일")`), 개발사, 퍼블리셔, 언어지원(음성/인터페이스/독점 한국어 뱃지 or "한국어지원안함"), 장르(getTagName), 카테고리(getTagName).
4. **추천상품**(`recommand_title`): 2열 카드(col-6). title 기반 이미지(`/upload/title/{title_id}/header/{title_id}.jpg`, onerror hidden), product_name, 배송/프로모션/예약/특전 뱃지, 할인율·소비자가·판매가. **버튼 없음, view_url = `/game/game_view.html?product_id={sku}`**.
5. **상품 정보 제공 고시**: 정적 리스트(이용조건에 platform_store_url + getPlatform(platform), 환불정책 링크 `/service/refund_policy.html`).

## SSR·SEO (legacy)

- `<title>` = `title_info['title_name']`
- `<meta name=description>` = `goods_description['short_description']`, author="H2interactive"
- canonical = `https://directg.net/game/game_view.html?product_id={title_info['sku']}`
- alternate(mobile) = `https://m.directg.net/game/game_view.html?product_id={sku}`
- `<meta name=amazonbot content=noarchive>`
- OG: title=title_name, type=video.movie, url(canonical), image=`{domain}/upload/title/{title_id}/header/{title_id}.jpg`, description=short_description, site_name="다이렉트게임즈"
- **GA4**: `gtag view_item` 이벤트 — `items: $ga4`(기본게임 목록 기준 item_id/name/index/brand/category1~5/list_id="game_view"/list_name/price/discount/quantity). (config G-S69YNEJF27 — header_common 공통과 별개로 인라인 재선언)
- **구조화 데이터(ld+json)**: `<script type="application/ld+json">` 블록이 **전부 주석(`/* */`)** 처리되어 있음 → **실제 출력 JSON 없음**. `$schema_json`(ProductGroup)은 계산되나 echo 안 됨. **parity: JSON-LD 미출력(주석 블록만) 그대로 재현** (개선 금지).
- 페이지 CSS: `splide.min.css` 로드(단 미디어는 splide 미사용, overflow-scroll) + 인라인 `<style>`(screenshot-thumbnail/media_list/description_html/platform_title/opacity-30/container 1320px).

## 데이터 (legacy)

도메인 클래스·메서드(모두 **백엔드 책임**, 프론트는 조립된 응답 소비):
- `Goods::getTitleInfoSku($product_id)` — 대표상품(타이틀) 정보. 필드: sku, title_id, title_name, title_name_en, domain, genre(csv), category(csv), publisher, developer, is_view, drm_notice, ext_user_account_notice, age_limit, game_rate, spoken_korean, interface_korean, exclusive_korean, coming_soon, coming_soon_date, release_date.
- `Goods::setTitleHit($product_id,$ip)` — 조회수 증가(부수효과).
- `Goods::getGoodsMediaList($title_id)` — youtube(media_type, youtube_media_id, media_url).
- `Goods::getGoodsScreenshotList($title_id)` — 스크린샷(file_type, screenshot_num, domain, url, thumbnail).
- `Goods::getTitlePlatform($title_id)` — 플랫폼 목록(product_platform).
- `Goods::getTitleGameList($title_id,$platform)` — 기본게임 옵션(product_code, product_name, goods_sku, product_platform, price, discount, consumer_price, delivery_type, is_bonus, is_preorder, soldout, description).
- `Goods::getEventGoodsInfo($product_code)` — 기본게임[0] 진행중 이벤트(event_link_url, event_link_target, event_banner, subject, contents, event_notes).
- `Goods::getTitleEditionList` / `getTitleDLCList` / `getTitleDLCBundleList($title_id,$platform)` — 에디션/DLC/DLC번들 옵션.
- `Goods::getGoodsDescription($title_id)` — short_description, dgkr_description, description, version, description_v2, requirements, legal_text, region_msg.
- `Goods::getRecommandTitle($title_id,'1',developer,genre,category)` — 유사 추천 타이틀(sku, title_id, domain, product_code, product_name, consumer_price, price, discount, delivery_type, is_preorder, is_bonus).
- `Goods::getTagName($code)` — 장르/카테고리 코드→이름.
- `Goods::getPlatform($code)` — 플랫폼 코드→이름.
- `Promotion::getPromotionGoodsPrice($product_code)` — 옵션별 프로모션가(sale_price, discount_rate, promotion_end). sale_price>0이면 discount/price 오버라이드 + is_promotion="Y" + promotion_label="bg-danger".
- `Mypage2::getWishlistItem($m_no,$product_code)` — 로그인 세션 위시 여부(idx>0 → wishlist_chk="Y"). **세션(`$_SESSION['member']['m_no']`) 의존 — 백엔드가 쿠키로 판정.**
- 로그인 여부 `is_login` = `$_SESSION['member']['m_id']` 존재 여부 → 버튼 `data-login`.

### AJAX/POST (인터랙션)
- **장바구니 담기** `.btn_cart` → `POST /order/cart_proc.php` `{mode:"add_cart", goods_sku}` → 응답 HTML을 `#cart_result`에 주입 후 `#cart-modal` 표시. 모달 닫힘(`hidden.bs.modal`) 시 `location.reload()`. **order 도메인**.
- **위시리스트 담기** `.btn_wishlist` → `POST /order/wishlist_proc.php` `{mode:"add_wishlist", goods_sku}` → 응답 HTML을 `#wishlist_result`에 주입, `#fail` 없으면 버튼 아이콘 y로 전환, `#wishlist-modal` 표시. **order/session 도메인**.
- **비로그인**(`data-login=="N"`) 시 두 버튼 모두: `alert("로그인 이후에 이용이 가능합니다.")` → `location.href="/member/login.html"`. **(백엔드 무관, client-only)**
- `#btn_cart_move` → `/order/cart.html`, `#btn_wishlist_move` → `/mypage/mypage_wishlist.html`.
- `#btn_buy`(핸들러만 존재, 본 템플릿에 트리거 엘리먼트 없음 → 미재현) — order_pre.html POST.
- promotion_timer: `$goods_product_chk['promotion_end']` 미정의 → 항상 빈 값 → 타이머 미작동(재현 시 no-op).

## 결제(PG) — 해당 시

- 직접 PG 연동 없음. 단 **장바구니 담기**가 order 도메인(`cart_proc.php`) 진입점 → **cart 게이트**. 본 단위는 **비로그인 parity**(alert+redirect)까지만 구현, 로그인 시 AJAX 런타임은 order 도메인 단위로 이월.

## API 계약 (백엔드 전달)

### `GET /api/game/detail?product_id={title_sku}&platform={code}`
- 요청: `product_id`(타이틀 sku, 필수), `platform`(옵션 — 빈 값이면 백엔드가 타이틀 첫 플랫폼으로 고정해 응답). 세션 쿠키 전달(wishlist_chk·is_login 판정용).
- 백엔드 책임: `setTitleHit`(조회수) 부수효과, 위 도메인 메서드 조립, 옵션별 `getPromotionGoodsPrice` 적용(sale_price>0 오버라이드), `getWishlistItem`으로 옵션별 `wishlist_chk`, `getTagName`/`getPlatform` resolve.
- 응답(JSON, snake_case verbatim):
  ```
  {
    goods_status: "Y" | "N",            // is_view 기준
    goods_status_msg: string,            // "판매중인 상품이 아닙니다"
    is_login: "Y" | "N",
    platform: string,                    // 확정된 현재 플랫폼
    title_info: { sku, title_id, title_name, title_name_en, domain, genre, category,
                  publisher, developer, drm_notice, ext_user_account_notice, age_limit,
                  game_rate, spoken_korean, interface_korean, exclusive_korean,
                  coming_soon, coming_soon_date, release_date },
    goods_description: { short_description, dgkr_description, description, version,
                         description_v2, requirements, legal_text, region_msg },
    media_list: [{ media_type, media_id, media_url, media_thumb }],
    title_platform: [{ product_platform }],
    goods_item: { [platform]: { game:[GameOption], edition:[...], dlc:[...], dlc_bundle:[...] } },
    is_event_info: "Y" | "N",
    event_data: { event_link_url, event_link_target, event_banner, subject, contents_html, event_notes_html },  // Parsedown 결과 HTML(백엔드 렌더) 권장
    recommand_title: [RecommandItem],    // 각 promotion 적용됨
    flags: { is_early_access, is_free, only_multiplayer },  // legacy strpos 버그 포함해 백엔드가 동일 판정
    description_html: string,            // 게임설명 최종 HTML(dgkr + description, Parsedown/raw 규칙 백엔드)
    requirements_html: string,           // Parsedown(requirements)
    legal_html: string,                  // Parsedown(legal_text)
    ga4: [{ item_id, item_name, index, item_brand, item_category..5, item_list_id, item_list_name, price, discount, quantity }]
  }
  ```
  - GameOption/에디션/DLC/DLC번들: `{ product_code, product_name, goods_sku, product_platform, price, consumer_price, discount, delivery_type, is_bonus, is_preorder, soldout, is_promotion, promotion_label, promotion_end, wishlist_chk }`.
  - RecommandItem: `{ sku, title_id, domain, product_code, product_name, consumer_price, price, discount, delivery_type, is_preorder, is_bonus, is_promotion, promotion_label }`.
  - **주의**: Parsedown/htmlspecialchars_decode/`##`치환 등 마크다운 렌더는 legacy와 동일 결과가 나오도록 **백엔드가 HTML을 렌더**해 `*_html` 필드로 내려준다(프론트는 `dangerouslySetInnerHTML`). description version 분기·event contents decode 규칙 verbatim.

### `POST /api/order/cart` (add_cart) — **order 도메인 이월**
- legacy `POST /order/cart_proc.php {mode:add_cart, goods_sku}`. 응답 장바구니 HTML. 본 단위 미구현(비로그인 경로만).

### `POST /api/order/wishlist` (add_wishlist) — **order/session 도메인 이월**
- legacy `POST /order/wishlist_proc.php {mode:add_wishlist, goods_sku}`. `#fail` 유무로 성공 판정. 본 단위 미구현.

## 타겟 매핑

- 라우트: `app/(pc)/game/game_view.html/page.tsx` — searchParams(product_id/sku/platform), 301 redirect(특수 id), `generateMetadata`(동적 title/desc/canonical/alternate/OG/amazonbot), viewport, GA4 인라인 `<script>`.
- screen: `screens/game-detail` — server `GameDetailScreen`(전체 레이아웃) + client 하위:
  - `MediaGallery`(client) — 메인 미디어 + 썸네일 클릭 교체
  - `OptionCard`/`OptionActions`(client) — wishlist/cart 버튼(비로그인 alert+redirect, 로그인 AJAX는 order 이월) + cart/wishlist 모달
  - `ToggleContent`(client) — 게임설명/시스템요구사항 전체보기(scrollHeight 측정 로직 이식)
  - `DlcCollapse` — bootstrap `data-bs-collapse` 선언형 + 버튼 텍스트 토글 client
  - `RecommandCard`(server, onerror만 client 불필요 — img onError는 inline) — 추천 2열 카드
- entities: `entities/game-detail` — `model/types.ts`, `api/get-game-detail.ts`(쿠키 포워딩, `GET /api/game/detail`), `index.ts`
- mock: `shared/mocks/handlers.ts` + `fixtures/game-detail.ts` — 비로그인(is_login="N", 전 옵션 wishlist_chk="N"), 플랫폼 2종·기본게임/에디션/DLC(4+개)/DLC번들/이벤트/추천 포함 realistic fixture.

## Parity 체크리스트
- [ ] 진입 파라미터·301 redirect·is_view 분기
- [ ] content-left: 미디어(교체)·안내alert 6종·플랫폼탭·옵션4종(뱃지/가격/버튼)·이벤트·게임설명/요구사항 toggle·권리표기·DLC collapse(3+)
- [ ] content-right: 헤더·연령/등급 아이콘·정보dl·추천2열·상품고시
- [ ] 필드/검증: 프로모션가 오버라이드·wishlist_chk·is_login·소프트아웃(품절)
- [ ] 분기/플로우: 비로그인 cart/wishlist alert+redirect, 로그인 AJAX(order 이월 명시)
- [ ] SEO: title/desc/canonical/alternate/amazonbot/OG/GA4 view_item, **JSON-LD 미출력(주석) 재현**
- [ ] 엣지: media 없음(섹션 숨김), 옵션 없음, coming_soon, 무료/멀티전용(strpos 버그)
