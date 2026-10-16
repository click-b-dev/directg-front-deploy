# game_search 통합검색 목록 (thumb/list/grid)

## 원본
- 파일: `pc/game/game_search_{thumb,list,grid}.html`(라이브 — header 검색창 submit + GNB 한국어지원 링크 `?interface_korean=Y` 등).
- 선례: `screens/game-list`(전체 목록 동형). game_thumb + `q`(검색어) 추가.

## 화면·플로우
- 진입 URL: `/game/game_search_{thumb,list,grid}.html?q=검색어` (+ 필터/`interface_korean` 등).
- page_title = `"통합검색 - " . $q`, sub_title="". product_type=game → **필터 전체 블록 표시**.
- 목록 컨테이너(동형): thumb `#thumb_list` / list `#card_list>.row.g-3` / grid `#grid_list`.
- `getGoodsList2($page,$add_where,$orderby,$param,60,$q)` — q를 MATCH AGAINST 스코어 + LIKE 가중치로 검색(getGoodsList2 keyword 분기).

## breadcrumb
- `다이렉트 게임즈 > 통합검색 - {q}` — page_title 텍스트(링크 아님, sub_title 비어있음).

## SSR·SEO
- title=`통합검색 - {q}`, description/author 빈, amazonbot noarchive, viewport 동일. canonical/OG/구조화데이터 없음. card-list.css. Splide 없음.

## API 계약 (백엔드)
- **기존 `GET /api/game/list` 재사용** — `q`는 검색 파라미터(getGoodsList2 keyword). 요청: `page`, `q`, 필터. 응답 `GameListResponse`.
- 백엔드: q MATCH AGAINST(product_name/en/keyword) + LIKE 가중치 스코어 정렬.

## 타겟 매핑
- 라우트: `app/game/game_search_{thumb,list,grid}.html/page.tsx` (viewType, q).
- screen: `screens/game-search` — viewType + q(title/breadcrumb) + filter(전체)/order(basePath `/game/game_search`)/pagination.
- entities: `entities/game-list`(`getGameList` 재사용). mock: 기존 `/api/game/list`.

## Parity 체크리스트
- [ ] 목록 3뷰 + filter_order 뷰전환 + 필터 전체 블록
- [ ] title/breadcrumb `통합검색 - {q}`
- [ ] pagination baseUrl `/game/game_search_{viewType}.html`, q 유지
- [ ] SEO title·amazonbot noarchive 3뷰 동일
