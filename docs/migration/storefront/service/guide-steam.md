# 스팀(STEAM) 이용안내

> service 도메인 2번째 단위. `aside_service` 공통 aside 재사용(active=`guide_steam`).
> aside 메뉴가 guide·guide_steam 2페이지 공유가 되어 `widgets/service-aside`(aside_service.html 등가)로 추출,
> 기존 `screens/service-guide`도 이를 사용하도록 정리(출력 동일 — guide parity 불변).

## 원본
- 파일: `pc/service/guide_steam.html` (라이브 — `aside_service.html` include, active `guide_steam`)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`
- 선행 단위: `service/guide.md` (동일 레이아웃/aside 셸)

## 화면·플로우
- 진입 URL/파라미터: `/service/guide_steam.html` (파라미터 없음, GET)
- 레이아웃: guide.html과 동일 (`container my-3 pb-5` > `main.d-grid (240px auto)` > `ServiceAside` + `section#content`). 단, 본문 wrapper `div.main mb-5`, 탭 `nav-tabs nav-bordered mb-3` (guide는 `.main`, `mb-0`)
- 화면 요소:
  - 좌측 aside "이용안내" (guide와 동일 5항목, active=스팀)
  - 우측 **5개 탭** (첫 탭만 active):
    1. `#steam-b1` "제품 키 확인 및 활성화" — 3단계 (이미지 없음)
    2. `#steam-b2` "가입 및 계정 만들기" — 6단계 (각 `<img>` 가이드 이미지)
    3. `#steam-b3` "클라이언트 설치하기" — 2단계 (`<img>`)
    4. `#steam-b4` "라이브러리 게임 등록 및 플레이" — 9단계 (`<img>`, 마지막 단계 2장)
    5. `#steam-b5` "코드 중복 입력 대처법" — 5단계 (`<img>`)
  - 강조: `text-warning`(버튼/메뉴명), `text-danger`(①② 마커), 곡선따옴표 `‘’`·`“”` 원문 유지
- 폼 필드/검증: 없음 (정적)
- 분기/리다이렉트: 없음. 탭 전환은 Bootstrap 탭 JS(전역 번들)로 클라이언트 처리
- 세션/권한 의존: 없음 (비로그인 접근)

## SSR·SEO (legacy)
- `<title>스팀(STEAM) 이용안내</title>` (`$page_title`)
- viewport `width=device-width, initial-scale=1.0`, description 빈값, author `H2interactive`
- canonical/OG/구조화 데이터: 없음
- 페이지별 CSS/자산: 추가 없음 (`header_common.html` 공통 head만). guide 전용 CSS 불필요
- SSR/CSR: 정적 SSR 마크업. 탭 인터랙션만 Bootstrap JS(전역). 별도 `'use client'` 불필요

## 데이터 (legacy)
- 도메인 클래스/SQL/AJAX/POST: **없음** (정적 안내)
- 이미지: `https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_steam_*.jpg` (외부 CDN, src 원문 유지)
  - legacy 버그: tab2 4번째 이미지 경로 `guide/pc//KR_Guide_steam_A_04.jpg` (더블 슬래시) — 그대로 이식

## 결제(PG)
- 해당 없음

## API 계약 (백엔드 전달)
- **없음** — 정적 페이지.

## 타겟 매핑
- 라우트: `app/service/guide_steam.html/page.tsx` → `/service/guide_steam.html`
- screen: `screens/service-guide-steam`
- widget: `widgets/service-aside`(신규, aside_service 등가) — 위 `widgets/site-aside` 셸 사용. `screens/service-guide`도 이 위젯으로 정리
- entities/mock: 없음

## Parity 체크리스트
- [ ] aside 5항목 + active(스팀) 일치
- [ ] 5개 탭 제목·순서·active(첫 탭) 일치
- [ ] 각 탭 단계 수(3/6/2/9/5) 및 텍스트·강조·곡선따옴표 일치
- [ ] 이미지 src(더블슬래시 버그 포함)·alt·title 일치
- [ ] SEO(title/viewport/description/author) 일치, canonical/OG 없음
- [ ] 탭 전환 동작 (Bootstrap)
