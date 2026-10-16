# 모바일 장르별 게임 목록 (game_genre_thumb)

## 원본 (legacy mobile)
- 파일: `mobile/game/game_genre_thumb.html` (라이브 — 모바일 사이드바 "장르별" 진입: `sidebar.html` L233~242 `?genre_code=G0001…G0010`)
- 더보기 증분: `mobile/game/game_genre_thumb_ajax.php`
- 필터/정렬 조립: `mobile/game/new_game_common.php` (page 화면과 ajax 공용, genre_code → match(a.genre) AGAINST boolean mode)
- 카드 조각: `mobile/game/thumb_inc.php` (파일럿 `game_thumb`과 동일)
- 더보기 핸들러: `mobile/inc/footer_common.html`
- PC 대응 단위: `docs/migration/storefront/game/game-genre.md` (재사용 출처)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터: `/game/game_genre_thumb.html?genre_code=G0001`(액션) … `G0002` 어드벤처 / `G0003` RPG / `G0004` 전략 / `G0005` 시뮬레이션 / `G0006` 스포츠 / `G0010` 레이싱 / `G0007` 캐주얼 / `G0008` 인디 / `G0009` 앞서 해보기. 그 외 필터 파라미터도 모두 수용하나 UI(offcanvas 필터)는 후속.
- 화면 요소:
  - `sub_header.html` (뒤로/pageTitle/검색토글/장바구니) — `MobileSubHeader` 재사용
  - `game_filter.html` (offcanvas 필터) — **후속 범위**(platform/game_thumb과 동일하게 미이관)
  - `#appCapsuleSub.full-height > .section.full`
    - `.wide-block.pt-2.pb-2.px-2 > #goods_thumb` : thumb 카드 반복 (`thumb_inc.php`)
    - `.wide-block.pt-2.pb-2.border-0.dg_bg > #btn_paging` : `( page / total_pages ) 더보기` 버튼
  - (하단 divider `arrow-down`은 legacy 주석처리 → 미렌더)
  - **장르 베스트 캐러셀 없음** — PC(`game-genre`)에만 있는 상단 캐러셀은 mobile 화면에 존재하지 않는다.
- 폼 필드/검증: 없음(목록 화면). 더보기 버튼 클릭만.
- 분기/리다이렉트: 없음.
- 세션/권한 의존: 공개. `getGoodsList2`가 wishlist_chk 위해 세션 쿠키 참조 → `getGameGenreList` 이미 쿠키 포워딩.

### page_title 파생
- legacy: `$page_title = $goods->getPrimaryGenreName($genre_code)` (`src/classes/Goods.php` L1371) — **DB 조회** `select tag_name from tbl_tags where tag_code=:tag_code`. 정적 switch 아님(platform과 차이).
- → 백엔드가 `getGameGenreList` 응답 `genreName`으로 이미 해석해서 내려줌. 프론트는 그 값을 head `<title>`·`sub_header` `.pageTitle`에 그대로 사용. **정적 매핑 lib 불필요.**
- **`genre_code` 기본 주입 없음**: PC(`game-genre`)는 `genre_code` 빈값 → `G0001`(액션) 기본값을 주입하나, **mobile game_genre_thumb.html에는 없다**. genre_code 비었으면 title 빈값, genre 필터 미적용. (사이드바가 항상 genre_code를 넘기므로 실무상 영향 없음 — parity로 기본 주입하지 않는다.)

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover` / theme-color `#000000` / apple-mobile-web-app-capable yes / status-bar black-translucent — 파일럿·platform과 동일.
- head title: `genreName` 동적, description 빈값.
- 사용 앱셸: `MobileSubHeader(pageTitle=genreName)` (재사용) / bottom-nav·sidebar·dialog는 `app/m/layout.tsx` 공유.
- 페이지별 mobile-assets CSS: 파일럿과 동일(layout에서 로드). thumb 카드 CSS 재사용.

## 데이터
- 재사용 엔티티: `entities/game-genre` `getGameGenreList(genreCode, page, filters)` → `GET /api/game/genre?genre_code=X&page=N&{필터}` (60/page). 응답 `list`(ProductThumb) + `totalPages` + **`genreName`**(page_title) + `bestTitles`(캐러셀 — **모바일 미사용, 무시**). **증분 없음.**
- 카드: `entities/product-thumb` `MobileThumbCard` (파일럿 재사용).
- 모바일 전용 동작: "더보기" 증분 — `game_genre_thumb_ajax.php`는 page+1 후 동일 `getGoodsList2`+genre 재호출. → 서버액션이 `getGameGenreList(genreCode, nextPage, filters)` 호출(platform 선례와 동형).

## API 계약 (증분만, 백엔드 전달)
- 없음. `GET /api/game/genre` (game-genre 단위 계약)를 그대로 재사용. genre_code FULLTEXT 조건·getPrimaryGenreName은 백엔드.

## 타겟 매핑
- middleware `MOBILE_ROUTES` 추가 경로: `"/game/game_genre_thumb.html"`
- 라우트: `app/m/game/game_genre_thumb.html/page.tsx` (서버 컴포넌트, `generateMetadata` title=genreName)
- screen: `screens/mobile-game-genre-thumb`
  - `ui/mobile-game-genre-thumb-screen.tsx` — `MobileSubHeader(pageTitle=genreName)` + `#appCapsuleSub` + 목록 (캐러셀 없음)
  - `ui/mobile-game-genre-thumb-list.tsx` (client) — thumb 목록 + 더보기 (genreCode 전달)
  - `api/load-more-genre-games.ts` (server action) — `getGameGenreList(genreCode, nextPage, filters).list`
- 재사용 entities: `game-genre`(getGameGenreList) · `product-thumb`(MobileThumbCard)
- 신규 UI: genre 전용 카드 없음(thumb 카드 재사용). 정적 name lib 없음(백엔드 genreName).
- mock: 기존 `/api/game/genre` MSW 핸들러 재사용 — 신규 없음.

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치 (sub_header + appCapsuleSub + #goods_thumb + 더보기 버튼)
- [ ] **장르 베스트 캐러셀 미렌더** (PC와 차이 — mobile 화면에 없음)
- [ ] page_title = getPrimaryGenreName(genre_code) = 백엔드 genreName
- [ ] head `<title>` = pageTitle 동일
- [ ] genre_code 필터가 getGameGenreList로 전달 (match(a.genre) 백엔드)
- [ ] 더보기 증분: `( page / total )` 표기, 마지막 페이지 alert("마지막페이지입니다"), append 동작
- [ ] `genre_code` 기본 주입 **없음**(PC의 G0001 기본값과 차이) — 빈 genre_code 시 빈 title/무필터
- [ ] 모바일 head/viewport 일치(theme #000, viewport-fit=cover, apple-web-app)
- [ ] offcanvas 필터 미렌더(후속)
- [ ] middleware rewrite(모바일 UA→/m) / 데스크톱 UA 폴백(PC game_genre_thumb) 확인
