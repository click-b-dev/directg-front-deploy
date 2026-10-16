# 공통 레이아웃 (header/footer)

스토어프론트 첫 이관 단위. legacy 공통 골격(header + footer) + CDN/로컬 자산 기반 도입.

## 원본

- 파일:
  - `pc/inc/header.html` — **라이브** (판별 근거: `pc/index.php:229` `include_once '/inc/header.html'`)
  - `pc/inc/footer.html` — **라이브** (판별 근거: `pc/index.php:649` `include_once '/inc/footer.html'`)
  - 제외된 변형: `header_common.html`, `yjs_header.html`, `footer2.html`, `footer_new.html`, `footer_common.html`, `footer_common2.html`, `yjs_footer.html`, `top_bar*.html`, `top_nav*.html` — index.php가 include하지 않는 구세대/타 화면 변형.
  - `pc/inc/footer_banner.html`(index 전용 배너 영역), `pc/inc/cart.html`(장바구니 슬라이드 모달)은 **index.php 본문 소속 → 이번 단위 밖**(메인 페이지 단위에서 처리).
- 참조 문서: `docs/design-system/client.md`, `../legacy-project/docs/PROJECT-OVERVIEW.md`, `SEO-CHANNEL.md`

## 화면·플로우

### 진입 URL/파라미터

- 공통 레이아웃 — 모든 스토어프론트 페이지에 include됨. 자체 URL 없음.
- header 검색폼: `GET /game/game_search_thumb.html?q=<검색어>` (minlength=2, required)

### 화면 요소 (legacy 기준)

**header (`header.html`)**

1. **기획 고정 배너** (조건부): `2026-06-25 16:00:00 ~ 2026-07-09 16:00:00` 구간에만 노출. `promotion_season.html` 링크 + 이미지 배너. → **기간 만료됨**(오늘 2026-08-31). legacy 현재 상태 = 미노출. 하드코딩 날짜 조건 그대로 이식(현재 렌더 안 됨).
2. **상단 바** (`.container` row):
   - 로고 `H2_DG_logo_160x45_v2.png` → `/index.php`
   - 검색폼 (`#searchFrm`): 입력 `#q`, 검색 버튼, `q` 있을 때만 리셋 버튼 `#btn_search_reset` 노출. `schema.org/WebSite` + `SearchAction` 마이크로데이터 포함.
   - 추천검색어 슬롯(최대 4): `search_recommand_click.php?idx=` 링크 (클릭수 집계 경유)
   - 우측 유틸 링크: **로그인 시** [로그아웃, 마이페이지], **비로그인 시** [로그인, 회원가입] / 공통 [위시리스트, 장바구니]
3. **1차 내비게이션** (`.border-nav` `#top_bar`): 서비스소개 / 할인프로모션(▼드롭다운) / 이벤트 / 공지사항 / 이용안내(▼) / 고객지원(▼)
   - 할인프로모션 드롭다운: 할인진행중 + (기간조건)여름프로모션 + 주말특가 + **그룹 프로모션 목록(동적)**
   - 이용안내 드롭다운: 다이렉트게임즈/스팀/에픽/락스타 가이드 + 홀로모델(외부, target=\_blank)
   - 고객지원 드롭다운: 자주묻는질문/문의하기/자료실
4. **2차 내비게이션** (`#navbar` navbar-dark): 모든게임 / PS액세서리 / 홀로모델 / 플랫폼별(▼) / 장르별(▼) / 카테고리별(▼ 4열 메가메뉴) / 퍼블리셔별(▼) / 한국어지원(▼) / 예약구매
   - 모두 정적 링크(하드코딩). 데이터 의존 없음.
5. **breadcrumb** (조건부): `$aside['product_type']`가 game/group/accessories일 때만. → header.html 내에 있으나 `$aside`/`$sub_title`/`$page_title`는 **각 페이지가 설정하는 변수**. 공통 레이아웃 단위에서는 빈 상태(미노출). 페이지 단위에서 값 주입.

**footer (`footer.html`)** — 순수 정적, 데이터/세션 의존 없음

