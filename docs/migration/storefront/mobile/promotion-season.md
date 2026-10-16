# 모바일 시즌(대규모) 프로모션 (promotion/promotion_season) — 복합 랜딩, 섹션 분할

> 모바일 주말특가(`mobile/promotion/promotion_weekend.html`, W-1~W-5)와 동형인 복합 랜딩. 섹션이 더 많음(배너+7섹션+게임목록). PC 시즌(S-1~S-8) 엔티티/계약을 **전부 재사용**하고, 모바일 마크업(`mobile/`)만 별도 screen으로 옮긴다.

## 원본 (legacy mobile)
- 파일: `mobile/promotion/promotion_season.html` (**라이브** — `mobile/inc/sidebar.html` 링크 진입)
- PC 대응 단위: `docs/migration/storefront/promotion/promotion-season.md` (재사용 출처, S-1~S-8 ✅)
- 선례(모바일 패턴): `screens/mobile-promotion-weekend`(W-1~W-5), `entities/product-thumb` `MobileThumbCard`, `widgets/mobile-sub-header`

## 서브단위 계획 (PC S-1~S-8 정렬)
| # | 서브단위 | legacy 라인 | 재사용 |
| --- | --- | --- | --- |
| **S-1** | **기반(접근게이트+배너+셸)** | head + 16~46(접근제한) + 173~180(배너) | `getPromotionSeasonConfig`(+`bannerMobile` 증분) |
| S-2 | DG 추천게임 | 182~231 | `getPromotionSeasonRecommand` |
| S-3 | 프로모션 인기게임 | 233~318 | `getPromotionSeasonBest` |
| S-4 | 진행중인 이벤트 | 320~341 | `getPromotionEvents`(event) |
| S-5 | 역대 최대할인 | 343~408 | `getPromotionSeasonMaxDiscount` |
| S-6 | 추가 포인트 적립 | 410~475 | `getPromotionSeasonAddRepay` |
| S-7 | 5천/1만원 미만 게임 | 477~609 | `getPromotionSeasonPrices` |
| S-8 | 프로모션 게임 목록 + 하단배너 | 611~664 | `getPromotionSeasonGames` |

> S-2~S-8 카드는 **모바일 전용 마크업**(`splide` `carousel-multiple` perPage2 캐러셀 + `product-card`)이라 PC 위젯/카드는 재사용하지 않고 모바일 카드를 신규 작성한다(주말특가 W-2~W-5 선례). 데이터 계약(entities)만 PC 재사용.

## S-2 (DG 추천게임, 182~231)
- 섹션 `section full mb-3` > section-title "DG 추천게임"(h2.font-16) > `#promotion_recommand` `carousel-multiple splide px-2`.
- 카드(`card product-card`): 헤더 `card-header rounded-0 text-truncate ps-1`(title_name) + `card-img` hero_capsule(`{domain}/upload/title/{title_id}/hero/hero_capsule.jpg`, game_view 링크 `?product_id={sku}`) + `card-body px-2`(할인배지 `-{discount}%` + 정가취소선 + 판매가).
- Splide: perPage2/perMove1/pagination·arrows false/drag/flickMaxPages1 (grid 확장 미마운트로 core만).
- **재사용**: `entities/promotion-season` `getPromotionSeasonRecommand`(→ `WeekendRecommandResponse`, weekend와 동형).
- **주말특가 W-2와 마크업 차이**(재사용 안 함, season 전용 `MobileSeasonRecommandSection`): (a) `card-header`에 `border-0` 없음, (b) 배지 `badge {label} rounded-1 percent` + 텍스트 `-{discount}%`(W-2는 `rounded-2 … minus` + `{discount} %`), (c) min-height row에 `lh-1` 없음.
- **label**: sale_price>0 → bg-danger, else **bg-cprimary**(비프로모션, 백엔드 파생). `WeekendRecommandGame.promotion_label` 그대로 렌더.
- **mock 증분**: `seasonRecommandFixture`(WeekendRecommandGame[])에 `title_name` 추가 — 모바일은 `title_info.title_name`을 헤더/alt에 쓰나 PC는 `product_name`만 소비해 fixture에 없었음. 계약상 백엔드는 recommand 응답에 `title_name`(title_info.title_name) 포함 필요.

