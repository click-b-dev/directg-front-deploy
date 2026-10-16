# 모바일 오프캔버스 필터 (inc/game_filter.html) — 공용 위젯

> 여러 모바일 게임 목록 페이지(promotion_ing thumb/list, 향후 game_list/genre/platform/search/goods 등)가 공유하는 필터. thumb/list 이관 시 "offcanvas 필터 후속"으로 연기해 둔 공통 단위. PC `widgets/game-filter`와 **계약(GET 파라미터/`aside` config)은 동일, 마크업은 offcanvas로 완전히 다름**.

## 원본 (legacy mobile)
- 파일: `mobile/inc/game_filter.html`(278줄) + JS는 `mobile/inc/footer_common.html`(reset/chip/fade/offcanvas backdrop)
- PC 대응: `widgets/game-filter`(`GameFilterAside` config·GET 파라미터 계약·genre/price 목록 재사용 참조)
- 데이터 계약: `entities/promotion-ing` `ProductFilterParams`(legacy 필터 키 verbatim 문서화) 재사용

## 구조 (legacy)
- 전체가 `<form method="get">`(action=self) 하나로 감싸짐.
- **search_top 바**: `#search_label`(적용된 필터 칩 — genre 라벨 + cancel × `data-label-key`, 가로 스크롤 fade) + "옵션 검색" 버튼(→ `#search_option` offcanvas).
- **`#search_option` offcanvas**(bottom, backdrop): hidden idx/q + 5블록:
  - 검색필터: is_preorder(예약구매)/is_bonus(특전)/is_promotion(프로모션, `aside.promotion=="false"`면 d-none)/is_soldout(품절상품 제외)
  - 상품유형(product_type accessories/holomodels면 d-none): game_type_basic/edition/dlc/music(사운드트랙)/bundle
  - 플랫폼(`aside.platform=="false"`면 d-none): hidden platform + platform_1/34/35(Steam/Epic/Rockstar)
  - 한국어지원(`aside.korean=="false"`면 d-none): interface/spoken/exclusive_korean
  - 장르(`aside.genre=="false"`면 d-none): hidden genre_code + genre_code_1~10(액션~앞서해보기, 순서 1~7·10·8·9)
  - 가격(`aside.cost=="false"`면 d-none): min_price/max_price(원 addon)
  - tail: 초기화(option_reset) + 검색(submit)
- **count/정렬/뷰전환 바**: 총 N개 + 정렬(→ `#sort_option`) + list/thumb 뷰전환 링크(`{page_name}_{list,thumb}.html?{QUERY}`, 현재 뷰 bg-clight/svg-on)
- **`#sort_option` offcanvas**(bottom): sort radio(release 출시일순/name 가나다순/name_en ABC순/pricedown/priceup/discount) + 초기화(sort_reset) + 검색(submit)

## JS (footer_common.html) — 필터 관련
- **submit**: native GET(체크된 값만) — React는 `onSubmit` preventDefault → `router.push(pathname?params)`(PC 동일 로직, page 미포함=1페이지).
- **option_reset**: `#search_option` 체크박스/라디오 uncheck + number 비우기 + `.search-label` 칩 제거 + fade 갱신(제출 안 함).
- **sort_reset**: `#sort_option` 체크박스/라디오 uncheck(제출 안 함).
- **search-label × 클릭**: `#{label-key}` uncheck + 칩 제거 + fade(제출 안 함 — 이후 검색 버튼으로 반영).
- **fade(updateFade)**: `#search_label` 가로 스크롤 위치별 mask-image 페이드.
- **offcanvas backdrop**: Bootstrap 기본 backdrop(data-bs-backdrop) 사용 — legacy 수동 backdrop append/remove는 중복이라 미이식(Bootstrap JS가 처리, `/m/layout` 로드됨).
- 더보기(btn_paging)·위시/장바구니·스크롤복원(product-link/sessionStorage)은 **필터 위젯 범위 밖**(더보기는 thumb/list 서버액션 기존 처리, 위시/장바구니는 order 이월, 스크롤복원은 후속).

## 모바일 head / 앱셸
- 위젯은 appCapsuleSub 최상단(목록 앞)에 렌더. offcanvas는 Bootstrap(`/m/layout` bootstrap.min.js). 아이콘 자산(cancel/gear/sort_icon/list/thumb/rotate) 전부 `public/mobile-assets` 기존 복사분.

## 데이터
- **재사용**: `entities/promotion-ing` `ProductFilterParams`(필터 키 계약). 위젯은 데이터 fetch 안 함 — searchParams 기반 UI + GET 제출. 총 N개는 상위(page)가 전달(`total`).

## API 계약 (증분)
- 없음. 필터 파라미터는 각 목록 fetcher(getPromotionIngList 등)가 이미 소비.

## 타겟 매핑
- 신규 위젯: `widgets/mobile-game-filter/ui/mobile-game-filter.tsx`(client) — props `{ aside: MobileGameFilterAside; total: number; pageName: string; pageType: "thumb"|"list" }`.
- `MobileGameFilterAside`: `{ productType?; promotion?; platform?; korean?; genre?; cost? }`(PC 개념 동일, false면 블록 숨김).
- 배선: `screens/mobile-promotion-ing-thumb`(pageType="thumb")·`screens/mobile-promotion-ing-list`(pageType="list") 의 `{/* game_filter offcanvas — 후속 단위 */}` 자리에 삽입 + `total` 전달(PromotionIngResponse.total). aside={ promotion:false }(promotion_ing는 프로모션 체크박스 숨김).
- 재사용: `entities/promotion-ing`(ProductFilterParams).

## Parity 체크리스트 (모바일 UA)
- [ ] search_top(칩 + 옵션검색 버튼) + 옵션검색 offcanvas 5블록(aside 노출 규칙) 마크업
- [ ] 체크박스/라디오/가격 초기값이 URL 파라미터 반영
- [ ] 검색 submit → GET 파라미터로 목록 재조회(1페이지)
- [ ] option_reset/sort_reset(UI 초기화)·칩 × 제거·fade
- [ ] 총 N개 + 정렬 offcanvas(sort radio) + list/thumb 뷰전환 링크(현재 뷰 강조)
- [ ] promotion_ing에서 프로모션 체크박스 숨김(aside.promotion=false)
- [ ] thumb·list 양쪽 화면에서 동일 동작