1. `#topBtn` (TOP 버튼) + `#top` 앵커
2. footer-left: 문의하기/FAQ 링크, SNS 4종(유튜브/페북/카카오/인스타 — inline SVG), 고객센터 정보(전화 1544-2367, 이메일, 운영시간)
3. footer-right: 제휴 배너 3종(H2 Interactive/H2mall/Cable Guys — 외부링크), 하단 정책 링크 6종, 회사 정보(사업자번호 등), 저작권

### 폼 필드/검증

- 검색폼 `#q`: `minlength="2"`, `required`. submit → `/game/game_search_thumb.html?q=`
- `#btn_search_reset`: `q` 존재 시 노출되나 **`assets/js/`에 클릭 핸들러 부재 → legacy에서도 실동작 없음**. 버튼만 렌더(그대로 이식).

### 분기/리다이렉트

- header 우측 유틸: `$_SESSION['member']['m_id']` 존재 여부로 로그인/비로그인 UI 분기
- 기획 고정 배너 / 여름프로모션 메뉴: 하드코딩 날짜 구간 조건 (현재 만료 → 미노출)

### 세션/권한 의존

- `$_SESSION['member']['m_id']` — 로그인 상태 판정 (header 우측 유틸 분기에만 사용)
- **인증 방식 미정 (MIGRATION-MAP 게이트).** 이번 단위는 비로그인 상태 기본 렌더로 구현하고, 세션 연결은 첫 인증 단위에서 처리(보류).

## SSR·SEO (legacy)

- **head meta/title/canonical/OG**: `index.php`가 페이지별로 직접 소유 (header.html에 없음). 공통 레이아웃 단위에서는 head 자산 로드(CDN/CSS/폰트)만 layout에 도입. 페이지별 title/meta는 각 페이지 단위에서.
- **구조화 데이터**: header 검색폼에 `schema.org/WebSite` + `SearchAction` 마이크로데이터 (itemscope/itemprop). → 그대로 재현.
- **페이지별 CSS/자산**: 공통 = Bootstrap 5.3.5, FA 6.7.2, Noto Sans KR, `directg.css`, `templete/.../custom.css`, `styleguide.css`. (`page/main.css`, `card-list.css`, splide는 메인 페이지 전용 → 해당 단위에서 도입)
- **다크 테마 (필수)**: legacy 루트 태그는 `<html lang="ko" data-bs-theme="dark">`. Bootstrap 다크 테마 전제 — `text-body-secondary` 등 테마 종속 색이 이 속성에 의존한다. `app/layout.tsx`의 `<html>`에 `data-bs-theme="dark"` 재현 필수(누락 시 헤더 로그인/회원가입 텍스트 등이 배경과 대비 소실).
- **SSR/CSR 렌더 구간**: header/footer 마크업은 전부 SSR. 인터랙션(Bootstrap 드롭다운, TOP 버튼 스크롤)만 클라이언트.

## 데이터 (legacy)

### 도메인 클래스·메서드

- `Promotion::getPromotionGroupList()` (`src/classes/Promotion.php:151`)
  - SQL: `SELECT idx, subject, start_date, end_date, use_flag FROM tbl_group WHERE use_flag='Y' AND start_date<=:now AND end_date>=:now`
  - `:now` = 현재 unix timestamp (`strtotime(date("Y-m-d H:i:s"))`). start_date/end_date는 int timestamp 컬럼.
  - 용도: 할인프로모션 드롭다운의 그룹 프로모션 항목(`/game/group_thumb.html?idx=<idx>`, 표시명 `subject`)
- `Goods::getSearchRecommandList()` (`src/classes/Goods.php:1752`)
  - SQL: `select idx,keyword,link_url from tbl_search_recommand where is_del='N' and is_view='Y' order by recommand_sort asc, idx asc limit 4`
  - 용도: 검색바 하단 추천검색어(최대 4). 링크는 `/game/search_recommand_click.php?idx=<idx>`(클릭수 집계 후 이동)

### AJAX/POST

- 없음 (공통 레이아웃 자체는 서버 렌더 데이터만). `search_recommand_click.php`(클릭 집계 리다이렉트)는 추천검색어 클릭 시 이동 경유지 → 별도 단위/백엔드 계약.

## 결제(PG)

- 해당 없음.

## API 계약 (백엔드 전달)

### `GET /api/promotion/groups` — 활성 그룹 프로모션 목록

