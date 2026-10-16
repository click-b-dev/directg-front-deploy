# 메인 2-3: 예약구매 / 한국어지원 / 이벤트배너

메인 `pc/index.php` 섹션 그룹 2-3. 신규 small 카드(`small_list_inc.php`) 도입.

## 원본
- 파일: `pc/index.php`
  - 이벤트배너: `#event_banner2` (479–505) — 날짜조건 `2025-08-27 16:00 ~ 2025-09-01 00:00`(만료 → 현재 미노출)
  - 예약구매: `#goods_preorder` (507–521) — `#preorder_area` custom-scroll(가로) drawThumb
  - 한국어지원: `#goods_korean` (580–611) — 음성/독점 2블록, `drawSmallList`
- 카드: 예약=`game/thumb_inc.php`(기존 ProductThumbCard), 한국어=`game/small_list_inc.php`(신규)
- 데이터: `getGoodsPreorder(30)`(456) · `getGoodsSpokenKorean(5)`(339) · `getGoodsExclusiveKorean(5)`(383) + `Draw::getProductInfo` 조립
- DOM 순서: event → preorder → [publisher 2-4] → korean → [platform 2-4]

## 화면·플로우
### 이벤트배너 (`#event_banner2`)
- 날짜조건일 때만(현재 만료). `#event_banner_carousel` carousel-inner > carousel-item active
- h2 "다이렉트 게임즈 X 네이버페이 즉시할인 이벤트" + 이미지(`image.directg.net/X82k22XCkH`) → `/board/notice_view.html?idx=30`
- 화살표 버튼은 legacy 주석 처리(미노출)

### 예약구매 (`#goods_preorder`)
- h2 "예약구매" + 전체보기(`/game/game_thumb.html?is_preorder=Y` target=_blank)
- `#preorder_area` = `d-flex flex-row justify-content-start flex-nowrap card-shadow border-0 custom-scroll thumb_list` (가로 스크롤) → ProductThumbCard(drawThumb)

### 한국어지원 (`#goods_korean`)
- `d-grid` 2블록:
  - 음성: h2 "음성 한국어지원" + 전체보기(`?spoken_korean=Y`), `#spoken_korean.card_list_small` > row > drawSmallList
  - 독점: h2 "독점 한국어지원" + 전체보기(`?exclusive_korean=Y`), `#exclusive_korean.card_list_small` > row > drawSmallList

### small 카드 (`small_list_inc.php`) — 신규, 가로형
- card flex-row(bg-light): thumb-area(이미지+label) / content-area(플랫폼·상품명·배지·가격) / button-area(위시·장바구니, 세로)
- thumb_inc과 차이: label에 holomodels 없음, 배지 배경 `bg-none-40`(vs bg-light-50), "한국어 지원안함"·추가적립·프로모션 종료일 없음, 가격 순서=판매가→원가
- 필드는 ProductThumb 동일(getProductInfo 조립)

### 세션/권한 의존
- `wishlist_chk`(비로그인 N 고정, 보류), 위시/장바구니 AJAX 보류 — 2-1/2-2 정책 동일

## SSR·SEO
- 세 섹션 SSR(캐러셀 아님, event는 정적 carousel 마크업이나 화살표 미노출·단일 item). 페이지 전용 자산 추가 없음(card-list.css는 2-2 도입, `.card_list_small` 포함)

## 데이터 (legacy)
- `getGoodsPreorder($n)`: `tbl_goods_item`(is_view='Y', is_preorder='Y', status='0', game_type∈{game,dlc}, display_type∈{basic,dlc}, release_date asc, limit) + getProductInfo
- `getGoodsSpokenKorean($n)`: `tbl_goods`⋈`tbl_title_option`⋈`tbl_goods_item`(is_view='Y', release_date<now, status='0', spoken_korean='Y', group by title_id, release_date desc, limit) + getProductInfo
- `getGoodsExclusiveKorean($n)`: 동일 구조, `exclusive_korean='Y'`

## API 계약 (백엔드 전달)
### `GET /api/main/preorder-games?limit=30` → `{ games: ProductThumb[] }`
### `GET /api/main/spoken-korean?limit=5` → `{ games: ProductThumb[] }`
### `GET /api/main/exclusive-korean?limit=5` → `{ games: ProductThumb[] }`
- 공통: `ProductThumb`(2-2 계약), 백엔드가 getProductInfo 조립(위시/프로모션/view_url) 반영

## 타겟 매핑
- entities: `entities/preorder-game`, `entities/korean-game`(spoken/exclusive 2 fetcher) — 응답 `ProductThumb[]`
- entities/product-thumb: `ProductSmallListCard` 추가(small_list_inc)
- widgets: `widgets/event-banner-section`, `widgets/preorder-section`, `widgets/korean-support-section`
- screen: home-screen에 event→preorder→korean 순서 배치(publisher/platform 자리는 2-4)
- mock: fixtures 3 + handlers 3

## Parity 체크리스트
- [ ] 이벤트배너 날짜조건(만료→미노출), carousel 마크업
- [ ] 예약구매: 전체보기, 가로 스크롤(custom-scroll), ProductThumbCard
- [ ] 한국어지원: 음성/독점 2블록, 전체보기 링크, small 카드
- [ ] small 카드: label/플랫폼/배지(bg-none-40)/가격 순서/위시·장바구니
- [ ] DOM 순서(event→preorder→korean, publisher/platform 자리 유지)
- [ ] 엣지: 각 섹션 0건, 이미지 onerror

## 보류/후속
- 위시/장바구니 AJAX, wishlist_chk 세션 → 인증/order
- publisher/platform(2-4), 메인 metadata(2-M)
- 데이터 = fixture(MSW)
