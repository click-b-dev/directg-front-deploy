# 모바일 홈 본문 ③ 하단군 (예약구매·퍼블리셔·네이버페이 배너)

> 모바일 홈(`mobile/index.php`) 본문 3서브단위 중 **③**(마지막). `#appCapsule`에서 ②게임리스트군 뒤, main_footer 앞.
> 실제 순서: 네이버페이 이벤트배너(만료·미표시) → 예약구매(`#main_preorder`) → 퍼블리셔 안내(`#publisher_list`) → [한국어지원 2섹션 = legacy 전부 주석처리·미이관].
> ②게임리스트군 개발자 승인(2026-09-11) 후 착수.

## 원본 (legacy mobile)
- 파일: `mobile/index.php` (라이브 버전)
  - 네이버페이 이벤트배너: L664~675 — 기간게이트 `>= '2025-08-27 16:00:00' && < '2025-09-01 00:00:00'` (**현재 만료 → 미표시**)
  - 예약구매: `#main_preorder` (L677~779) — `count($goods_preorder)>0`일 때만, splide `carousel-multiple`
  - 퍼블리셔 안내: `#publisher_list` (L781~885) — **정적 12개**, splide5 init은 주석처리(L1217~1236) → 캐러셀 아님(col-6 2열 그리드)
  - 음성/독점 한국어지원: L887~1064 — **legacy 전부 `/* */` 주석처리 → 미이관**(범위 밖)
  - splide init: main_preorder splide4 (L1197~1215)
- 데이터 세팅: L36 `$goods_preorder = $main->getGoodsPreorder(12)` (한국어지원 getGoodsSpokenKorean/Exclusive는 주석 섹션 전용)
- **PC 대응 단위**: `docs/migration/storefront/main/preorder-korean-event.md`(2-3, `entities/preorder-game`) · `publisher-platform-footerbanner.md`(2-4, `widgets/publisher-section` 정적)

## 화면·플로우 (legacy mobile 기준)

### 네이버페이 이벤트배너 (만료·미표시)
- 기간게이트 `date >= '2025-08-27 16:00:00' && < '2025-09-01 00:00:00'` (현재 만료).
- 마크업: `div.section.mb-2 > (section-title.py-2.px-0 > h2.mb-0 "다이렉트 게임즈 X 네이버페이 즉시할인 이벤트") + (div.event_banner#event_banner > a[/board/notice_view.html?idx=30] > img[image.directg.net/v82AtcoPy4].w-100)`.
- ①의 planning/footer 배너처럼 기간게이트 위젯으로 재현(현재 null). PC `event-banner-section`(2-3)과 별개(모바일 전용 마크업·img).

### 예약구매 (`#main_preorder`) — splide carousel-multiple
- `count($goods_preorder)>0`일 때만 `<div class="section">`. section-title h2 "예약구매" + 전체보기 `<a href="/game/game_thumb.html?is_preorder=Y" class="btn btn-outline-primary btn-allview">`.
- `<div class="carousel-multiple splide" id="main_preorder">` > track/list.
- 각 `li.splide__slide`: `card product-card`:
  - `card-header rounded-0 text-truncate ps-1 border-0` = product_name
  - `card-img position-relative rounded-0` > `a[url]` > `img[{domain}/upload/product/{product_code}/header/header.jpg].imaged.w-100.square, alt="{product_name} 이미지"` (**product header 이미지** — new_game의 title header와 다름) + `position-absolute bottom-0 start-0`에 game_type badge(GAME/DLC/Music/번들, ②와 동일)
  - `card-badge bg-grey`: delivery(1 코드발송/2 택배발송/3 코드+택배발송) + is_promotion(프로모션) + is_preorder(예약구매) + is_bonus(특전), `badge-outline-*` `rounded-2`
  - `card-body > card-price`: discount>0면 `<span class="badge bg-cprimary rounded-1 percent minus">{discount} %</span>`(항상 bg-cprimary) + old-price(discount>0면 `<s class="won">{number_format(consumer_price)}</s>`, else `&nbsp;`) + `<div class="current-price text-white won">{number_format(price)}</div>`
