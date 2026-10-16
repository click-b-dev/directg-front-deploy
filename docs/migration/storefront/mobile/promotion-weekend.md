# 모바일 주말특가 프로모션 (promotion/promotion_weekend) — 복합 랜딩(서브유닛 분할)

> PC weekend(W-1~W-5) 선례처럼 서브유닛으로 분할 이관. 데이터 소스는 PC `entities/promotion-weekend` + `entities/event` 재사용.

## 원본 (legacy mobile)
- 파일: `mobile/promotion/promotion_weekend.html` (링크: `mobile/inc/sidebar.html`). 공개, Cache-Control no-store
- 데이터: `Promotion::getPromotionWeekend`(config/기간/추천·인기 goods_code) + per-goods `getGoodsOptionTitleInfo`·`getGoodsItemDetail` + `getPromotionEventList(show_promotion=Y)` + `getPromotionIng`(game/basic, 기간, 20)
- PC 대응: `screens/promotion-weekend`(W-1~W-5), `entities/promotion-weekend`, `entities/event` `getPromotionEvents`

## 섹션 구성 / 서브유닛 계획
- **W-1 (완료 ✅)**: 접근 게이트 + 배너 + 셸(MobileSubHeader + `#appCapsuleSub.full-height`)
- **W-2 (이 단위)**: DG 추천게임(Splide perPage2, product-card) — `getPromotionWeekendRecommand` 재사용 + **`title_name` 증분**(카드 헤더/alt, PC/season은 product_name 사용 → optional)
- **W-3 (이 단위)**: 프로모션 인기게임(Splide perPage2, ranking/option_gubun/badge) — `getPromotionWeekendBest` 재사용(thumbList+gridList 평면 concat, ranking=index+1, ProductThumb 필드 전부 보유 → 증분 없음)
- **W-4 (이 단위)**: 진행중인 이벤트(event 카드 + Parsedown) — `entities/event` `getPromotionEvents`·`EventItem` 재사용(증분 없음) + `.event_contents` inline style, server 컴포넌트
- **W-5 (이 단위, 완결)**: 프로모션 게임 목록(`#goods_thumb`, `MobileThumbCard` 재사용) + 하단 배너 — `getPromotionWeekendGames` 재사용(증분 없음), server 컴포넌트

## W-1 접근 게이트 (legacy is_view 분기)
- is_view = (now >= week_start && now < week_end) ? Y : N (백엔드 `isActive`)
- is_view=N: 사무실 IP 아니면(`allowView=false`) alert + `location.href` 홈 리다이렉트 + exit / 사무실 IP면(`allowView=true`) alert만(계속 렌더)
- **모바일 alert 메시지**(PC와 다름 — `\n` 1개, "(단," 인라인): `"프로모션 기간이 아닙니다. \n주말특가 프로모션은 금요일 16시 ~ 월요일 16시에 진행됩니다. (단, 대규모 프로모션 기간은 제외)"`
- **리다이렉트 대상**: legacy `https://m.directg.net/index.php` → 본 앱 `/`(모바일 홈, PC 가드의 `directg.net/index.php`와 다름)

## W-1 배너
- `.section.full.mb-3 > .wide-block.pt-1.px-2 > a[href=bannerLink][title=name] > img(하드코딩 https://image.directg.net/m82AwckcqL, img-fluid, alt=name)`

## SSR·SEO (legacy)
- title "주말특가 프로모션", description/keywords 빈값, **canonical `https://directg.net/promotion/promotion_weekend.html`**(PC URL 지정 quirk), viewport theme #000
- Cache-Control no-store(헤더) — Next 기본, 별도 재현 생략(경미)

## 데이터 / API 계약
- **재사용(증분 없음)**: `getPromotionWeekendConfig`(`GET /api/promotion/weekend/config`, `PromotionWeekendConfig{name,bannerLink,weekStart,weekEnd,isActive,allowView}`)
- W-2~5는 각 서브유닛에서 해당 fetcher 재사용

