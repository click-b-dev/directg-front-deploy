# Admin 디자인시스템 — Hyper 테마 코드화

> 원본: `../legacy-project/pc/_Admin_/assets/` (Hyper v3.4.0, CoderThemes, Bootstrap 5.1, `config/saas` 변형)
> 토큰 단일 진실 원천: `../legacy-project/pc/assets/scss/config/saas/_variables.scss` (+ `_custom-variables.scss`)
> 전략·계층 구조는 [README.md](README.md) 참조.

## 1. 자산층 도입 — ✅ 완료 (index.html 배선)

legacy `pc/_Admin_/inc/admin_head.php`가 로드하는 순서 그대로 `apps/directg-admin/index.html`에 재현했다.

| 순서 | legacy | 타겟 (`apps/directg-admin`) | 상태 |
|------|--------|------------------------------|------|
| 1 | Google Fonts `Noto Sans KR` (100~900) | `index.html` 동일 `<link>` | ✅ |
| 2 | `/_Admin_/assets/css/icons.min.css` | `public/assets/css/icons.min.css` | ✅ |
| 3 | `/_Admin_/assets/css/app.min.css?time()` (`id=light-style`) | `public/assets/css/app.min.css` (`id=light-style`, 활성) | ✅ |
| 4 | `/_Admin_/assets/css/app-dark.min.css?time()` (`id=dark-style`) | `public/assets/css/app-dark.min.css` (`id=dark-style`, **`disabled`**) | ✅ |
| 5 | `/_Admin_/assets/css/vendor/simplemde.min.css` | 에디터 화면 이관 시 결정 (보류) | ⏸ |
| 폰트 | `/_Admin_/assets/fonts/` | `public/assets/fonts/` — **CSS가 실제 참조하는 파일만** 선별 복사 (dripicons-v2 / materialdesignicons-webfont / unicons / Nunito 4종). Noto Sans KR은 Google CDN 로드라 로컬 미복사 | ✅ |
| 이미지 | `../images/` 참조 4종 | `public/assets/images/` (`bg-auth.jpg` `bg-pattern.png` `bg-pattern-light.svg` `bg-pattern-dark.png` `waves.png`) + `favicon.ico` | ✅ |
| 인라인 `<style>` | admin_head.php 5줄 (Noto Sans KR 16px override 등) | `index.html` `<style>` 동일 재현 | ✅ |
| body class | 페이지별 (`authentication-bg` 등) | React가 라우트별로 관리 (login = `authentication-bg` 적용됨). `data-layout-config`는 M1-6에서 CSS-only 실효 속성 `data-leftbar-theme="dark"`로 재현 완료(`index.html`). `<title>$page_title` per-route는 각 content-page 단위에서 설정(옵션 A) | ✅ |

**light/dark 처리 (중요)**: legacy는 두 CSS를 모두 로드하되 테마 JS가 `data-layout-config`의 `darkMode:false`를 읽어 `#dark-style`에 `disabled`를 부여한다 → 항상 라이트. 이 앱은 전 페이지 `darkMode:false`이므로, 그 **런타임 결과 상태**(light 활성 + dark `disabled`)를 정적으로 재현했다. id를 보존해 향후 필요 시 토글 가능.

