# 주말특가 프로모션 (promotion/promotion-weekend) — 복합 랜딩, 섹션 분할

> promotion_ing(단순 목록)과 완전히 다른 **복합 랜딩 페이지**. 메인 index.php처럼 서브단위(W-1~W-5)로 분할 이관.

## 원본
- 파일: `pc/promotion/promotion_weekend.html` (**라이브** — `pc/inc/header.html:94` 할인프로모션 드롭다운 "주말특가 프로모션")
- **DB**: 리뉴얼 DB(`$dsn`) + `Promotion`(getPromotionWeekend/getPromotionEventList/getPromotionIng) + `Goods`(getGoodsOptionTitleInfo/getGoodsItemDetail) + `Draw`(drawThumb/drawGrid) + `Parsedown`(이벤트 본문)
- 세션: 공개(비로그인 열람). wishlist_chk만 세션.
- no-cache 헤더(Cache-Control no-store).
- 선례: `screens/home`(섹션 분할), `entities/event`(이벤트 카드), `entities/product-thumb`(ProductThumbCard/GridCard), `entities/promotion-ing`(getPromotionIng 유사)

## 서브단위 계획 (index.php 방식)
| # | 서브단위 | legacy 섹션 | 데이터 |
| --- | --- | --- | --- |
| **W-1** | **기반(메타/접근제한/배너 + 셸)** | head + 접근제한 + 배너 section | `getPromotionWeekend`(config: 기간/배너/이름) |
| W-2 | DG 추천게임 | `#DG추천` 4열 커스텀 카드 | promotion_week_recommand(sku[]) → getGoodsOptionTitleInfo/ItemDetail |
| W-3 | 프로모션 인기게임 | top4 drawThumb + 나머지 drawGrid | promotion_week_best(sku[]) |
| W-4 | 진행중인 이벤트 | getPromotionEventList | 이벤트 카드(event 재사용) |
| W-5 | 프로모션 게임 목록 | getPromotionIng drawGrid + 전체보기 | 프로모션 기간 상품 |

## W-1 (이번 단위): 기반

### 화면·플로우
- 진입 URL: `/promotion/promotion_weekend.html`.
- **접근제한**: 주말특가 기간(금 16시~월 16시, `promotion_week_start`~`promotion_week_end`) 밖이면 `alert("프로모션 기간이 아닙니다. \n주말특가 프로모션은 금요일 16시 ~ 월요일 16시에 진행됩니다. \n(단, 대규모 프로모션 기간은 제외)")` + `location.href="https://directg.net/index.php"`. **단 관리자 IP(112.216.231.146)는 alert만**(redirect 없음, 미리보기).
- 레이아웃: `div.wrapper`(layout) > header > `container my-3 pb-5 px-0` > `main#content.content.rounded-0` > 섹션들.
- **배너 섹션**(W-1): `section.mb-3` > `container` > `<a href={promotion_week_banner_link} title={promotion_week_name}><img src="https://image.directg.net/U84s2DngyK" class="w-100" alt={promotion_week_name}></a>` + `.b-example-divider`.
  - ⚠️ **배너 img 하드코딩**(U84s2DngyK, banner 필드 무시) — legacy verbatim.

### SSR·SEO (legacy)
- head: `<title>주말특가 프로모션</title>`, `description=""`, `author=H2interactive`.
- **canonical**: `https://directg.net/promotion/promotion_weekend.html`
- **alternate(모바일)**: media 640 → `https://m.directg.net/promotion/promotion_weekend.html`
- viewport: `width=device-width, initial-scale=1.0`. `data-bs-theme="dark"`.
- CSS: card-list.css(screen `<link>`) + page inline `<style> .b-example-divider{ width:100%; height:50px; }`.

### 데이터 (legacy)
- `Promotion::getPromotionWeekend()`: 노출(is_view=Y) 주말특가 설정 1건 — `promotion_week_start/end`(unix ts), `promotion_week_name`, `promotion_week_banner_link`, `promotion_week_recommand`(| 구분 sku), `promotion_week_best`(| 구분 sku).

### API 계약 (백엔드 전달) — W-1
- `GET /api/promotion/weekend/config` (optional 세션) → `{ name; bannerLink; weekStart; weekEnd; isActive; allowView }`
  - `isActive`: 현재 주말특가 기간 여부(서버시간 금16~월16). `allowView`: 관리자 IP 등 미리보기 허용(isActive=false여도 alert만).
  - 접근제한 판정은 **백엔드**(서버시간/IP). 프론트는 `isActive`/`allowView`로 alert·redirect.
  - 배너 img는 프론트 하드코딩(U84s2DngyK). bannerLink/name만 계약.
- 응답 타입: `entities/promotion-weekend/model/types.ts`

