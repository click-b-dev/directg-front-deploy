# 재고 영역 사이드바 전환 + stock 사이드바 (#153)

> 재고 영역(#152 대시보드) 착수 후 영역 사이드바 배선. goods Unit 17 선례(resolveSideNav + 영역별 SIDE_NAV) 계승.

## 원본
- `pc/_Admin_/inc/sidebar_stock.php`. 각 재고 페이지가 `$sidebar_file="sidebar_stock.php"`로 이 사이드바 선택.
- 참조: [sidebar-goods](../goods/sidebar-goods.md)(#17), [sidebar](../layout/sidebar.md)(#4).

## 화면·플로우
- legacy: 페이지마다 `$sidebar_file`로 좌측 사이드바 선택. 타겟은 **경로 area**로 매핑(`resolveSideNav`).
  - **문제**: stock 페이지 실제 경로는 `/goods/stock/*`·`/goods/asset/*` — 현재 `resolveSideNav`가 `/goods` prefix로 GOODS_SIDE_NAV를 반환한다. → stock area 체크를 **goods 체크보다 먼저** 넣어 전환.
  - goods 트리의 API 그룹 경로(`/goods/ztorm/`·`/goods/genba/`·`/goods/vaultn/`·`/goods/pointnexus/`)는 stock에 포함되지 않으므로 goods 트리 유지(#139 Vaultn 재고확인 `/goods/vaultn/vaultn_stock`은 stock의 `/goods/stock/vaultn_stock`과 다른 파일 — 충돌 없음).
- **stock 사이드바**: 상단 "재고 대시보드" link + 4개 그룹(모두 legacy `collapse show`).
  - 재고 대시보드 → `/goods/stock/dashboard_stock` (icon `uil uil-dashboard font-22`, link) — #152 이관 완료
  - **Asset 서버 관리(API)** (id `sidebarAsset`, icon `uil-shop`): Asset 현황(`/goods/asset/asset_list`) / Asset 등록(`/goods/asset/asset_register`) / Asset 예약현황(`/goods/asset/asset_reserve_list`) / Asset 다운로드(`/goods/asset/asset_download_list`) / Asset Code 현황(`/goods/asset/asset_code_list`) / Asset Code 등록(`/goods/asset/asset_code_register`)
  - **Vaultn 재고(API)** (id `sidebarVaultn`, icon `uil-shop`): Vaultn 재고현황(`/goods/stock/vaultn_stock`)
  - **재고 관리(DB)** (id `sidebarStock`, icon `uil-shop`): Asset 재고현황(`/goods/stock/asset_stock`) / 옵션상품 재고현황(`/goods/stock/goods_option_stock`) / 할인 프로모션 재고현황(`/goods/stock/goods_promotion_stock`) / Asset 랜덤박스 재고현황(`/goods/stock/asset_stock_random`)
  - **Genba Webhook Log** (id `sidebarStockGenba`, icon `uil-shop`): availability log(`/goods/stock/genba_avaliability`)
  - **제외(주석/공백 파일)**: Asset ID조회(`asset_search`)·공급처별 Asset현황(`asset_publisher`)·구매관리 그룹 전체(sidebarBuy)·통합재고현황(`asset_stock_info`)·Asset 공급처별/특전/기초재고/번들/시스템별/재고이동 등 — 모두 HTML 주석. legacy 미노출 그대로 미포함.
- **펼침 정책**: legacy 4개 그룹 모두 `class="collapse show"` → `expandAll=true`(site/board/event와 동일. goods만 아코디언).
- 아이콘: 대시보드 link만 `uil uil-dashboard font-22`. 그룹은 `uil-shop`(기본 크기, board/event와 동일).
- active 하이라이트: #4 규칙 그대로(menuitem-active / li.active).
- 라벨 공백: 대시보드 link만 legacy `<span> 재고 대시보드 </span>`(leading+trailing space) — 원본 보존(SITE "운영서비스 현황 " 선례). 그룹/자식 라벨은 공백 없음.

## 데이터/계약
- 없음(정적 nav 설정). API 없음.

## 타겟 매핑
- `widgets/sidebar/model/nav.ts`: `STOCK_SIDE_NAV` 추가 + `resolveSideNav`에 stock area(`/goods/stock`·`/goods/asset`) 분기를 goods 분기 **앞**에 삽입, `expandAll=true`.
- `widgets/sidebar/ui/sidebar.tsx`: 변경 없음(nav 설정 기반 렌더 재사용).
- 링크는 `.php` 제거 매핑. 미이관 페이지(asset_*/asset_stock/goods_option_stock 등)는 링크만(라우트 미존재 → 클릭 시 404, 순차 이관 시 생성).

## 보류
- product_viewer(admin_level 분기) 축약 사이드바: goods #17과 동일하게 non-viewer 전체판만. auth별 분기 후속.
- bootstrap-icons 미로드 아이콘은 마크업만 유지(해당 없음 — stock은 uil 아이콘만 사용).

## Parity 체크리스트
- [ ] `/goods/stock/*`·`/goods/asset/*` 진입 시 stock 사이드바로 전환(전체 펼침)
- [ ] `/goods/ztorm|genba|vaultn|pointnexus/*` 등은 goods 사이드바 유지(회귀 없음)
- [ ] stock 4개 그룹·링크·상단 대시보드 link 일치(주석 항목 제외)
- [ ] active 그룹 menuitem-active + 2차 항목 active + collapse show
