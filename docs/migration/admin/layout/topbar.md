# 상단 메뉴 (topbar) (M1-3)

## 원본

- 파일: `pc/_Admin_/inc/topbar.php` (모든 관리자 페이지가 `content-page` 상단에 include)
- 라이브 버전 판별: 변형 파일 없음 — 단일 버전. 제휴(jehu) 항목은 원본에서 **주석 처리**되어 미렌더.
- 참조 문서: `docs/legacy-admin/00-overview.md`, `../legacy-project/docs/ADMIN-AUTHORIZATION.md`
- 선행 단위: [로그인(M1-1)](../auth/login.md)(세션 생성), [세션가드+로그아웃(M1-2)](../auth/session-guard-logout.md)(로그아웃 계약)

## 화면·플로우

### 구조
- 래퍼 `div.navbar-custom.px-2`(bg `#313a46`, 흰 글씨) > `header.p-0` > `.container-fluid` > flex row.
- `ul.nav.nav-pills#topmenu` (메뉴) + 우측 프로필 `.dropdown`.
- 인라인 `<style>`: `.nav-item{width:100px}`, `.navbar-custom{background-color:#313a46;color:#fff}`, `.content-page{padding-top:88px}`, `.nav-pills>li>a{font-weight:500}`.

### 메뉴 분기 (`$_SESSION['admin']['admin_level']`)
- **`admin_level=="1"`(product_viewer)** → **상품 1개만** (`/goods/dashboard_goods.php`, `uil-store`).
- **그 외** → 아래 **12개** 순서대로 (제휴 주석 제외):

| # | key | 라벨 | legacy href | 아이콘 |
|---|-----|------|-------------|--------|
| 1 | dashboard | 대시보드 | `/main.php` | `uil uil-dashboard` |
| 2 | site | 사이트 | `/site/banner_list.php` | `dripicons-gear noti-icon` |
| 3 | goods | 상품 | `/goods/dashboard_goods.php` | `uil-store` |
| 4 | stock | 재고 | `/goods/stock/dashboard_stock.php` | `mdi mdi-warehouse` |
| 5 | member | 회원 | `/member/dashboard_crm.php` | `dripicons-user` |
| 6 | order | 주문 | `/order/dashboard_order.php` | `uil uil-notes` |
| 7 | promotion | 프로모션 | `/promotion/dashboard_promotion.php` | `uil-calender` |
| 8 | event | 이벤트 | `/event/event_board_list.php` | `uil uil-document` |
| 9 | board | 게시판 | `/board/dashboard_board.php` | `uil uil-document` |
| 10 | statistics | 통계 | `/statistics/order/order_day_count.php` | `uil-chart` |
| 11 | china | 중국결제 | `/china/invoice_list.php` | `uil uil-invoice` |
| 12 | partner | 파트너 | `/partner/partner_list.php` | `dripicons-article` |

- 각 항목: `<li.nav-item.border-end.border-secondary><a.nav-link.px-2.rounded-0 [active]><div.d-flex.flex-column.text-center><i icon><span>라벨</span>`.
- **active**: legacy는 각 페이지가 `$topmenu[key]='active'`를 include 전에 설정. SPA는 현재 경로의 **최장 접두 매칭**으로 active 산출(예: `/goods/stock/*`는 goods 아닌 stock).

### 프로필 드롭다운 (분기 밖 — 항상 렌더)
- 토글: `avatar-md > .avatar-title.bg-success.rounded-circle`에 `admin_name` 표시.
- 메뉴: 프로필 관리 / 설정 / 활동이력 (모두 `javascript:void(0)` **no-op**) + **로그아웃 → `logout.php`**.

### 세션/권한 의존
- `admin_level`(메뉴 분기), `admin_name`(아바타). 둘 다 M1-1 로그인 세션(`AuthProvider.session.user`)에 존재.

## 데이터 (legacy)
- 도메인 클래스/SQL 없음 — 순수 세션 값 + 정적 메뉴. **신규 API 없음.**
- 로그아웃만 동작 트리거 → M1-2의 `POST /admin/auth/logout` 재사용(세션 파기 후 `/login`).

## API 계약 (백엔드 전달)
- **신규 엔드포인트 없음.** 로그아웃은 [M1-2 계약](../auth/session-guard-logout.md)의 `POST /admin/auth/logout` 사용.

