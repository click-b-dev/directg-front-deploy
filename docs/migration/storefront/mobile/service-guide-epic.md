# 모바일 이용가이드 Epic (service/guide_epic + step1~5)

## 원본 (legacy mobile)
- 파일: `mobile/service/guide_epic.html`(허브) + `guide_epic_step1~5.html`
- PC 대응: `screens/service-guide-epic`(허브형, PC는 step 없음). 기능 단위(허브+step5)로 묶음 — 이용가이드 일반/Steam 선례(개발자 승인).
- 데이터: **없음**(전부 정적). 슬라이드 이미지는 외부 CDN(`https://directg.diskn.com/upload/ezwel/guide/mobile/...`), 자산 복사 없음.
- 선행 단위: 이용가이드 일반(`widgets/mobile-guide-footer`), Steam(`widgets/mobile-guide-carousel`). **footer는 재사용**. **카caroul은 epic 슬라이드에 인라인 HTML(링크/span/br)이 있어 문자열 기반 `MobileGuideCarousel` 재사용 불가 → epic 전용 shell로 JSX 전사.**

## 화면·플로우

### 허브 `guide_epic.html`
- URL `/service/guide_epic.html`, `MobileSubHeader("Epic Games 이용안내")`
- `#appCapsuleSub.mt-0.full-height` > `.section.full.mt-2` > `.section-title`("Epic Games") + `ul.listview.link-listview`(5링크: step1 제품 키 확인 및 활성화 / step2 가입 및 계정만들기 / step3 클라이언트 설치하기 / step4 라이브러리 게임 등록 및 플레이 / step5 등록 불가 상황 대처법)
- bottom_menu + sidebar 포함(하단 네비 표시)

### step1~5 `guide_epic_stepN.html`
- 헤더: `div.appHeader.no-border.bg-primary`(**step1은 mt-0 없음**, step2~5 `mt-0`) + 빈 left + pageTitle + 닫기 `<a href="/service/guide_epic.html">`(**step1/2/4/5 `close-button text-white`, step3 `headerButton text-white`**)
  - **step5 헤더 pageTitle="본인(성인) 인증 및 홈페이지를 통한 제품 등록 안내"**(허브 라벨 "등록 불가 상황 대처법"과 다름 — verbatim)
- 본문 `#appCapsule`(**step1은 class 없음**, step2~5 `mt-0`) > `.carousel-slider.splide#carousel-slider > .splide__track > ul.splide__list.text-start` > `li.splide__slide.p-2` 반복
- footer `.carousel-button-footer`: 뒤로 가기(goBack) + **Epic 목록**(`/game/game_platform_list.html?platform=34`). **step1만 `btn-lg`**.
- **bottom_menu/sidebar 없음** → page `<style> .appBottomMenu{display:none}` (공유 레이아웃 무수정)
- Splide: `type loop / perPage 1 / arrows false`(pagination 기본 true), grid 미적용. 각 step Splide Script 로드. 페이지 pagination `<style>` **없음**(Steam step2와 달리).
- 슬라이드 구성:
  - step1: **이미지 없음**, 4슬라이드(상품 선택/주문하기/결제하기/주문완료), 각 `li>div.section.full.mt-2>h3+p`. slide1만 `p.fs-6`, slide2~4 `p`(fs-6 없음) — verbatim
  - step2: 6슬라이드. slide1은 `li>div.section.full.mt-2>img+h3+p`(img **alt 없음**, title만), slide2~6은 `li>img+h3+p`(alt+title). 인라인 링크(epicgames store)·`<span class="text-danger fs-5 fw-bold">①..</span>`·`<br/>` 포함
  - step3: 2슬라이드(img+h3+p, 인라인 링크). meta는 **Mobilekit 템플릿 잔재**(description/keywords) verbatim
  - step4: 7슬라이드(img+h3+p)
  - step5: 5슬라이드(img+h3+p, 인라인 링크 3)

## 데이터 / API 계약
- **없음**

## 타겟 매핑
- middleware MOBILE_ROUTES +6: `/service/guide_epic.html`, `/service/guide_epic_step1~5.html`
- 라우트: `app/m/service/guide_epic.html`(허브) + `guide_epic_step1~5.html`(각 Splide Script + `.appBottomMenu{display:none}` style)
- screen: `screens/mobile-service-guide-epic`(허브) + `screens/mobile-service-guide-epic-step`(단일 step screen + `steps.tsx` EPIC_STEPS[1~5] + epic 캐러셀 shell client)
- 신규 UI: epic 캐러셀 shell(client, children, `ul.splide__list.text-start`, useSplide). `MobileGuideFooter`(파라미터화, backLabel "뒤로 가기"/gameHref platform=34/gameLabel "Epic 목록"/buttonClassName step1 "btn-lg") **재사용**.
- 재사용: `MobileSubHeader`(허브). 외부 CDN 이미지 직접 참조.

## 보존할 legacy quirk
- step1 이미지 없음·section wrap·slide2~4 fs-6 없음
- step2 slide1 section wrap·img alt 없음(title만)
- step3 닫기 `headerButton`(타 step `close-button`)·meta 템플릿 잔재
- step5 헤더 pageTitle ≠ 허브 라벨
- 인라인 링크 target=_blank → rel=noreferrer(프로젝트 관행)
- 닫기 href 모두 `/service/guide_epic.html`(index 아님)

## Parity 체크리스트 (모바일 UA) — 개발자 승인 완료 2026-09-14 ✅
- [x] 허브 MobileSubHeader + section-title + 5링크 + 하단 네비
- [x] step 헤더(bg-primary, mt-0 유무, close 클래스, pageTitle) verbatim
- [x] step 캐러셀 슬라이드(이미지/제목/본문·인라인 링크/span/br) verbatim, text-start
- [x] footer(뒤로 가기 goBack + Epic 목록 platform=34, step1 btn-lg)
- [x] step 하단 네비 숨김
- [x] middleware rewrite 6경로 + 데스크톱 폴백(PC service-guide-epic)
- 승인 시 확인된 이탈(개발자 수용): 외부 링크 `target="_blank"`에 `rel="noreferrer"` 추가(refund-policy 선례 프로젝트 관행). 본문 `>`·`'`는 `&gt;`·`&apos;` 표기(렌더 동일).
