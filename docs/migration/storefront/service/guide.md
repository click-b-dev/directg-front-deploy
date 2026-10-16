# 이용가이드 (구매방법) + 공통 서브페이지 aside 레이아웃 셸

> 단위 재설정 근거: "공통 aside/breadcrumb"는 소비 도메인(service/mypage/board/game)이 전부 미이관이라
> 단독 렌더·parity 검증이 불가. 개발자 승인하에 **공통 aside 레이아웃 셸 + 첫 소비자 service/guide.html**를
> 하나의 단위로 이관한다. breadcrumb은 게임/프로모션 도메인 전용(`$aside['product_type']`)이라 이 단위에서 제외,
> 게임 도메인 이관 시 함께 처리한다.

## 원본
- 파일: `pc/service/guide.html` (라이브 — service 도메인 대표, `aside_service.html` include)
- 공통 aside: `pc/inc/aside_service.html` (실제 include되는 3종 aside 중 하나. 나머지 live: `aside_mypage`(mypage 36곳)·`aside_customer`(board). 죽은 파일: `aside_game/goods/promotion/publisher/search` — 어디서도 include 안 됨)
- 레이아웃 래퍼: `guide.html` 본문 `<div class="container my-3 pb-5"><main class="d-grid gap-3" style="grid-template-columns:240px auto">`
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/OPERATION-POLICY-MAP.md`

## 화면·플로우
- 진입 URL/파라미터: `/service/guide.html` (파라미터 없음, GET)
- 화면 요소 (legacy 기준):
  - 좌측 aside(`#sidebar`, 240px): 제목 "이용안내" + list-group 5항목
    - `- 다이렉트 게임즈` → `/service/guide.html` (현재 페이지, active=`text-primary fw-bold`)
    - `- 스팀` → `/service/guide_steam.html`
    - `- 에픽 게임즈` → `/service/guide_epic.html`
    - `- 락스타 게임즈` → `/service/guide_rockstar.html`
    - `- 홀로 모델` → `https://xr-marketplace.com/ko/holomodels/play/ar` (외부, `target="_blank"`, active 변수 없음)
  - 우측 `section#content.content.rounded-0` > `div.main`:
    - `ul.nav.nav-tabs.nav-bordered` 단일 탭 "구매방법"(`#order-b1`, active, `data-bs-toggle="tab"`)
    - `h4` "다이렉트 게임즈 구매방법"
    - `ol.list-group.list-group-numbered.rounded-0` 7단계(상품 선택 / 장바구니 담기 / 주문하기 / 결제하기 / 주문완료 / 제품 코드 활성화 및 수취확인 / 제품 코드 확인) — 각 항목 `li` > `div.ms-2.me-auto` > `div.font-15`(제목) + `p.text-muted.font-14`(설명, 일부 `<br/>`·`<span class="text-warning">` 강조 포함)
- 폼 필드/검증: 없음 (정적 안내 페이지)
- 분기/리다이렉트: 없음
- 세션/권한 의존: **없음** — `lib.php` include하나 `$_SESSION['member']` 미사용(비로그인 접근 가능). 로그인 게이트 없음.

## SSR·SEO (legacy)
- head: `<title>다이렉트 게임즈(DIRECT GAMES)</title>` (`$page_title`)
- viewport: `width=device-width, initial-scale=1.0` (index.php와 달리 initial-scale 포함)
- `<meta name="description" content="">` (빈값), `<meta name="author" content="H2interactive">`
- canonical/OG/구조화 데이터: **없음**
- 페이지별 CSS/자산: **추가 없음**. `header_common.html`(공통 head)만 로드 → fonts / FA 6.7.2 / Bootstrap 5.3.5 / custom.css / directg.css / styleguide.css / card-list.css.
  - `#sidebar`·`.content`·`.main`은 커스텀 CSS 정의 없음(Bootstrap 유틸 + 인라인 grid로만 스타일). guide 전용 CSS 불필요.
- SSR/CSR: 전 구간 정적 SSR. 단일 탭이라 인터랙션 없음(Bootstrap 탭 JS는 전역 번들로 이미 로드).

## 데이터 (legacy)
- 도메인 클래스·메서드: 없음 (DB 조회 없음)
- SQL: 없음
- AJAX/POST: 없음

## 결제(PG)
- 해당 없음

## API 계약 (백엔드 전달)
- **없음** — 데이터 페칭이 전혀 없는 정적 페이지. entity/fetcher/MSW 불필요.

