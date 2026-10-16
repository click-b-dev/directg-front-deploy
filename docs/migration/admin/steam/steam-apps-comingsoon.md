# Steam API - 스팀 Apps 출시예정작 (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_apps_comingsoon.php` (라이브) — page_title "스팀 출시예정 App"
- 대상: `steam_app_list where coming_soon='1'` — `getSteamComingSoon`. `steam_apps_list_all`(#74) 자매(단순형).
- 엔티티: 기존 `steam` 확장(응답 항목은 `SteamAppAllItem` 재사용). **읽기 뷰만**.

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_apps_comingsoon`
  - `page`, `search_appid`, `search_name`, `search_title_id`(폼 미노출이나 URL로 적용)

- 검색필터 카드: 스팀 APPID text / 스팀 상품명 text / submit `스팀 Apps 검색`
- 카운트: `{total} 개`
- 목록 테이블(thead `table-dark`, tbody `font-13`), 메인 7컬럼:
  - 스팀APPID(100) / 스팀 상품명 / 스팀유형(100)
  - 출시예정일(130): `coming_soon ? coming_soon_date : release_date`
  - 스팀 초기가격(100, end): `{consumer_price/100}` / 스팀 판매가(100, end): `{price/100}`
  - 비고(130): **[후속] 스팀 업데이트 버튼**
  - **상품별 중첩 행**:
    - 정보 테이블: 개발사(getSteamDeveloper)/퍼블리셔/추천수(**raw, #74와 달리 콤마 없음**) | 지원언어(clean) | 한국어지원(badges bg-info)/업데이트 날짜(batch_date)
    - **Package** 행: getSteamPackageAll → package_name 있으면 `[{packageid}] {package_name} / {package_release} / ` (⚠️ 3번째 필드는 legacy 오타 `package_comming_soon`으로 항상 빈값), 없으면 **[후속] 동기화 버튼**
    - `app_type==game`이면 **DLC** 행: getSteamDLCAll → name 있으면 `[{dlc_appid}] {name}`, 없으면 **[후속] 동기화 버튼**
  - (#74와 달리 기본게임 행·삭제 버튼 없음)
  - 페이지네이션(50/page)

### 필터/정렬 (legacy)

- base WHERE: `coming_soon='1'` + **큐레이션 퍼블리셔 화이트리스트 REGEXP**(하드코딩 150+ 퍼블리셔) — 백엔드 책임.
- `search_appid`=appid 등호, `search_name`=name LIKE, `search_title_id`=title_id 등호.
- orderby: `sort asc, coming_soon_date asc, release_date asc, batch_date asc`.

## 데이터 (legacy)

- `Admin::getSteamComingSoon($page, $add_where, $orderby, $param)` — `steam_app_list where coming_soon='1'`, **50/page**.
- 항목별: getSteamDeveloper, getSteamPackageAll, getSteamDLCAll+getSteamAppinfoAll.

## API 계약 (백엔드 전달)

### `GET /admin/steam/coming-soon` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_appid` | string | appid 등호 |
| `search_name` | string | name LIKE %val% |
| `search_title_id` | string | title_id 등호 |

백엔드 책임: base `coming_soon='1'` + 큐레이션 퍼블리셔 REGEXP, orderby(sort/coming_soon_date/release_date/batch asc), 항목별 developer/packages/dlcs 집계.

응답: `{ items: SteamAppAllItem[], pagination }` (#74 항목 타입 재사용; basic_game은 빈값).

### [후속 단위] 동기화
- 앱 동기화: `get_steam_app_info.php {mode:steam_sync, appids}` / 패키지: `get_steam_package_info_all.php`.

## 타겟 매핑

- 라우트: `routes/steam/steam_apps_comingsoon.tsx` → `/steam/steam_apps_comingsoon`
- screens: `screens/steam-apps-comingsoon`
- entities: `steam` 확장 — `SteamComingSoonSearch`/`SteamComingSoonResponse`(SteamAppAllItem 재사용), `fetchSteamComingSoon`, `useSteamComingSoon`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_COMINGSOON_LIST` + `GET /admin/steam/coming-soon`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색 2종/7메인/중첩 정보·Package·DLC)
- [ ] 필드/포맷 일치 (가격/100, 추천수 raw, 지원언어 클린, package 오타 빈값)
- [ ] 분기/플로우 일치 (game DLC행, 정렬, coming_soon 기준)
- [ ] 후속 표시 (스팀 업데이트·동기화 버튼 제외)
