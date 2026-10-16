# 모바일 홈 본문 ② 게임리스트군 (추천및특집·인기게임·신규게임)

> 모바일 홈(`mobile/index.php`) 본문 3서브단위 중 **②**. `#appCapsule`에서 ①상단배너군 뒤,
> ③하단군(예약·퍼블리셔·네이버페이) 앞에 위치: 추천및특집(`#recommand_list`) · 인기게임(`#main_best`) · 신규게임(`#main_new`).
> ①상단배너군 개발자 승인(2026-09-11) 후 착수.

## 원본 (legacy mobile)
- 파일: `mobile/index.php` (라이브 버전 — `_foundation.md` 기준. `index_dev.php`/`index20260120.php`/`kdy_index.php`/`app/index.html`은 미사용 사본)
  - 추천및특집: `#recommand_list` (L305~493) — `count($main_recommand)>0`일 때만
  - 인기게임: `#main_best` (L495~574) — splide `carousel-multiple`
  - 신규게임: `#main_new` (L576~662) — splide `carousel-multiple`, 전체보기 버튼
  - splide init: L1157~1195 (`main_new` splide2 / `main_best` splide3)
- 데이터 세팅: L22 `$main_recommand = $main->getMainRecommand()`, L30 `$best_title = $main->getBestTitle(10)`, L27 `$new_game = $main->getNewGame(8)`
- **PC 대응 단위**: `docs/migration/storefront/main/game-lists.md` (2-2, `entities/main-recommand`·`best-title`·`new-game`·`product-thumb` 재사용 출처)

## 화면·플로우 (legacy mobile 기준)

### 추천및특집 (`#recommand_list`) — splide 아님(정적 col)
- `count($main_recommand)>0`일 때만 `<div class="section">` 렌더. `section-title` h2 "추천 및 특집".
- `<div class="col" id="recommand_list">` 안에 recommand마다 `<div>`:
  - `.recommand_main_img > a[recommand_banner_link, title=recommand_name] > img[recommand_banner].img-fluid.w-100.card-shadow`
  - `<ul class="list-unstyled d-flex flex-wrap">` — recommand_goods 카드.
- **모바일 quirk**: recommand_goods를 순회하되 카드는 `$recommand_goods_loop < 2`, 즉 **recommand당 최대 2개**만 렌더(loop++가 if 블록 내부, L482). PC는 4개(col-md-6 thumb_list)와 다름.
- **legacy dead code**: L332~341에서 지역변수 `$price/$discount/$promotion_label`를 `$recommand_goods['promotion']['sale_price']` 기준으로 재계산하나 **미사용**(카드 렌더는 L323~331에서 `$promotion_goods['sale_price']` 기준으로 세팅한 `$recommand_goods[...]`를 사용). 블록에서 실제로 쓰이는 산출물은 `$recommand_url`뿐. → 이관 시 dead 계산 생략, 가격은 ProductThumb 값 사용.
- 카드 마크업 (`card row-card rounded-1 card-shadow border-0`):
  - `card-body d-flex p-0` > `img rounded-0 position-relative col-5` > `a[recommand_url] > img[{domain}/upload/product/{product_code}/header/header.jpg].img-fluid` + `position-absolute top-0 start-0`에 **타입 badge**(game_type/display_type별, `rounded-0`)
  - `product-info col-7` > `card-title` > 한국어 badge(음성 한국어/인터페이스·자막 한글/독점 한국어, `rounded-2`) + `product_name text-truncate`
  - `card-tail`(d-flex justify-content-between):
    - `card-badge`: delivery_type(1 코드/2 택배/3 코드+택배, `badge-outline-*`) + is_promotion(프로모션) + is_preorder(예약) + is_bonus(특전), 모두 `rounded-2`
    - `card-price`: discount>0면 `<div class="rounded-2 {promotion_label} badge percent minus">{discount} %</div>` (promotion_label = **is_promotion Y→`bg-cdanger`, N→`bg-cprimary`**, L327/330) + discount>0면 `<s class="num won old-price">{number_format(consumer_price)}</s>` + `<span class="current-price text-white num won">{number_format(price)}</span>`
