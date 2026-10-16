# Steam API - 스팀 Apps 검색 (읽기 뷰 / 동기화는 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_apps_list.php` (라이브)
- 신규 도메인(Steam) — `steam` 엔티티 신설. topmenu=goods, breadcrumb 3번째 "스팀 동기화".
- **이 단위는 읽기 뷰만.** 동기화 mutation·App등록 모달은 후속 단위(sync)로 분리.

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_apps_list`
  - `page`, `search_app_type`(all|game|dlc|music), `search_appid`, `search_name`, `drm_notice`(Y), `ext_user_account_notice`(Y)
  - (`search_title_id`도 캡처되나 폼 필드 없음 → dead, 생략)

- 검색필터 카드(`스팀 Apps 검색필터`):
  - 스팀 APP TYPE radio: Game(`game`)/DLC(`dlc`)/Music(`music`) (전체 라디오 없음, 기본 all)
  - 스팀 APPID text(`search_appid`) / 스팀 상품명 text(`search_name`)
  - 제 3자 DRM checkbox(`drm_notice`=Y) / 타사 계정 checkbox(`ext_user_account_notice`=Y)
  - submit `스팀 Apps 검색`
- **[후속] `Steam App추가` 버튼 + 모달** (get_steam_game_info.php register) — 이 단위 제외.
- 카운트: `{total} 개`
- 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-dark`), 메인 7컬럼:
  - 스팀APPID(steam_appid,100) / 스팀유형(app_type,100) / 스팀 상품명(name)
  - 출시일(130): `coming_soon ? coming_soon_date : release_date`
  - 스팀 초기가격(100, end): `number_format(consumer_price/100)` / 스팀 판매가(100, end): `number_format(price/100)`
  - 대표상품코드(100): title_id
  - **상품별 중첩 데이터 행**(th bg-light + colspan):
    - `app_type≠game`이면 **기본게임**: `[{basic_game_appid}] {basic_game_name}` (getSteamBasicGame+getSteamAppinfo)
    - 개발사(developer) / 퍼블리셔(publisher) / 제 3자 DRM(drm_notice) / 타사 계정(ext_user_account_notice) / 동기화일자(batch_date)
    - 한국어지원: `supported_languages` 콤마분리·strip_tags → "한국어" 있으면 `[인터페이스/자막]` 뱃지, "한국어*"면 `[인터페이스/자막][음성]`
    - 장르: `genre` 콤마분리 → 뱃지들 / 카테고리: `category` 콤마분리 → 뱃지들 / 태그(국문): getSteamTagList_ko → `[code] name` dark 뱃지
    - **[후속] 리뷰 sync 버튼 / 스팀·장르·카테고리·TAG 동기화 버튼 행** — 제외
    - **리뷰 현황** 테이블(getSteamReview, total_reviews>0만): language/purchase_type/review_score/review_score_desc/긍정(count+%)/부정(count+%)/전체
    - **Package 현황** 테이블(getSteamPackage): 번호/packageid/package_name/출시여부(`package_coming_soon=='1'?예약판매:일반판매`+release)/initial(/100)/final(/100 +discount%)/individual(/100)/옵션상품코드(빈칸)/비고(**[후속] 패키지 동기화 버튼** — 빈칸)
    - `app_type==game`이면 **DLC 현황** 테이블(getSteamDLCList): 번호(consumer_price>0일때만 증가/else "-")/appid/app_name/app_type/출시여부(`coming_soon=='1'?출시예정:출시`+date)/initial(무료/판매예정/판매중지 분기)/final/비고(**[후속] DLC 동기화** — 빈칸)/삭제(**[후속]** — 빈칸)
  - 페이지네이션(10/page)

### 가격/포맷 규칙 (legacy)