## S-3 (프로모션 인기게임, 233~318)
- 섹션 `section full mb-3` > section-title "프로모션 인기게임" > `#promotion_best carousel-multiple splide px-2`.
- 카드(`card product-card`): 헤더 `card-header rounded-0 text-truncate ps-1`(product_name) + `card-img`(ranking 배지 `#313E4F` 32×32 좌상단 + header.jpg + view_url 링크 + option_gubun 좌하단) + `card-badge bg-grey`(코드발송 + 예약구매(is_preorder) + 특전(is_bonus)) + `card-body px-2`(할인배지 `-{discount}%` + 정가/판매가).
- **재사용**: `entities/promotion-season` `getPromotionSeasonBest`(→ `WeekendBestResponse` thumbList/gridList). page에서 `[...thumbList, ...gridList]` 평면 concat, ranking=index+1(legacy 단일 foreach 순위 재현).
- **option_gubun**(client 파생, legacy display_type→game_type override 순서): bundle→번들(bg-success), dlc→DLC(**bg-ccontent**), basic→기본게임(bg-info), edition→에디션(bg-primary). game_type=game이면 display_type 결과. **gubun 없어도 `position-absolute bottom-0 start-0` 빈 div 렌더**(legacy verbatim).
- **view_url**: `ProductThumb.view_url`(백엔드 precomputed) 그대로 사용 — legacy game_type별 계산과 동일 결과.
- **주말특가 W-3와 차이**(재사용 안 함, season 전용 `MobileSeasonBestSection`): (a) card-header `border-0` 없음, (b) gubun 배지 `font-11 py-1 px-2` 포함(W-3 미포함), (c) DLC(bg-ccontent) 처리(W-3 미처리→null), (d) 배지 `rounded-1 percent -{discount}%`, (e) 가격 row `min-height:32px`(lh-1 없음), (f) gubun 빈 div 항상 렌더.
- label: 프로모션 bg-danger / 비프로모션 bg-cprimary(백엔드 파생). mock(`seasonBestFixture`)은 game_type/display_type 기본(game/basic)이라 gubun=기본게임, dlc/bundle 분기는 계약 코드로만 검증.

## S-4 (진행중인 이벤트, 320~341)
- 섹션 `section full mb-3` + page `<style>` `.event_contents ul/li`(154~164) + section-title(align-items-center) "진행중인 이벤트" + 전체보기 `/event/event.html` + `wide-block full px-2 bg-transparent border-0` > 이벤트 카드(`card product-card mb-2 bg-transparent`: 배너 링크 `event_link_url`/target + `card-img-top rounded-0` + `card-body p-1`(h5 "■ {subject}" + `.event_contents` contents_html)).
- **재사용**: `entities/event` `getPromotionEvents`(show_promotion=Y, → `EventListResponse`).
- **주말특가 W-4와 완전 동일 마크업** → **공용 위젯 승격**: 기존 `screens/mobile-promotion-weekend/ui/mobile-weekend-event-section.tsx`를 `widgets/mobile-promotion-event-section` `MobilePromotionEventSection`으로 이동(PC `widgets/promotion-event-section` 공유 패턴·holomodels `MobileGameOptionCard` 재배치 선례). weekend 화면은 import만 갱신(**동작 불변**), season 화면과 공유. server 컴포넌트.
- **증분 없음**: 새 mock/타입 없음. `getPromotionEvents`/`EventItem` 그대로.

## S-5~S-7 공용 캐러셀 (`MobileSeasonCarouselSection`)
- legacy S-5(역대 최대할인 343~408) · S-6(추가 포인트 적립 410~475) · S-7(5천/1만원 미만 477~609)은 **카드 구조 완전 동일** → 파라미터형 공용 컴포넌트 `screens/mobile-promotion-season/ui/mobile-season-carousel-section.tsx`(props: title/carouselId/allViewLink/list).
- 카드: `card product-card` 헤더 `card-header rounded-0 text-truncate`(**ps-1 없음**) + card-img(view_url 링크 + header.jpg + option_gubun 좌하단, 빈 div 렌더) + card-badge(코드발송/예약구매/특전) + card-body(할인배지 `-{discount}%` + 정가/판매가, row min-height:32px).
- **best(S-3)와 차이**: ranking 배지 없음, **DLC/번들 gubun 없음(display_type basic/edition만)**, card-header ps-1 없음.
- **비프로모션 label bg-primary**(best/recommand의 bg-cprimary와 다름 — 백엔드 파생, `promotion_label` 그대로 렌더).
- **link**: legacy는 `game_view.html?product_id={title_info.sku}` 고정이나 계약상 `ProductThumb.view_url`이 동일값(PC ProductThumbCard 선례) → view_url 사용.