- 복사만 하고 **무수정**. SCSS 재컴파일 금지 (빌드 도구·버전 차이로 결과가 달라질 수 있음).
- **테마 JS 미도입(CSS-only 확정)**: `vendor.min.js`/`app.min.js`는 로드하지 않는다. Hyper JS 로드도 검토·시제(試製)했으나(1.6MB jQuery 번들 + React DOM 충돌 + 재초기화 훅 필요) React SPA에는 과하고, 스타일 이득이 없어 **CSS-only로 되돌렸다**.
  - ⚠️ **핵심 원리(불일치 재발 방지)**: Hyper CSS는 body `data-*` 속성으로 구동된다 — 예: `body[data-leftbar-theme=dark] .leftside-menu{background:#313a46}`, `body[data-layout=topnav] ...`. legacy는 app.min.js가 body `data-layout-config`(JSON)에서 이 속성을 파생·설정한다. **JS 없이 그 결과 속성을 정적으로 부여**하면 CSS만으로 동일 스타일이 나온다.
  - 이 앱 config(`leftSideBarTheme:dark`, boxed/condensed/scrollable:false)에서 실효 속성은 **`data-leftbar-theme="dark"` 하나**(`index.html` body에 정적 부여). 나머지는 기본값이라 부여 불필요.
  - ❌ 하지 말 것: legacy가 설정하지 않는 속성을 임의로 추가(예: main.php에 없는 `data-layout=topnav`)하면 오히려 CSS 캐스케이드가 달라져 불일치. **legacy 렌더 상태의 속성만** 재현.
  - dropdown/collapse/active/logout 등 **동작은 React로 재현**. 스크롤바는 네이티브 폴백(필요 시 `simplebar` npm 별도 도입).
- Bootstrap 자체는 `app.min.css`에 컴파일 포함되어 **그대로 사용**(별도 `bootstrap`/`react-bootstrap` npm 미설치). Bootstrap JS 위젯은 등장 단위에서 React로 구현.

## 2. 토큰 레퍼런스 (`config/saas/_variables.scss` 추출)

신규 코드에서 값이 필요하면 하드코딩 대신 자산층 CSS의 `--bs-*` 변수를 참조한다. 아래 표는 값 대조용.

### 색상

| 토큰 | 값 | CSS 변수 |
|------|-----|----------|
| primary | `#727cf5` (indigo) | `--bs-primary` |
| secondary | `#6c757d` (gray-700) | `--bs-secondary` |
| success | `#0acf97` | `--bs-success` |
| info | `#39afd1` | `--bs-info` |
| warning | `#ffbc00` | `--bs-warning` |
| danger | `#fa5c7c` | `--bs-danger` |
| light | `#eef2f7` (gray-200) | `--bs-light` |
| dark | `#313a46` (gray-900) | `--bs-dark` |
| body-bg | `#fafbfe` | — |
| body-color | `#6c757d` (gray-700) | — |
| link | primary, `text-decoration: none` | — |

gray 스케일: 100 `#f1f3fa` · 200 `#eef2f7` · 300 `#dee2e6` · 400 `#ced4da` · 500 `#adb5bd` · 600 `#98a6ad` · 700 `#6c757d` · 800 `#343a40` · 900 `#313a46`
원색: blue `#2c8ef8` · purple `#6b5eae` · pink `#ff679b` · orange `#fd7e14` · teal `#02a8b5`

### 타이포그래피

> ⚠️ **실측 보정**: 테마 SCSS 기본은 Nunito/0.9rem이지만, `admin_head.php`의 인라인 `<style>`이
> `html { font-family:'Noto Sans KR'; font-size:16px }`로 **덮어쓴다**. admin의 실제 기준은 아래.

| 토큰 | 실제 적용값 (인라인 override) | 테마 SCSS 원값 (참고) |
|------|------------------------------|----------------------|
| html font-family | `'Noto Sans KR', sans-serif` | `'Nunito', sans-serif` |
| html font-size | `16px` | (base 0.9rem) |
| table | `font-size: 0.875rem` | — |
| thead th | `font-weight: 500` | — |
| `.eng` / `.num` | `arial 12px` / `tahoma 12px` (레거시 숫자·영문 표시용) | — |
| font-size-base(rem 기준) | `0.9rem` (컴포넌트 상대 크기의 기준) | sm `-.025` / lg `×1.390` |
| line-height-base | `1.5`, font-weight-normal `400` | |
| h1~h6 | `2.25 / 1.875 / 1.5 / 1.125 / 0.9375 / 0.75rem`, headings weight `500` | |

이 인라인 override 5줄은 `index.html`의 `<style>`로 그대로 재현되어 있다 (자산층 도입 시 반영 완료).

### 레이아웃·형태

