# game (모든게임) 목록 thumb/list/grid

## 원본

- 파일: `pc/game/game_thumb.html`(라이브 — header GNB "모든게임" → `/game/game_thumb.html`, "예약구매" → `?is_preorder=Y`), `game_list.html`, `game_grid.html`. `old_game_list.html`·`yjs_*`는 미참조 죽은 파일 → 제외.
- 참조 문서: `docs/design-system/client.md`
- 선례: `screens/game-category`(viewType 3뷰 + filter/order/pagination/breadcrumb 재사용). game_thumb은 game_category에서 **category_code·getTagName 제거**한 최단순형(캐러셀 없음).

## 화면·플로우

- 진입 URL/파라미터: `/game/game_{thumb,list,grid}.html` — `?page=`, 필터 파라미터. **category_code·genre_code(단일)·q 없음**(전체 게임 목록).
- page_title = `"게임"`(정적), sub_title = `""`.
- 목록 컨테이너(game_category 동일): thumb `#thumb_list`(drawThumb), list `#card_list>.row.g-3`(drawList=.col), grid `#grid_list`(drawGrid, CSS grid).
- 필터/정렬/페이지네이션: `game_filter`/`game_filter_order`/`links_html` 동일.
- 세션/권한: 공개 SSR. 카드 wishlist/cart는 세션(m_no) 의존(카드 컴포넌트 기존 처리).

## 필터(game_filter) aside 매핑

game_thumb는 `$aside['product_type']="game"`만 설정(promotion/genre/platform/korean/cost 미설정) → **모든 필터 블록 표시**(상품유형/플랫폼/한국어/장르/가격 + 검색필터行). game_category와 동일 → `<GameFilter aside={{ productType: true }} />`.

- game_category와 달리 **장르 블록도 표시**(genre 미설정, genre 페이지만 숨김).

## SSR·SEO (legacy)

- head: `<title>게임</title>`(정적), description·author 빈, `amazonbot noarchive`, viewport `width=device-width, initial-scale=1.0` — 3뷰 동일. (game_thumb은 favicon `<link>` 주석만 있고 실제 링크 없음 — 무의미, 무시.)
- canonical/OG/구조화데이터: 없음(미추가).
- 페이지별 자산: `card-list.css`(screen `<link>`). Splide 없음.
- SSR/CSR: 목록/카드/breadcrumb SSR. 필터/정렬/뷰전환만 client.

## breadcrumb

- legacy header.html: sub_title="" + page_title="게임" → `다이렉트 게임즈 > 게임`. **"게임"은 텍스트(링크 아님)** — game_category의 "게임"(link)과 대비.
- 타겟: `<Breadcrumb items={[{ label: "게임" }]} />` (href 없음).

## 데이터 (legacy)

- `Goods::getGoodsList2($page,$add_where,$orderby,$param,60)`: 전체 게임 목록. `$add_where`는 filter_include가 필터로 조립(category_code·genre_code 단일 없음). 검색(q) 미전달.
- AJAX/POST: 없음.

## API 계약 (백엔드 전달)

- **`GET /api/game/list`** — 요청: `page`, 필터 파라미터(`game_type_*`, `platform`, `interface_korean`/`spoken_korean`/`exclusive_korean`, `genre_code_*`, `is_preorder`/`is_bonus`/`is_promotion`/`is_soldout`, `search_price`/`min_price`/`max_price`) — **파라미터명 verbatim**, `category_code`/`q` 없음.
- 응답 `GameListResponse`: `{ list: ProductThumb[], page, totalPages, total }`.
- 백엔드 책임: filter_include 필터/정렬/페이징(60/page). is_promotion 등 강제 필터 없음(전체 상품).
- 에러: legacy `Error!: {message}` die — 백엔드 5xx.

## 타겟 매핑

- 라우트: `app/game/game_{thumb,list,grid}.html/page.tsx` (viewType).
- screen: `screens/game-list` — viewType + filter/order/pagination/breadcrumb("게임" 텍스트).
- entities: `entities/game-list`(`getGameList` fetcher + `GameListResponse`), `entities/product-thumb`(카드 3종 재사용), `widgets/game-filter`·`game-filter-order`·`breadcrumb` 재사용.
- mock: `shared/mocks/fixtures/game-list.ts` + `GET /api/game/list` handler.

## Parity 체크리스트

- [ ] 목록 3뷰(thumb/list=`.row.g-3`/grid) + filter_order 뷰전환 active
- [ ] 필터: 모든 블록 표시(상품유형/플랫폼/한국어/장르/가격)
- [ ] breadcrumb `다이렉트 게임즈 > 게임`("게임" 텍스트, 링크 아님)
- [ ] pagination baseUrl `/game/game_{viewType}.html`
- [ ] SEO title="게임"(정적)·description/author 빈·amazonbot noarchive 3뷰 동일
- [ ] category_code/q 미사용