### S-5 (역대 최대할인, 343~408)
- 섹션 title "역대 최대할인" + 전체보기 `{promotion_max_discount_link}`(=`SeasonBannerListResponse.bannerLink`), `#promotion_max_discount` 캐러셀.
- **재사용**: `getPromotionSeasonMaxDiscount`(→ `SeasonBannerListResponse` bannerLink+list). 증분 없음.
- **PC S-5와 차이**: PC는 배너(col-3 하드코딩)+가로 thumb였으나 **모바일은 배너 없이 캐러셀만**.

### S-6 (추가 포인트 적립, 410~475)
- 섹션 title "추가 포인트 적립" + 전체보기 `{promotion_add_repay_link}`(=`SeasonBannerListResponse.bannerLink`), `#promotion_add_repay` 캐러셀. S-5와 카드 구조 **완전 동일** → `MobileSeasonCarouselSection` 재사용.
- **재사용**: `getPromotionSeasonAddRepay`(→ `SeasonBannerListResponse`). 증분 없음.

### S-7 (5천/1만원 미만 게임, 477~609)
- 캐러셀 2개: "5천원 미만 게임"(`#promotion_price_5000`, 전체보기 **하드코딩** `/promotion/promotion_ing_thumb.html?min_price=0&max_price=5000`) + "1만원 미만 게임"(`#promotion_price_10000`, 하드코딩 `?min_price=5000&max_price=10000`). 카드 구조 S-5/S-6과 완전 동일 → `MobileSeasonCarouselSection` 재사용(2회).
- **재사용**: `getPromotionSeasonPrices`(→ `SeasonPricesResponse` price5000/price10000). 증분 없음.
- **PC S-7과 차이**: PC는 2열 `drawSmallList`(ProductSmallListCard)였으나 **모바일은 캐러셀**(다른 섹션과 동일 카드).

## S-8 (프로모션 게임 목록 + 하단 배너, 611~664) — 시즌 랜딩 완결
- **캐러셀 아님** — `wide-block full px-2` > `row row-col-5 row-cols-md-2 g-0 justify-content-center` > `col-6` 2열 grid. 섹션 title "프로모션 게임 목록" + 전체보기 `/promotion/promotion_ing_thumb.html`. 마지막에 하단 배너 `<section class="mb-3">` `k843QVx2Jq`.
- 카드(`card product-card m-0 mb-2`): 헤더(product_name) + card-img(view_url 링크 + header.jpg + **기본게임 배지 하드코딩** bg-info always) + card-body(**bg-danger 하드코딩** `-{discount}%` + 정가/판매가). **card-badge(코드발송 등) 없음**.
- **재사용**: `getPromotionSeasonGames`(→ `WeekendGamesResponse` list). 증분 없음.
- **전용 컴포넌트** `MobileSeasonGamesSection`(server) — 주말특가 W-5(`MobileThumbCard`+`#goods_thumb`)와 마크업 다름(season은 `product-card` grid). best/carousel과도 다름(기본게임/bg-danger 하드코딩·card-badge 없음·grid).
- link/discount: legacy `discount_rate`·`title_info.sku` → `ProductThumb.discount`·`view_url`(계약 정규화, PC 동일).

## 완료
S-1~S-8 전부 구현. 모바일 시즌 프로모션 랜딩 완결.

## 화면·플로우 (legacy mobile 기준) — S-1

### 진입 URL/파라미터
- `/promotion/promotion_season.html` (모바일 UA → `/m/...` rewrite). 파라미터 없음.

### 접근제한 (legacy 16~46)
- `getPromotionSeason` 노출(is_view=Y) 1건 조회 → `page_title = promotion_season_name`.
- 서버시간이 `promotion_season_start ~ end` **밖**이면 `is_view="N"`:
  - 관리자 IP(`112.216.231.146`)가 **아니면**: `alert("프로모션 기간이 아닙니다.");location.href="https://m.directg.net/index.php";` → 앱에선 홈 `/`.
  - 관리자 IP(allowView): `alert("프로모션 기간이 아닙니다.");`만 (본문은 그대로 렌더).
- **주말특가와 차이**: 메시지가 짧다("프로모션 기간이 아닙니다."만, 부가 설명 없음).

### 화면 요소 / 마크업 조각 (S-1)
- `inc/sub_header.html` → `MobileSubHeader`(pageTitle=`promotion_season_name` 동적) — 뒤로/검색토글/장바구니.
- `<div id="appCapsuleSub" class="full-height">` 본문.
- **배너 섹션**(173~180, 조건 `promotion_season_banner_mobile <> "#"`):
  ```
  <div class="section full">
    <div class="wide-block pt-1 px-2">
      <a href="{banner_link}"><img src="{banner_mobile}" class="img-fluid" alt=" {page_title}"></a>
    </div>
  </div>
  ```
  - `section full` (주말특가는 `section full mb-3`, 시즌은 `mb-3` 없음).
  - `<a>`에 **title 속성 없음**(주말특가는 title 추가). alt는 **선행 공백 1개 + name**(verbatim).
  - `bannerMobile == "#"`이면 배너 미노출.
