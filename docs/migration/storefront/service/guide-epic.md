# 에픽 게임즈(EPIC GAMES) 이용안내

> service 도메인 3번째 단위. `widgets/service-aside`(active=`guide_epic`)·`site-aside` 재사용(위젯 변경 없음).
> 구조는 guide_steam과 동형(5탭 + 이미지). 정적 페이지.

## 원본
- 파일: `pc/service/guide_epic.html` (라이브 — `aside_service.html` include, active `guide_epic`)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`
- 선행 단위: `service/guide-steam.md` (동일 레이아웃/탭 패턴)

## 화면·플로우
- 진입 URL: `/service/guide_epic.html` (파라미터 없음, GET)
- 레이아웃: 동일 (`container` > `main.d-grid(240px auto)` > `ServiceAside` + `section#content`). 본문 wrapper **`div.main`**(steam은 `.main mb-5`), 탭 `nav-tabs nav-bordered mb-3`
- 화면 요소:
  - 좌측 aside "이용안내" 5항목, active=에픽 게임즈
  - 우측 **5개 탭**(첫 탭만 active):
    1. `#epic-b1` "제품 키 확인 및 활성화" — 4단계, **이미지 없음**, backtick 강조(`` `구매하기` ``·`` `마이페이지 > 주문완료 내역` ``)
    2. `#epic-b2` "가입 및 계정 만들기" — 6단계 + img, `text-danger ①②③④⑤⑦⑧⑨⑩`(**⑥ 누락 — legacy 원문**), `text-warning`, 곡선따옴표, `<br/>`
    3. `#epic-b3` "클라이언트 설치하기" — 2단계 + img
    4. `#epic-b4` "라이브러리 게임 등록 및 플레이" — 7단계 + img (item3 `p.text-muted.mb-2` — font-14 없음)
    5. `#epic-b5` "등록 불가 상황 대처법"(탭 라벨) / h4는 "본인(성인) 인증 및 홈페이지를 통한 제품 등록 안내" — 5단계 + img
- 폼/검증/분기: 없음. 탭 전환은 Bootstrap 탭 JS(전역)
- 세션/권한 의존: 없음

## SSR·SEO (legacy)
- `<title>에픽 게임즈(EPIC GAMES) 이용안내</title>`
- viewport `width=device-width, initial-scale=1.0`, description 빈값
- **`<meta name="author" content="">` — author 빈값**(guide/steam은 "H2interactive". epic만 빈값 — 원문 유지)
- canonical/OG/구조화 데이터: 없음
- 페이지별 CSS/자산: 추가 없음(공통 head만). 전용 CSS 불필요
- SSR/CSR: 정적 SSR + 탭 Bootstrap JS. `'use client'` 불필요

## 데이터 (legacy)
- 도메인 클래스/SQL/AJAX/POST: 없음
- 이미지: `https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_epic_*.jpg` (외부 CDN, src 원문)

## legacy 버그/특이점 (그대로 이식)
- tab5 1번째 링크 `target="blank"` (밑줄 없는 변형 — steam은 `_blank`)
- alt/title trailing space·중복 space (예: "가입양식 입력 및 이용약관과 동의서 확인 ", "에픽 게임즈  메인 페이지")
- text-danger 마커 ⑥ 누락 (⑤ → ⑦)

## API 계약 (백엔드 전달)
- **없음** — 정적 페이지.

## 타겟 매핑
- 라우트: `app/service/guide_epic.html/page.tsx` → `/service/guide_epic.html`
- screen: `screens/service-guide-epic`
- widget: `widgets/service-aside`(active=guide_epic) 재사용 — 변경 없음
- entities/mock: 없음

## Parity 체크리스트
- [ ] aside active(에픽) 일치
- [ ] 5개 탭 제목·순서·active 일치
- [ ] 각 탭 단계 수(4/6/2/7/5)·텍스트·강조·따옴표 일치
- [ ] 이미지 src·alt(trailing space 포함)·title 일치
- [ ] text-danger 마커(⑥ 누락 포함)·`target="blank"` 버그 이식
- [ ] SEO: title/viewport/description 일치, **author 빈값** 유지, canonical/OG 없음
