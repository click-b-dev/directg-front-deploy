# game_genre 장르별 목록 (thumb/list/grid)

## 원본

- 파일: `pc/game/game_genre_thumb.html`(라이브 — header GNB "장르별" → `?genre_code=G0001` 등), `game_genre_list.html`, `game_genre_grid.html`. `game_genre.html`(19KB)·`old_game_genre.html`은 미참조(GNB는 `_thumb`만 링크) → 이관 제외.
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/src/classes/Goods.php`
- 선례: `screens/game-category`(viewType 3뷰 + breadcrumb + game-filter/order 재사용), `widgets/main-banner-carousel`+`shared/lib/use-splide`(Splide 재현 승인 방법), `screens/home`(Splide CSS/JS page-scoped 로드).

## 화면·플로우

- 진입 URL/파라미터: `/game/game_genre_{thumb,list,grid}.html` — `?genre_code=`(빈값→`G0001` 액션), `?page=`, 필터 파라미터. **검색(`q`) 없음**(getGoodsList2 6번째 인자 미전달).
- game_category와 동일 골격(filter/order/pagination/breadcrumb/viewType별 컨테이너·카드) + **상단 장르 베스트 캐러셀** 추가.
- **장르 베스트 캐러셀** (`#game_page > section#splide`, Splide): `getGenreBestTitle(genre_code)` 최대 5건. 슬라이드 = `.card.mb-3 > .row.g-0`:
  - 좌 `.col-md-4`: `<img src="{domain}/upload/title/{title_id}/header/{title_id}.jpg" class="img-fluid rounded-start" alt="...">` (alt `"..."` verbatim)
  - 우 `.col-md-8`: `<h4 class="card-title mx-4 py-3 ps-1 border-bottom">{title_name}</h4>` + `ul.list-group.list-group-flush`:
    - 장르: 각 genre 코드 → `<a href='/game/game_genre_thumb.html?genre_code={code}' title='{name}'><span class='badge font-12 mb-1 me-2 fw-normal'>{name}</span></a>`
    - 카테고리: 각 category 코드 → `<a href='/game/game_category_thumb.html?category_code={code}' title='{name}'><span class='badge ...'>{name}</span></a>`
    - 출시일: `date("Y년 m월 d일", release_date)` (2자리 zero-pad)
  - Splide 옵션(legacy verbatim): `{ type:'loop', focus:'center', arrows:true, arrowPath:'M33.1875…(SVG)', pagination:false, autoplay:true, interval:4000 }`
- 뷰별 목록 컨테이너(game_category와 동일): thumb `#thumb_list`(drawThumb), list `#card_list>.row.g-3`(drawList=.col), grid `#grid_list`(drawGrid, CSS grid).
- 세션/권한: 공개 SSR. 카드 wishlist/cart는 세션(m_no) 의존(카드 컴포넌트 기존 처리).

## 필터(game_filter) aside 매핑 — legacy d-none 조건 대조

legacy `inc/game_filter.html`의 블록별 표시 조건과 game_genre 설정:

| 블록 | legacy 조건 | game_genre(`product_type=game`, `genre="false"`) | GameFilter prop |
| --- | --- | --- | --- |
| 상품유형 | `product_type != accessories && != holomodels` | 표시 | `productType: true` |
| 플랫폼 | `platform != "false"` | 표시(미설정) | 기본 표시 |
| 한국어지원 | `korean != "false"` | 표시(미설정) | 기본 표시 |
| **장르** | `genre != "false"` | **숨김**(`genre="false"`) | **`genre: false`** |
| 가격 | (표시) | 표시 | 기본 표시 |

→ `<GameFilter aside={{ productType: true, genre: false }} />`. (game_category는 genre 미설정 → 장르 블록 표시. genre 페이지는 장르 필터 숨김이 parity.)

## SSR·SEO (legacy)

- head: `<title>{getPrimaryGenreName(genre_code)}</title>`, description·author 빈, `amazonbot noarchive`, viewport `width=device-width, initial-scale=1.0` — 3뷰 동일. **Splide CSS `<link>` head 추가**.
- canonical/OG/구조화데이터: 없음(미추가).
- 페이지별 자산: Splide CSS(head)+JS(footer, page-scoped, home 선례 동일), `card-list.css`(screen `<link>`).
- SSR/CSR: 목록/카드/캐러셀 마크업/breadcrumb SSR. 캐러셀 Splide 마운트·필터/정렬/뷰전환만 client.

