# publisher 퍼블리셔별 목록 12종 (thumb/list/grid)

## 원본
- 파일: `pc/game/publisher_{name}_{thumb,list,grid}.html` — 12 퍼블리셔 × 3뷰 = 36개(라이브 — header GNB "퍼블리셔별" 드롭다운).
- 12종·publisher_code: 2k=12, 505_games=46, asw=47, capcom=34, clouded_leopard=132, focus=22, hooded_horse=277, neowiz=117, paradox=30, playstation=162, sega=93, thq=23.
- 선례: `screens/game-category`(동형), `screens/game-platform`(코드 파라미터 + 이름 매핑).

## 화면·플로우
- 진입 URL: `/game/publisher_{name}_{thumb,list,grid}.html` (publisher_code는 **파일 하드코딩**, URL 파라미터 아님).
- product_type=game → 필터 전체 블록 표시. sub_title="퍼블리셔별 (", page_title=getPublisher(publisher_code), sub_title2=")".
- publisher_code → filter_include `and a.supplier_code='{publisher_code}'`(백엔드). getGoodsList2 with q.
- 목록 컨테이너 동형(thumb/list `.row.g-3`/grid).

## breadcrumb
- `다이렉트 게임즈 > 퍼블리셔별 ({publisherName})` — sub_title+page_title+sub_title2 텍스트(게임 링크 없음).

## SSR·SEO
- title=getPublisher(publisher_code) 동적, description/author 빈, amazonbot noarchive, viewport 동일. canonical/OG/구조화 없음. card-list.css.

## API 계약 (백엔드)
- **`GET /api/game/publisher`** — 요청: `publisher_code`, `page`, 필터/`q`. 응답 `GamePublisherResponse { list, page, totalPages, total, publisherName }`.
- 백엔드: `supplier_code=publisher_code` 필터 + getPublisher(publisher_code) 이름 resolve.

## 타겟 매핑
- 라우트: `app/game/publisher_{name}_{thumb,list,grid}.html/page.tsx` 36개 — `makePublisherPage({publisherCode, basePath, viewType})` 팩토리로 생성(중복 제거, idiomatic).
- screen: `screens/game-publisher` — viewType + publisherName(title/breadcrumb) + filter(전체)/order(basePath per publisher)/pagination.
- entities: `entities/game-publisher`(`getGamePublisherList` + `GamePublisherResponse`). mock: `/api/game/publisher` + publisher 이름 맵.

## Parity 체크리스트
- [ ] 12 퍼블리셔 × 3뷰 라우트, publisher_code 매핑 정확
- [ ] breadcrumb `퍼블리셔별 ({publisherName})`, title=publisherName
- [ ] 필터 전체 블록, 목록 3뷰, pagination baseUrl `/game/publisher_{name}_{viewType}.html`
- [ ] supplier_code 백엔드 필터
