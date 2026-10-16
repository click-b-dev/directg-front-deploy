# 게임 필터/정렬 인프라 (common/game-filter)

> 상품 목록 공통 인프라. legacy `inc/game_filter.html`(필터 UI) + `inc/game_filter_order.html`(정렬/뷰) + `inc/filter_include.php`(필터 SQL 생성) + `inc/footer_common.html` `goodsFilter()`(제출 JS). 이번 단위는 **promotion_ing_thumb에 통합**해 검증.

## 원본
- 파일: `pc/inc/game_filter.html`(131줄, 필터 UI), `pc/inc/game_filter_order.html`(28줄, 정렬/뷰전환), `pc/inc/filter_include.php`(441줄, GET 파라미터→SQL where/orderby), `pc/inc/footer_common.html` `goodsFilter()`(28~208줄, 제출 JS)
- 세션: 무관(공개). 필터는 URL 파라미터 기반.
- 선례: `screens/promotion-ing-thumb`(적용 대상), `entities/promotion-ing`(계약 확장), `ProductThumbCard`
- 참조: `docs/design-system/client.md`

## 동작 (legacy)
- 필터/정렬 = **GET 파라미터**. 필터 UI 폼(`#topbar`) 내 개별 checkbox(name별). 검색 버튼(`#btn_filter`) 클릭 → `goodsFilter()`가 체크된 값만 수집해 GET 폼 조립·제출 → URL 갱신 → SSR 재조회.
- 정렬 select(`#sort`) change → `goodsFilter()` 즉시 제출(현재 필터 유지 + sort 갱신).
- 가격 프리셋 버튼(`button[name=search_price]`) click → `#min_price`/`#max_price` 채움(제출 안 함). 실제 제출은 min_price/max_price만(프리셋 버튼 자체는 button이라 미제출).
- 리셋(`#btn_reset`) → 모든 checkbox/radio 해제 + min/max 비움.
- 접기(`#btn_filter_close`) → Bootstrap collapse `#filter_body` 토글.
- checked/selected 복원: filter_include.php가 URL 파라미터로 `$checked`/`$selected` 생성 → UI에 반영.

### 필터 파라미터 (filter_include.php)
| 그룹 | 파라미터 | SQL(백엔드) |
| --- | --- | --- |
| 상태 | is_preorder=Y, is_bonus=Y | (a.is_bonus='Y' OR a.is_preorder='Y') — **OR 그룹** |
| 프로모션 | is_promotion=Y | c.idx IS NOT NULL (aside promotion!=false 시 UI 노출) |
| 품절제외 | is_soldout=Y | a.soldout!='Y' |
| 게임타입 | game_type_basic/edition/dlc/music/bundle | (game+basic)/(game+edition)/dlc/music/bundle — **OR 그룹** |
| 플랫폼 | platform_1/34/35 | a.product_platform IN — **OR 그룹** |
| 한국어 | interface_korean/spoken_korean/exclusive_korean=Y | — **OR 그룹** |
| 장르 | genre_code_1~10 (G0001~G0010) | MATCH(a.genre) AGAINST(...BOOLEAN) |
| 가격 | min_price, max_price | COALESCE(c.sale_price,a.price) BETWEEN |
| 검색 | q | MATCH(product_name,...) AGAINST(BOOLEAN) |
| 정렬 | sort | release/name/name_en/pricedown/priceup/discount (기본 release, q면 match) |
| (페이지 컨텍스트) | idx(그룹), category_code(태그) | game_filter UI엔 없음 — 다른 화면용 |

- 기본 where: product_type별 game_type 제한(promotion_ing_thumb=game → `find_in_set(a.game_type,'game,dlc,music,bundle')`).
- **promotion_ing_thumb 특수**: `is_promotion="Y"` PHP 하드코딩(URL 무관) + aside `promotion="false"`(프로모션 체크박스 UI 숨김). 즉 항상 프로모션 상품만.

### game_filter UI (aside 조건부 표시)
- promotion_ing_thumb aside: product_type=game, promotion=false, (platform/korean/genre/cost 미설정→표시)
- 표시 필터: **검색필터**(예약구매/특전/[프로모션 숨김]/품절제외) + **상품유형**(기본게임/에디션/DLC/사운드트랙/번들) + **플랫폼**(Steam/Epic/Rockstar) + **한국어지원**(자막/음성/독점) + **장르**(액션~앞서해보기 10종) + **가격**(프리셋5 + min/max 직접입력)
- 상품유형 hr/블록은 product_type!=accessories&&!=holomodels 시 표시.