## 타겟 매핑 (W-1)
- middleware MOBILE_ROUTES +1: `/promotion/promotion_weekend.html`
- 라우트: `app/m/promotion/promotion_weekend.html/page.tsx`(server, getPromotionWeekendConfig, canonical)
- screen: `screens/mobile-promotion-weekend`(server 셸) + `ui/mobile-weekend-access-guard.tsx`(client)
- 재사용: `entities/promotion-weekend`(getPromotionWeekendConfig)·`widgets/mobile-sub-header`
- **PC 폴백 있음**: PC weekend가 `app/(pc)/promotion/promotion_weekend.html`에 존재 → 데스크톱 UA는 PC weekend 서빙, 모바일 UA는 middleware가 `/m/...`로 rewrite

## 보존할 legacy quirk
- 모바일 alert 메시지(\n 1개, "(단," 인라인) — PC와 다름
- 리다이렉트 `/`(모바일 홈)
- canonical PC URL 지정
- Splide grid 확장은 `.mount(window.X.Extensions)` undefined라 미적용 = perPage:2만(W-2/W-3에서 useSplide 재사용)

## Parity 체크리스트 (W-1) — 개발자 승인 완료 2026-09-15 ✅
- [x] MobileSubHeader("주말특가 프로모션")·`#appCapsuleSub.full-height`·공개
- [x] 접근 게이트(기간 밖 alert + allowView 아니면 홈 리다이렉트, 모바일 메시지)
- [x] 배너(bannerLink + 하드코딩 img + name alt/title)
- [x] title/canonical(PC URL)/viewport/theme#000
- [x] middleware rewrite
- [x] W-2~W-5 완결

## Parity 체크리스트 (W-5 — 프로모션 게임 목록 + 하단 배너)
- [ ] 섹션 제목 "프로모션 게임 목록" + 전체보기(`/promotion/promotion_ing_thumb.html`)
- [ ] `#goods_thumb` + `MobileThumbCard`(thumb-card card-shadow, product_name/img data-sku/bg-c* 배지/card-tail 가격) 재사용
- [ ] 하단 배너(하드코딩 `k843QVx2Jq` → promotion_ing_thumb 링크)
- [ ] `getPromotionWeekendGames`(주말특가 기간 game/basic) 재사용(증분 없음), server 컴포넌트

## Parity 체크리스트 (W-4 — 진행중인 이벤트) — 개발자 승인 완료 2026-09-15 ✅
- [x] 섹션 제목 "진행중인 이벤트" + 전체보기(`/event/event.html`)
- [x] 이벤트 카드(card product-card bg-transparent): 배너 링크(event_link_url/target) + `■ subject` + contents_html(Parsedown, dangerouslySetInnerHTML)
- [x] `.event_contents` inline style(ul padding / li font-12)
- [x] `getPromotionEvents`(show_promotion=Y)·`EventItem` 재사용(증분 없음), server 컴포넌트

## Parity 체크리스트 (W-3 — 프로모션 인기게임) — 개발자 승인 완료 2026-09-15 ✅
- [x] `#promotion_best` Splide carousel-multiple(perPage 2) + ranking 배지(index+1)
- [x] option_gubun(bundle→번들 우선 / basic→기본게임 / edition→에디션) + header.jpg 이미지 + view_url
- [x] card-badge: 코드발송 + 예약구매(is_preorder) + 특전(is_bonus)
- [x] 할인률/정가 취소선/판매가 + `getPromotionWeekendBest` 재사용(thumbList+gridList concat, 증분 없음)

## Parity 체크리스트 (W-2 — DG 추천게임) — 개발자 승인 완료 2026-09-15 ✅
- [x] `#promotion_recommand` Splide carousel-multiple(perPage 2, arrows/pagination false, drag)
- [x] product-card: 헤더 title_name·hero_capsule 이미지(domain/title_id)·game_view 링크(sku)
- [x] 할인률 badge(promotion_label)·정가 취소선(consumer_price)·판매가(price) — discount>0 조건
- [x] `getPromotionWeekendRecommand` 재사용 + `title_name` 증분(optional)
