# 사이드바 패턴 (M1-4)

## 원본

- 파일: `pc/_Admin_/inc/sidebar_<영역>.php` (영역별 좌측 사이드바). 대표 패턴으로 **`inc/sidebar_site.php`**(사이트) 채택.
- 조립: `inc/admin_body_start.php`가 `$sidebar_file`(영역별 sidebar) → `inc/topbar.php` 순으로 include. 328개 콘텐츠 페이지가 이 방식.
- 로고: **사이드바 상단 `.logo` 박스**에 위치(topbar 아님). 이미지 `assets/images/H2_DG_BI_nm_160x37.png`.
- 라이브 판별: `sidebar_site.php` 단일 버전. 내부에 주석 처리된 정책(policy) 섹션 다수 → **미렌더**.
- 참조: `docs/legacy-admin/10-site-policy-tag-api.md`. 선행: [topbar(M1-3)](topbar.md).

## 화면·플로우 (sidebar_site.php)

- 컨테이너 `div.leftside-menu`(CSS: `position:fixed; width:260px; top:0; bottom:0; 보라 그라데이션 #8f75da→#727cf5; padding-top:70px`).
- **로고** `a.logo.text-center.logo-light[href=/main.php]` > `span.logo-lg` + `span.logo-sm` 각각 `img(H2_DG_BI_nm_160x37.png)`. (CSS: `.logo{position:fixed;top:0;width:260px;line-height:70px}`)
- 스크롤 컨테이너 `div#leftside-menu-container[data-simplebar]` > `ul.side-nav`:
  1. `li.side-nav-item > a.side-nav-link[href=/site/dg_operation_service.php]` — `uil uil-dashboard`, "운영서비스 현황".
  2. `li.side-nav-item` — collapse 그룹 "사이트 관리"(`uil uil-image`, `menu-arrow`):
     - 토글 `a.side-nav-link[data-bs-toggle=collapse][href=#sidebarSite][aria-expanded=true]`
     - `div.collapse.show#sidebarSite > ul.side-nav-second-level`:
       - 메인배너 관리 → `/site/banner_list.php`
       - 추천 및 특집 관리 → `/site/main_recommand.php`
       - 추천 검색어 관리 → `/site/search_recommand.php`
       - `[X] 기획배너 관리` → `#` (비활성 placeholder, 라벨 그대로)
       - `[X] 인기 게임 관리` → `#`
  - (정책 6개 섹션은 legacy 주석 → 미렌더)
- 상단 `<link>`로 bootstrap-icons(kr) CDN 로드되나 site 사이드바 아이콘은 `uil-*`(icons.min.css 내장)만 사용 → CDN 불필요.
- product_viewer 분기 없음(site 사이드바 로고 링크 항상 `/main.php`).

## 데이터 (legacy)
- 도메인 클래스/SQL 없음 — 정적 메뉴 트리. **신규 API 없음.**

## API 계약 (백엔드 전달)
- **신규 엔드포인트 없음.**

## 타겟 매핑
- widget: `widgets/sidebar` — `leftside-menu` + 로고 + `side-nav`(site 트리). ⚠️ Hyper `app.min.css`가 `.collapse{display:block!important}`로 **강제 상시 표시** → legacy 서브메뉴는 토글 불가·항상 펼침. 따라서 collapse는 **정적 상시-표시**로 재현(토글 앵커는 `#id`로 두되 preventDefault, `menu-arrow` 장식). React 상태 불필요.
- 레이아웃 정합: `.navbar-custom{position:fixed;left:260px;right:0;top:0}`(app.min.css) → 사이드바(260px) 우측에 topbar 자동 정렬. `.leftside-menu .logo`(fixed 260×70)가 좌상단을 채움(사용자가 본 빈 자리).
- 링크: legacy `<a href>`(전체 이동), `.php` 제거 매핑(`/site/banner_list` 등). `[X]` 항목은 `#`.
- active 하이라이트(M2-8에서 실배선 시 수정): legacy는 `app.min.js`가 현재 URL과 매칭해 클래스를 부여 → CSS-only이므로 `useLocation`으로 재현. **Hyper 규칙**: 상위 항목/그룹은 `.side-nav-item.menuitem-active`(`> a` 흰색 + 화살표 회전), 2차 항목은 `.side-nav-second-level li.active`(`> a` 흰색). `.side-nav-link.active`는 Hyper CSS에 없어 무효라 **menuitem-active를 사용**. leaf `href="#"`(placeholder)는 매칭 제외. 그룹은 활성 leaf 보유 시 menuitem-active.
- 자산: `H2_DG_BI_nm_160x37.png` 복사 완료.
- 배선: `LayoutShell`(인증 경로) = `Sidebar`(fixed left 260px, 로고 포함) + `Topbar` + `content-page`(margin-left:260px). Hyper CSS가 위치 처리.
- ⚠️ 범위 메모: 영역별 사이드바 선택(라우트→해당 영역 side-nav)은 **M1-6 조립**. M1-4는 **site 트리를 패턴 예시**로 전 인증 경로에 노출(패턴/로고 확립 목적). 대시보드(main.php)의 topnav 변형(사이드바 없음, 로고 in topbar)은 **M1-7** 범위.

## Parity 체크리스트
- [ ] leftside-menu(260px, 보라 그라데이션) + 상단 로고(H2 이미지) 표시
- [ ] side-nav: 운영서비스 현황 + "사이트 관리" collapse(기본 확장) 5개 서브(2개 `[X]` placeholder)
- [ ] 서브메뉴 상시 표시(Hyper `.collapse{display:block!important}` — legacy 동일, 토글 무효)
- [ ] 정책 주석 섹션 미렌더
- [ ] 로고 클릭 → /main
- [ ] active 하이라이트: 현재 경로의 2차 항목(`li.active`) + 상위 그룹(`menuitem-active`) 흰색 강조 (예: `/site/banner_list` → "메인배너 관리" + "사이트 관리")

## 산출물
- widget: `src/widgets/sidebar/`
- 배선: `LayoutShell`에 Sidebar 추가(sidebar + topbar + content-page)
- 자산: `public/assets/images/H2_DG_BI_nm_160x37.png`
- mock: 없음
