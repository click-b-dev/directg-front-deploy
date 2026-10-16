# 관리자 레이아웃 조립 (M1-6)

## 원본
- `pc/_Admin_/site/banner_list.php` — 사이드바 페이지 표준 조립(대표).
- `pc/_Admin_/main.php` — topnav(사이드바 없음) 조립(대시보드).
- 조립 부품: `inc/admin_head.php`(head), `inc/admin_body_start.php`(sidebar+topbar), `inc/admin_body_end.php`(footer+scripts).
- 라이브 판별: 단일 버전. 참조: [topbar](topbar.md)/[sidebar](sidebar.md)/[footer](footer.md), `docs/design-system/admin.md`.

## 화면·플로우

### 표준 사이드바 페이지 조립 (banner_list.php)
```php
<?php $sidebar_file = "sidebar_site.php"; include lib.php; $page_title="메인배너 관리"; ?>
<?php include admin_head.php ?>        // <!DOCTYPE><html lang=ko><head>…LoadingOverlay/renderPaging/<style></head>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark", …}'>
  <div class="wrapper">
    <?php include admin_body_start.php ?>   // sidebar_file + topbar.php
    <div class="content-page">
      <div class="content">
        <div class="container-fluid"> …breadcrumb + <h4 class="page-title"> + 본문… </div>
      </div>
    </div><!-- /content-page -->
  </div><!-- /wrapper -->
  <?php include admin_body_end.php ?>       // footer.php + vendor.min.js + app.min.js + simplemde.min.js
</body></html>
```

### topnav 페이지 조립 (main.php)
- 자체 head 인라인(차트/벡터맵 CSS 추가), `admin_head.php` 미사용.
- `<body class="loading" data-layout-config='…dark…'>` 동일.
- `.wrapper > (topnav 마크업) + .content-page.ms-0.pt-0 > .content > .container-fluid`.
- footer는 **wrapper 안**(724줄)이나 `.wrapper{overflow:hidden}`에 클리핑됨 → 공통 패턴(banner_list = wrapper 밖)을 따른다.
- 스크립트: vendor/app/apexcharts/jvectormap/demo.dashboard.

### 조립 순서 (양 레이아웃 공통 계약)
`head → body(테마 속성) → wrapper[ sidebar+topbar(또는 topnav) + content-page>content>container-fluid[본문] ] → footer → scripts`

## 데이터 (legacy)
- 없음 — 정적 조립 셸. **신규 API 없음.**

## API 계약 (백엔드 전달)
- **신규 엔드포인트 없음.**

## 타겟 매핑 (이미 구현됨 — 이 단위는 검증·문서화)
- **head**: `apps/directg-admin/index.html` — `admin_head.php` 로드 순서/구조 재현(폰트·icons·app/app-dark CSS·인라인 style). `design-system/admin.md §1` ✅.
- **body 셸**: `index.html` `<body data-leftbar-theme="dark">` — legacy `data-layout-config`(JSON, app.min.js가 파생) 대신 **CSS-only 실효 속성**만 정적 부여. `class="loading"`은 테마 JS가 로드 후 제거하는 과도 상태라 재현 안 함(등가 종료 상태). `design-system/admin.md §1` 26~30줄.
- **조립 체인**: `app/providers.tsx` `AppErrorBoundary → AuthProvider → RouteGuard → LayoutShell` → `__root.tsx` `<Outlet/>`.
- **LayoutShell**(`widgets/layout-shell`): `pathname`으로 3분기
  - public(로그인 등): 독립 레이아웃(셸 없음).
  - topnav(main.php): `Topbar variant=topnav` + `.wrapper > .content-page.ms-0.pt-0 > .content > .container-fluid` + Footer(wrapper 밖).
  - sidebar(기본): `.wrapper > Sidebar + Topbar + .content-page > .content > .container-fluid` + Footer(wrapper 밖).
- **본문 breadcrumb + `page-title-box`**: 페이지별 콘텐츠 → 각 content-page 단위(M1-7, M2+)에서 `.container-fluid` children으로 렌더. 레이아웃 조립 범위 밖.
- **admin_body_end 스크립트**: vendor/app.min.js는 **CSS-only 확정으로 미로드**(`design-system/admin.md` 26줄). simplemde는 에디터 화면 이관 시 결정(⏸). apexcharts/jvectormap은 대시보드(M1-7) 단위에서 결정.

## 미해결 — 개발자 판단 필요
- **`$page_title` → per-route `document.title`**: legacy는 페이지마다 `<title>$page_title</title>`로 브라우저 탭 제목이 달랐다. 현재 `index.html` 정적 제목("다이렉트 게임즈 관리자시스템") 하나뿐. 실제 콘텐츠 페이지가 아직 없어(전 라우트 stub) 미관측.
  - **옵션 A(권장, 미리 만들지 않음)**: 각 content-page 단위(M1-7 등)에서 해당 페이지 title을 설정하며 함께 이관. 레이아웃 단위에서는 인프라 선구축 안 함.
  - **옵션 B**: 지금 공통 per-route title 메커니즘(예: 라우트 `head`/effect)을 신설.

## Parity 체크리스트
- [x] head 로드 순서/구조 legacy 재현 (index.html)
- [x] body 테마 속성(`data-leftbar-theme=dark`) legacy 실효 상태 재현
- [x] 조립 순서 head→sidebar/topbar→content-page>content>container-fluid→footer 일치
- [x] sidebar / topnav / public 3레이아웃 분기 일치
- [x] per-route `document.title`($page_title) — **옵션 A 확정**: 각 content-page 단위에서 title 설정(레이아웃 단위는 인프라 선구축 안 함)

## 산출물
- 신규 구현 없음(기존 `index.html` + `app/providers.tsx` + `widgets/layout-shell` 검증).
- mock: 없음.