- **url**(L692~706): delivery 1 → game_type game→`/game/game_view.html?product_id={title_sku}` · dlc→`/game/dlc_view.html?sku={goods_sku}` / delivery 2·3 → `/game/goods_item_view.html?product_id={title_sku}&sku={goods_sku}`. (`sku`=title sku. new_game과 달리 delivery1에 dlc→dlc_view 분기 추가)
- **POST 폼 없음**: 홈 예약 카드는 `<a href>` 링크만. `$(".btn_preorder")` 핸들러(L1109)는 이 섹션에 대상 버튼이 없어 무효(상세 페이지 전용). → 이관 시 POST 폼 불필요.
- splide4 옵션: `{grid:{gap:{row:'1rem',col:'1rem'}}, perPage:2, perMove:1, pagination:false, arrows:false, drag:true, flickMaxPages:1}`. **grid 무효**(`window.splide4.Extensions`=undefined) → 실효 `perPage:2`. (②와 동일 패턴.)

### 퍼블리셔 안내 (`#publisher_list`) — 정적 2열 그리드(캐러셀 아님)
- `<div class="section">` > section-title h2 "퍼블리셔 안내" > `<div class="col" id="publisher_list"> > <ul class="list-unstyled d-flex flex-wrap">` > **12x** `li.col-6.p-0`:
  - `div.card.rounded-top.card-shadow > (div.card-header.border-0.text-truncate > span.mb-0 {name}) + a[link, title={name}] > img[src].w-100`
- **정적 12개**(순서·이름·링크·이미지 고정):
  1. 2K — `/game/publisher_2k_thumb.html` — `image.directg.net/N84CVZeIW8`
  2. SEGA — `/game/publisher_sega_thumb.html` — `image.directg.net/I84CVZipaf`
  3. CAPCOM — `/game/publisher_capcom_thumb.html` — `image.directg.net/upload/main/publisher_capcom.png`
  4. Paradox Interactive — `/game/publisher_paradox_thumb.html` — `image.directg.net/y84CVZhNXz` (**card-header에 `border-0` 누락** quirk, L813)
  5. PlayStation PC LLC — `/game/publisher_playstation_thumb.html` — `image.directg.net/T84CVZi7pP`
  6. NEOWIZ — `/game/publisher_neowiz_thumb.html` — `image.directg.net/upload/main/publisher_neowiz.png`
  7. Arc System Works — `/game/publisher_asw_thumb.html` — `image.directg.net/I84CVZeZrr`
  8. THQ Nordic — `/game/publisher_thq_thumb.html` — `image.directg.net/B84CVZiYCO`
  9. 505 Games — `/game/publisher_505_games_thumb.html` — `image.directg.net/R84CVZeS5n`
  10. Focus Entertainment — `/game/publisher_focus_thumb.html` — `image.directg.net/C86t87TuRI`
  11. Hooded Horse — `/game/publisher_hooded_horse_thumb.html` — `image.directg.net/E84CVZfcs2`
  12. Clouded Leopard Entertainment — `/game/publisher_clouded_leopard_thumb.html` — `image.directg.net/P84CVZf632` (span `mb-0 ` 뒤 공백 quirk, L878)
- splide5(캐러셀)는 주석처리 → 정적 그리드로 렌더. PC 2-4 `publisher-section`(정적)과 동일 정책, 마크업만 모바일.

### 세션/권한 의존
- 없음. 예약/퍼블리셔 모두 링크만(위시/장바구니·POST 없음).

## 모바일 head / 앱셸
- 추가 head 불필요(splide JS는 ①에서 로드됨). 본 단위는 `#appCapsule` 본문만.
- splide grid: ②와 동일 — 확장 미마운트로 무효, `useSplide` perPage2만.