- **타입 badge 매핑**(game_type/display_type): game/basic→"기본게임"(bg-cinfo) · game/edition→"에디션"(bg-cprimary) · game/multi→"멀티팩"(bg-cwarning) · dlc→"DLC"(bg-ccontent) · music→"Music"(bg-ccontent) · bundle→"번들"(bg-csuccess) · holomodels/holomodels→"본체"(bg-csuccess) · holomodels/holomodelsdlc→"DLC"(bg-ccontent) · holomodels/holomodelsedition→"에디션"(bg-cprimary). (= `MobileThumbCard`의 typeBadge와 동일 매핑)
- **recommand_url**(delivery_type + game_type + display_type 분기, L342~379):
  - delivery 1: game→`/game/game_view.html?product_id={title_sku}&sku={goods_sku}` · dlc(dlc_bundle→`/game/bundle_view.html?sku={goods_sku}`, else `/game/dlc_view.html?sku={goods_sku}`) · bundle→`/game/bundle_view.html?sku={goods_sku}` · holomodels(holomodels/holomodelsedition→`/game/holomodels_view.html?product_id={title_sku}&sku={goods_sku}`, holomodelsdlc→`/game/holomodelsdlc_view.html?...`) · default→`/game/game_view.html?product_id={title_sku}`
  - delivery 2·3: `/game/goods_item_view.html?product_id={title_sku}&sku={goods_sku}`
  - → API 계약상 `ProductThumb.view_url`이 백엔드에서 이 규칙으로 precompute됨. 모바일 카드는 `view_url` 재사용.

### 인기게임 (`#main_best`) — splide carousel-multiple
- `<div class="section mb-2">` > h2 "인기게임" > `<div class="carousel-multiple splide" id="main_best">` > track/list.
- 각 `li.splide__slide`: `card product-card` > `card-img position-relative rounded-0`:
  - `a[/game/game_view.html?product_id={sku}, title=title_name]` > `position-absolute top-0 start-0`에 **순위 badge**(`bg-secondary text-dark` inline `width:32px;height:32px;background:#313E4F`, `<span class="badge rounded-0 fs-5 my-1">{ranking}</span>`, 1부터) + `img[{domain}/upload/title/{title_id}/library/library_600x900.jpg].imaged.w-100.square, alt=title_name`
  - `position-absolute bottom-0 start-0`에 **game_type badge**(game→"GAME" bg-cinfo · dlc→"DLC" bg-ccontent · music→"Music" bg-ccontent · bundle→"번들" bg-csuccess, 모두 `rounded-0`)
  - **onerror 없음**(PC `BestTitleCard`는 세로 BI fallback 있으나 모바일은 없음 — parity상 미적용)
  - card-badge/card-body(가격) 블록은 **주석처리**(L543~565) → 커버+순위+타입 badge만.
- splide3 옵션: `{grid:{gap:{row:'1rem',col:'1rem'}}, perPage:2, perMove:1, pagination:false, arrows:false, drag:true, flickMaxPages:1}`. **grid 무효**(아래 splide 주석 참조) → 실효는 `perPage:2` 슬라이드.

### 신규게임 (`#main_new`) — splide carousel-multiple
- `<div class="section">` > `section-title`에 h2 "신규게임" + `<a href="/game/game_thumb.html" class="btn btn-outline-primary btn-allview">전체보기</a>` (PC와 달리 쿼리 없음) > `<div class="carousel-multiple splide" id="main_new">` > track/list.
- 각 `li.splide__slide`: `card product-card`:
  - `card-header rounded-0 text-truncate ps-1 border-0` = product_name
  - `card-img position-relative rounded-0` > `a[url]` > `img[{domain}/upload/title/{title_id}/header/{title_id}.jpg].imaged.w-100.square, alt="{product_name} image"` + `position-absolute bottom-0 start-0`에 game_type badge(GAME/DLC/Music/번들, best와 동일)
  - `card-badge bg-grey d-flex flex-row align-items-center`: delivery(1 코드발송/2 택배발송/3 코드+택배발송) + is_promotion(프로모션) + is_preorder(예약구매) + is_bonus(특전), 모두 `badge-outline-*` `rounded-2`
  - `card-body` > `card-price`: discount>0면 `<span class="badge bg-cprimary rounded-1 percent minus">{discount} %</span>`(**항상 bg-cprimary 하드코딩**) + old-price(discount>0면 `<s class="won">{number_format(consumer_price)}</s>`, else `&nbsp;`) + `<div class="current-price text-white won">{number_format(price)}</div>`