## 타겟 매핑
- widget: `widgets/topbar` (legacy 마크업/클래스 그대로, Hyper `navbar-custom`).
- 메뉴 링크: legacy URL 구조 유지(`.php` 제거) — 대부분 미이관 페이지라 **legacy처럼 `<a href>` 전체 이동**(SPA Link 아님, 타입드 라우트 미존재 회피 + 전체이동 동작이 legacy와 동일). 이관되며 점진 전환.
- 드롭다운: Bootstrap JS 미로드 → **React 제어 드롭다운**(useState open + `.show` 클래스 토글)으로 동일 마크업/시각 재현.
- 로그아웃: `entities/admin-auth`의 `adminLogout()` → `setSession(null)` → `navigate('/login')`. 엔드포인트 실패해도 세션 파기(legacy 항상 파기).
- active: `useLocation` 최장 접두 매칭.
- 레이아웃 배선: `LayoutShell`(인증 경로)이 `navbar-custom`(고정 상단) + `content-page`(padding-top:88px) 본문으로 렌더. **스타트킷 플레이스홀더(사이드바/헤더)는 제거** — 비-legacy였음. 단위별 사이드바(M1-4)·footer(M1-5)·최종 조립(M1-6)은 후속.

## Parity 체크리스트
- [ ] 일반 계정: 12개 메뉴 순서/라벨/아이콘/링크 일치, 제휴 미렌더
- [ ] product_viewer(level 1): 상품 1개만
- [ ] 프로필 아바타에 admin_name 표시, 드롭다운 4항목(3 no-op + 로그아웃)
- [ ] 로그아웃: 세션 파기 후 `/login` 이동, 재접근 시 로그인 요구
- [ ] navbar-custom 배경(#313a46)·active 하이라이트

## topbar 변형 — topnav (main.php, 사이드바 없는 레이아웃)

legacy는 topbar가 두 가지다. 대시보드(`main.php`)는 `inc/topbar.php`가 아닌 **자체 인라인 topbar**를 쓴다.

| 구분 | 사이드바 레이아웃(inc/topbar.php, 328p) | topnav 레이아웃(main.php, 대시보드) |
|------|------------------------------------------|--------------------------------------|
| wrapper | `.navbar-custom.px-2` | `.navbar-custom.topnav-navbar.topnav-navbar-dark` |
| 로고 | 없음(로고는 사이드바에) | **topbar에 `.topnav-logo`(194x45)** |
| 메뉴 | `nav-pills col-lg-auto` (12개 동일) | `nav-pills col-9` (12개 동일, 폭 좁아 래핑) |
| 프로필 | 아바타 원형(`avatar-title bg-success`) | **`nav-user` 텍스트 "이름(레벨)"** |
| 드롭다운 | 4항목(3 no-op + 로그아웃) | **5항목(+화면잠금 no-op)** |
| 사이드바 | 있음 | **없음** |
| content | `content-page`(margin-left:260px) | `content-page`(margin-left:0, 전폭) |

- 구현: `Topbar`에 `variant: "sidebar"|"topnav"` prop. 메뉴 리스트·드롭다운 항목은 공유, wrapper/로고/프로필만 분기.
- 레이아웃 전환: `LayoutShell`이 `isTopnavPath`(`/main`)로 분기한다. **legacy main.php는 body에 `data-layout` 속성을 두지 않는다** — topnav는 순수 클래스로만 구성:
  - topbar `.navbar-custom.topnav-navbar` → `.topnav-navbar{position:relative;left:0!important;z-index:1002}`가 base `.navbar-custom{position:fixed;left:260px}`를 덮어 **in-flow 전폭**.
  - content `.content-page.ms-0.pt-0`(Bootstrap 유틸: margin-left:0, padding-top:0) → 사이드바 없는 전폭, in-flow topbar 아래로 흐름.
  - 구조: `.wrapper > .content-page.ms-0.pt-0 > .content > .container-fluid`.
  - ⚠️ `body[data-layout=topnav]`를 부여하면 topbar가 `position:absolute`가 되어 **legacy와 달라진다**(초기 시도의 오류). data-layout 미사용이 정답. (`shared/lib/layout.ts`)
- ⚠️ 이 변형은 본래 대시보드(M1-7) 범위이나, 사용자 요청으로 topbar/레이아웃 단위에서 선반영. 대시보드 본문은 M1-7.

## 산출물
- widget: `src/widgets/topbar/` (ui + menu config, `variant` 지원)
- 배선: `LayoutShell` — 사이드바 레이아웃 / topnav 레이아웃(`data-layout` 관리) 분기
- helper: `src/shared/lib/layout.ts` (`isTopnavPath`)
- mock: 없음(신규 API 없음). 로그아웃 mock은 M1-2에서 이미 추가됨.
