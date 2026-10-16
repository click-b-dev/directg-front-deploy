# 모바일 이용가이드 Steam (guide_steam + step1~5)

## 원본 (legacy mobile)
- 파일: `mobile/service/guide_steam.html`(허브) + `guide_steam_step1~5.html`(캐러셀 5종)
- PC 대응 단위: `docs/migration/storefront/service/guide.md`(`service-guide-steam`) — PC는 단일 탭형 화면, 모바일은 허브+step 분리 구조. **데이터 없음(전부 정적)** → entity 재사용 대상 없음.
- 모바일 선례: `docs/migration/storefront/mobile/service-guide.md`(guide 일반) — 허브/step/footer/캐러셀 패턴 계승.
- 기능 단위(허브+5 step)로 묶어 링크 parity 확보(guide 일반 선례, 개발자 승인 기준).

## 화면·플로우 (legacy mobile 기준)

### 허브 `guide_steam.html`
- URL: `/service/guide_steam.html`, title `Steam 이용안내`
- 헤더: `inc/sub_header.html` → `MobileSubHeader("Steam 이용안내")`
- 본문: `#appCapsuleSub.mt-0`(**full-height 없음** — 일반 허브와 차이) > `.section.full.mt-2` > `.listview-title.mt-2.fs-5`("Steam") + `ul.listview.link-listview` (li 5):
  - 제품 키 확인 및 활성화 → `/service/guide_steam_step1.html`
  - 가입 및 계정만들기 → `/service/guide_steam_step2.html`
  - 클라이언트 설치하기 → `/service/guide_steam_step3.html`
  - 라이브러리 게임 등록 및 플레이 → `/service/guide_steam_step4.html`
  - 코드 중복 입력 대처법 → `/service/guide_steam_step5.html`
- bottom_menu + sidebar 포함(layout chrome, 하단 네비 표시)
- **dead 캐러셀 스크립트 없음**(일반 허브의 `#carousel-slider2`와 달리 hub는 Splide init 없음)

### step1~5 공통 구조
- 헤더: **커스텀** `div.appHeader.no-border.transparent.mt-0`(좌 빈칸 / pageTitle / 우 닫기 `ion-icon close`→`/index.html`). sub_header 아님.
- 본문: `#appCapsule.mt-0`(Sub 아님) > `.carousel-slider.splide#carousel-slider > .splide__track > ul.splide__list`(li.splide__slide.p-2) + `.carousel-button-footer`
- **bottom_menu/sidebar 없음** → `/m/layout` 전역 `MobileBottomNav`를 page `<style> .appBottomMenu{display:none}`로 숨김(guide 일반 선례, 공유 레이아웃 무수정)
- Splide: `type loop / perPage 1 / arrows false`(step2만 perMove 1 추가, 무의미) — grid gap 옵션 있으나 perPage1이라 시각 무영향 → `useSplide` loop/perPage1/arrows false로 재현
- footer: `뒤로 가기`(goBack) + `/game/game_platform_list.html?platform=1`(Steam 게임목록) — **일반과 링크/라벨 다름**
- 각 step 상세:
  | step | pageTitle | 슬라이드 | 이미지 | footer 게임버튼 | 비고 |
  |---|---|---|---|---|---|
  | 1 | 제품 키 확인 및 활성화 | 3 (텍스트만) | 없음 | "Steam 게임목록" | 이미지 없는 텍스트 캐러셀 |
  | 2 | 스팀(Steam) 가입 및 계정 만들기 | 6 | A_01~A_06 (mb-2) | "Steam 게임" (버튼 fs-6) | **pagination `<style>` 있음** |
  | 3 | 스팀(Steam) 클라이언트 설치하기 | 2 | B_01~B_02 (mb-2) | "Steam 게임목록" | meta desc/keywords 템플릿 잔재 |
  | 4 | 라이브러리 게임 등록 및 플레이 | 10 | C_01~C_10 (mb-2) | "Steam 게임목록" | 9번 항목 2슬라이드·마지막 p 잘림 verbatim |
  | 5 | 코드 중복 입력 대처법 | 5 | D_01~D_05 (mb-4) | "Steam 게임목록" | alt/title이 step2 복붙 잔재 quirk·meta 템플릿 잔재 |

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`, theme-color `#000000`, apple-web-app 메타 (기존 route 패턴)
- title: 허브 `Steam 이용안내`, step1~5 `이용안내(Steam)`. description/keywords: step1/2/4 빈값, step3/5 `Mobilekit HTML Mobile UI Kit`(+ 템플릿 keywords) — 잔재 verbatim
- 사용 앱셸: 허브=`MobileSubHeader` + bottom-nav(표시) / step=커스텀 헤더(인라인) + `MobileGuideFooter` + bottom-nav(숨김)
- 페이지 CSS: step2만 `.carousel-slider .splide__pagination{bottom:5rem}` + active white. 전 step `.appBottomMenu{display:none}`.

## 데이터 / API 계약
- **없음** (전부 정적). entity/fetcher/MSW 불필요. 이미지는 외부 CDN(`https://directg.diskn.com/upload/ezwel/guide/mobile/M_KR_Guide_steam_*.jpg`) 직접 참조 — 자산 복사 없음.

## 타겟 매핑
- middleware MOBILE_ROUTES +6: `/service/guide_steam.html`, `/service/guide_steam_step1~5.html`
- 라우트: `app/m/service/guide_steam.html/page.tsx`(허브) + `guide_steam_step1~5.html/page.tsx`(각 STEP_STYLE + Splide Script)
- screen: `screens/mobile-service-guide-steam`(허브) + `screens/mobile-service-guide-steam-step1~5`
- 신규 UI: `widgets/mobile-guide-carousel`(client, 데이터 주도 `slides` — img/alt/heading/body, `useSplide` loop/perPage1/arrows false) — 5 step + 향후 epic/rockstar 재사용
- 재사용/확장: `MobileGuideFooter`에 옵션 props(backLabel/gameHref/gameLabel/buttonClassName) 추가(기본값=일반 동작 유지, 하위호환) · `MobileSubHeader`(허브)
- mock: 없음

## 보존할 legacy quirk
- 허브 full-height 없음(일반 허브와 차이), dead 캐러셀 스크립트 없음
- step1 이미지 없는 텍스트 캐러셀(3슬라이드)
- step2만 pagination `<style>`, footer 버튼 fs-6·라벨 "Steam 게임"
- step4 "9. 게임 플레이" 2슬라이드, 마지막 슬라이드 p 잘림("…나타나는 ")
- step5 img `mb-4`, alt/title이 step2 복붙("가입 및 로그인" 등 h3와 불일치)
- step3/step5 meta description="Mobilekit HTML Mobile UI Kit"·template keywords
- footer 링크 `/game/game_platform_list.html?platform=1`(legacy 값 유지)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 허브: MobileSubHeader("Steam 이용안내") + listview 5링크 + 하단 네비 표시
- [x] step1~5: 커스텀 투명헤더(pageTitle/닫기→/index.html) + 캐러셀 + footer, 하단 네비 숨김
- [x] 각 step 슬라이드 수·텍스트·이미지(CDN URL·mb-2/mb-4·alt/title) verbatim
- [x] step2 pagination style·버튼 fs-6·"Steam 게임" 라벨
- [x] footer 뒤로 가기 goBack + Steam 게임목록 링크(platform=1)
- [x] 모바일 head/viewport/title(허브 vs step)·step3/5 meta 잔재
- [x] middleware rewrite 6경로 + 데스크톱 폴백
