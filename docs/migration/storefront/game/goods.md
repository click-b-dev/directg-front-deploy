# goods PS액세서리 목록 (thumb/list/grid)

## 원본
- 파일: `pc/game/goods_{thumb,list,grid}.html`(라이브 — GNB "goods_thumb.html"). product_type=accessories.
- 선례: `screens/game-list`(동형). accessories 전용 필터 축소.

## 화면·플로우
- 진입 URL: `/game/goods_{thumb,list,grid}.html` (+ page/필터/q).
- page_title="PS액세서리"(정적), sub_title="". aside: `product_type=accessories`, `platform=false`, `genre=false`, `korean=false`.
- 필터 블록: 검색필터 top행(예약구매/특전/프로모션/품절제외) + **가격만** 표시. 상품유형(accessories→숨김)·플랫폼·장르·한국어 **숨김**.
- product_type=accessories → filter_include `find_in_set(a.game_type,'accessories')`(백엔드). getGoodsList2 with q.
- 목록 컨테이너 동형(thumb/list `.row.g-3`/grid).

## breadcrumb
- `다이렉트 게임즈 > PS액세서리` — page_title 텍스트(header 조건 product_type=accessories 포함 → breadcrumb 렌더).

## SSR·SEO
- title="PS액세서리"(정적), description/author 빈, amazonbot noarchive, viewport 동일. canonical/OG/구조화 없음. card-list.css.

## API 계약 (백엔드)
- **기존 `GET /api/game/list` 재사용** — `product_type=accessories` 필터 파라미터(백엔드 `find_in_set(game_type,'accessories')`). 요청: page, product_type, q, 필터. 응답 `GameListResponse`.

## 타겟 매핑
- 라우트: `app/game/goods_{thumb,list,grid}.html/page.tsx`(viewType, product_type=accessories 주입).
- screen: `screens/game-goods` — viewType + filter(`{productType:false, platform:false, genre:false, korean:false}`)/order(basePath `/game/goods`)/pagination + breadcrumb("PS액세서리").
- entities: `entities/game-list`(`getGameList` 재사용). mock: 기존 `/api/game/list`.

## Parity 체크리스트
- [ ] 필터: 상품유형/플랫폼/장르/한국어 숨김, 가격+top행 표시
- [ ] title/breadcrumb "PS액세서리"
- [ ] 목록 3뷰 + pagination baseUrl `/game/goods_{viewType}.html`
- [ ] product_type=accessories 백엔드 필터