- 하단: `inc/bottom_menu.html`(하단바) + `inc/sidebar.html` → `app/m/layout.tsx` 전역 소유(재조립 불필요).

### 폼 필드/검증
- 없음(랜딩).

### 분기/리다이렉트
- 접근제한(위). 배너 조건부.

### 세션/권한 의존
- 공개(비로그인 열람). config는 세션 쿠키 전달(옵션). 인기게임(S-3) 등 wishlist_chk만 세션이나 모바일 카드엔 위시 표기 없음.

## 모바일 head / 앱셸 (S-1)
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover` (138). theme-color `#000000`(141). → 주말특가 page와 동일.
- title=`promotion_season_name`(동적) → `generateMetadata`에서 config 조회. description=""/keywords="".
- canonical=`https://directg.net/promotion/promotion_season.html`(145, PC URL — quirk). **alternate media 없음**(모바일 head엔 canonical만). **author 없음**(PC는 H2interactive, 모바일은 없음).
- 사용 앱셸: `MobileSubHeader(pageTitle=name)` / bottom-nav(표시) / dialogs(N/A).
- 페이지별 CSS: page `<style>` `.event_contents ul/li`(154~164) — **S-4(진행중 이벤트)에서 도입**(S-1엔 event_contents 없음).

## 데이터 (S-1)
- **재사용 엔티티**: `entities/promotion-season` `getPromotionSeasonConfig`(server, `GET /api/promotion/season/config`) — PC S-1이 생성. **fetcher/엔드포인트 그대로 재사용**.
- **증분**: `PromotionSeasonConfig`에 `bannerMobile: string`(promotion_season_banner_mobile, "#"이면 미노출) 필드 추가. PC는 `bannerPc`만 사용 → 모바일 전용 필드. 계약 엔드포인트 동일, 응답에 필드 추가.

## API 계약 (증분만, 백엔드 전달) — S-1
- `GET /api/promotion/season/config` (기존, optional 세션) 응답에 **`bannerMobile` 추가**:
  - `bannerMobile: string` — legacy `promotion_season_banner_mobile`. 모바일 배너 이미지 URL, `"#"`이면 배너 미노출. (PC `bannerPc`와 별개 필드.)
  - 그 외(name/bannerLink/seasonStart/seasonEnd/isActive/allowView/notice) 변경 없음.

## 타겟 매핑 — S-1
- middleware `MOBILE_ROUTES` 추가: `"/promotion/promotion_season.html"`.
- 라우트: `app/m/promotion/promotion_season.html/page.tsx` (server, viewport theme#000, `generateMetadata` title=name 동적 + canonical, `getPromotionSeasonConfig()`).
- screen: `screens/mobile-promotion-season/ui/mobile-promotion-season-screen.tsx` (server 셸) — `MobileSubHeader(name)` + access guard(client) + `#appCapsuleSub.full-height` + 배너 조건부. 이후 S-2~S-8 추가.
- client: `screens/mobile-promotion-season/ui/mobile-season-access-guard.tsx` (`'use client'`) — isActive=false면 alert("프로모션 기간이 아닙니다."), !allowView면 `/` 리다이렉트.
- 재사용 entities: `entities/promotion-season/api/get-promotion-season-config`(+타입 증분).
- 신규 UI: screen 2종(셸+가드).
- mock: `shared/mocks/fixtures/promotion-season.ts`에 `bannerMobile` 추가(기존 config 핸들러 재사용).

## Parity 체크리스트 (모바일 UA) — S-1
- [ ] 접근제한(기간 밖 alert "프로모션 기간이 아닙니다." + !allowView `/` 리다이렉트 / allowView alert만)
- [ ] 배너(`bannerMobile != "#"` 조건 + `section full`(mb-3 없음) + `<a>` title 없음 + alt=" {name}")
- [ ] MobileSubHeader pageTitle = name(동적)
- [ ] 모바일 head/viewport(theme#000, min/max-scale 1, viewport-fit cover) + title=name 동적 + canonical PC URL
- [ ] middleware rewrite/폴백 동작(모바일 UA→/m, 데스크톱→PC)
