# Steam API - 스팀 Game 현황 (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_game_list.php` (라이브)
- 엔티티: 기존 `steam` 확장. breadcrumb 3번째 "스팀 동기화".
- **읽기 뷰만.** 동기화 mutation(스팀 동기화·평가 동기화)은 후속.

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_game_list`
  - `page`, `search_appid`, `search_name`
  - (`search_title_id`, `search_app_type`도 캡처되나 폼 필드 없음/base가 game 강제 → dead, 생략)
- 성격: **game 타입 스팀 앱 현황 목록.**

- 화면 요소 (legacy 기준):
  - page_title `스팀 Game 현황` / breadcrumb: 홈 > 상품 > 스팀 동기화 > 스팀 Game 현황
  - 검색필터 카드(`스팀 Apps 검색필터`): 스팀 APPID text / 스팀 상품명 text / submit `스팀 Apps 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-dark font-13`, tbody `font-12`), 12컬럼:
    - 번호 = `(page-1)*50 + num` (오름차순)
    - 스팀APPID(90) / 스팀유형(90) / 스팀 상품명(name + 한국어지원 뱃지 **font-11**)
    - 퍼블리셔(130) / 출시일(130): `release_date`<br>`({coming_soon_date})`
    - 관련 Package 수(130, end): `count(getSteamPackage)` / 관련 DLC 수(130, end): `count(getSteamDLCList)`
    - 스팀 가격정보(100, end): `{consumer_price/100}`<br>`({price/100})`
    - 스팀 평가정보(120): `{review_score}`<br>`({review_score_desc})` + review_score 없으면 **[후속] 평가 동기화 버튼**
    - 대표상품코드(100): title_id
    - 비고(160): **[후속] {appid} 동기화 버튼** <br> `({batch_date})`
  - 페이지네이션(50/page)

### 필터/정렬 (legacy)

- base WHERE: `app_type='game' AND publisher NOT IN ('BANDAI NAMCO Entertainment','Warner Bros. Interactive Entertainment','Ubisoft','Bandai Namco Entertainment Inc.','Electronic Arts')`.
- `search_appid`=steam_appid 등호, `search_name`=name LIKE.
- orderby: `coming_soon desc, coming_soon_date desc, release_date desc`.

## 데이터 (legacy)

- `Admin::getSteamGame($page, $add_where, $orderby, $param)` — **50/page**.
- 항목별: `count(getSteamPackage)`, `count(getSteamDLCList)`, `getSteamReviewInfo(appid)`(review_score/desc 요약).
- 컬럼: steam_appid, app_type, name, supported_languages, publisher, release_date, coming_soon_date, consumer_price, price, title_id, batch_date.

## API 계약 (백엔드 전달)

### `GET /admin/steam/games` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_appid` | string | steam_appid 등호 |
| `search_name` | string | name LIKE %val% |

백엔드 책임: base(game + 제외 퍼블리셔), orderby(coming_soon desc, coming_soon_date desc, release_date desc), 항목별 package_count/dlc_count/review_score 요약 포함.

응답 항목(`SteamGameItem`): steam_appid, app_type, name, supported_languages, publisher, release_date, coming_soon_date, package_count, dlc_count, consumer_price(cents), price(cents), review_score, review_score_desc, title_id, batch_date.

### [후속 단위] 동기화
- 스팀 동기화: `get_steam_game_info.php {mode:btn_steam_sync, appids}` / 평가 동기화: `get_steam_review.php {purchase_type:all, appids, language:all}`.

## 타겟 매핑

- 라우트: `routes/steam/steam_game_list.tsx` → `/steam/steam_game_list`
- screens: `screens/steam-game-list`
- entities: `steam` 확장 — `SteamGameSearch`/`SteamGameItem`/`SteamGameListResponse`, `fetchSteamGameList`, `useSteamGameList`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_GAME_LIST` + `GET /admin/steam/games`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색/12컬럼/한국어 뱃지 font-11)
- [ ] 필드/포맷 일치 (가격 /100, 출시일+coming_soon_date, 평가 score/desc, package/dlc count)
- [ ] 분기/플로우 일치 (번호 오름차순, 정렬)
- [ ] 후속 표시 (스팀·평가 동기화 버튼 제외)
