# holomodels 홀로 모델 목록 (thumb/list/grid)

## 원본
- 파일: `pc/game/holomodels_{thumb,list,grid}.html`(라이브 — GNB "holomodels_thumb.html"). product_type=holomodels.
- 선례: `screens/game-goods`(product_type 필터 축소 동형).

## 화면·플로우
- 진입 URL: `/game/holomodels_{thumb,list,grid}.html` (+ page/필터).
- page_title="홀로 모델"(정적), sub_title="". aside: product_type=holomodels, platform/genre/korean=false.
- 필터: 검색필터 top행 + 가격만. 상품유형(holomodels→숨김)·플랫폼·장르·한국어 숨김.
- product_type=holomodels → `find_in_set(a.game_type,'holomodels')`(백엔드). getGoodsList2 **q 없음**.
- 목록 컨테이너 동형(thumb/list `.row.g-3`/grid).

## breadcrumb
- **없음**. legacy header.html breadcrumb 조건은 product_type `game|group|accessories`만 → holomodels 미렌더. → `<Breadcrumb>` 미배치.

## SSR·SEO
- title="홀로 모델"(정적), description/author 빈, amazonbot noarchive, viewport 동일. canonical/OG/구조화 없음. card-list.css.

## API 계약 (백엔드)
- **기존 `GET /api/game/list` 재사용** — `product_type=holomodels` 필터(백엔드 `find_in_set(game_type,'holomodels')`). 요청: page, product_type, 필터. 응답 `GameListResponse`.

## 타겟 매핑
- 라우트: `app/game/holomodels_{thumb,list,grid}.html/page.tsx`(viewType, product_type=holomodels 주입).
- screen: `screens/game-holomodels` — viewType + filter(축소)/order(basePath `/game/holomodels`)/pagination. **breadcrumb 없음**.
- entities: `entities/game-list`(`getGameList` 재사용). mock: 기존 `/api/game/list`.

## Parity 체크리스트
- [ ] breadcrumb 미표시(holomodels)
- [ ] 필터: 상품유형/플랫폼/장르/한국어 숨김, 가격 표시
- [ ] title="홀로 모델", 목록 3뷰, pagination baseUrl `/game/holomodels_{viewType}.html`
- [ ] product_type=holomodels 백엔드 필터
