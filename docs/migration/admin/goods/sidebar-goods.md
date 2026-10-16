# 사이드바 영역 전환 + goods 사이드바 (#17)

> #16(디지털상품 목록)에서 지적된 갭 해소. #4에서 보류된 "영역별 사이드바 선택" 구현.

## 원본
- `pc/_Admin_/inc/sidebar_goods.php` (761줄). 각 페이지가 `$sidebar_file`로 사이드바 선택.
- 참조: [sidebar](../layout/sidebar.md)(#4 사이트 사이드바).

## 화면·플로우
- legacy: 페이지마다 `$sidebar_file="sidebar_goods.php"` 등으로 좌측 사이드바를 선택. 타겟은 **경로 area**로 매핑(`resolveSideNav`).
  - `/site/*` → site 트리(sidebar_site, #4).
  - `/goods/*`·`/steam/*`·`/tag/*`·`/code/*` → goods 트리(goods 사이드바가 이 링크들을 포함).
- **goods 사이드바(non-viewer 전체판)**: 상단 "상품 대시보드" link + 15개 그룹.
  - 대표상품 관리 / 대표상품 이미지 관리 / 옵션상품 관리 / 옵션상품 이미지 관리 / 제공컨텐츠 관리 / 한글패치 관리 / 심의정보 관리 / Steam API / Ztorm API / Genba API / Vaultn API / PointNexus API / TAG 관리 / 코드 관리 / 그룹 관리.
  - 주석 처리 항목(small capsule, 등록류, Youtube, Epic, 공급처 등)은 미포함.
- **펼침 정책 차이(중요)**: `.side-nav .collapse`는 CSS에서 display:none, `.collapse.show`만 표시.
  - site sidebar: legacy `collapse show`(전체 펼침) → `expandAll=true`.
  - goods sidebar: legacy `collapse`(아코디언 — app.min.js가 active 그룹만 펼치고 그룹 클릭 시 독립 토글) → CSS-only이므로 **React 상태로 재현**: active 그룹 기본 펼침 + **그룹 헤더 클릭 시 해당 그룹 독립 토글**(`aria-expanded`/`.collapsed`/menu-arrow 반영). `expandAll=false`.
- active 하이라이트는 #4 규칙 그대로(menuitem-active / li.active).

## 데이터/계약
- 없음(정적 nav 설정). API 없음.

## 타겟 매핑
- `widgets/sidebar/model/nav.ts`: `GOODS_SIDE_NAV` + `resolveSideNav(pathname)` → `{ entries, expandAll }`.
- `widgets/sidebar/ui/sidebar.tsx`: `resolveSideNav`로 트리 선택, 그룹 collapse `show`는 `expandAll || groupActive`.
- 링크는 `.php` 제거 매핑. 미이관 페이지는 링크만(라우트 미존재 → 클릭 시 404, 이관되며 생성).

## 스크롤 폴백
- legacy는 simplebar(커스텀 스크롤바)로 긴 사이드바를 스크롤. CSS-only라 **네이티브 스크롤 폴백** 적용: `#leftside-menu-container{overflow-y:auto}`(`widgets/sidebar/ui/sidebar.css`). base `.leftside-menu`는 overflow 미지정이라 goods처럼 그룹 많은 사이드바(Steam 8·PointNexus 13 항목 등 펼침 시)는 뷰포트를 넘어 하단이 잘렸음 → 스크롤로 해결.

## 보류
- **product_viewer(admin_level=="1") 간소화 사이드바**: legacy는 상품뷰어에게 축약 goods 사이드바(API 그룹 없음) 표시. 이 단위는 **non-viewer 전체판**만 구현 — auth별 분기는 후속(topbar #3처럼 권한 분기 필요 시).
- bootstrap-icons 미로드로 `bi bi-steam` 아이콘 미표시(마크업만 유지).
- goods 하위 페이지 다수 미이관 → 사이드바 링크는 존재하나 대상 라우트는 순차 이관.

## Parity 체크리스트 (개발자 승인 완료 — ✅ 검증완료)
- [x] /goods/* 진입 시 goods 사이드바로 전환(디지털상품 목록 등 active 그룹만 펼침)
- [x] /site/* 는 기존 site 사이드바(전체 펼침) 유지
- [x] goods 15개 그룹·링크·상단 대시보드 링크
- [x] active 그룹 menuitem-active + 2차 항목 active + collapse show
- 기계 검증: tsc 0 / lint 0 / build 성공(474 modules).
