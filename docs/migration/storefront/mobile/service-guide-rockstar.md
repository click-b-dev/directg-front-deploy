# 모바일 이용가이드 Rockstar Games (guide_rockstar + step1~4)

## 원본 (legacy mobile)
- 파일: `mobile/service/guide_rockstar.html`(허브) + `guide_rockstar_step1~4.html`(캐러셀 4종)
- PC 대응: `screens/service-guide-rockstar`(정적, entity 없음)
- 선례: Epic(`service-guide-epic.md`) 구조 계승 — 허브 `.section-title`+full-height, step bg-primary 헤더·`ul.text-start`·section wrap(slide1)·footer 재사용
- **정적**(DB/AJAX/session 없음). 이미지 외부 CDN 직접 참조.

## ⚠️ legacy 복붙 버그 (전부 verbatim 보존)
- 허브: title "RockStar Games 이용안내"(대문자 S), `.section-title`="RockStar Games", keywords="l", base.js cruft
- **pageTitle이 허브 링크 라벨과 대부분 불일치**(Epic 복붙 미편집):
  - step1 pageTitle "가입 및 계정만들기" ≠ 허브 "제품 키 확인 및 활성화"
  - step3 pageTitle "락스타 게임즈 런처 설치" ≠ 허브 "클라이언트 설치하기"
  - step4 pageTitle "가입 및 계정만들기" ≠ 허브 "라이브러리 게임 등록 및 플레이"
