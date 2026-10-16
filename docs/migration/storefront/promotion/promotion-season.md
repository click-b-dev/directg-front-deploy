# 시즌(대규모) 프로모션 (promotion/promotion-season) — 복합 랜딩, 섹션 분할

> weekend와 유사한 복합 랜딩. 섹션이 더 많음(8개). 공통 섹션은 weekend 위젯/카드 재사용, season 전용 3섹션 추가. 섹션 분할(S-1~S-8) 이관.

## 원본
- 파일: `pc/promotion/promotion_season.html` (**라이브** — `pc/inc/header.html:92` 할인프로모션 드롭다운 "2026 여름 프로모션" + header 상단 배너)
- **DB**: 리뉴얼 DB(`$dsn`) + `Promotion`(getPromotionSeason/getPromotionEventList/getPromotionSeasonGame2) + `Goods`(getGoodsOptionTitleInfo/getGoodsItemDetail) + `Draw`(drawThumb/drawGrid/drawSmallList) + Parsedown
- 세션: 공개(비로그인 열람). wishlist_chk만 세션.
- 선례: `screens/promotion-weekend`(섹션 분할·접근제한·배너), weekend 위젯(recommand/best/event/games), `entities/product-thumb`

## 서브단위 계획
| # | 서브단위 | legacy 섹션 | weekend 재사용 |
| --- | --- | --- | --- |
| **S-1** | **기반(메타/breadcrumb/접근제한/배너+notice)** | head + 접근제한 + 배너 section | W-1 유사(+breadcrumb·notice) |
| S-2 | DG 추천게임 | 4열 커스텀 카드 | W-2(RecommandCard) |
| S-3 | 프로모션 인기게임 | top4 thumb + grid | W-3 |
| S-4 | 진행중인 이벤트 | getPromotionEventList | **W-4(PromotionEventSection 그대로)** |
| S-5 | 역대 최대할인 | 배너(col-3) + drawThumb 가로 | 신규 |
| S-6 | 추가 포인트 적립 | 배너 + drawThumb 가로 | 신규 |
| S-7 | 5천/1만원 미만 게임 | 2열 drawSmallList | 신규(ProductSmallListCard) |
| S-8 | 프로모션 게임 목록 | getPromotionSeasonGame2 grid + 전체보기 | W-5 유사 |

## weekend 대비 차이
- title 동적(`promotion_season_name`), banner: `banner_pc != "#"` 조건 + **notice 배너 옵션**(notice_view=Y → title+btn, else divider).
- **breadcrumb 있음**(다이렉트 게임즈 > 할인프로모션 > {season_name}).
- 접근제한 메시지: `"프로모션 기간이 아닙니다."`(weekend보다 짧음).
- 추가 섹션 3개(역대 최대할인/추가 포인트/가격대). 게임 목록: `getPromotionSeasonGame2`(weekend는 getPromotionIng).

## S-2~S-8 (섹션)

- **S-2 DG 추천게임**(209–258): weekend W-2와 동일 마크업. `getPromotionSeasonRecommand` → `RecommandCard`(재사용). 위젯 `widgets/season-recommand-section`.
- **S-3 인기게임**(260–358): weekend W-3와 동일. `getPromotionSeasonBest` → `#thumb_list`(ProductThumbCard) + `.grid_list`(ProductGridCard, id="" 스타일 미적용). 위젯 `season-best-section`.
- **S-4 진행중 이벤트**(360–387): `getPromotionEvents` 공유 + `PromotionEventSection` **재사용**. ⚠️ season 전체보기 버튼은 `btn` class 포함(weekend는 미포함) — 재사용으로 weekend 버전(btn 없음) 렌더, 미세차 명시.
- **S-5 역대 최대할인**(389–408): `getPromotionSeasonMaxDiscount` → 배너(col-3, 하드코딩 F86PJKuwZi) + `.thumb_list`(가로 flex-nowrap) ProductThumbCard + 전체보기 링크. 위젯 `season-max-discount-section`.
- **S-6 추가 포인트 적립**(410–429): S-5 동일 구조, 배너 Y88eupClXn, `getPromotionSeasonAddRepay`. 위젯 `season-add-repay-section`.
- **S-7 5천/1만원 미만 게임**(431–463): 2열(col-6) `card_list_small` `getPromotionSeasonPrices` → `ProductSmallListCard`(drawSmallList 재사용) + 전체보기(가격 필터 프리셋). 위젯 `season-prices-section`.
- **S-8 프로모션 게임 목록**(465–482): weekend W-5와 동일. `getPromotionSeasonGames`(getPromotionSeasonGame2) → `#grid_list`(ProductGridCard) + 전체보기 배너(k843QVx2Jq). 마지막 섹션(divider 없음). 위젯 `season-games-section`.