### 타겟 매핑 — W-1
- 라우트: `app/promotion/promotion_weekend.html/page.tsx` (public, `getPromotionWeekendConfig()`, metadata title/canonical/alternate).
- screen: `screens/promotion-weekend/ui/promotion-weekend-screen.tsx` (server 셸) — card-list.css + `.b-example-divider` style + 접근제한 guard(client) + 배너 섹션. 이후 W-2~W-5 섹션 추가.
- client: `screens/promotion-weekend/ui/weekend-access-guard.tsx` (`'use client'`) — isActive=false면 alert, !allowView면 `location.href=index`. (survey-access-guard 선례)
- entities: `entities/promotion-weekend` 신규 (`getPromotionWeekendConfig` server + 타입)
- mock: `shared/mocks/fixtures/promotion-weekend.ts`(config, isActive=true) + handler `GET */api/promotion/weekend/config`

## W-2 (DG 추천게임)

### 화면
- legacy(135–178): `section.mb-3` > `container` > `h2 "DG 추천게임"` + `.row.row-col-1.row-cols-md-4.g-3.justify-content-center`(4열) + `.b-example-divider`.
- 카드(`.col-3`): **ProductThumbCard와 다른 전용 마크업**.
  - `.card.mb-0.rounded-1.card-shadow.bg-card.border-0`
  - 이미지: `<a href="/game/game_view.html?product_id={title_info.sku}" title={product_name}><img src="{domain}/upload/title/{title_id}/hero/hero_capsule.jpg" class="card-img-top rounded-1" onerror="this.src='/assets/images/logo/H2_DG_BI_VERTICAL.svg'"></a>` (**hero_capsule** — thumb는 header.jpg와 다름)
  - `.card-footer.px-2.py-0.border-0` > `.d-flex`(min-height:48px):
    - discount>0 → 할인율 뱃지 `<span class="badge {promotion_label} num font-14 px-3 py-2">-{discount}%</span>`
    - `.ms-auto.text-end`: discount>0 → 정가 취소선(consumer_price, `.text-decoration-line-through`) + 판매가(price, `.num.won`)
- ⚠️ legacy 클래스 `row-col-1`(오타로 보이나 verbatim) 유지.

### 데이터 파생 (legacy PHP → 백엔드)
- `promotion_week_recommand`(| 구분 sku[]). 각 sku → `getGoodsOptionTitleInfo`(title_info: sku/title_id/domain) + `getGoodsItemDetail`(option_info: product_name/consumer_price/price/discount/promotion).
- 파생: `promotion.sale_price>0` → discount=discount_rate, price=sale_price, is_promotion=Y, promotion_label=bg-danger / else is_promotion=N, promotion_label=bg-primary.

### API 계약 (백엔드 전달) — W-2
- `GET /api/promotion/weekend/recommand` (public) → `{ list: WeekendRecommandGame[] }`
  - `WeekendRecommandGame { sku; title_id; domain; product_name; consumer_price:number; price:number; discount:number; is_promotion; promotion_label }`
  - 백엔드: promotion_week_recommand sku[] → getGoodsOptionTitleInfo/ItemDetail → 파생(sale_price→discount/price/label) → RecommandGame.
- 응답 타입: `entities/promotion-weekend/model/recommand-types.ts`

### 타겟 매핑 — W-2
- entities: `entities/promotion-weekend`에 `getPromotionWeekendRecommand` fetcher + `WeekendRecommandGame`/`WeekendRecommandResponse` 타입.
- widget: `widgets/promotion-recommand-section/ui/promotion-recommand-section.tsx` (async server) — 자체 fetch + 헤더 + 4열 row + 카드(내부 렌더, hero_capsule + onerror 로고 + 할인/가격 footer) + b-example-divider.
- screen: W-2 자리에 `<PromotionRecommandSection/>`.
- mock: `shared/mocks/fixtures/promotion-weekend-recommand.ts`(WeekendRecommandGame[]) + handler `GET */api/promotion/weekend/recommand`.
- 자산: H2_DG_BI_VERTICAL.svg(존재), card-shadow/num/won CSS(directg/card-list 전역).

### Parity 체크리스트 — W-2
- [ ] 헤더("DG 추천게임") + 4열 row(row-cols-md-4) + 카드(card-shadow, hero_capsule, onerror 로고)
- [ ] discount>0 할인율 뱃지(promotion_label) + 정가 취소선 + 판매가(won), min-height:48px footer
- [ ] 파생(sale_price→discount/price/label) 백엔드 계약 + b-example-divider

## W-3 (프로모션 인기게임)

