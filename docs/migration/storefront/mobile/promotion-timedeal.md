# 모바일 타임딜 (promotion/timedeal)

## 원본 (legacy mobile)
- 파일: `mobile/promotion/timedeal.html` (공개, 세션 불필요). 링크: `mobile/inc/main_bottom_menu.html`(홈 하단바 "타임딜")
- **PC 대응 없음(별개 데이터 모델)**: PC `time_deal.html`은 메인 DB·하드코딩 product_code=50005634(`entities/promotion-time-deal`). 모바일은 **DGKR DB 이벤트 구동형** → 신규 엔티티 `entities/promotion-timedeal`
- 데이터: DGKR `tbl_event`(timedeal='Y' start_dt DESC LIMIT 1) → `tbl_event_goods` ⋈ `tbl_goods`(event_no=idx). order_ea = max(order_ea, 기간 내 tbl_order_item count)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL: `/promotion/timedeal.html`(GET), title "타임딜". **공개**
- 헤더: `inc/sub_header.html` → `MobileSubHeader("타임딜")`
- 본문 `#appCapsule.mt-2.full-height` > `.section.inset`:
  - 상단 배너 img(하드코딩 `image.directg.net/O7PjnFN5nl`) + **소진임박 배지**(event_ea-order_ea<=50 → `P7PaBshmEs` position-absolute)
  - `#countdown_banner`: 카운트다운(`#given_date` vendor) + 연령 이미지(`age_{level}.gif`, level=age_limit 변환 0→10/18→19/else)
  - `a[href=/game/game_page.html?product_code={goods_code}]`: 상품 이미지(`upload/product/{open_graph}` 또는 없으면 `/images/404.jpg`) + "게임정보 바로가기 →"(fa 아이콘)
  - goods_name + `badge.badge-danger` "TIMEDEAL"
  - goods_info 카드(있을 때만, **raw echo → dangerouslySetInnerHTML**)
  - `.timedeal_price`(bg 이미지): 정상가(consumer_price 취소선) → 할인가(sale_price) → discount_rate %off
  - `.cart`: "장바구니 담기" 버튼(data-goodscode/assetid/prodtp) — **인페이지 핸들러 없음 = dead**(order 도메인 후속, base.js 전역 바인딩 여부 불명이나 in-page 부재 재현)
  - `<hr>` + 유의사항 카드(정적 ul 9항목)

## 카운트다운 (vendor)
- legacy: `/assets/js/jquery.countdownTimer.js` + jquery-3.4.1. `$('#given_date').countdowntimer({ regexpMatchFormat: "D:H:M:S", regexpReplaceWith: $2 $3 $4(3 span), startDate: date('Y-m-d H:i:s'), dateAndTime: end_dt })`
- 재현: `MobileTimedealCountdown`(client) — jQuery 3.7.1 CDN(PC time-deal 선례 SRI) + `public/mobile-assets/js/jquery.countdownTimer.js`(기존 복사분) page-scoped 로드 후 동형 초기화. **모바일은 H·M·S 3 span**(PC 4 span과 다름). dateAndTime=event.end_dt 문자열 그대로

## SSR·SEO (legacy)
- viewport device-width scale 고정 viewport-fit cover, theme #000, title "타임딜", description/keywords 빈값. canonical 없음
- head 자산: FA 6.7.2 CDN(SRI) + Material Icons + GmarketSans @font-face + 인라인 `<style>`(countdown/timedeal_price bg) → screen에서 `<link>`(React 19 hoist) + `<style>` 재현
- 하드코딩 CDN 이미지(O7PjnFN5nl/P7PaBshmEs/f7PjRn2Md4 bg) verbatim 유지

## 데이터 / API 계약 (백엔드 전달)
- `GET /api/promotion/timedeal` (공개) → `{ active, event: {idx, subject, end_dt} | null, goods: TimedealGoods | null }`
  - `TimedealGoods { goods_code, goods_name, goods_info, consumer_price, sale_price, discount_rate, age_limit(raw), open_graph(파일명), event_ea, order_ea }`
  - 백엔드: 최신 timedeal 이벤트 + 상품 조인, **order_ea = max(order_ea, 기간 내 tbl_order_item count)**. 이벤트 없으면 active=false
  - age_limit 표시 변환(0→10/18→19)·img URL 조립·소진임박 판정은 프론트(뷰)
- 응답 타입: `entities/promotion-timedeal/model/types.ts`

## 타겟 매핑
- middleware MOBILE_ROUTES +1: `/promotion/timedeal.html`
- 라우트: `app/m/promotion/timedeal.html/page.tsx`(server, getTimedeal, 공개)
- screen: `screens/mobile-promotion-timedeal`(server) + `ui/mobile-timedeal-countdown.tsx`(client vendor)
- entity: `entities/promotion-timedeal`(신규, getTimedeal + types)
- mock: `shared/mocks/fixtures/promotion-timedeal.ts` + handler `GET */api/promotion/timedeal`(end_dt now+8h)

## 보존할 legacy quirk / 결정
- **PC 폴백 없음**: 모바일 전용 URL(`/promotion/timedeal.html`), PC는 `/promotion/time_deal.html`(별개). 데스크톱 UA가 이 URL 접근 시 404(legacy는 별개 사이트+UA 301, 본 앱은 UA 301 미재현). 문서화된 수용 갭
- 장바구니 버튼 dead(in-page 핸들러 없음)
- age_limit 변환(0→10, 18→19) quirk
- goods_info raw echo(HTML 가능) → dangerouslySetInnerHTML
- `fa fa-long-arrow-right`(FA4 문법인데 FA6 로드 → 아이콘 미표시 가능) verbatim
- bottom_banner(event_banner) 변수 할당하나 legacy 미출력 → 미렌더
- 이벤트 없음(active=false) 시 상품 이미지 404 + 가격 0(legacy number_format 빈값) — 구조 유지, goods 가드

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-15 ✅
- [x] MobileSubHeader("타임딜")·#appCapsule·공개(세션 없음)
- [x] 상단 배너 + 소진임박 배지(event_ea-order_ea<=50)
- [x] 카운트다운 vendor 로드(H:M:S 3 span)·연령 이미지(변환)
- [x] 상품 이미지(open_graph/404)·game_page 링크·goods_name·TIMEDEAL 배지·goods_info 카드
- [x] 가격 블록(정상가 취소선/할인가/%off)·장바구니 dead 버튼·유의사항 9항목
- [x] title/viewport/theme#000·하드코딩 CDN 이미지 verbatim
- [x] middleware rewrite (PC 폴백 없음 — 문서화 갭)
