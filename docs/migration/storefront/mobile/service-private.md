# 모바일 개인정보처리방침 (service/private)

## 원본 (legacy mobile)
- 파일: `mobile/service/private.html` (라이브 — `mobile/index.php` UA 분기 하위 service 도메인)
- PC 대응 단위: `docs/migration/storefront/service/private.md` (screen `service-private`, agreement 동형)
- 모바일 동형 단위: `docs/migration/storefront/mobile/service-agreement.md` (**agreement와 완전 동형** — page_title·txt만 다름)
- 데이터: `pc/service/private.txt`를 `<pre>`에 raw include (`/../pc//service/private.txt`)
  - **PC와 차이: 모바일은 `?date` 버전 스위치 없음** — 항상 현행 `private.txt`만.

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터 (.html 경로): `/service/private.html` — 파라미터 없음
- 화면 요소 / 마크업 조각: agreement.html과 **byte 단위 동일 구조**, page_title="개인정보처리방침" / txt=`private.txt`만 차이
  - 인라인 헤더 `div.appHeader.appHeaderSub.bg-primary.text-light` (goBack + pageTitle + **빈 right**)
  - `#appCapsuleSub.full-height` > `.section.full.mt-2` > `.wide-block.pt-2` > `pre.p-1`(private.txt raw HTML inline)
  - bottom_menu.html + sidebar.html (레이아웃 chrome — `/m/layout.tsx` 소유)
- 폼 필드/검증: 없음
- 분기/리다이렉트: 없음
- 세션/권한 의존: **없음** (비로그인 접근 가능)

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`
- theme-color `#000000`, apple-mobile-web-app-capable=yes, status-bar-style=black-translucent, manifest
- title = "개인정보처리방침", description="", keywords="" (빈값)
- CSS: 전부 `/m/layout.tsx` 전역 로드분 (페이지 추가 불필요)
- 페이지 인라인 `<style>`: `pre { white-space: pre-wrap; -moz/-o-pre-wrap; word-wrap: break-word; line-height:150% }` (agreement와 동일)
- 사용 앱셸: `MobileSimpleSubHeader(pageTitle="개인정보처리방침")` **재사용** + bottom-nav + sidebar + dialogs(layout 공유)

## 데이터
- 재사용 엔티티: **없음** (정적 txt). `readFile("public/service/private.txt")` 서버 인라인.
- 모바일 전용 동작(증분/AJAX): 없음

## API 계약 (증분만, 백엔드 전달)
- **없음** — 데이터 페칭 전무.

## 타겟 매핑
- middleware MOBILE_ROUTES 추가 경로: `"/service/private.html"`
- 라우트: `app/m/service/private.html/page.tsx` (server, `readFile` private.txt → screen 전달, viewport/metadata)
- screen: `screens/mobile-service-private` (신규) — `MobileSimpleSubHeader` 재사용 + `#appCapsuleSub` + `<pre>`(dangerouslySetInnerHTML)
- 신규 UI: 없음 (`widgets/mobile-simple-sub-header` **재사용** — agreement 단위에서 생성)
- 재사용 자산: `public/service/private.txt` (기존, PC 이관분)
- mock: 없음

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치 (appHeaderSub 헤더 + appCapsuleSub + pre)
- [ ] 헤더 right 비어있음 (검색/장바구니 미출력)
- [ ] private.txt 내 태그가 pre 안에서 렌더
- [ ] `?date` 파라미터 없음 — 항상 현행 (PC 버전 스위치 미이식 확인)
- [ ] pre 인라인 스타일(white-space:pre-wrap + line-height:150%) 적용
- [ ] 모바일 head/viewport 일치 (title="개인정보처리방침", theme #000, scale 고정)
- [ ] goBack 동작 (referrer 있으면 history.back, 없으면 "/")
- [ ] middleware rewrite: 모바일 UA→/m/service/private.html, 데스크톱 UA→PC service-private 유지
