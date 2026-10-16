# 모바일 홀로모델 목록 holomodels (thumb + list)

## 원본 (legacy mobile)

- 파일: `mobile/game/holomodels_thumb.html`·`holomodels_list.html`. 더보기: `holomodels_*_ajax.php`(구조상 getGameList 재사용). 카드: `thumb_inc.php`/`list_inc.php`. 필터: `game_filter.html`.
- PC 대응: `app/(pc)/game/holomodels_thumb.html`·`holomodels_list.html` → getGameList + `product_type=holomodels` 주입 — **계약 출처**.
- 기반 패턴: **goods 계열과 완전 동형**(base where만 accessories↔holomodels, title만 다름).

## goods 대비 차이 (동형)

| 항목 | goods | holomodels |
|------|-------|------------|
| base where | `game_type='accessories'` → `product_type=accessories` 주입 | `find_in_set(game_type,'holomodels')` → **`product_type=holomodels` 주입** |
| title | "PS액세서리" | **"홀로 모델"** |
| aside | productType/platform/korean/genre = false | **동일** (product_type="holomodels"도 상품유형 블록 숨김) |
| page_name | goods | holomodels |

thumb/list는 include(thumb_inc/list_inc)만 차이(구조 라인 동일).

## 데이터 / 재사용

- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)` + **`product_type=holomodels` 주입**. **증분 없음**(PC holomodels 선례, 백엔드가 product_type 해석).
- 카드: thumb=`MobileThumbCard`, list=`MobileListCard`.
- 필터: `MobileGameFilter(aside={productType:false,platform:false,korean:false,genre:false}, viewBasePath="/game/holomodels")` — goods와 동일 aside.
- 더보기: `getGameList(nextPage, filters)`(product_type 포함) — game_list divergence 노트 동일.

## API 계약 (증분만)

증분 없음. `GET /api/game/list?product_type=holomodels&page=N&{필터}` (PC holomodels 계약).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/holomodels_thumb.html`, `/game/holomodels_list.html`
- 라우트: `app/m/game/holomodels_thumb.html/page.tsx`·`holomodels_list.html/page.tsx` — theme#000, title "홀로 모델" 정적, collectFilters에 product_type=holomodels 주입
- screen: `screens/mobile-holomodels-thumb`(MobileThumbCard)·`mobile-holomodels-list`(MobileListCard) — goods 계열 동형, `MobileSubHeader("홀로 모델")` + filter aside + items + 더보기
- 재사용: `game-list`, `product-thumb`, `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`
- 신규 UI: 없음. mock: 없음(기존 getGameList mock, filter 무시).

## Parity 체크리스트 (모바일 UA)

- [ ] 헤더 "홀로 모델" / 필터 검색필터+가격만(상품유형·플랫폼·한국어·장르 숨김) / thumb·list 카드 / 더보기
- [ ] product_type=holomodels 주입 / 뷰전환 list↔thumb=`/game/holomodels_*`
- [ ] head/viewport theme#000
- [ ] middleware rewrite/폴백
- caveat: 더보기 구형카드 divergence(game_list 승인 동일), 위시/장바구니 마크업만
