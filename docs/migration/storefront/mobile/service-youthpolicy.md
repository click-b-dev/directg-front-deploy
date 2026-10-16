# 모바일 청소년보호정책 (service/youthpolicy)

## 원본 (legacy mobile)
- 파일: `mobile/service/youthpolicy.html` (라이브 — service 도메인)
- PC 대응 단위: `docs/migration/storefront/service/youthpolicy.md` (screen `service-youthpolicy`, 완전 정적 인라인 HTML→JSX)
- 데이터: **없음** — 본문이 하드코딩 정적 HTML (txt include 아님, agreement/private와 다름)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터 (.html 경로): `/service/youthpolicy.html` — 파라미터 없음
- 화면 요소 / 마크업 조각:
  - 인라인 헤더 `div.appHeader.appHeaderSub.bg-primary.text-light` (goBack + pageTitle="청소년 보호정책" + **빈 right**)
  - `#appCapsuleSub.full-height` > `.section.full.mt-2` > `.wide-block.pt-2` 본문(정적):
    - `<p>` 도입 문단 (**typo "반사회적 행위에 대해세는" verbatim 유지**)
    - `<ul>` 활동 5개 항목
    - `<strong>청소년보호 책임자</strong>`
    - `<ul>` 책임자 정보 5개 (이름 김지훈 / 직책 부장 / 소속부서 사업개발부 / 전화 02-6929-3861 / 이메일 mojh@h2int.com)
  - bottom_menu.html + sidebar.html (레이아웃 chrome — `/m/layout.tsx` 소유)
- 폼 필드/검증: 없음
- 분기/리다이렉트: 없음
- 세션/권한 의존: 없음

## 모바일 head / 앱셸
- viewport: `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover`
- theme-color `#000000`, apple-web-app 메타, manifest
- title = "청소년 보호정책"(공백 포함 verbatim), description="", keywords=""
- CSS: 전부 `/m/layout.tsx` 전역 로드분
- 페이지 인라인 `<style>`: `pre {...}` — **`<pre>` 요소 없음 → dead CSS(렌더 무효)**. 렌더 영향 0이라 미이식(behavior parity 유지).
- 사용 앱셸: `MobileSimpleSubHeader(pageTitle="청소년 보호정책")` **재사용** + bottom-nav + sidebar + dialogs

## 데이터
- 재사용 엔티티: **없음** (정적 HTML). readFile도 불필요.
- 모바일 전용 동작(증분/AJAX): 없음

## API 계약 (증분만, 백엔드 전달)
- **없음**

## 타겟 매핑
- middleware MOBILE_ROUTES 추가 경로: `"/service/youthpolicy.html"`
- 라우트: `app/m/service/youthpolicy.html/page.tsx` (server 정적, viewport/metadata만)
- screen: `screens/mobile-service-youthpolicy` (신규) — `MobileSimpleSubHeader` 재사용 + `#appCapsuleSub` + 본문 JSX 전사
- 신규 UI: 없음 (`widgets/mobile-simple-sub-header` 재사용)
- 재사용 자산: 없음 (txt 없음)
- mock: 없음

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치 (appHeaderSub 헤더 + appCapsuleSub + p/ul/strong/ul)
- [ ] 헤더 right 비어있음
- [ ] 본문 텍스트 verbatim (typo "대해세는" 포함, 책임자 정보 5항목)
- [ ] 모바일 head/viewport 일치 (title="청소년 보호정책", theme #000, scale 고정)
- [ ] goBack 동작
- [ ] middleware rewrite: 모바일 UA→/m/service/youthpolicy.html, 데스크톱 UA→PC service-youthpolicy 유지
