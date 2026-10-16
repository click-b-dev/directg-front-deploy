# Steam API - 스팀 DLC 현황 (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_dlc_list.php` (라이브)
- 엔티티: 기존 `steam` 확장. **읽기 뷰만** (동기화·삭제 mutation 후속).

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_dlc_list`
  - `page`, `search_appid`, `search_name`, `is_free`(체크=1)
- 성격: **dlc/music 타입 스팀 앱 현황.**

- 화면 요소 (legacy 기준):
  - page_title `스팀 DLC 현황` / breadcrumb: 홈 > 상품 > 스팀 동기화 > 스팀 DLC 현황
  - 검색필터 카드(`스팀 Apps 검색필터`): 스팀 APPID text / 스팀 상품명 text / 무료여부 checkbox(`is_free`=1, "무료제공") / submit `스팀 Apps 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-dark font-13`, tbody `font-12`), 12컬럼:
    - 번호: `consumer_price>0`이면 `(page-1)*50 + num++`(가격 있는 행만 증가), else `-`
    - 스팀APPID(100) / 스팀유형(90)
    - 스팀 상품명: name + 한국어지원 뱃지(font-11) + `<br>` + `[기본게임 뱃지 bg-info] {basic_game_name} [{basic_game_appid}]`
    - 출시여부(100): `coming_soon=='1'` → `<span text-danger>출시예정</span>` : `출시`
    - 출시일(120): `release_date`<br>`({coming_soon_date})`
    - 관련 Package 수(100, end): `count(getSteamPackage)`; **0이면 `판매종료`**
    - 스팀 초기가격(100, end): `is_free=='1'`→`무료` : `{consumer_price/100}`
    - 스팀 판매가(100, end): `is_free=='1'`→`-` : `{price/100}`
    - 옵션상품코드(100): `getSteamAppChk(appid).product_code`
    - 비고(160): **[후속] {appid} 동기화 버튼** <br> `({batch_date})`
    - 삭제(80): **[후속]** product_code 없을 때만 삭제 버튼
  - 페이지네이션(50/page)

### 필터/정렬 (legacy)

- base WHERE: `find_in_set(app_type,'dlc,music') AND is_free<>'Y'`.
- `search_appid`=steam_appid 등호, `search_name`=name LIKE, `is_free`=1이면 `is_free='1'`.
- orderby: `coming_soon desc, coming_soon_date desc, release_date desc, name desc`.

## 데이터 (legacy)

- `Admin::getSteamAppDLC($page, $add_where, $orderby, $param)` — **50/page**.
- 항목별: `getSteamBasicGame(appid)`+`getSteamAppinfo`(기본게임), `count(getSteamPackage)`, `getSteamAppChk(appid).product_code`.
- 컬럼: steam_appid, app_type, name, supported_languages, coming_soon, coming_soon_date, release_date, is_free, consumer_price, price, batch_date.

## API 계약 (백엔드 전달)

### `GET /admin/steam/dlcs` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_appid` | string | steam_appid 등호 |
| `search_name` | string | name LIKE %val% |
| `is_free` | string | `1`이면 is_free='1' |

백엔드 책임: base(dlc/music + is_free≠Y), orderby, 항목별 basic_game/package_count/product_code 포함.

응답 항목(`SteamDlcListItem`): steam_appid, app_type, name, supported_languages, basic_game_appid, basic_game_name, coming_soon, coming_soon_date, release_date, package_count, is_free, consumer_price(cents), price(cents), product_code, batch_date.

### [후속 단위] 동기화/삭제
- DLC 동기화: `get_steam_game_info.php {mode:dlc_sync, appids}` / 삭제: `steam_app_delete.php {mode:dlc_sync, appids}`(product_code 없을 때).

## 타겟 매핑

- 라우트: `routes/steam/steam_dlc_list.tsx` → `/steam/steam_dlc_list`
- screens: `screens/steam-dlc-list`
- entities: `steam` 확장 — `SteamDlcSearch`/`SteamDlcListItem`/`SteamDlcListResponse`, `fetchSteamDlcList`, `useSteamDlcList`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_DLC_LIST` + `GET /admin/steam/dlcs`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색 3종/12컬럼/기본게임 뱃지)
- [ ] 필드/포맷 일치 (번호 가격조건, 무료/가격 /100, 출시여부, package 0→판매종료)
- [ ] 분기/플로우 일치 (정렬, 옵션상품코드)
- [ ] 후속 표시 (동기화·삭제 버튼 제외)
