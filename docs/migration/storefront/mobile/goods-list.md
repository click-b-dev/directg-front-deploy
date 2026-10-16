# 모바일 액세서리 목록 goods (thumb + list)

## 원본 (legacy mobile)

- 파일: `mobile/game/goods_thumb.html`(thumb) · `mobile/game/goods_list.html`(list). 둘은 aside/where/page_name/title 동일, **page_type + include(thumb_inc/list_inc)만 다름**.
- 더보기: `goods_thumb_ajax.php` / `goods_list_ajax.php`. 카드: `thumb_inc.php`/`list_inc.php`. 필터: `game_filter.html`. 도출: `new_game_common.php`.
- PC 대응: `app/(pc)/game/goods_thumb.html`·`goods_list.html` → `screens/game-goods`(getGameList + `product_type=accessories` 주입) — **계약 출처**.
- 기반 패턴: `game-list.md`·`game-platform-list.md`(list-view 재사용), thumb 카드 `mobile-game-thumb`.

## game_list 대비 차이

| 항목 | game_list | goods_thumb/list |
|------|-----------|------------------|
| base where | `find_in_set(game_type,'game,dlc,music,bundle')` | `a.game_type='accessories'` → **필터 `product_type=accessories` 주입**(PC 동일) |
| `$page_title` | "모든게임" | **"PS액세서리"**(정적) |
| `$page_name` | game | goods (더보기 ajax=goods_*_ajax.php) |
| aside | 미설정(전체) | **platform=false·genre=false·korean=false·product_type="accessories"** |

## 오프캔버스 필터 aside (legacy game_filter.html 조건 확인)

- 상품유형 블록(L88): `product_type != "accessories" && != "holomodels"`일 때 노출 → goods는 **숨김**.
- 플랫폼(L104)·한국어(L117)·장르(L129): `!= "false"`일 때 노출 → goods는 전부 **숨김**.
- 검색필터(is_preorder/is_bonus/is_promotion/is_soldout)·가격(cost): goods 미설정 → **노출**.
- → 위젯 boolean aside로 전부 커버: **`aside={ productType:false, platform:false, korean:false, genre:false }`** (promotion·cost 기본 노출). 위젯 확장 불필요(문자열 "accessories"/"holomodels" 둘 다 productType 블록 숨김이라 boolean false로 등가).

## 데이터

- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)` — filters에 **`product_type: "accessories"` 주입**(PC `collectFilters` 선례). **증분 없음**(백엔드가 product_type 해석, 데이터 shape=ProductThumb).
- 카드: thumb=`MobileThumbCard`, list=`MobileListCard` **재사용**.
- 더보기: `getGameList(nextPage, filters)` — filters(product_type 포함)를 client가 유지·전달. game_list divergence 노트 동일.

### product_type 주입 위치 주의
`product_type=accessories`는 **URL이 아니라 page-level 주입**이다(PC 동일). 필터 폼 제출·뷰전환 링크는 URL 기반이라 product_type을 안 실어도, 대상 page가 다시 주입하므로 parity 유지. 더보기는 client가 SSR filters(product_type 포함)를 그대로 loadMore에 전달.

## API 계약 (증분만)

증분 없음. `GET /api/game/list?product_type=accessories&page=N&{필터}` (PC goods 단위에서 계약 확정).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/goods_thumb.html`, `/game/goods_list.html`
- 라우트: `app/m/game/goods_thumb.html/page.tsx`(thumb) · `app/m/game/goods_list.html/page.tsx`(list) — viewport theme#000, title "PS액세서리" 정적, collectFilters에 product_type=accessories 주입, getGameList
- screen:
  - `screens/mobile-goods-thumb` `MobileGoodsThumbScreen`: `MobileSubHeader("PS액세서리")` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={productType:false,platform:false,korean:false,genre:false}, total, viewBasePath="/game/goods", pageType="thumb")` + thumb items(#goods_thumb, MobileThumbCard, 더보기)
  - `screens/mobile-goods-list` `MobileGoodsListScreen`: 동일 셸 + `pageType="list"` + list items(#goods_list, MobileListCard, 더보기)
  - 각 `api/load-more-goods-*.ts`: `getGameList(nextPage, filters)`
- 재사용: `game-list`, `product-thumb`(MobileThumbCard/MobileListCard), `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`
- 신규 UI: 없음. mock: 없음(기존 getGameList mock에 product_type=accessories 응답 필요 — mock 핸들러 확인).

## Parity 체크리스트 (모바일 UA)

- [ ] 화면 요소 (헤더 "PS액세서리" / 필터 검색필터+가격만 / thumb·list 카드 / 더보기)
- [ ] 필드/검증 (MobileThumbCard·MobileListCard)
- [ ] 분기/플로우 (product_type=accessories 주입, 뷰전환 list↔thumb=`/game/goods_*`, 더보기)
- [ ] head/viewport (theme #000, title "PS액세서리")
- [ ] 필터 블록 노출(검색필터/가격만, 상품유형·플랫폼·한국어·장르 숨김)
- [ ] 증분 동작 (더보기 append + 마지막 alert) — 구형 카드 divergence는 game_list 승인 동일
- [ ] middleware rewrite/폴백