- step1 title "이용안내(Rock Games)"(오타), step4 title "이용안내(Epic Games)"(Epic 복붙)
- step1: 슬라이드 heading h3(slide1)/**h2**(slide2~6) 혼용·이미지가 **Epic 파일**(`KR_Guide_epic_A_02~06.jpg`, slide1만 `KR_Guide_Rockstar_A_01.jpg`)·경로 `upload/guide/`(타 step은 `upload/ezwel/guide/mobile/`)·**slide4/5/6 본문이 heading과 무관**(Epic 복붙)·**slide5 `<p>` 미종료**(malformed, 브라우저 auto-close → 닫힌 `<p>`로 렌더)·img `mb-4`·footer "Rockstar  목록"(공백 2개)·btn-lg
- step2: 닫기 href **`/service/guide_epic.html`**(타 step은 guide_rockstar.html)·slide6 h3 "락스타 게임즈 각종 설정 선택" ≠ img alt "인증용 보안 코드 입력"·straight quote `"4. 계정 정보 입력"`
- footer 게임 버튼 라벨 상이: step1/2 "Rockstar 목록"(step1은 공백2), step3/4 "락스타 게임즈 목록"

## 화면·플로우

### 허브 `guide_rockstar.html`
- URL `/service/guide_rockstar.html`, title "RockStar Games 이용안내"
- `MobileSubHeader` + `#appCapsuleSub.mt-0.full-height` > `.section.full.mt-2` > `.section-title`("RockStar Games") + `ul.listview.link-listview`(4링크: step1 제품 키 확인 및 활성화 / step2 가입 및 계정만들기 / step3 클라이언트 설치하기 / step4 라이브러리 게임 등록 및 플레이)
- bottom_menu+sidebar(chrome 표시). base.js cruft 미이식.

### step1~4 공통
- 헤더 `div.appHeader.no-border.bg-primary`(step1 mt-0 없음, step2~4 mt-0) + pageTitle + 닫기(→`guide_rockstar.html`, **step2만 guide_epic.html**), 닫기 클래스 `close-button text-white`
- `#appCapsule`(step1 class 없음, step2~4 mt-0) > `.carousel-slider.splide#carousel-slider > .splide__track > ul.splide__list.text-start` > `li.splide__slide.p-2` + `.carousel-button-footer`
- slide1은 `.section.full.mt-2` wrap + img(title만, alt 없음); slide2~ 는 미wrap + img alt+title
- Splide: type loop / perPage 1 / arrows false → useSplide 재현. pagination `<style>` 없음. bottom_menu 없음 → page `<style> .appBottomMenu{display:none}`
- footer: 뒤로 가기(goBack) + `/game/game_platform_list.html?platform=35`(라벨 step별 상이). step1만 btn-lg
- step 구성:
  | step | pageTitle | 슬라이드 | 이미지 | footer 라벨 |
  |---|---|---|---|---|
  | 1 | 가입 및 계정만들기 | 6(h3+h2×5) | slide1 `upload/guide/KR_Guide_Rockstar_A_01`·slide2~6 `upload/guide/KR_Guide_epic_A_02~06`(mb-4) | "Rockstar  목록"(공백2), btn-lg |
  | 2 | 가입 및 계정만들기 | 7 | `ezwel/guide/mobile/M_KR_Guide_Rockstar_A_01~07`(mb-2) | "Rockstar 목록" |
  | 3 | 락스타 게임즈 런처 설치 | 3 | `..._Rockstar_B_01~03` | "락스타 게임즈 목록" |
  | 4 | 가입 및 계정만들기 | 6 | `..._Rockstar_C_01~06` | "락스타 게임즈 목록" |

## 모바일 head / 앱셸
- viewport device-width scale 고정 viewport-fit cover, theme #000, apple-web-app
- title: 허브 "RockStar Games 이용안내", step1 "이용안내(Rock Games)", step2/3 "이용안내(Rockstar Games)", step4 "이용안내(Epic Games)". description/keywords 빈값(허브 keywords="l")
- 앱셸: 허브=MobileSubHeader+bottom-nav(표시) / step=인라인 커스텀 헤더+footer+bottom-nav(숨김)

## 데이터 / API 계약
- **없음**(정적). 이미지 외부 CDN 직접 참조(step1은 `upload/guide/`, step2~4는 `upload/ezwel/guide/mobile/`). 외부 링크 `socialclub.rockstargames.com`(target _blank) verbatim.

## 타겟 매핑
- middleware MOBILE_ROUTES +5: `/service/guide_rockstar.html`, `/service/guide_rockstar_step1~4.html`
- 라우트: `app/m/service/guide_rockstar.html`(허브) + `guide_rockstar_step1~4.html`(STEP_STYLE 하단바 숨김 + Splide Script)
- screen: `screens/mobile-service-guide-rockstar`(허브) + `screens/mobile-service-guide-rockstar-step`(단일 step screen + `ROCKSTAR_STEPS[1~4]` JSX 데이터)
- 신규 UI: `widgets/mobile-guide-carousel`에 **`MobileGuideCarouselShell`** 추가(client, children/ulClassName, useSplide) — Rockstar 사용(Epic 로컬 shell과 별개, 향후 통합 가능)
- 재사용/확장: `MobileGuideFooter`(backLabel "뒤로 가기"/gameHref platform=35/gameLabel 데이터/buttonClassName step1 "btn-lg") · `MobileSubHeader`(허브)
- mock: 없음

## 보존할 legacy quirk (요약 — 위 ⚠️ 참조)
- pageTitle/허브 라벨 불일치, title 오타(Rock/Epic), h2/h3 혼용, Epic 이미지 복붙, 경로 상이, 내용 heading 불일치, slide5 malformed p, close href step2 epic, footer 라벨/공백 상이
- 외부 링크 target=_blank → rel=noreferrer(프로젝트 관행, refund/epic 선례)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 허브 MobileSubHeader("RockStar Games 이용안내") + section-title + full-height + 4링크 + 하단 네비
- [x] step 헤더(bg-primary, mt-0 유무, pageTitle, close href step2 epic) verbatim
- [x] step 슬라이드(h2/h3·이미지 URL/경로·alt 유무·내용 복붙·slide5 닫힘) verbatim, text-start
- [x] footer(뒤로 가기 + 게임 라벨 step별·platform=35·step1 btn-lg)
- [x] step 하단 네비 숨김
- [x] title 오타(Rock/Epic)·허브 keywords="l"
- [x] middleware rewrite 5경로 + 데스크톱 폴백
- 승인 시 확인된 이탈(개발자 수용): legacy 복붙 버그 전부 verbatim 이식(title 오타·pageTitle 불일치·Epic 이미지·close href·footer 라벨). 외부 링크 rel=noreferrer(관행). malformed `<p>`는 닫힘 렌더(DOM 동일).