### API 계약 (S-2~S-8, 백엔드 전달)
- `GET /api/promotion/season/recommand` → `{ list: WeekendRecommandGame[] }`
- `GET /api/promotion/season/best` (세션) → `WeekendBestResponse`(thumbList/gridList)
- `GET /api/promotion/season/max-discount` (세션) → `{ bannerLink; list: ProductThumb[] }`
- `GET /api/promotion/season/add-repay` (세션) → `{ bannerLink; list: ProductThumb[] }`
- `GET /api/promotion/season/prices` (세션) → `{ price5000; price10000: ProductThumb[] }`
- `GET /api/promotion/season/games` (세션) → `{ list: ProductThumb[] }`
- 백엔드: 각 sku[] → getGoodsOptionTitleInfo/ItemDetail 파생(sale_price→할인/view_url) + getPromotionSeasonGame2(S-8). ProductThumb 정규화.

## S-1 (이번 단위): 기반

### 화면·플로우
- 진입 URL: `/promotion/promotion_season.html`.
- **접근제한**: 시즌 기간(`promotion_season_start`~`end`) 밖이면 `alert("프로모션 기간이 아닙니다.")` + `location.href="https://directg.net/index.php"`. 관리자 IP(112.216.231.146)는 alert만.
- 레이아웃: `div.wrapper`(layout) > header > **breadcrumb**(`container mt-3 breadcrumb` > `다이렉트 게임즈 > 할인프로모션(promotion_ing_thumb) > {season_name}`) > `container my-3 pb-5 px-0` > `main#content.content.rounded-0` > 섹션들.
- **배너 섹션**(S-1): `section.mb-3` > `container` >
  - `banner_pc != "#"`이면 `<a href={banner_link}><img src={banner_pc} class="w-100" alt="{title} {title}"></a>` (alt에 title 2회 — legacy verbatim)
  - `notice_view=="Y"` → notice 배너(`.promotion-notice`: title + btn(notice_btn_url/title)) / else → `.b-example-divider`

### SSR·SEO (legacy)
- head: `<title>{promotion_season_name}</title>`(동적), `description=""`, `author=H2interactive`.
- **canonical**: `https://directg.net/promotion/promotion_season.html` / **alternate**: media 640 → m.directg.net.
- viewport/data-bs-theme dark. CSS: card-list.css + page inline(`.b-example-divider` + `.promotion-notice`/`.promotion-notice-title`/`.promotion-notice-btn`).

### 데이터 (legacy)
- `Promotion::getPromotionSeason()`: 노출(is_view=Y) 대규모 프로모션 1건 — promotion_season_name, promotion_season_start/end(unix ts), promotion_season_banner_pc, promotion_season_banner_link, notice_view/notice_title/notice_btn_url/notice_btn_title, (+ recommand/best/max_discount/price_5000/price_10000/add_repay sku 및 링크 — 후속 섹션).

### API 계약 (백엔드 전달) — S-1
- `GET /api/promotion/season/config` (optional 세션) → `{ name; bannerPc; bannerLink; seasonStart; seasonEnd; isActive; allowView; notice: { view; title; btnUrl; btnTitle } }`
  - isActive/allowView: 서버시간 기간·IP 판정(백엔드). bannerPc="#"이면 배너 미노출.
- 응답 타입: `entities/promotion-season/model/types.ts`

### 타겟 매핑 — S-1
- 라우트: `app/promotion/promotion_season.html/page.tsx` (public, `getPromotionSeasonConfig()`, **generateMetadata title=name** 동적 + canonical/alternate).
- screen: `screens/promotion-season/ui/promotion-season-screen.tsx` (server 셸) — card-list.css + page style + 접근제한 guard(client) + breadcrumb + 배너/notice 섹션. 이후 S-2~S-8 추가.
- client: `screens/promotion-season/ui/season-access-guard.tsx` (`'use client'`) — isActive=false면 alert("프로모션 기간이 아닙니다."), !allowView면 index redirect.
- entities: `entities/promotion-season` 신규 (`getPromotionSeasonConfig` server + 타입)
- mock: `shared/mocks/fixtures/promotion-season.ts`(config, isActive=true, notice_view 케이스) + handler `GET */api/promotion/season/config`.

### Parity 체크리스트 — S-1
- [ ] 접근제한(기간 밖 alert+redirect / 관리자 alert만, 메시지 "프로모션 기간이 아닙니다.")
- [ ] breadcrumb(다이렉트 게임즈 > 할인프로모션 > {name})
- [ ] 배너(banner_pc!="#" 조건 + alt title 2회) + notice 배너(notice_view=Y title/btn) or divider
- [ ] SEO(title=name 동적/canonical/alternate/author H2interactive) + page style(b-example-divider/promotion-notice)