### game_filter_order UI
- 뷰 전환: list/thumb/grid 아이콘 링크(`{page_name}_{type}.html?{querystring}`, 현재 type active). **list/grid 미이관 → 링크 마크업만(죽은 링크)**.
- 총 N개: `number_format(goods_list->total_results)`.
- 정렬 select: 정렬순서(placeholder)/출시일순(release)/가나다순(name)/ABC순(name_en)/낮은가격순(pricedown)/높은가격순(priceup)/높은할인율순(discount).

## API 계약 (백엔드 전달)
- `GET /api/promotion/ing?page=N&{필터 파라미터}` (optional 세션) → `{ list: ProductThumb[]; page; totalPages; total }`
  - 필터 파라미터: `is_preorder, is_bonus, is_soldout, game_type_basic, game_type_edition, game_type_dlc, game_type_music, game_type_bundle, platform_1, platform_34, platform_35, interface_korean, spoken_korean, exclusive_korean, genre_code_1~10, min_price, max_price, q, sort` (모두 optional, legacy 파라미터명 verbatim)
  - `total`: 총 결과 수(정렬 UI "총 N개"). **신규 추가**.
  - 백엔드: filter_include.php 로직(OR 그룹 결합, 장르 FULLTEXT, 가격 COALESCE, 정렬) + `is_promotion='Y'` 고정. legacy SQL 동작 그대로.
- 응답 타입: `entities/promotion-ing/model/types.ts`(PromotionIngResponse에 total 추가)

## 타겟 매핑
- widget: `widgets/game-filter/ui/game-filter.tsx` (`'use client'`) — 필터 UI(aside props 조건부) + `useSearchParams` 복원 + 검색 버튼 → searchParams 조립 `router.push` + 가격 프리셋(min/max state) + 리셋(base navigate) + 접기(Bootstrap collapse). legacy `goodsFilter()` 동작 재현.
- widget: `widgets/game-filter-order/ui/game-filter-order.tsx` (`'use client'`) — 뷰전환 링크(list/grid 죽은링크) + 총개수 + 정렬 select onChange → searchParams sort 갱신 push.
- entities: `entities/promotion-ing` 확장 — `getPromotionIngList(page, filters)` 필터 파라미터 전달 + `total` 응답.
- screen: `screens/promotion-ing-thumb` 통합 — `<GameFilter aside={...}/>`(main 안, content 밖) + `<GameFilterOrder .../>`(content 안, thumb_list 위).
- 라우트: `promotion_ing_thumb.html/page.tsx` — searchParams에서 필터 파라미터 파싱 → getPromotionIngList 전달.
- 자산: 필터 CSS(`#topbar`, `.chevron`, `svg-on/off`, `btn-check` 등) — legacy game 페이지 CSS 확인·도입. `game_filter.html` 마크업 클래스 verbatim.
- mock: 필터 파라미터 무시(fixture 반환) + total 추가. 필터 로직은 백엔드.

## 범위/후속
- 이번: 필터 UI(promotion aside 기준) + 정렬 + 파라미터 계약 + promotion_ing_thumb 통합.
- 후속: category_code(태그) 필터·다른 화면 aside 변형(platform/genre 단일값 hidden)·list/grid 뷰·cart. game 도메인 화면 이관 시 이 widget 재사용.

## Parity 체크리스트
- [ ] 필터 UI(검색필터/상품유형/플랫폼/한국어/장르/가격, 프로모션 숨김) 마크업·클래스 verbatim
- [ ] 검색 버튼 → URL 파라미터 조립(체크된 것만) → SSR 재조회 (goodsFilter 동작)
- [ ] checked 복원(URL 파라미터) / 가격 프리셋 버튼(min/max 채움) / 리셋 / 접기(collapse)
- [ ] 정렬 select(6종) onChange 즉시 반영 + 총개수 + 뷰전환 링크(thumb active, list/grid 죽은링크)
- [ ] 필터 파라미터 백엔드 계약(verbatim 파라미터명) + total 응답