- consumer_price/price/price_initial/price_final/price_individual/DLC price 모두 **cents** → `/100` 후 number_format.
- 긍정/부정 리뷰 %: `round(total_positive*100/total_reviews, 2)`.
- DLC initial: is_free=='1'→"무료" / consumer_price>0→금액 / else(coming_soon=='1'→"판매예정" else "판매중지"). final: is_free→"-" / price>0→금액 / else "-".

## 데이터 (legacy)

- `Admin::getSteamList($page, $add_where, $orderby='release_date desc', $param)` — `select * from steam_game`, **10/page**.
- WHERE: `steam_appid=`(appid), `ext_user_account_notice is not null`(체크), `drm_notice is not null`(체크), `name LIKE`, `app_type=`(≠all).
- 항목별 집계: `getSteamBasicGame(appid)`→`getSteamAppinfo` (비game 기본게임), `getSteamTagList_ko(appid)`, `getSteamReview(appid)`, `getSteamPackage(appid)`, `getSteamDLCList(appid)`(game).
- 컬럼: steam_appid, app_type, name, coming_soon, coming_soon_date, release_date, consumer_price, price, title_id, developer, publisher, drm_notice, ext_user_account_notice, batch_date, supported_languages, genre, category.

## API 계약 (백엔드 전달)

### `GET /admin/steam/apps` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 10개/page |
| `search_app_type` | string | `all`\|`game`\|`dlc`\|`music` |
| `search_appid` | string | steam_appid 등호 |
| `search_name` | string | name LIKE %val% |
| `drm_notice` | string | `Y`면 `drm_notice is not null` |
| `ext_user_account_notice` | string | `Y`면 `ext_user_account_notice is not null` |

백엔드 책임: `order by release_date desc`, 항목별 basic_game/tags_ko/reviews/packages/dlcs 집계 포함.

응답 항목(`SteamAppItem`): 위 컬럼 + `basic_game_appid`/`basic_game_name`, `tags_ko:[{code,name}]`, `reviews:SteamReviewRow[]`, `packages:SteamPackageRow[]`, `dlcs:SteamDlcRow[]`. (가격은 cents 원본, 프론트가 /100)

### [후속 단위] 동기화 계약 (이 단위 제외 — 별도 문서화 예정)

- App 등록: `GET get_steam_game_info.php {mode:steam_sync, appids}`
- 스팀 동기화: `{mode:steam_sync, appids, title_id}` / 장르·카테고리: 유사 mode
- TAG 동기화: `python/steam_app.py` → `tag/tag_ps.php`
- 리뷰 동기화: `get_steam_review.php {purchase_type, appids, language}`
- 패키지 동기화: `get_steam_package_info.php {mode:steam_sync, packageids, appid}`
- DLC 동기화: `get_steam_game_info.php {mode:dlc_sync, appids, title_id}` / DLC 삭제: `steam_app_delete.php {mode:dlc_sync, appids}`

## 타겟 매핑

- 라우트: `routes/steam/steam_apps_list.tsx` → `/steam/steam_apps_list`
- screens: `screens/steam-apps-list`
- entities: **신규 `steam`** — `SteamAppSearch`/`SteamAppItem`/서브타입/`SteamAppListResponse`, `fetchSteamAppList`, `useSteamAppList`
- shared: `shared/ui/ServerPagination`
- mock: **신규 `shared/mocks/handlers/steam.ts`**(handlers.ts 등록) — `STEAM_APP_LIST`(game/dlc 혼합, reviews/packages/dlcs 포함) + `GET /admin/steam/apps`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색필터/메인 7컬럼/중첩 데이터행/3종 현황 테이블)
- [ ] 필드/포맷 일치 (가격 /100, 출시일 분기, 한국어/장르/카테고리/태그 뱃지, 리뷰 %)
- [ ] 분기/플로우 일치 (비game 기본게임, game DLC 테이블, 필터 조건)
- [ ] 엣지케이스 일치 (리뷰/패키지/DLC 없음 시 미표시, DLC 가격 분기)
- [ ] 후속 표시 (동기화 버튼/App등록 모달 이 단위 제외 명시)
