# Steam API - 동기화 액션 레이어 (읽기 뷰 #69~76의 후속)

## 개요

- Steam API 그룹 8개 화면(#69~76)의 **동기화/삭제/등록 mutation**을 공용 액션 레이어로 구현.
- legacy는 화면마다 `get_steam_*.php`, `steam_*_delete.php` 등에 GET AJAX로 호출 → 성공 시 `location.reload()`(일부 DOM 제거).
- 타겟: `entities/steam` mutation 훅 + mock. 성공 시 STEAM 쿼리 invalidate(=reload). DOM 제거형(삭제)도 invalidate로 통일.

## legacy 버튼 → 액션 매핑

| 버튼(legacy class) | 화면 | 호출 | 타겟 계약 |
|---|---|---|---|
| App 등록(모달) / btn_steam_sync | #69,#74,#75,#76 | get_steam_game_info/get_steam_app_info `{mode:steam_sync, appids, [title_id]}` | `POST /admin/steam/apps/sync {appids, title_id?}` |
| btn_steam_game | #70 | get_steam_game_info `{mode:btn_steam_sync, appids}` | `POST /admin/steam/apps/sync {appids}` (동일) |
| btn_steam_sync_genre | #69 | `{mode:genre_sync}` | `POST /admin/steam/apps/sync-genre {appids, title_id}` |
| btn_steam_sync_category | #69 | `{mode:category_sync}` | `POST /admin/steam/apps/sync-category {appids, title_id}` |
| btn_steam_sync_tag | #69 | python + tag_ps | `POST /admin/steam/apps/sync-tag {appids}` |
| btn_review_steam_all | #69,#70,#73 | get_steam_review `{purchase_type, appids, language}` | `POST /admin/steam/reviews/sync {appid, purchase_type, language}` |
| btn_steam_package | #69,#72,#74,#75 | get_steam_package_info(_all) `{mode:steam_sync, packageids, appid}` | `POST /admin/steam/packages/sync {packageid, appid}` |
| btn_steam_dlc | #69,#71 | get_steam_game_info `{mode:dlc_sync, appids}` | `POST /admin/steam/apps/sync {appids, mode:dlc_sync}` (재사용) |
| btn_steam_app_delete / btn_app_delete / btn_dlc_delete | #69,#71,#74 | steam_app_delete `{appids}` | `DELETE /admin/steam/apps/{appid}` |
| btn_steam_package_delete | #72 | steam_package_delete `{packageids}` | `DELETE /admin/steam/packages/{packageid}` |

## API 계약 (백엔드 전달)

| METHOD /path | 요청 | 응답 | 비고 |
|---|---|---|---|
| `POST /admin/steam/apps/sync` | `{appids, title_id?, mode?}` | `{success, message}` | 앱/게임/DLC 동기화(mode로 분기). 성공 alert 후 reload |
| `POST /admin/steam/apps/sync-genre` | `{appids, title_id}` | `{success, message}` | |
| `POST /admin/steam/apps/sync-category` | `{appids, title_id}` | `{success, message}` | |
| `POST /admin/steam/apps/sync-tag` | `{appids}` | `{success, message}` | 백엔드: python 크롤 + tag upsert |
| `POST /admin/steam/reviews/sync` | `{appid, purchase_type, language}` | `{success, message}` | |
| `POST /admin/steam/packages/sync` | `{packageid, appid}` | `{success, message}` | |
| `POST /admin/steam/apps/register` | `{appids}` | `{success, message}` | App 등록 모달(=steam_sync) |
| `DELETE /admin/steam/apps/:appid` | — | `{success, message}` | 앱/DLC 삭제 |
| `DELETE /admin/steam/packages/:packageid` | — | `{success, message}` | 패키지 삭제 |

- 프론트: 성공 시 `alert(message)`(legacy 동일한 화면만) 후 STEAM 쿼리 invalidate. 삭제는 legacy가 DOM 제거이나 invalidate로 재조회 통일(동작 동일).

## 타겟 매핑

- entities: `steam` 확장 — 요청/응답 타입 + `syncSteamApp`/`syncSteamGenre`/`syncSteamCategory`/`syncSteamTag`/`syncSteamReview`/`syncSteamPackage`/`registerSteamApp`/`deleteSteamApp`/`deleteSteamPackage` fetcher + `use*` mutation 훅(onSuccess STEAM invalidate)
- 화면 배선: #69~76의 `[후속]` 버튼/모달 자리에 실제 버튼+핸들러 연결(각 화면 커밋)
- mock: `steam.ts` — 9개 mutation 핸들러(`{success:true, message}`)

## 배선 순서(커밋 단위)

1. 액션 레이어(entity+mock) + 허브 화면 #69(스팀 Apps 검색: 모든 버튼+App등록 모달)
2. #70 Game / #71 DLC / #72 Package / #73 평가 (각 화면 버튼)
3. #74 Apps list / #75 출시예정 / #76 순위 (각 화면 버튼)

## Parity 체크리스트

- [ ] 각 버튼 → 정확한 액션/파라미터 매핑
- [ ] 성공 시 alert(해당 화면만)+목록 갱신
- [ ] 삭제/등록 후 재조회
- [ ] product_viewer/권한 게이트 없음(legacy 동일)
