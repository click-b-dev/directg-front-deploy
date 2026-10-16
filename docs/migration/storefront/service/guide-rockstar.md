# 락스타 게임즈(ROCKSTAR GAMES) 이용안내

> service 도메인 4번째(마지막 이용가이드) 단위. `widgets/service-aside`(active=`guide_rockstar`) 재사용(위젯 변경 없음).
> steam/epic과 동형이나 더 단순(4탭·평문·이미지 class 없음). 정적 페이지.

## 원본
- 파일: `pc/service/guide_rockstar.html` (라이브 — `aside_service.html` include, active `guide_rockstar`)
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`
- 선행 단위: `service/guide-epic.md`

## 화면·플로우
- 진입 URL: `/service/guide_rockstar.html` (파라미터 없음, GET)
- 레이아웃: 동일. 본문 wrapper **`div.main mb-4`**(guide=없음, steam=mb-5), 탭 `nav-tabs nav-bordered mb-3`
- 화면 요소:
  - 좌측 aside "이용안내" 5항목, active=락스타 게임즈
  - 우측 **4개 탭**(steam/epic은 5탭), 탭 ID **`order-b1~order-b4`**(legacy quirk — rockstar 아닌 order prefix):
    1. `#order-b1` "제품 키 확인 및 활성화" / h4="다이렉트 게임즈 구매방법" — 4단계, **이미지 없음**, backtick 강조(`` `구매하기` ``·`` `마이페이지 > 주문완료 내역` ``)
    2. `#order-b2` "가입 및 계정 만들기" — 7단계 + img
    3. `#order-b3` "클라이언트 설치하기" — 3단계 + img
    4. `#order-b4` "라이브러리 게임 등록 및 플레이" — 6단계 + img
  - **강조 span 없음** — tab2~4는 전부 평문 곡선따옴표(‘’·“”), text-warning/text-danger 미사용. `socialclub.rockstargames.com` URL도 평문(링크 아님)
- 폼/검증/분기: 없음. 탭 전환은 Bootstrap 탭 JS(전역)
- 세션/권한 의존: 없음

## SSR·SEO (legacy)
- `<title>락스타 게임즈(ROCKSTAR GAMES) 이용안내</title>`
- viewport `width=device-width, initial-scale=1.0`, description 빈값, **author `H2interactive`**(epic과 달리 채워짐)
- canonical/OG/구조화 데이터: 없음
- 페이지별 CSS/자산: 추가 없음. 전용 CSS 불필요
- SSR/CSR: 정적 SSR + 탭 Bootstrap JS. `'use client'` 불필요

## 데이터 (legacy)
- 도메인 클래스/SQL/AJAX/POST: 없음
- 이미지: `https://directg.diskn.com/upload/ezwel/guide/pc/KR_Guide_Rockstar_*.jpg` (R 대문자, 외부 CDN, src 원문)
  - **이미지에 `class` 없음**(steam/epic는 `class="mb-2"` — rockstar만 무클래스)

## legacy 버그/특이점 (그대로 이식)
- 탭 ID `order-b*`(rockstar 아님)
- tab4 1번째 이미지 `KR_Guide_Rockstar_B_01.jpg` 재사용 + alt "락스타 게임즈 소셜 클럽 메인 페이지"(내용 불일치), tab4는 C_01 건너뛰고 C_02~C_06
- 이미지 무클래스

## API 계약 (백엔드 전달)
- **없음** — 정적 페이지.

## 타겟 매핑
- 라우트: `app/service/guide_rockstar.html/page.tsx` → `/service/guide_rockstar.html`
- screen: `screens/service-guide-rockstar`
- widget: `widgets/service-aside`(active=guide_rockstar) 재사용 — 변경 없음
- entities/mock: 없음

## Parity 체크리스트
- [ ] aside active(락스타) 일치
- [ ] 4개 탭 제목·순서·탭 ID(order-b*)·active 일치
- [ ] 각 탭 단계 수(4/7/3/6)·평문 텍스트·backtick(tab1) 일치
- [ ] 이미지 src(Rockstar 대문자, tab4 B_01 재사용 버그)·**무클래스**·alt·title 일치
- [ ] SEO: title/viewport/description 일치, author=H2interactive, canonical/OG 없음