### 화면
- legacy(180–278): `section.mb-3` > `container` > `h2 "프로모션 인기게임"` + `#thumb_list`(top4 drawThumb) + `.grid_list`(나머지 drawGrid) + `.b-example-divider`.
- **#thumb_list**: `<div class="justify-content-center mb-3" id="thumb_list">` → `promotion_best`(key<4, top4) → `drawThumb` → **ProductThumbCard**.
- **.grid_list**: `<div class="grid_list" id="">` → `promotion_best_small`(key>=4) → `drawGrid` → **ProductGridCard**.
  - ⚠️ **id="" (빈값)** → CSS `#grid_list`(id) **미적용**(class `.grid_list` 규칙 없음). legacy 그대로 재현: id 없이 class만(스타일 없음).

### 데이터 파생 (legacy PHP → 백엔드)
- `promotion_week_best`(| 구분 sku[]). 각 sku → `getGoodsOptionTitleInfo`(title_info) + `getGoodsItemDetail`(option_info).
- option_info 파생:
  - `promotion.sale_price>0` → discount=discount_rate, price=sale_price, is_promotion=Y, promotion_label=bg-danger / else is_promotion=N, promotion_label=bg-primary
  - display_type → option_gubun(기본게임/에디션 뱃지 — **thumb_inc/grid_inc는 game_type/display_type으로 자체 라벨, option_gubun 미사용**)
  - game_type → view_url: game→`game_view?product_id={sku}` / dlc→`dlc_view?sku={goods_sku}` / bundle→`bundle_view?sku={goods_sku}`(+번들 뱃지)
- `drawThumb($best_array)`는 getProductInfo로 ProductThumb 정규화 → thumb_inc.php(ProductThumbCard). → **파생·정규화 전부 백엔드**, 프론트는 ProductThumb[] 수신.

### API 계약 (백엔드 전달) — W-3
- `GET /api/promotion/weekend/best` (optional 세션 — wishlist_chk) → `{ thumbList: ProductThumb[]; gridList: ProductThumb[] }`
  - 백엔드: promotion_week_best sku[] → getGoodsOptionTitleInfo/ItemDetail → 파생(sale_price/할인/view_url) → getProductInfo(ProductThumb). key<4 → thumbList(top4), key>=4 → gridList.
- 응답 타입: `entities/promotion-weekend/model/best-types.ts`(ProductThumb 재사용).

### 타겟 매핑 — W-3
- entities: `entities/promotion-weekend`에 `getPromotionWeekendBest` fetcher + `WeekendBestResponse` 타입.
- widget: `widgets/promotion-best-section/ui/promotion-best-section.tsx` (async server) — 자체 fetch + 헤더 + `#thumb_list`(ProductThumbCard) + `.grid_list`(ProductGridCard, id 없음) + b-example-divider.
- screen: W-3 자리에 `<PromotionBestSection/>`.
- mock: `shared/mocks/fixtures/promotion-weekend-best.ts`(thumbList/gridList ProductThumb[]) + handler `GET */api/promotion/weekend/best`.

### Parity 체크리스트 — W-3
- [ ] 헤더("프로모션 인기게임") + #thumb_list(top4 ProductThumbCard) + .grid_list(ProductGridCard, id="" 스타일 미적용)
- [ ] 파생(sale_price→할인/is_promotion/promotion_label, view_url by game_type) 백엔드 계약 + ProductThumb 재사용
- [ ] b-example-divider

## W-5 (프로모션 게임 목록)