## 데이터 (재사용/증분)
- **재사용**: `entities/preorder-game` `getPreorderGames(12)` + `ProductThumb`. 퍼블리셔는 정적(엔티티 없음).
- **증분**: `ProductThumb.title_sku` — ②에서 이미 추가됨(예약 url `product_id={title_sku}`용). preorder fixture에 title_sku 값만 추가. (raw price=consumer_price/price/discount 기보유. title_id는 예약 이미지가 product header라 불필요.)
- **모바일 전용 동작(증분/AJAX)**: 없음(SSR 1회, POST 폼 없음).

## API 계약 (증분만, 백엔드 전달)

기존 `GET /api/main/preorder-games`(2-3, ProductThumb[])는 확정. 모바일 추가 필드:

### `GET /api/main/preorder-games?limit=12` — 예약구매 (증분)
- 응답 `games[]`(ProductThumb)에 **`title_sku`** 포함(모바일 예약 카드 url `product_id={title_sku}`용, ②와 동일 필드). goods_sku와 구분.
- 모바일은 `limit=12` 호출(legacy `getGoodsPreorder(12)`). PC 2-3은 별도 limit.

### 퍼블리셔
- API 없음. 정적 12개(위 목록) — 프론트 하드코딩(legacy도 정적 HTML).

## 타겟 매핑
- **middleware MOBILE_ROUTES**: `/` 이미 등록(①). **추가 없음**.
- **라우트**: `app/m/page.tsx` — `getPreorderGames(12)` SSR 로드 추가 → `MobileHomeScreen`에 전달.
- **screen**: `screens/mobile-home` — `#appCapsule` 내 ②(신규게임) 뒤 ③ 주석 자리에 삽입.
- **widgets**:
  - `widgets/mobile-naverpay-banner`(server, 기간게이트 — 현재 null).
  - `widgets/mobile-preorder-section`(client, `useSplide` perPage2, count>0).
  - `widgets/mobile-publisher-section`(server, 정적 12).
- **신규 UI 카드**: `entities/product-thumb/ui/mobile-preorder-card.tsx`(`MobilePreorderCard`, ProductThumb+title_sku). (new_game 카드와 이미지 소스·url·alt가 달라 별도.)
- **재사용 entities**: preorder-game, product-thumb.
- **mock**: 기존 handler(`*/api/main/preorder-games`) 재사용. preorder-games fixture에 title_sku 추가.

## Parity 체크리스트 (모바일 UA)
- [ ] 네이버페이 배너: 기간게이트(현재 만료=미표시) 마크업 재현
- [ ] 예약구매: count>0 게이트 · 전체보기(`?is_preorder=Y`) · card-header·product header 이미지·game_type badge·card-badge(발송/프로모션/예약구매/특전)·할인%(bg-cprimary)·가격 · url(delivery1 game/dlc 분기·2·3) · perPage2 슬라이드
- [ ] 퍼블리셔: 정적 12개(순서/이름/링크/이미지) · col-6 2열 · Paradox border-0 누락·Clouded 공백 quirk
- [ ] number_format(콤마) · discount 표기
- [ ] `#appCapsule` 순서: [②게임리스트군] → 네이버페이(만료) → 예약구매 → 퍼블리셔 → main_footer
- [ ] middleware `/` rewrite 유지
- [ ] 엣지: goods_preorder 0건(예약 섹션 숨김) · discount 0(원가·%badge 미표시)

## 보류/후속
- 음성/독점 한국어지원 2섹션: legacy 주석처리 상태 → 미이관(향후 legacy가 활성화하면 재검토).
- 모바일 홈 본문 3서브단위(①②③) 완료 시 홈 이관 종결. bottom_menu 홈 variant·directgames 앱 UA 분기·`/index.php`→홈 링크 등은 별도 후속(홈 앱셸 단위 잔여).
