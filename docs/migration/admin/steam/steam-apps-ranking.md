# Steam API - 스팀 Apps 추천수 순위 (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_apps_ranking.php` (라이브) — page_title "스팀 Apps 평가수 순위"
- 엔티티: 기존 `steam` 확장. **읽기 뷰만**. **카드 그리드 레이아웃**(테이블 아님).

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_apps_ranking`
  - `page`, `search_year`, `search_publisher`, `is_free`(체크=1, "무료제외")

- 검색필터 카드: 스팀 출시연도 select(2005~현재) / 퍼블리셔 select(**동적**: publisher_name) / 무료여부 checkbox("무료제외", is_free=1) / submit
- 카운트: `총 {total}건`
- **카드 그리드**(`.grid > .item > .card`, legacy masonry JS 미로드 → 블록 배치): 카드마다:
  - card-title: `{name}` + 순위 뱃지(bg-danger, `ranking + 50*(page-1)`)
  - card-subtitle: `APPID: {appid}`
  - 헤더 이미지: `/upload/apps/header/{appid}/header.jpg` + 한국어 뱃지 오버레이(bg-success `인터페이스/자막 한글`, bg-primary `음성 한글`)
  - 정보 테이블: 개발사(→`steam_apps_list_all?search_developer=&search_app_type=game` 링크) / 퍼블리셔(→`steam_apps_ranking?search_publisher=` 링크) / 출시일 / 장르(getSteamAppsGenre 뱃지 bg-dark) / 평가수(`{recommendations}`<br>`(일평균: {diff_per_day} 3자리)`) / 가격정보(`{consumer_price/100} ({price/100})`) / Metacritic(`{metacritic_score}` strong) / Package(`{count} 개`) / DLC(`{count} 개`)
  - card-footer: `업데이트 일자: {batch_date}` + **[후속] 동기화 버튼**

### 필터/정렬/특이 (legacy)

- base WHERE: `app_type='game' AND recommendations>0`.
- `search_year`=release_date 연도, `is_free`=1이면 `is_free<>'1'`(**무료 제외**), `search_publisher`=publisher LIKE '{val}%'.
- orderby: `recommendations desc`.
- 퍼블리셔 드롭다운: `steam_game a join steam_game_publisher b ... a.coming_soon<>'1' group by publisher_name`.
- ⚠️ 한국어 뱃지: legacy `strpos($language,"한국어")` 진위판정 — 언어 요소 **position 0이면 미표시**(strpos 0=false 버그). 요소는 미트림(콤마분리, 선행 공백 유지) → 통상 표시됨. `indexOf("한국어")>0`로 재현.

## 데이터 (legacy)

- `Admin::getSteamAppRanking($page, $add_where, $orderby, $param)` — **50/page**.
- 항목별: getSteamAppsGenre(장르), count(getSteamPackageAll), count(getSteamDLCAll).
- 컬럼: appid, name, developer, publisher, release_date, supported_languages, recommendations, diff_per_day, consumer_price, price, metacritic_score, batch_date.

## API 계약 (백엔드 전달)

### `GET /admin/steam/ranking` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_year` | string | release_date 연도 |
| `search_publisher` | string | publisher LIKE '{val}%' |
| `is_free` | string | `1`이면 is_free<>'1'(무료 제외) |

응답: `{ items: SteamRankingItem[], pagination, publishers: string[] }`
- `SteamRankingItem`: appid, name, developer, publisher, release_date, supported_languages, recommendations, diff_per_day, consumer_price(cents), price(cents), metacritic_score, package_count, dlc_count, batch_date, genres:string[].

### [후속 단위] 동기화
- 앱 동기화: `get_steam_app_info.php {mode:steam_sync, appids}`.

## 타겟 매핑

- 라우트: `routes/steam/steam_apps_ranking.tsx` → `/steam/steam_apps_ranking`
- screens: `screens/steam-apps-ranking`
- entities: `steam` 확장 — `SteamRankingSearch`/`SteamRankingItem`/`SteamRankingResponse`, `fetchSteamRanking`, `useSteamRanking`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_RANKING_LIST` + `GET /admin/steam/ranking`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색 3종/카드 그리드/순위뱃지/정보테이블 9행)
- [ ] 필드/포맷 일치 (가격/100, diff_per_day 3자리, metacritic, package/dlc count)
- [ ] 분기/플로우 일치 (개발사·퍼블 링크, 무료제외, recommendations desc)
- [ ] 후속 표시 (동기화 버튼 제외)