- **url**(L588~595): delivery 1→`/game/game_view.html?product_id={sku}` · delivery 2·3→`/game/goods_item_view.html?product_id={sku}&sku={goods_sku}`. (`sku`=title sku)
- splide2 옵션: splide3와 동일(`grid gap`, `perPage:2, perMove:1, pagination:false, arrows:false, drag:true, flickMaxPages:1`).

### 세션/권한 의존
- 위시/장바구니 버튼 자체가 모바일 카드에 **없음**(recommand/new/best 모두). 세션 의존 없음. (PC 공통카드의 위시/장바구니는 모바일 미노출.)

## 모바일 head / 앱셸
- head/viewport: 홈 앱셸 단위(`app/m/page.tsx`)에서 이미 이관(theme #ffffff, splide JS CDN @4.1.4 로드됨). **추가 head 불필요** — 본 단위는 `#appCapsule` 본문만.
- **splide grid extension**: legacy는 `splide-extension-grid.min.js`를 로드하고 `splideN.mount(window.splideN.Extensions)`로 마운트하나, `window.splideN`은 인스턴스 var(`var splide2 = new Splide(...)`)이므로 `.Extensions`는 `undefined` → **grid 확장 실제 미적용**. 또한 `grid:{gap}`만 있고 `rows/cols` 없어 확장이 붙어도 무의미. → ①선례대로 `useSplide`(무확장 mount) 재사용, 옵션은 `perPage:2` 등 core 옵션만.
- 앱셸: MobileMainHeader/bottom-nav/dialogs/main-footer는 기존 소유. 본 단위는 `#appCapsule` 내부에 3섹션 삽입만.
- 페이지별 mobile-assets CSS: 없음(카드/그리드 클래스는 style.css/dg_style.css에 존재, 이미 로드).

## 데이터 (재사용/증분)
- **재사용**:
  - `entities/main-recommand` `getMainRecommendations()` + `MainRecommand`(recommand_goods: ProductThumb[]) — 그대로.
  - `entities/best-title` `getBestTitles(10)` + `BestTitle` — 재사용(단 game_type 증분).
  - `entities/new-game` `getNewGames(8)` — 재사용(반환 ProductThumb에 title_id/title_sku 증분).
  - `entities/product-thumb` `ProductThumb` — recommand/new 카드 공통 데이터.
- **증분**:
  - `BestTitle.game_type: string` — 모바일 `#main_best` 카드가 game_type badge 렌더(PC BestTitleCard는 미사용). 백엔드 `GET /api/main/best-titles` 응답에 game_type 추가.
  - `ProductThumb.title_id?: string`, `ProductThumb.title_sku?: string` — 모바일 `#main_new` 카드가 title 헤더 이미지(`/upload/title/{title_id}/header/{title_id}.jpg`)와 title-sku url(`product_id={title_sku}`)에 사용. PC 카드는 product_code 이미지 + precomputed view_url만 써서 누락. (raw price=consumer_price/price/discount는 ProductThumb 기보유.)
- **모바일 전용 동작(증분/AJAX)**: 없음. 세 섹션 모두 SSR 1회 렌더(더보기/AJAX 없음). 예약구매(`btn_preorder` POST)는 ③ 하단군 범위.

## API 계약 (증분만, 백엔드 전달)

기존 계약(`GET /api/main/recommendations`, `GET /api/main/best-titles`, `GET /api/main/new-games`)은 `game-lists.md`(2-2)에서 확정. 아래는 모바일 이관으로 추가되는 필드만.

### `GET /api/main/best-titles?limit=10` — 인기게임 (증분)
- 응답 `titles[]`에 **`game_type`** 추가: `{ title_id, title_name, release_date, domain, sku, game_type }`
  - `game_type`: 'game' | 'dlc' | 'music' | 'bundle' (모바일 카드 badge용). 백엔드: `tbl_title_best`⋈`tbl_goods`의 game_type.
- 모바일은 `limit=10` 호출(legacy `getBestTitle(10)`). PC는 12.

### `GET /api/main/new-games?limit=8` — 신규게임 (증분)
- 응답 `games[]`(ProductThumb)에 **`title_id`**, **`title_sku`** 추가:
  - `title_id`: 타이틀 헤더 이미지 경로용(`/upload/title/{title_id}/header/{title_id}.jpg`).
  - `title_sku`: 상세 url `product_id={title_sku}`용(legacy `$value['sku']`, title sku). goods_sku와 구분.
  - 백엔드: `getNewGame` 쿼리의 tbl_title.title_id / sku를 ProductThumb에 포함.

### ProductThumb (증분 필드)
- `title_id?: string`, `title_sku?: string` — 모바일 new-game 카드 전용(옵셔널, 다른 섹션은 미사용).

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `/` 이미 등록(①에서). **추가 없음**(본 단위는 홈 `/` 본문).
- **라우트**: `app/m/page.tsx` — 기존 `getMainBanners`+`getNotices(3)`에 `getMainRecommendations()`+`getBestTitles(10)`+`getNewGames(8)` SSR 로드 추가 → `MobileHomeScreen`에 전달. (splide JS는 이미 로드됨.)
- **screen**: `screens/mobile-home` — `#appCapsule` 내 `MobileFooterBanner` 뒤 주석 자리에 3섹션 위젯 삽입.
- **widgets**:
  - `widgets/mobile-recommand-section`(server) — count>0 게이트 + 섹션/배너/카드 조립.
  - `widgets/mobile-best-game-section`(client, `useSplide` perPage 2) — `#main_best`.
  - `widgets/mobile-new-game-section`(client, `useSplide` perPage 2) — `#main_new` + 전체보기.
- **신규 UI 카드**:
  - `entities/product-thumb/ui/mobile-recommand-card.tsx`(`MobileRecommandCard`, ProductThumb) — row-card.
  - `entities/product-thumb/ui/mobile-new-game-card.tsx`(`MobileNewGameCard`, ProductThumb+title_id/title_sku).
  - `entities/best-title/ui/mobile-best-card.tsx`(`MobileBestCard`, BestTitle+game_type+ranking).
- **재사용 entities**: main-recommand, best-title, new-game, product-thumb.
- **mock**: 기존 handler(recommendations/best-titles/new-games) 재사용. fixture 증분 — best-titles에 game_type, new-games에 title_id/title_sku 추가.

## Parity 체크리스트 (모바일 UA)
- [ ] 추천및특집: count>0 게이트 · 배너(link/title/img) · **recommand당 카드 2개만**(loop<2) · row-card(타입 badge/한국어 badge/product_name/delivery·프로모션·예약·특전 badge/할인%·원가취소선·판매가)
- [ ] 인기게임: 순위 badge(1부터, #313E4F 32px) · 커버 library_600x900 · game_type badge · game_view 링크 · perPage 2 슬라이드 · (가격/onerror 없음)
- [ ] 신규게임: 전체보기(`/game/game_thumb.html` 쿼리없음) · card-header product_name · title header 이미지 · game_type badge · card-badge(코드발송 등) · 할인%(항상 bg-cprimary)·가격 · delivery별 url · perPage 2
- [ ] number_format(천단위 콤마) · discount 표기
- [ ] `#appCapsule` 순서: [①배너군] → 추천및특집 → 인기게임 → 신규게임 → [③하단군 자리] → main_footer
- [ ] middleware `/` rewrite(모바일 UA→/m) 유지, 데스크톱 PC 유지
- [ ] 엣지: recommand 0건(섹션 숨김) · recommand_goods 1개(카드 1개) · 이미지 로드 실패(그대로, onerror 없음) · discount 0(원가 미표시, %badge 미표시)

## 보류/후속
- ③ 하단군(예약구매 `#main_preorder`+POST 폼·퍼블리셔·만료 네이버페이 event_banner) — 다음 단위.
- 위시/장바구니: 모바일 카드에 애초에 없음(범위 밖).
- 만료 이벤트배너(L664~675, 2025-08 기간게이트 만료) — 현재 미표시, ③ 검토.
