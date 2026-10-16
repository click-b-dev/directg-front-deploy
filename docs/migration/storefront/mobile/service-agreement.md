# 모바일 이용약관 (service/agreement)

## 원본 (legacy mobile)
- 파일: `mobile/service/agreement.html` (라이브 — `mobile/index.php` UA 분기 하위 service 도메인)
- PC 대응 단위: `docs/migration/storefront/service/agreement.md` (screen `service-agreement`, txt 자산 재사용 출처)
- 데이터: `pc/service/agreement.txt`를 `<pre>`에 raw include (`/../pc//service/agreement.txt`)
  - **PC와 차이: 모바일은 `?date` 버전 스위치 없음** — 항상 현행 `agreement.txt`만. 이전 약관 링크/`$old_dates` 로직 전부 없음.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터 (.html 경로): `/service/agreement.html` — 파라미터 없음
- 화면 요소 / 마크업 조각:
  - 인라인 헤더 `div.appHeader.appHeaderSub.bg-primary.text-light` (← sub_header.html include **아님**)
    - `.left > a.headerButton.goBack[href="#"][data-rel=back] > ion-icon[chevron-back-outline]`
    - `.pageTitle` = "이용약관"
    - `.right` **빈 값** (검색 토글·장바구니 **없음** — MobileSubHeader와 다름)
  - `#appCapsuleSub.full-height` > `.section.full.mt-2` > `.wide-block.pt-2` > `pre.p-1`(agreement.txt raw HTML inline)
  - bottom_menu.html + sidebar.html (레이아웃 chrome — `/m/layout.tsx` 소유)
- 폼 필드/검증: 없음
- 분기/리다이렉트: 없음
- 세션/권한 의존: **없음** — `lib.php` include하나 세션 미사용(비로그인 접근 가능)

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover` (dataroom과 동일)
- theme-color `#000000`, apple-mobile-web-app-capable=yes, status-bar-style=black-translucent, manifest
- title = "이용약관", description="", keywords="" (빈값)
- CSS: style.css / Material Icons 폰트 / dg_style.css / styleguide.css — **전부 `/m/layout.tsx` 전역 로드분** (페이지 추가 불필요)
- 페이지 인라인 `<style>`: `pre { white-space: pre-wrap; -moz/-o-pre-wrap; word-wrap: break-word; line-height:150% }`
  - **PC와 다름**: PC는 `text-wrap:auto; font-family Noto Sans KR`. 모바일은 `white-space:pre-wrap + line-height:150%`. 모바일 원문 그대로 이식.
- 사용 앱셸: 인라인 최소 헤더(pageTitle="이용약관") + bottom-nav + sidebar + dialogs(layout 공유)
- 페이지별 mobile-assets CSS: 없음 (전역 스택으로 충분)

## 데이터
- 재사용 엔티티: **없음** (정적 txt). PC도 entity 없이 `readFile("public/service/agreement.txt")` 서버 인라인 — 동일 방식 재사용.
- 모바일 전용 동작(증분/AJAX): 없음

## API 계약 (증분만, 백엔드 전달)
- **없음** — 데이터 페칭 전무. entity/fetcher/MSW 불필요.

## 타겟 매핑
- middleware MOBILE_ROUTES 추가 경로: `"/service/agreement.html"`
- 라우트: `app/m/service/agreement.html/page.tsx` (server, `readFile` agreement.txt → screen 전달, viewport/metadata)
- screen: `screens/mobile-service-agreement` — 최소 헤더 + `#appCapsuleSub` 본문 + `<pre>`(dangerouslySetInnerHTML)
- 신규 UI: `widgets/mobile-simple-sub-header` (`MobileSimpleSubHeader` — `appHeaderSub` 최소 헤더, goBack + pageTitle + 빈 right, 검색/장바구니 없음). service 정적 페이지 후속 단위(private/youthpolicy/guide 등)에서 재사용.
- 재사용 자산: `public/service/agreement.txt` (기존, PC 이관분)
- mock: 없음

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치 (appHeaderSub 헤더 + appCapsuleSub + pre)
- [ ] 헤더 right 비어있음 (검색/장바구니 미출력) — MobileSubHeader와 구분
- [ ] agreement.txt 내 `<h3>` 등 태그가 pre 안에서 렌더
- [ ] `?date` 파라미터 없음 — 항상 현행 약관 (PC 버전 스위치 미이식 확인)
- [ ] pre 인라인 스타일(white-space:pre-wrap + line-height:150%) 적용
- [ ] 모바일 head/viewport 일치 (theme #000, scale 고정)
- [ ] goBack 동작 (referrer 있으면 history.back, 없으면 "/")
- [ ] middleware rewrite: 모바일 UA→/m/service/agreement.html, 데스크톱 UA→PC service-agreement 유지
