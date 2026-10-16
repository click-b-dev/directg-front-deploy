# 모바일 플랫폼별 게임 목록 (game_platform_thumb)

## 원본 (legacy mobile)
- 파일: `mobile/game/game_platform_thumb.html` (라이브 — 모바일 사이드바 "플랫폼별" 진입: `sidebar.html` L217~219 `?platform=1|34|35`)
- 더보기 증분: `mobile/game/game_platform_thumb_ajax.php`
- 필터/정렬 조립: `mobile/game/new_game_common.php` (page 화면과 ajax 공용)
- 카드 조각: `mobile/game/thumb_inc.php` (파일럿 `game_thumb`과 동일)
- 더보기 핸들러: `mobile/inc/footer_common.html`
- PC 대응 단위: `docs/migration/storefront/game/game-platform.md` (재사용 출처)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/game/game_platform_thumb.html?platform=1` (Steam) / `?platform=34` (Epic Games) / `?platform=35` (Rockstar Games Launcher). 그 외 필터 파라미터(sort, is_*, game_type_*, min/max_price, genre_code 등)도 모두 수용하나 UI(offcanvas 필터)는 후속.
- 화면 요소:
  - `sub_header.html` (뒤로/pageTitle/검색토글/장바구니) — `MobileSubHeader` 재사용
  - `game_filter.html` (offcanvas 필터) — **후속 범위**(파일럿 game_thumb과 동일하게 미이관)
  - `#appCapsuleSub.full-height > .section.full`
    - `.wide-block.pt-2.pb-2.px-2 > #goods_thumb` : thumb 카드 반복 (`thumb_inc.php`)
    - `.wide-block.pt-2.pb-2.border-0.dg_bg > #btn_paging` : `( page / total_pages ) 더보기` 버튼
  - (하단 divider `arrow-down`은 legacy 주석처리 → 미렌더)
- 폼 필드/검증: 없음(목록 화면). 더보기 버튼 클릭만.
- 분기/리다이렉트: 없음. (PDO 에러 시 `echo 'Error!'` die — 재현 불필요)
- 세션/권한 의존: 공개. 단, `getGoodsList2`가 wishlist_chk 위해 세션 쿠키 참조 → `getGameList` 이미 쿠키 포워딩.

### page_title 파생 (PC와 다름 — 주의)
- legacy: `$page_title = $goods->getPlatform($platform)` (`src/classes/Goods.php` L518 switch).
  - `1`→`Steam`, `3`→`Origin`, `34`→`Epic Games`, `30`→`Ubisoft Connect`, `35`→**`Rockstar Games Launcher`**, `33`→`Bethesda`, 그 외→`""`(빈 title).
- **PC(`game-platform`)는 정적 switch `1→Steam / 34→Epic Games / 35→Rockstar Games`** 로 mobile과 **35 라벨이 다르다**(PC "Rockstar Games" vs mobile "Rockstar Games Launcher"). 또 mobile은 3/30/33 코드까지 매핑.
- **`platform=1` 기본 주입 없음**: PC page_platform은 `if(!platform && !platform_1..) platform=1` 기본값이 있으나, **mobile game_platform_thumb.html에는 없다**. platform 비었으면 title=`""`, platform 필터 미적용. (사이드바가 항상 platform을 넘기므로 실무상 영향 없음 — parity로 기본 주입하지 않는다.)
- head `<title>`과 `sub_header`의 `.pageTitle` 모두 동일한 `$page_title` 사용.

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover` / theme-color `#000000` / apple-mobile-web-app-capable yes / status-bar black-translucent — 파일럿 `game_thumb.html/page.tsx`와 동일.
- head title: `getPlatform(platform)` 동적, description 빈값.
- 사용 앱셸: `MobileSubHeader(pageTitle=getPlatform(platform))` (재사용) / bottom-nav·sidebar·dialog는 `app/m/layout.tsx` 공유.
- 페이지별 mobile-assets CSS: 파일럿과 동일(`style.css`/`dg_style.css`/`styleguide.css`는 layout에서 로드). thumb 카드 CSS 재사용(`card-list` 계열).

## 데이터
- 재사용 엔티티: `entities/game-list` `getGameList(page, filters)` → `GET /api/game/list?page=N&{필터}` (60/page). platform은 필터 파라미터일 뿐 — **증분 없음**(PC game-platform 선례와 동일).
- 카드: `entities/product-thumb` `MobileThumbCard` (파일럿 재사용).
- 모바일 전용 동작: "더보기" 증분 — `game_platform_thumb_ajax.php`는 page+1 후 동일 `getGoodsList2` 재호출. → `screens/mobile-game-thumb` 파일럿의 서버액션 패턴(`loadMoreGames`) 재사용(필터에 platform 포함).

## API 계약 (증분만, 백엔드 전달)
- 없음. `GET /api/game/list` (game-list 단위 계약)를 platform 필터 파라미터와 함께 재사용. filter_include의 `a.product_platform='<platform>'` 조건은 백엔드.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `"/game/game_platform_thumb.html"`
- 라우트: `app/m/game/game_platform_thumb.html/page.tsx` (서버 컴포넌트, `generateMetadata` title=getPlatform(platform))
- screen: `screens/mobile-game-platform-thumb`
  - `lib/platform-name.ts` — mobile `getPlatform` switch 매핑 + platform 파라미터 해석(기본 주입 없음)
  - `ui/mobile-game-platform-thumb-screen.tsx` — `MobileSubHeader(pageTitle)` + `#appCapsuleSub` + 목록
  - 목록/더보기 UI: 파일럿 `screens/mobile-game-thumb`의 `MobileGameThumbList` + `loadMoreGames` **재사용**(필터에 platform 포함되어 그대로 동작).
- 재사용 entities: `game-list`(getGameList) · `product-thumb`(MobileThumbCard)
- 신규 UI: platform 전용 카드 없음(thumb 카드 재사용). platform title lib만 신규.
- mock: 기존 `/api/game/list` MSW 핸들러 재사용(platform 파라미터 무시해도 목록 반환) — 신규 없음.

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치 (sub_header + appCapsuleSub + #goods_thumb + 더보기 버튼)
- [ ] page_title = getPlatform(platform) (1→Steam / 34→Epic Games / 35→Rockstar Games Launcher / 그 외 매핑 / 빈값)
- [ ] head `<title>` = pageTitle 동일
- [ ] platform 필터가 getGameList 파라미터로 전달
- [ ] 더보기 증분: `( page / total )` 표기, 마지막 페이지 alert("마지막페이지입니다"), append 동작
- [ ] `platform=1` 기본 주입 **없음**(PC와 차이) — 빈 platform 시 빈 title/무필터
- [ ] 모바일 head/viewport 일치(theme #000, viewport-fit=cover, apple-web-app)
- [ ] offcanvas 필터 미렌더(후속) — 파일럿 game_thumb과 동일
- [ ] middleware rewrite(모바일 UA→/m) / 데스크톱 UA 폴백(PC game_platform_thumb) 확인
