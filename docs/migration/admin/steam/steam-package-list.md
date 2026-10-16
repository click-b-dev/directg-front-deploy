# Steam API - 스팀 Package 현황 (읽기 뷰 / 동기화 후속)

## 원본

- 파일: `pc/_Admin_/steam/steam_package_list.php` (라이브)
- 엔티티: 기존 `steam` 확장. **읽기 뷰만** (동기화·삭제 mutation 후속).

## 화면·플로우 (읽기 뷰)

- 진입 URL/파라미터: `/steam/steam_package_list`
  - `page`, `search_packageid`, `search_name` (`search_title_id`/`search_app_type`은 dead, 생략)

- 화면 요소 (legacy 기준):
  - page_title `스팀 Package 현황` / breadcrumb: 홈 > 상품 > 스팀 동기화 > 스팀 Package 현황
  - 검색필터 카드(`스팀 Package 검색필터`): 스팀 packageid text / 스팀 상품명 text / submit `스팀 Apps 검색`
  - 카운트: `{total} 개`
  - 목록 테이블(`table-centered nowrap table-sm table-bordered`, thead `table-dark font-13`, tbody `font-12`), 11컬럼:
    - 번호 = `(page-1)*50 + num` (오름차순)
    - Package ID (App ID)(100): `packageid`<br>`({appid})`
    - Package Name: package_name
    - 출시일(100): package_release
    - 판매구분(100): `package_coming_soon=='1'`→`<span text-danger>예약판매</span>` : `일반판매`
    - 포함된 APP수(130, end): `{cc}`
    - initial(100, end): `{price_initial/100}` / final(100, end): `{price_final/100}`
    - 옵션상품코드(100): **`getGoodsOptionPackageInfo(packageid).display_type` 라벨**(basic→기본게임/dlc·music→DLC/edition→에디션; 없으면 빈칸) — ⚠️ 컬럼명은 "옵션상품코드"이나 실제로 display_type 라벨 표시(legacy quirk)
    - 비고(160): **[후속] {appid} 동기화 버튼** <br> `batch_date` 있으면 `(date(Y-m-d H:i:s, batch_date))` else `<strong text-danger>업데이트 필요</strong>`
    - 삭제(100): **[후속]** 삭제 버튼
  - 페이지네이션(50/page)

### 필터/정렬 (legacy)

- `search_packageid`=packageid 등호, `search_name`=package_name LIKE.
- orderby: `package_coming_soon desc, package_release desc, package_name desc`.

## 데이터 (legacy)

- `Admin::getSteamAppPackage($page, $add_where, $orderby, $param)` — **50/page**.
- 항목별: `getGoodsOptionPackageInfo(packageid).display_type`.
- 컬럼: packageid, appid, package_name, package_release, package_coming_soon, cc(포함 APP수), price_initial, price_final, batch_date(unix).

## API 계약 (백엔드 전달)

### `GET /admin/steam/packages` (읽기 뷰)

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `page` | number | 1-base, 50개/page |
| `search_packageid` | string | packageid 등호 |
| `search_name` | string | package_name LIKE %val% |

백엔드 책임: orderby, 항목별 display_type 포함.

응답 항목(`SteamPackageListItem`): packageid, appid, package_name, package_release, package_coming_soon, cc, price_initial(cents), price_final(cents), display_type, batch_date(unix 초, 0이면 미설정).

### [후속 단위] 동기화/삭제
- 패키지 동기화: `get_steam_package_info.php {mode:steam_sync, packageids}` / 삭제: `steam_package_delete.php {packageids}`.

## 타겟 매핑

- 라우트: `routes/steam/steam_package_list.tsx` → `/steam/steam_package_list`
- screens: `screens/steam-package-list`
- entities: `steam` 확장 — `SteamPackageSearch`/`SteamPackageListItem`/`SteamPackageListResponse`, `fetchSteamPackageList`, `useSteamPackageList`
- shared: `shared/ui/ServerPagination`
- mock: `steam.ts` — `STEAM_PACKAGE_LIST` + `GET /admin/steam/packages`

## Parity 체크리스트 (읽기 뷰)

- [ ] 화면 요소 일치 (검색 2종/11컬럼)
- [ ] 필드/포맷 일치 (가격 /100, 판매구분, display_type 라벨, batch_date unix 포맷/업데이트 필요)
- [ ] 분기/플로우 일치 (번호 오름차순, 정렬)
- [ ] 후속 표시 (동기화·삭제 버튼 제외)