### 화면
- legacy(309–327): `section.mb-3` > `container` > 헤더(`h2 "프로모션 게임 목록"` + `<a href="/promotion/promotion_ing_thumb.html?is_promotion=Y">전체보기</a>` bg-primary) + `#grid_list`(**id 있음** → #grid_list CSS 6열) drawGrid + 하단 전체보기 배너.
  - `#grid_list`: `<div class="grid_list" id="grid_list">` → getPromotionIng 결과 → `drawGrid` → **ProductGridCard**. (W-3 best_small은 id="" 였으나 W-5는 id="grid_list" — 둘 다 6열 동일 규칙)
  - 하단 배너: `<div class="mt-4 pt-2"><a href="/promotion/promotion_ing_thumb.html?is_promotion=Y"><img src="https://image.directg.net/k843QVx2Jq"></a></div>` (하드코딩 img)
  - ⚠️ **b-example-divider 없음**(마지막 섹션).

### 데이터 (legacy)
- `Promotion::getPromotionIng("1", $add_where, "a.release_date desc", $param, 30)`:
  - where: `a.game_type='game' and a.display_type='basic' and c.promotion_start<={week_start} and c.promotion_end>={week_end}` (주말특가 기간 프로모션 상품)
  - release_date desc, 30개. drawGrid → getProductInfo → ProductThumb.

### API 계약 (백엔드 전달) — W-5
- `GET /api/promotion/weekend/games` (optional 세션 — wishlist_chk) → `{ list: ProductThumb[] }`
  - 백엔드: getPromotionIng(주말특가 기간 프로모션, game+basic, promotion_start<=week_start && promotion_end>=week_end, release desc, 30개) → ProductThumb.
- 응답 타입: `entities/promotion-weekend/model/games-types.ts`(ProductThumb 재사용).

### 타겟 매핑 — W-5
- entities: `entities/promotion-weekend`에 `getPromotionWeekendGames` fetcher + `WeekendGamesResponse` 타입.
- widget: `widgets/promotion-games-section/ui/promotion-games-section.tsx` (async server) — 자체 fetch + 헤더/전체보기 + `#grid_list`(ProductGridCard) + 하단 전체보기 배너(하드코딩 img). **divider 없음**.
- screen: W-5 자리에 `<PromotionGamesSection/>`.
- mock: `shared/mocks/fixtures/promotion-weekend-games.ts`(ProductThumb[]) + handler `GET */api/promotion/weekend/games`.

### Parity 체크리스트 — W-5
- [ ] 헤더("프로모션 게임 목록" + 전체보기 링크) + #grid_list(id, 6열 ProductGridCard) + 하단 전체보기 배너(하드코딩 img)
- [ ] divider 없음(마지막 섹션) + getPromotionIng(주말특가 기간) 백엔드 계약 + ProductThumb 재사용

## W-4 (진행중인 이벤트)

### 화면
- legacy(280–307): `section.mb-3` > `container` > 헤더(`h2 "진행중인 이벤트"` + `<a href="/event/event.html">전체보기</a>` bg-primary) + 이벤트 카드 반복(`card mb-3 rounded-0` — event.html은 mb-4, 미세차) + `.b-example-divider`.
- 이벤트 카드: **event 목록(event.html)과 동일** — `row g-0` > col-md-5(배너 링크: event_link_url/target/banner/subject alt) + col-md-7(card-body: h4 "■ subject" + `.event_contents` Parsedown contents).
- ⚠️ promotion_weekend는 `.event_contents li` inline style **없음**(event.html엔 있음) — verbatim(추가 안 함).

### 데이터 (legacy)
- `Promotion::getPromotionEventList(" AND show_promotion = 'Y'")`: **`getEvenBoardtList`와 SQL·필드 100% 동일** + `show_promotion='Y'` 필터. `select subject,contents,start_date,end_date,event_banner,event_link_url,event_link_target from tbl_event where is_view='Y' AND show_promotion='Y' and 진행중 order by end_date asc,start_date asc,-(idx) asc`.

### API 계약 (백엔드 전달) — W-4
- `GET /api/promotion/events` (public) → `{ list: EventItem[] }`
  - `EventItem` **재사용**(entities/event — subject/contents_html/event_banner/event_link_url/event_link_target).
  - 백엔드: getPromotionEventList(show_promotion='Y'), 진행중 필터, 마감임박순. contents Parsedown → contents_html.
- 응답 타입: `entities/event` `EventListResponse` 재사용.

### 타겟 매핑 — W-4
- entities: `entities/event`에 `getPromotionEvents` fetcher 추가(public, EventItem 재사용).
- widget: `widgets/promotion-event-section/ui/promotion-event-section.tsx` (async server) — 자체 `getPromotionEvents` fetch + 헤더/전체보기 + 이벤트 카드(mb-3) 반복 + b-example-divider.
- screen: `PromotionWeekendScreen` W-4 자리에 `<PromotionEventSection/>`(showContent 내).
- mock: `shared/mocks/fixtures/promotion-events.ts`(EventItem[]) + handler `GET */api/promotion/events`.

### Parity 체크리스트 — W-4
- [ ] 헤더("진행중인 이벤트" + 전체보기 링크) + 이벤트 카드(mb-3, event 목록 동일 마크업)
- [ ] contents_html Parsedown dangerouslySetInnerHTML + b-example-divider + `.event_contents li` style 미포함(verbatim)
- [ ] getPromotionEvents(show_promotion=Y) 백엔드 계약 + EventItem 재사용

## Parity 체크리스트 — W-1
- [ ] 접근제한(기간 밖 alert+redirect / 관리자 alert만) — isActive/allowView 백엔드 판정
- [ ] 배너 섹션(하드코딩 img + banner_link + name alt) + b-example-divider
- [ ] 셸(wrapper > container px-0 > main#content) + card-list.css + b-example-divider style
- [ ] SEO(title 주말특가 프로모션/canonical/alternate/author H2interactive/viewport)
- [ ] 후속 W-2~W-5 섹션(추천/인기/이벤트/목록)