## 타겟 매핑
- 라우트: `app/service/guide.html/page.tsx` → `/service/guide.html` (legacy URL 그대로 유지, `.html` 세그먼트 → SEO/aside href parity)
- screen: `screens/service-guide`
- widget: `widgets/site-aside` (공통 `#sidebar` list-group 셸 — title + items[label,href,active,external]. service/board 단순형 커버. mypage 그룹형은 후속 확장)
- entities: 없음
- mock: 없음

## 단위 경계 결정 (개발자 확인 필요)
1. **URL `.html` 유지**: 이 단위가 client 서브페이지 URL 규약의 첫 사례. legacy `/service/guide.html`을 그대로 재현(폴더명 `guide.html`). parity철칙(URL/SEO 동일성) 준수. 이후 서브페이지 동일 규약.
2. **breadcrumb 제외**: 게임 도메인으로 연기.
3. aside 타 링크(steam/epic/rockstar)는 미이관 → Next에서 404(legacy href 그대로 보존, PublisherSection 선례와 동일한 점진 이관 상태).
4. `card-list.css` 전역 로드 차이(subpage head엔 있으나 guide는 카드 미사용) — guide parity 영향 없어 미도입.

## Parity 체크리스트
- [ ] 화면 요소 일치 (aside 5항목 + 탭 + 7단계 ol)
- [ ] 필드/검증 일치 (N/A — 정적)
- [ ] 분기/플로우 일치 (N/A)
- [ ] SEO(title/viewport/description/author) 일치, canonical/OG 없음 유지
- [ ] 엣지케이스: 외부 홀로모델 링크 `target="_blank"`, active 강조 위치

---

## 부록: 이용안내 서브페이지 3종 (guide_steam/epic/rockstar)

guide.html과 동일한 aside 셸(`ServiceAside`)·레이아웃 래퍼(`container my-3 pb-5` + `d-grid` 240px 그리드)를 공유하는 정적 SSR 멀티탭 안내 페이지. 데이터 페칭·폼·세션 의존 전부 없음. Bootstrap 탭 JS는 전역 번들. 각각 커밋 완료:
- `guide_steam.html` → `screens/service-guide-steam` (커밋 `5653e02`)
- `guide_epic.html` → `screens/service-guide-epic` (커밋 `e88567d`)
- `guide_rockstar.html` → `screens/service-guide-rockstar` (커밋 `4af4f77`)

### 페이지별 legacy 사양·보존한 quirk (parity 판정 포함)
- **스팀** (`$page_title` "스팀(STEAM) 이용안내", author `H2interactive`): 5탭(`#steam-b1~b5`), 컨테이너 `main mb-5`. b1 3항목(무이미지)·b2 6항목·b3 2항목·b4 9항목(마지막 이미지 2장)·b5 5항목. quirk 보존: b3 item1/2 `p.text-muted`(font-14 없음), b4 item6 제목 `fw-500`(다른 항목은 `font-15`), b2 item4 이미지 src 더블슬래시 `pc//KR_Guide_steam_A_04.jpg`, b4 item9 `text-danger` ①② 마커.
- **에픽** (`$page_title` "에픽 게임즈(EPIC GAMES) 이용안내", **author 빈값 `""`** — steam/rockstar와 다름): 5탭(`#epic-b1~b5`), 컨테이너 `main`(mb 없음). quirk 보존: b2 마커 ①~⑩ 중 **⑥ 누락**(⑤ 다음 ⑦), b4 item3 `p.text-muted mb-2`(font-14 없음), b5 item1 realid 링크 `target="blank"`(언더스코어 없음), 이미지 alt/title 트레일링 스페이스("…확인 ").
- **락스타** (`$page_title` "락스타 게임즈(ROCKSTAR GAMES) 이용안내", author `H2interactive`): 4탭이나 탭 ID가 **`#order-b1~b4`**(guide.html 복붙 잔재, rockstar 아님), 컨테이너 `main mb-4`. quirk 보존: b1 h4가 "다이렉트 게임즈 구매방법"(제목 불일치), 강조 span 없이 평문, 모든 이미지 **class 없음**(steam/epic은 `mb-2`), b4 item1 이미지 src `_B_01` 재사용(alt "…소셜 클럽 메인 페이지" 불일치, `_C_01` 건너뜀).

### SEO
- 3종 모두 `<title>`=각 `$page_title`, `description=""`, `viewport=width=device-width, initial-scale=1.0`, canonical/OG/구조화데이터 없음. author는 steam/rockstar=`H2interactive`, **epic=빈값**. route `metadata`/`viewport`로 재현.

### 검증
- 기계 검증: `tsc --noEmit` PASS, `eslint .` PASS. 화면/탭/항목/이미지 src·alt/SEO를 legacy와 라인 대조 완료(quirk 포함 일치).
