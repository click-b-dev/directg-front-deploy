# game_category list/grid 뷰

## 원본

- 파일: `pc/game/game_category_list.html`(`#card_list` + `.row.g-3` + `Draw::drawList` → `game/list_inc.php`), `pc/game/game_category_grid.html`(`#grid_list` + `Draw::drawGrid` → `game/grid_inc.php`)
- 라이브 판별: header GNB "카테고리별"은 thumb 진입, 뷰전환 아이콘(`game_filter_order.html`)으로 list/grid 전환. `old_*`·`yjs_*` 제외.
- 선례: **thumb 뷰 이미 이관**(`screens/game-category`, `entities/game-category`, `widgets/game-filter`·`game-filter-order`), **promotion_ing list/grid 이관 선례**(`screens/promotion-ing` viewType 공통 + `ProductListCard`/`ProductGridCard`).
- 참조 문서: `docs/design-system/client.md`

## 화면·플로우

- 진입 URL/파라미터: `/game/game_category_list.html`, `/game/game_category_grid.html` — `?category_code=`(빈값→`C0001001`), `?page=`, 필터 파라미터(필터/정렬은 game-filter/game-filter-order가 처리).
- **thumb/list/grid 차이는 카드 컨테이너 + 카드 렌더러뿐.** 나머지(header/breadcrumb/filter/filter_order/pagination/category_code 기본값/`getGoodsList2` 조회/`result_per_page=60`)는 3뷰 완전 동일.

| 뷰 | 컨테이너 | 카드 renderer(legacy) | 타겟 카드 | 래퍼 |
| --- | --- | --- | --- | --- |
| thumb | `#thumb_list` | `drawThumb`/`thumb_inc.php` | `ProductThumbCard` | 없음 |
| list | `#card_list` | `drawList`/`list_inc.php`(`.col`) | `ProductListCard`(`.col`) | **`.row.g-3` 필수** |
| grid | `#grid_list` | `drawGrid`/`grid_inc.php` | `ProductGridCard` | 없음(CSS `#grid_list{display:grid}`) |

- **`.row.g-3` 래퍼 (list 전용, parity 핵심)**: `card-list.css`에 `#card_list` bare 규칙 없음 → list 레이아웃은 Bootstrap `.row.g-3`(부모 flex+gutter)에 의존. `#grid_list`는 `display:grid; grid-template-columns:repeat(6,1fr); gap:1rem`로 자체 그리드 → 래퍼 불필요. legacy `game_category_list.html` L73–83이 `#card_list > .row.g-3 > (.col)` 구조. → **list 뷰는 `.row.g-3` 포함해 재현.**
- breadcrumb: legacy `$sub_title`가 `page_type` 사용 → `<a href='/game/game_{viewType}.html'>게임</a> > 카테고리별 (` → **"게임" 링크가 viewType 의존**(thumb→game_thumb, list→game_list, grid→game_grid). page_title=`tagName`, sub_title2=`)`.
- 뷰전환: `game-filter-order`가 `${basePath}_${type}.html` 링크 + 현재뷰 `svg-on` active 이미 생성(basePath=`/game/game_category`). 3뷰 라우트 존재 시 자동 활성.
- 세션/권한: 공개 SSR. 카드 내 wishlist/cart 하트·버튼은 `_SESSION['member']['m_no']` 의존(카드 컴포넌트 기존 처리 재사용).

## SSR·SEO (legacy)

- head: `<title>{tagName}</title>`, description·author 빈, `amazonbot noarchive`, viewport `width=device-width, initial-scale=1.0` — **3뷰 동일**(thumb page.tsx generateMetadata 재사용 패턴).
- canonical/OG: legacy 없음(미추가).
- 구조화 데이터: 없음.
- 페이지별 CSS: `card-list.css`(screen `<link>`, 기존). 추가 CSS 없음.
- SSR/CSR: 목록/카드/breadcrumb SSR. 필터/정렬/뷰전환·카드 인터랙션만 client(기존 위젯/카드 재사용).

## 데이터 (legacy)

- 도메인: `Goods::getGoodsList2($page,$add_where,$orderby,$param,60,$q)` + `Goods::getTagName($category_code)` — **thumb와 동일**. list/grid 전용 조회 없음.
- AJAX/POST: 없음.

## API 계약 (백엔드 전달)

- **신규 없음** — thumb 단위에서 도출한 `GET /api/game/category`(`getGameCategoryList` → `GameCategoryResponse`) 그대로 재사용. 뷰는 프론트 렌더링 차이일 뿐.

## 타겟 매핑

- 라우트: `app/game/game_category_list.html/page.tsx`, `app/game/game_category_grid.html/page.tsx` (thumb page.tsx와 동일 로직 + `viewType`).
- screen: `screens/game-category` — `GameCategoryScreen`에 `viewType` prop 추가(thumb 기본 동작 유지), 컨테이너/카드 분기 + breadcrumb "게임" 링크 viewType화.
- entities: `entities/game-category`(기존 `getGameCategoryList`), `entities/product-thumb`(`ProductListCard`/`ProductGridCard` 재사용).
- mock: 기존 game-category fixture 재사용(추가 없음).

## Parity 체크리스트

- [ ] list: `#card_list > .row.g-3 > ProductListCard(.col)` 구조 일치
- [ ] grid: `#grid_list > ProductGridCard` (CSS grid) 일치
- [ ] thumb 회귀 없음(`#thumb_list > ProductThumbCard`)
- [ ] breadcrumb "게임" 링크 viewType별(`/game/game_{thumb,list,grid}.html`), `카테고리별 ({tagName})`
- [ ] filter_order 뷰전환 active(현재 뷰 `svg-on`) + 링크 3뷰
- [ ] pagination baseUrl `/game/game_category_{viewType}.html`
- [ ] SEO title={tagName}·description/author 빈·amazonbot noarchive 3뷰 동일
