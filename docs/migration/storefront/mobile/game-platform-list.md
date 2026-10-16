# 모바일 플랫폼별 게임 목록 list 뷰 (game_platform_list)

## 원본 (legacy mobile)

- 파일: `mobile/game/game_platform_list.html` (`.html`=PHP 처리). 더보기: `game_platform_list_ajax.php`. 카드: `list_inc.php`. 필터 도출: `new_game_common.php`.
- PC 대응 단위: `docs/migration/storefront/game/game-list.md`(엔티티) — mobile은 `game_platform_thumb`/`game_list` 선례 재사용.
- 자매(같은 데이터 thumb 뷰): `docs/migration/storefront/mobile/game-platform-thumb.md` ✅ / list 원형: `docs/migration/storefront/mobile/game-list.md` ✅

`game_platform_list.html`은 `game_list.html`과 거의 동일하며 차이는 4곳:

| 항목 | game_list | game_platform_list |
|------|-----------|--------------------|
| `$aside['platform']` | 미설정(플랫폼 블록 노출) | `"false"` (플랫폼 블록 숨김) |
| `$page_name` | `"game"` | `"game_platform"` (더보기 ajax=game_platform_list_ajax.php) |
| `$page_title` | `"모든게임"` | `$goods->getPlatform($platform)` (동적) |
| `$search_label[3]`(플랫폼 칩) | 유지 | `unset` (칩 제거) |

`page_type="list"`, `#goods_list`, `list_inc.php`는 동일. `game_platform_thumb.html`과는 `page_type`/include만 다름(thumb vs list). where 기본 `find_in_set(a.game_type,'game,dlc,music,bundle')` + platform은 GET `?platform=`로 필터(new_game_common).

## 화면·플로우 (legacy mobile 기준)

- 진입 URL: `/game/game_platform_list.html?platform=1/34/35` (+ game_list과 동일 필터 파라미터). platform **기본 주입 없음**(빈 platform이면 title 빈값).
- title/pageTitle = `getPlatform($platform)` (mobile 매핑: 1 Steam, 3 Origin, 30 Ubisoft Connect, 33 Bethesda, 34 Epic Games, 35 Rockstar Games Launcher, 미정의→"").
- 화면 구성 = game_list와 동일: `MobileSubHeader` + `game_filter.html`(단, **플랫폼 블록 숨김**) + `#goods_list`(list_inc.php 카드) + 더보기(btn_paging).
- 세션/권한: 로그인 시 wishlist_chk 판정(백엔드), 비로그인 N.

## 모바일 head / 앱셸

- viewport/theme #000/apple-web-app = game_list와 동일. title=동적(platformName). description 빈값.
- 앱셸: `MobileSubHeader(pageTitle=platformName)` + `MobileGameFilter(aside={platform:false})` + bottom-nav/dialogs(레이아웃 소유).

## 데이터

- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)`(platform 필터 파라미터 포함) + `GameListResponse`. **증분 없음**(thumb/list 선례와 동일 데이터).
- 카드: `entities/product-thumb` `MobileListCard` **재사용**.
- title lib: `@screens/mobile-game-platform-thumb`의 `platformName`/`resolvePlatform` **재사용**(공개 API, FSD 상위 layer 조합 허용).
- 더보기 증분: `getGameList(nextPage, filters)` — game_list와 동일 divergence 노트 적용(전 페이지 `MobileListCard` 통일, game_list 게이트 승인).

## API 계약 (증분만)

증분 없음. `GET /api/game/list?page=N&platform=&{필터}` (기존 계약, 백엔드 필터/정렬/60per-page/wishlist_chk).

## 타겟 매핑

- middleware MOBILE_ROUTES: `/game/game_platform_list.html`
- 라우트: `app/m/game/game_platform_list.html/page.tsx` (platform_thumb page.tsx 구조 — `generateMetadata`=platformName, `resolvePlatform`, `collectFilters`, screen만 list로 교체)
- screen: `screens/mobile-game-platform-list`
  - `MobileGamePlatformListScreen`: `MobileSubHeader(pageTitle)` + `#appCapsuleSub.full-height` + `MobileGameFilter(aside={platform:false}, total, viewBasePath="/game/game_platform", pageType="list")` + `MobileGamePlatformListItems`
  - `MobileGamePlatformListItems`(client): `#goods_list` + `MobileListCard` + 더보기(footer_common 재현) + 서버액션 `loadMoreGamePlatformList`
  - `api/load-more-game-platform-list.ts`: `getGameList(nextPage, filters)`
- 재사용: `game-list`, `product-thumb`(MobileListCard), `promotion-ing`(ProductFilterParams), `mobile-sub-header`, `mobile-game-filter`, `mobile-game-platform-thumb`(platformName/resolvePlatform)
- 신규 UI: 없음. mock: 없음(기존 getGameList mock).

## Parity 체크리스트 (모바일 UA)

- [ ] 화면 요소 일치 (헤더 동적 title / 필터 **플랫폼 블록 숨김** / list 카드 / 더보기)
- [ ] 필드/검증 일치 (MobileListCard = list_inc.php)
- [ ] 분기/플로우 (platform 필터, 뷰전환 list↔thumb=`/game/game_platform_*`, 더보기)
- [ ] head/viewport (theme #000, title=platformName, platform=1→Steam)
- [ ] 증분 동작 (더보기 append + 마지막 alert) — 구형 카드 divergence는 game_list 승인 동일 적용
- [ ] 엣지 (빈 platform→빈 title, 비로그인 wishlist_chk N, soldout 품절)
- [ ] middleware rewrite/폴백
