# Steam API - 스팀 Apps list (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_apps_list_all.php` (라이브) — page_title "스팀 Apps 검색"(사이드바 라벨 "스팀 Apps list")
- 대상: `steam_app_list`(원본 크롤 카탈로그) — `getSteamListAll`. `steam_game`(#69)과 별개.
- 엔티티: 기존 `steam` 확장. **읽기 뷰만** (동기화·삭제 mutation 후속).

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_apps_list_all`
  - `page`, `search_year`, `search_publisher`, `search_appid`, `search_name`, `search_app_type`(all/game/dlc/music), `is_free`, `supported_languages`, `search_developer`

- 검색필터 카드:
  - 스팀 출시연도 select(2005~현재) / 퍼블리셔 select(**동적**: publisher [cc]) / 스팀 APPID / 스팀 상품명
  - 스팀 APP TYPE radio(전체/Game/DLC/Music) / 무료여부 checkbox(is_free=1) / 지원언어 text
  - submit
- 카운트: `{total} 개`
- 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-dark font-14`, tbody `font-13`), 메인 7컬럼:
  - 스팀APPID(100) / 스팀 상품명 / 스팀유형(100)
  - 출시일(130): `coming_soon ? coming_soon_date : release_date`<br>`({release_date})`
  - 스팀 초기가격(100, end): `is_free=='1'`→`""` : `{consumer_price/100}`
  - 스팀 판매가(100, end): `is_free=='1'`→`무료` : `{price/100}`
  - 비고(130): **[후속] 스팀 업데이트 버튼**
  - **상품별 중첩 행**(class app_{appid}):
    - `app_type≠game`이면 **기본게임**: `[{basic_game_appid}] {basic_game_name}` (getSteamBasicGameAll+getSteamAppinfoAll)
    - 정보 중첩 테이블: 개발사(getSteamDeveloper)/퍼블리셔/추천수(recommendations) | 지원언어(clean: strip_tags+`*음성이 지원되는 언어` 제거)/한국어지원(`한국어`→인터페이스/자막 bg-info, `한국어*`→+음성) | 동기화일자(batch_date) / `(date(last_modified))`
    - **Package** 행: getSteamPackageAll → package_name 있으면 `[{packageid}] {name} / {release} / {coming_soon} / {price_initial/100}` 텍스트, 없으면 **[후속] 동기화 버튼**
    - `app_type==game`이면 **DLC** 행: getSteamDLCAll → getSteamAppinfoAll(dlc_appid).name 있으면 `[{dlc_appid}] {name}` (**[후속] 삭제**), 없으면 **[후속] 동기화 버튼**. 끝에 **[후속] 앱 삭제 버튼**
    - `app_type≠game`이면 **[후속] 삭제 버튼** 행
  - 페이지네이션(20/page)

### 필터/정렬 (legacy)

- `search_appid`=appid 등호, `search_name`=name REGEXP, `is_free`=등호, `search_developer`=developer REGEXP, `supported_languages`=REGEXP, `search_app_type`=app_type(≠all), `search_publisher`=publisher LIKE '{val}%', `search_year`=release_date 연도.
- orderby: `coming_soon desc, release_date desc, batch_date desc`.
- 퍼블리셔 드롭다운: `select publisher,count(*) cc from steam_app_list where publisher<>'' [and app_type=?] group by publisher having count(*)>{10|5} order by count(*) desc`.

## 데이터 (legacy)

- `Admin::getSteamListAll($page, $add_where, $orderby, $param)` — `steam_app_list`, **20/page**.
- 항목별: getSteamBasicGameAll/getSteamAppinfoAll(기본게임·dlc명), getSteamDeveloper, getSteamPackageAll, getSteamDLCAll.
- 컬럼: appid, name, app_type, coming_soon, coming_soon_date, release_date, is_free, consumer_price, price, publisher, recommendations, supported_languages, batch_date, last_modified(unix).

## API 계약 (백엔드 전달)

### `GET /admin/steam/apps-all` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 20개/page |
| `search_year`/`search_publisher`/`search_appid`/`search_name`/`search_app_type`/`is_free`/`supported_languages`/`search_developer` | string | 위 필터 규칙 |

응답: `{ items: SteamAppAllItem[], pagination, publishers: [{publisher, cc}] }`
- `SteamAppAllItem`: appid, name, app_type, coming_soon, coming_soon_date, release_date, is_free, consumer_price(cents), price(cents), developer, publisher, recommendations, supported_languages, batch_date, last_modified(unix), basic_game_appid, basic_game_name, packages:[{packageid, package_name, package_release, package_coming_soon, price_initial}], dlcs:[{dlc_appid, name}].

### [후속 단위] 동기화/삭제
- 앱 동기화: `get_steam_app_info.php {mode:steam_sync, appids}` / 패키지: `get_steam_package_info_all.php` / 앱·DLC 삭제: `steam_app_delete.php {appids}`.

## 타겟 매핑

- 라우트: `routes/steam/steam_apps_list_all.tsx` → `/steam/steam_apps_list_all`
- screens: `screens/steam-apps-list-all`
- entities: `steam` 확장 — `SteamAppAllSearch`/`SteamAppAllItem`/서브타입/`PublisherOption`/`SteamAppAllResponse`, `fetchSteamAppAllList`, `useSteamAppAllList`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_APP_ALL_LIST` + `GET /admin/steam/apps-all`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (필터 9종/동적 퍼블리셔/7메인컬럼/중첩 정보·Package·DLC)
- [ ] 필드/포맷 일치 (가격/100, 지원언어 클린, 한국어 뱃지, last_modified 포맷)
- [ ] 분기/플로우 일치 (비game 기본게임/삭제행, game DLC행, 정렬)
- [ ] 후속 표시 (스팀 업데이트·동기화·삭제 버튼 제외)