| 토큰 | 값 |
|------|-----|
| spacer | `1.5rem` |
| grid-gutter | `24px` |
| breakpoints | sm 576 / md 768 / lg 992 / xl 1200 / xxl 1400 — 단, admin 화면은 `<meta viewport width=1630>` 데스크톱 고정 |
| border-radius | `.25rem` / sm `.2rem` / lg `.3rem` |
| box-shadow | `0 0 35px 0 rgba(154,161,171,.15)` (Hyper 카드 그림자) / sm `0 .125rem .25rem rgba(0,0,0,.075)` / lg `0 0 45px 0 rgba(0,0,0,.12)` |

### 아이콘

- **Material Design Icons** (`mdi mdi-*`) — 주 아이콘. `icons.min.css` + 웹폰트.
- dripicons (보조). 아이콘도 legacy 클래스명 그대로 마크업에 출력한다 (React 아이콘 라이브러리로 교체 금지).

## 3. 컴포넌트 인벤토리 (rule of two로 승격)

> 미리 만들지 않는다. 이관 중 두 번째 등장 시 래퍼로 승격하고 이 표의 상태를 갱신한다.
> 래퍼는 legacy 클래스명을 그대로 출력한다. 위치: 레이아웃 = `widgets/`, 범용 = `shared/ui/`.

### 레이아웃 (M1-3~6 단위와 1:1)

| 컴포넌트 | legacy 원본 | 위치 | 상태 |
|----------|-------------|------|------|
| Topbar | `inc/topbar.php` (메뉴 13종, `admin_level` 분기) | `widgets/topbar` | ✅ M1-3 |
| Sidebar | `inc/sidebar_<영역>.php` | `widgets/sidebar` | ✅ M1-4 |
| Footer | `inc/footer.php` | `widgets/footer` | ✅ M1-5 |
| AdminLayout | 조립 순서 head→topbar→sidebar→본문→footer + `data-layout-config` | `app/providers.tsx` + `widgets/layout-shell` + `index.html` ([분석](../migration/admin/layout/layout-assembly.md)) | ✅ M1-6 |

### 공통 헬퍼 대응 (M1-5)

| 컴포넌트 | legacy 원본 | 비고 |
|----------|-------------|------|
| LoadingOverlay | `admin_head.php` `LoadingOverlay('show'\|'hide')` | 전체 화면 스피너 |
| Pagination | `renderPaging(options)` — `baseUrl/page/totalPages/params/perBlock` | AJAX 목록 다수가 사용. 렌더 결과 마크업 동일 |
| escHtml | XSS 이스케이프 헬퍼 | React 기본 이스케이프로 충족 — 별도 구현 불필요(문서화만) |

### 화면 패턴 (M2~ 등장 시 승격)

| 후보 | legacy 패턴 | 승격 기준 |
|------|-------------|----------|
| Card / PageTitle | Hyper `card`·`page-title-box` 골격 | 목록 화면 2개째 |
| DataTable | `table table-centered` 등 목록 테이블 관례 | 〃 |
| SearchForm | 목록 상단 검색·필터 바 | 〃 |
| FormField | `form-label`+`form-control` 조합 | 폼 화면 2개째 |
| Button/Badge | `btn btn-*`, `badge bg-*` (`soldout_badge` 등) | 필요 시 |
| Modal/Tabs/Alert | Bootstrap 위젯 (data-bs-* JS 의존) | 등장 시 React 제어로 재현 + parity 대조 |
| StatWidget | 대시보드 통계 카드 (apexcharts 연계) | 대시보드 데이터 화면 이관 시 |
| Editor | smarteditor2 / simplemde | 등장 시 개별 결정 (사용자 게이트) |

## 4. 검증 방법

- 자산층 도입 단위(M1-3)의 parity 대조: 동일 화면을 legacy와 나란히 띄워 폰트·색·그림자·간격 육안 대조. 로그인 화면(M1-1)이 첫 대조 대상.
- 래퍼 승격 시: legacy 마크업(클래스 트리)과 래퍼 출력 DOM을 비교해 클래스 구조 일치 확인.