## 데이터 (legacy)

- `Goods::getPrimaryGenreName($genre_code)`: `select tag_name from tbl_tags where tag_code=:tag_code` → page_title.
- `Goods::getGenreBestTitle($genre_code)`: `tbl_sales_ranking a ⨝ tbl_goods b on a.title_id=b.title_id where a.sales_year=:y and a.sales_month=:m and match(b.genre) AGAINST('+{genre}') order by a.total_price desc limit 5`. (당월 = `getBestTitleConfig`). 반환: `title_id,title_name,genre,category,tags,release_date,domain` (genre/category는 콤마 조인 코드 → 렌더 시 `getTagName`).
- `Goods::getGoodsList2($page,$add_where,$orderby,$param,60)`: 목록. `$add_where`는 filter_include가 `genre_code`(+필터)로 조립(genre FULLTEXT).
- AJAX/POST: 없음.

## API 계약 (백엔드 전달)

- **`GET /api/game/genre`** — 요청: `genre_code`(빈값→`G0001`), `page`, 필터 파라미터(`game_type_*`, `platform`, `interface_korean`/`spoken_korean`/`exclusive_korean`, `is_preorder`/`is_bonus`/`is_promotion`/`is_soldout`, `search_price`/`min_price`/`max_price`, `genre_code_*`) — **파라미터명 verbatim**, `q` 없음.
- 응답 `GameGenreResponse`:
  ```
  {
    list: ProductThumb[],            // getGoodsList2 (60/page)
    page, totalPages, total,
    genreName: string,               // getPrimaryGenreName (page_title)
    bestTitles: GenreBestTitle[]     // getGenreBestTitle (≤5). 코드→이름 백엔드 resolve
  }
  GenreBestTitle = { domain, titleId, titleName, releaseDate,
                     genres: {code,name}[], categories: {code,name}[] }
  ```
- 백엔드 책임: filter_include genre FULLTEXT + 필터/정렬/페이징, 판매랭킹 당월 조인, `genre`/`category` 콤마 코드 → `tbl_tags.tag_name` resolve(배열화), release_date 원본 반환(포맷은 프론트).
- 에러: legacy `Error!: {message}` die — 백엔드 5xx.

## 타겟 매핑

- 라우트: `app/game/game_genre_{thumb,list,grid}.html/page.tsx` (game_category route와 동형 + viewType, genre_code 기본 G0001).
- screen: `screens/game-genre` — viewType + 캐러셀 + filter(genre 숨김)/order/pagination/breadcrumb + Splide 자산.
- widget: `widgets/genre-best-carousel`(client, `useSplide` 재사용, 슬라이드 마크업).
- entities: `entities/game-genre`(`getGameGenreList` fetcher + `GameGenreResponse`/`GenreBestTitle` 타입), `entities/product-thumb`(카드 3종 재사용), `widgets/game-filter`·`game-filter-order`·`widgets/breadcrumb` 재사용.
- mock: `shared/mocks/fixtures/game-genre.ts` + `GET /api/game/genre` handler.

## Parity 체크리스트

- [ ] 캐러셀: 슬라이드 마크업(card/img/title/장르·카테고리 badge 링크/출시일 포맷) + Splide 옵션(loop/center/arrows/arrowPath/autoplay 4s/pagination:false)
- [ ] 장르 badge → game_genre_thumb, 카테고리 badge → game_category_thumb 링크
- [ ] 목록 3뷰(thumb/list=`.row.g-3`/grid) + filter_order 뷰전환 active
- [ ] 필터: 장르 블록 **숨김**, 상품유형/플랫폼/한국어/가격 표시
- [ ] breadcrumb `게임({viewType} 링크) > 장르별 ({genreName})`
- [ ] pagination baseUrl `/game/game_genre_{viewType}.html`, genre_code param 유지
- [ ] SEO title={genreName}·description/author 빈·amazonbot noarchive 3뷰 동일
- [ ] genre_code 기본 G0001
