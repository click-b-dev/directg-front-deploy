# 모바일 환불정책 (service/refund_policy)

## 원본 (legacy mobile)
- 파일: `mobile/service/refund_policy.html` (라이브 — service 도메인)
- PC 대응 단위: `docs/migration/storefront/service/refund-policy.md` (screen `service-refund-policy`, 완전 정적 인라인 HTML→JSX·디지털/실물 표 2종)
- 데이터: **없음** — 본문이 하드코딩 정적 HTML (txt include 아님)

## 화면·플로우 (legacy mobile 기준)
- 진입 URL/파라미터 (.html 경로): `/service/refund_policy.html` — 파라미터 없음
- 화면 요소 / 마크업 조각:
  - 인라인 헤더 `div.appHeader.appHeaderSub.bg-primary.text-light` (goBack + pageTitle="다이렉트 게임즈 환불정책" + **빈 right**)
  - `#appCapsuleSub.full-height` > `.section.full.mt-2` > `.wide-block.pt-2.font-14` 본문(정적):
    - 도입 `<p class=font-14>`
    - `<h4 class=fw-bold>디지털상품</h4>` + 정의 `<p>` + 고객센터 note `<p>`
    - **디지털 표** `table.table.table-boldered.mb-3` (colgroup col 100%, tbody: `th.table-dark`(섹션제목) / `td.table-light`(내용 ul·중첩ul·텍스트) 반복 12섹션)
    - 고객센터 note `<p>`
    - `<h4 class=fw-bold>실물배송상품</h4>` + 정의 `<p>`(**이 p만 font-14 없음** — verbatim) 
    - **실물 표** `table.table.mb-3` (12섹션 + PlayStation 초기불량 섹션에 외부링크 `target=_blank`)
    - 고객센터 note `<p>`
  - bottom_menu.html + sidebar.html (레이아웃 chrome — `/m/layout.tsx` 소유)
- 폼 필드/검증: 없음
- 분기/리다이렉트: 없음
- 세션/권한 의존: 없음

## 모바일 head / 앱셸
- viewport/theme/apple-web-app/manifest: agreement와 동일 스택
- title = "다이렉트 게임즈 환불정책", description="", keywords=""
- 전역 CSS: `/m/layout.tsx` 로드분
- 페이지 인라인 `<style>`:
  - `.table{font-size:14px;border:1px;border-color:#495057}` / `body.dark-mode-active .table tr{border-color:#495057;border-style:initial}` / `.table th{background:#303D4E}` / `.table td{border-bottom:0}` / `.table-light{background:#191919!important;color:#fff!important}` — **유효(테이블 존재) → 이식 필수**
  - `pre{...}` — `<pre>` 없어 dead → 미이식(렌더 무효)
- 사용 앱셸: `MobileSimpleSubHeader(pageTitle="다이렉트 게임즈 환불정책")` **재사용** + bottom-nav + sidebar + dialogs

## 데이터
- 재사용 엔티티: **없음** (정적 HTML). readFile 불필요.
- 모바일 전용 동작(증분/AJAX): 없음

## API 계약 (증분만, 백엔드 전달)
- **없음**

## 타겟 매핑
- middleware MOBILE_ROUTES 추가 경로: `"/service/refund_policy.html"`
- 라우트: `app/m/service/refund_policy.html/page.tsx` (server 정적, viewport/metadata + 테이블 `<style>`)
- screen: `screens/mobile-service-refund-policy` (신규) — `MobileSimpleSubHeader` 재사용 + 2테이블 JSX 전사
- 신규 UI: 없음 (`widgets/mobile-simple-sub-header` 재사용)
- 재사용 자산: 없음
- mock: 없음

## 보존할 legacy quirk
- 디지털 표 class `table table-boldered mb-3` (오타 "boldered"), 실물 표 class `table mb-3` — 그대로 유지
- 실물배송상품 정의 `<p>`만 `font-14` 클래스 없음 (다른 p는 있음)
- PlayStation 수리접수 링크 `target="_blank"` (legacy는 `rel` 없음)
- 고객센터 운영시간 note `<p>` 3회 반복 (디지털 앞/뒤·실물 뒤)

## Parity 체크리스트 (모바일 UA)
- [ ] 화면 요소 일치 (헤더 + 도입 p + 디지털(h4·정의·note·표) + 실물(h4·정의·표) + note)
- [ ] 헤더 right 비어있음
- [ ] 표 스타일(다크 th #303D4E / td #191919) 적용
- [ ] 표 내용 verbatim (12섹션 × 2, 중첩 ul, 결제수단별 환불정책, PS 외부링크)
- [ ] class quirk(table-boldered / 실물 p font-14 누락) 유지
- [ ] 모바일 head/viewport 일치 (title "다이렉트 게임즈 환불정책", theme #000)
- [ ] goBack 동작
- [ ] middleware rewrite: 모바일 UA→/m, 데스크톱 UA→PC service-refund-policy 유지