- 용도: header 할인프로모션 드롭다운
- 요청: 파라미터 없음 (서버 현재시각 기준)
- 응답 200:
  ```json
  {
    "groups": [
      { "idx": 12, "subject": "가을 프로모션", "start_date": 1727740800, "end_date": 1730419200 }
    ]
  }
  ```
- 백엔드 책임: `tbl_group`에서 `use_flag='Y' AND start_date <= now AND end_date >= now` 필터, 정렬은 legacy 미지정(쿼리 순서 유지). `start_date`/`end_date`는 unix timestamp(초).
- 에러: 없음(빈 배열 허용).

### `GET /api/search/recommendations` — 추천 검색어 슬롯(최대 4)

- 용도: header 검색바 하단 추천검색어
- 요청: 파라미터 없음
- 응답 200:
  ```json
  { "keywords": [{ "idx": 3, "keyword": "발더스게이트", "link_url": "" }] }
  ```
- 백엔드 책임: `tbl_search_recommand`에서 `is_del='N' AND is_view='Y'`, `ORDER BY recommand_sort ASC, idx ASC LIMIT 4`.
- 에러: 없음(빈 배열 허용).
- 비고: `link_url`은 legacy에서 미사용(header는 `search_recommand_click.php?idx=`로 이동). 계약엔 포함하되 header 렌더에는 사용 안 함.

## 타겟 매핑

- **자산 도입**: `app/layout.tsx`에 CDN 스택(Noto Sans KR, FA 6.7.2, Bootstrap 5.3.5 CSS/JS, jQuery 3.7.1) 동일 URL·integrity 재현. 로컬 CSS(`directg.css`, `custom.css`, `styleguide.css`)는 `public/assets/css/`로 무수정 복사. 이미지 8종은 `public/assets/images/`로 복사.
- **widgets/site-header** (`'use client'` 또는 서버+클라이언트 분리): header 마크업. 데이터(프로모션 그룹, 추천검색어)는 상위 서버 컴포넌트에서 fetch해 props 주입.
- **widgets/site-footer** (서버 컴포넌트): footer 정적 마크업 + TOP 버튼(작은 `'use client'` 조각)
- **entities/promotion-group**: fetcher + 타입 (`GET /api/promotion/groups`)
- **entities/search-recommendation**: fetcher + 타입 (`GET /api/search/recommendations`)
- **shared/mocks**: MSW handler + fixture 2종
- 라우트 매핑: `pc/index.php?q=` 검색 → header 폼 action은 legacy URL `/game/game_search_thumb.html` 유지(해당 화면은 후속 단위).

## Parity 체크리스트

- [ ] header 화면 요소 일치 (로고/검색폼/추천검색어/유틸링크/1·2차 내비/드롭다운)
- [ ] footer 화면 요소 일치 (SNS/고객센터/제휴배너/정책링크/회사정보/TOP)
- [ ] 검색폼 필드/검증 일치 (minlength=2, required, action, SearchAction 마이크로데이터)
- [ ] 세션 로그인/비로그인 분기 (이번 단위는 비로그인 고정 — 보류 명시)
- [ ] 드롭다운 인터랙션 동작 (Bootstrap)
- [ ] TOP 버튼 스크롤 동작 (scrollY>200 show, smooth scroll)
- [ ] 기획 고정 배너 날짜 조건 (현재 만료 → 미노출)
- [ ] SEO(SearchAction 구조화데이터, 자산 로드) 일치
- [ ] 엣지케이스 (btn_search_reset 핸들러 부재 이식, 추천검색어 0건, 그룹 프로모션 0건)

## 착수 전 사용자 게이트 (구현 방식 결정 필요)

1. **Bootstrap vendor 인터랙션 재현 방식** — 드롭다운 8개 + collapse. legacy는 `bootstrap.bundle.min.js` + `data-bs-toggle` 속성. (A) CDN JS를 그대로 로드해 data 속성 기반 동작(최소 parity) vs (B) React 컴포넌트로 재구현.
2. **세션 로그인 분기** — 인증 방식 미정. 이번 단위는 비로그인 고정 렌더로 두고 인증 단위에서 연결(보류)하는 것으로 진행 확인.
