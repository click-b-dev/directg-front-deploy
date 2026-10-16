# 모바일 서비스소개 (service/service)

## 원본 (legacy mobile)
- 파일: `mobile/service/service.html` (라이브 — service 도메인)
- PC 대응 단위: `docs/migration/storefront/service/service-intro.md` (screen `service-intro` + `PublisherPartners` CSR)
- 데이터: **없음** — 퍼블리셔 목록은 PHP 하드코딩 배열(`$publisher_array`). DB/AJAX 없음.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터 (.html 경로): `/service/service.html` — 파라미터 없음
- 화면 요소:
  - **헤더**: `inc/sub_header.html` include → `MobileSubHeader`(검색토글+장바구니). appHeaderSub 최소 헤더 아님 (agreement류와 다름).
  - `#appCapsuleSub.full-height` > `.section.full` 본문:
    1. **마스트헤드** `.ja-masthead > #ja-masthead-bg`(배경이미지 cover) > `.flex-container`: 타이틀 h3 / 태그 4개(#상시할인 등) / 설명(h2int 로고 + 문구). 높이는 JS로 `width*540/460` 설정(client 재현).
    2. **content §1** h3 + progressbar(li 3개, 가운데 active) + 안내 p
    3. **content §2** h3 + 혜택 Splide 캐러셀 `#main_best`(카드 6개: 정식라이센스/프로모션·이벤트/편리한로그인/원활한소통/실시간코드/다양한결제, 앞 3개는 btn_link 있음). client Splide.
    4. **content §3** h3 + 퍼블리셔 그리드 `.section_container2 > .section_item3`(img) 반복
  - `app_search.html` offcanvas → `MobileAppSearch` 재사용 (죽은 offcanvas, DOM parity)
  - bottom_menu + sidebar (layout chrome)
- 세션/권한 의존: 없음
- 폼/분기/리다이렉트: 없음

### 퍼블리셔 배열 quirk
- PHP `$publisher_array`(code=>name) 69엔트리, **중복 키 "53"(Aspyr, Atari) → PHP 후자 우선 = Atari만 남고 Aspyr 탈락** → 68개 렌더.
- `array_multisort(names, SORT_ASC)` = 이름 오름차순(ASCII strcmp). JS `<` 문자열 비교로 동일.
- `$publisher_link`는 계산되나 **마크업에 미출력**(죽은 코드). img만 렌더: `v4/{name}_partners_contents_0.png?3`, alt/title=name. (PC의 hover 스왑·링크 없음)

## 모바일 head / 앱셸
- viewport: `width=device-width, scale 1 고정, viewport-fit=cover`, theme #000, `mobile-web-app-capable`(apple 아님)
- title="서비스 소개", description/keywords 빈값
- 폰트: Noto Sans KR(CSS 다수 사용) → 페이지 `<link>` 로드
- CSS: 전역 style.css/dg_style.css/styleguide.css(`/m/layout.tsx`) + **페이지 인라인 `<style>` 전체 verbatim 이식**(`/assets/`→`/mobile-assets/` 치환). 마스트헤드bg/progressbar li:before 배경이미지 URL 포함.
  - **Swiper CDN CSS(`swiper-bundle.min.css`)와 `.swiper-*` 규칙**: 캐러셀은 Splide(`.splide__*`)라 swiper 요소 부재 → 매칭 없음. CDN CSS `<link>`는 미로드(시각 no-op). 인라인 `.swiper-*` 규칙은 verbatim 블록에 포함되나 무효.
  - `#container`/`#header`/`header .gnb` 규칙: 해당 요소 없음(PC 셀렉터 잔재) → 무효(verbatim 유지).
- Splide JS: 홈과 동일 CDN(`@splidejs/splide@4.1.4`) `<Script>` 로드(캐러셀 마운트).
- 사용 앱셸: `MobileSubHeader("서비스 소개")` + `MobileAppSearch` + bottom-nav + sidebar + dialogs

## 데이터
- 재사용 엔티티: **없음** (하드코딩 배열). readFile/fetch 없음.
- 모바일 전용 동작: 마스트헤드 높이 JS, 혜택 캐러셀 Splide

## API 계약 (증분만)
- **없음**

## 타겟 매핑
- middleware MOBILE_ROUTES 추가: `"/service/service.html"`
- 라우트: `app/m/service/service.html/page.tsx` (server, 인라인 style + Noto Sans KR link + Splide Script)
- screen: `screens/mobile-service-intro` (server) — MobileSubHeader/MobileAppSearch 재사용 + 정적 마크업 + 퍼블리셔 그리드
  - client leaf: `MobileServiceMastheadBg`(높이 계산), `MobileServiceBenefitCarousel`(useSplide)
- 신규 UI: screen-local client leaf 2종. 신규 위젯 없음.
- 재사용 자산: `public/mobile-assets/images/service/*`(00/01/02 계열) + `v4/*_partners_contents_0.png`(69장 존재 확인, 누락 0) — **복사 불필요**
- mock: 없음

## 보존할 legacy quirk
- 퍼블리셔 중복키 53 → Atari, Aspyr 탈락
- publisher_link 미출력(img만)
- swiper CSS 무효(요소 부재), #container/#header 규칙 무효
- 마스트헤드 높이 JS 1회 계산(resize 리스너 없음)
- 캐러셀 `.mount(Extensions)`의 Extensions=undefined → 확장 없이 마운트(grid 미사용)

## Parity 체크리스트 (모바일 UA)
- [ ] 헤더(검색토글+장바구니) = MobileSubHeader
- [ ] 마스트헤드 배경이미지·태그·h2int로고·높이비율(460:540)
- [ ] progressbar 3단(가운데 active) + 안내문
- [ ] 혜택 캐러셀 6카드(앞3 btn_link) Splide 동작(loop/pagination/arrows/padding50/gap1.5em)
- [ ] 퍼블리셔 그리드 68개(이름순, Aspyr 없음), img 경로 ?3
- [ ] Noto Sans KR 폰트 적용, 인라인 style 시각 일치
- [ ] app_search offcanvas DOM 존재
- [ ] 모바일 head/viewport(title="서비스 소개", theme#000)
- [ ] middleware rewrite: 모바일 UA→/m, 데스크톱→PC service-intro 유지
