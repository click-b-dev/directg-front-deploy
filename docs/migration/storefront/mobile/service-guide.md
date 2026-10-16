# 모바일 이용가이드 일반 (service/guide + guide_step1 + guide_step2)

## 원본 (legacy mobile)
- 파일: `mobile/service/guide.html`(허브) + `guide_step1.html`(회원가입) + `guide_step2.html`(구매방법)
- PC 대응 단위: `docs/migration/storefront/service/guide.md` (screen `service-guide`)
  - **PC와 구조 상이**: PC `guide.html`은 허브가 아니라 "구매방법" 내용을 직접 렌더(탭+7단계 list). 모바일은 `guide.html`=허브(2링크), 실제 내용은 step 페이지에 분리.
  - step 페이지는 **PC에 없음** → 데이터/entity 재사용 대상 없음(전부 정적). 기능 단위(허브+step)로 묶어 링크 동작 parity 확보(개발자 승인).
- 데이터: **없음** (전부 정적). DB/AJAX/session 없음.

## 화면·플로우 (legacy mobile 기준)

### 허브 `guide.html`
- URL: `/service/guide.html`
- 헤더: `inc/sub_header.html` → `MobileSubHeader("다이렉트 게임즈 이용안내")`
- 본문: `#appCapsuleSub.mt-0.full-height` > `.section.full.mt-2` > `.listview-title.mt-2.fs-5`("다이렉트 게임즈") + `ul.listview.link-listview`(li 2: 회원가입→`/service/guide_step1.html`, 구매방법→`/service/guide_step2.html`)
- bottom_menu + sidebar 포함(레이아웃 chrome) → 하단 네비 표시(정상)
- 말미 `<script>` `new Splide('#carousel-slider2')` — **`#carousel-slider2` 요소 없음 → dead(미이식)**

### step1 `guide_step1.html` (회원가입)
- URL: `/service/guide_step1.html`
- 헤더: `sub_header.html` → `MobileSubHeader("회원가입")`
- 본문: `#appCapsuleSub.mt-0` > `.carousel-slider.splide#carousel-slider`(슬라이드 구조 없이 텍스트 **"회원가입 안내"**만 — 사실상 스텁) + `.carousel-button-footer`(뒤로가기 goBack / 게임 목록 `/game/game.html`)
- **bottom_menu/sidebar 없음** (legacy 미포함)
- Splide init은 `#carousel-slider`에 `.splide__track` 없어 마운트 불가 → 텍스트만 표시. **useSplide 미적용**(캐러셀 no-op 재현).
- 페이지 `<style>`: `.carousel-slider .splide__pagination{bottom:5rem}` + active white

### step2 `guide_step2.html` (구매방법)
- URL: `/service/guide_step2.html`
- 헤더: **커스텀** `div.appHeader.no-border.transparent.mt-0`(좌 빈칸 / pageTitle "다이렉트 게임즈 구매방법" / 우 닫기 `ion-icon close`→`/index.html`). sub_header 아님.
- 본문: `#appCapsule.mt-0`(Sub 아님) > `.carousel-slider.splide#carousel-slider` > `.splide__track > ul.splide__list` **9 슬라이드**(7단계, step3·step6 각 2슬라이드): 각 `li.splide__slide.p-2` > h3 + p(`.text-warning` 강조 verbatim, 오타 "주문하기\`\`"·"다은/담계" 포함) + img(외부 CDN `https://image.directg.net/upload/ezwel/guide/...jpg`) + `.carousel-button-footer`
- **bottom_menu/sidebar 없음**
- Splide: `type loop / perPage 1 / perMove 1 / arrows false`(pagination 기본 true), grid extension undefined→미적용 → 1장씩 loop + pagination. **useSplide 적용**.

## 앱셸 처리 (중요)
- `/m/layout.tsx`가 **모든 /m 페이지에 `MobileBottomNav` 무조건 렌더** → step1/step2는 legacy에 하단바 없고 `.carousel-button-footer`와 충돌.
- 공유 레이아웃 수정은 기존 20+ 단위 회귀 위험 → **페이지 스코프 `<style>`로 `.appBottomMenu{display:none}`** 하여 step1/step2에서만 하단바 숨김(저위험, DOM은 존재하나 시각 parity 동일). sidebar/dialogs는 기본 hidden(트리거 없음)이라 무영향.

## 데이터 / API 계약
- **없음** (정적). entity/fetcher/MSW 불필요.

## 타겟 매핑
- middleware MOBILE_ROUTES +3: `/service/guide.html`, `/service/guide_step1.html`, `/service/guide_step2.html`
- 라우트: `app/m/service/guide.html/page.tsx`, `guide_step1.html/page.tsx`(bottom nav 숨김 style + pagination style), `guide_step2.html/page.tsx`(bottom nav 숨김 style + pagination style + Splide Script)
- screen: `screens/mobile-service-guide`(허브), `screens/mobile-service-guide-step1`, `screens/mobile-service-guide-step2`
- 신규 UI: `widgets/mobile-guide-footer`(client, 뒤로가기 goBack + 게임목록 `/game/game.html`) — step1/step2 공유. step2 캐러셀은 screen-local client(`useSplide`).
- 재사용: `MobileSubHeader`(허브·step1). 외부 CDN 이미지는 그대로 참조(자산 복사 없음).
- mock: 없음

## 보존할 legacy quirk
- 허브 `#carousel-slider2` Splide 스크립트 dead(미이식)
- step1 캐러셀 콘텐츠 없음("회원가입 안내" 텍스트만)
- step2 오타: "\`주문하기\`\`"(백틱 2개), "다은 단계"·"다음 담계", step3/step6 슬라이드 2분할, img `?1` 버전쿼리 유지
- step2 img 3-4번째는 `_03a/_03b`, 6번째 `_06a/_06b`, 마지막은 `guide/mobile/...07` (다른 것은 `guide/pc/...`)
- footer `/game/game.html` 링크(legacy 값 유지)

## Parity 체크리스트 (모바일 UA)
- [ ] 허브: MobileSubHeader + listview 2링크(step1/step2) + 하단 네비 표시
- [ ] step1: MobileSubHeader("회원가입") + "회원가입 안내" 텍스트 + footer, 하단 네비 숨김
- [ ] step2: 커스텀 투명헤더(닫기→/index.html) + 9슬라이드 캐러셀(loop/pagination) + footer, 하단 네비 숨김
- [ ] step2 슬라이드 텍스트/이미지 verbatim(오타·외부 CDN·?1)
- [ ] footer 뒤로가기 goBack 동작 + 게임목록 링크
- [ ] 모바일 head/viewport(theme#000, 각 title)
- [ ] middleware rewrite 3경로 + 데스크톱 폴백
