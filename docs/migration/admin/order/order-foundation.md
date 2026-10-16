# 주문 영역 기반 (사이드바 전환 + 주문 대시보드)

O1 영역의 첫 단위. 다른 영역 기반 선례(#112 board / #153 stock / #169 promotion / #183 member) 계승.

## 원본
- 파일:
  - `pc/_Admin_/inc/sidebar_order.php` (라이브 사이드바 — 변형/테스트 파일 없음, 유일본)
  - `pc/_Admin_/order/dashboard_order.php` (주문 대시보드 — 라이브. `yjs_dashboard_order.php`는 개인 변형이므로 미채택)
- 참조 문서: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우

### 주문 대시보드 (`dashboard_order.php`)
- 진입 URL: `/order/dashboard_order.php` → 타겟 `/order/dashboard_order`
- 파라미터: 없음
- 화면 요소: `page-title-box` 안에 빈 `page-title-right` div + `h4.page-title "주문 대시보드"`. **breadcrumb 없음, 본문 카드 없음, 데이터/API 없음** (promotion 대시보드보다 더 단순 — datepicker/새로고침 버튼조차 없음).
- topmenu['order']=active (topbar #3에서 이미 배선됨: `/order/dashboard_order`, match `/order`)
- 죽은 스캐폴딩 미이식: `apexcharts.min.js` / `jquery-jvectormap-*` / `demo.dashboard.js` (board #112·promotion #169 선례).

### 사이드바 (`sidebar_order.php`)
- `$sidebar_file = "sidebar_order.php"`로 order 영역 페이지가 선택.
- 상단 대시보드 link(아이콘 `uil-comments-alt`, **font-22 없음** — member 사이드바와 동일 규칙) + 7개 collapse 그룹.
- **모든 그룹이 `class="collapse"`(초기 접힘, `show` 없음)** — 다른 영역(board/stock/promotion/member: 전체 펼침)과 상이. goods 사이드바와 동일하게 Hyper `app.min.js`가 active 링크 부모만 자동 펼침 → **expandAll=false** (goods 아코디언 방식)로 이식.
- 그룹 아이콘은 전부 `uil-shop`(기본 크기).

#### 라이브 그룹·항목 (주석/미노출 제외)
1. **결제 관리 v2** (`#sidebarPayment`): 입금대기(`order_step1`) / 결제완료(`order_step2`) / 가상계좌(`order_vbank`)
   - 제외: 결제내역 동기화(`order_sync`, HTML 주석)
2. **주문 관리 v2** (`#sidebarOrder`): 주문통합(`order_all`) / 주문대기(`order_ready`) / 주문완료(`order_success`) / 취소요청(`order_cancel_request`) / 취소완료(`order_cancel_complete`) / 과거주문(`order_old_list`)
   - legacy markup `class="collapse ="` 오타 — 무의미(show 아님), 이식 시 무시
3. **배송 주문 관리 v2** (`#sidebarOrderDelivery`): 배송통합(`order_shipment_all`) / 배송대기(`order_shipment_pending`) / 배송준비(`order_shipment_ready`) / 배송중(`order_shipment_shipping`) / 배송완료(`order_shipment_delivered`) / 구매확정(`order_shipment_confirm`)
4. **Asset 주문 관리** (`#sidebarOrderAsset`): Asset 주문완료(`order_asset_success`) / Asset 주문조회(`order_asset_key`) / Asset 주문 일괄조회(`order_asset_key_bulk`)
   - 제외: Asset 예약주문(`order_asset_preorder`, 주석) / Asset 주문실패(`order_asset_fail`, 주석)
5. **Ztorm 주문 관리** (`#sidebarOrderZtorm`): Ztorm 주문완료(`order_ztorm_success`) / Ztorm 주문조회(`ztorm_order_view`)
   - 제외: Ztorm 주문대기/주문실패(주석)
6. **Genba 주문 관리** (`#sidebarOrderGenba`): Genba 주문완료(`order_genba_success`) / Genba 주문조회(`genba_order_view`)
   - 제외: Genba 예약주문/주문실패(주석)
7. **Vaultn 주문 관리** (`#sidebarOrderVaultn`): Vaultn 주문완료(`order_vaultn_success`) / Vaultn 주문조회(`vaultn_order_view`)
   - 제외: Vaultn 예약주문/주문실패/주문취소(주석)

#### 그룹 전체 제외 (범위 밖)
- **주문 관리 v1** 그룹(`order_ready`/`order_end`/`order_cancel_request`/`order_cancel_end`/`order_delete`): HTML 주석 처리(구버전).
- **반품/교환 관리 v2** 그룹(`order_exchange_*`): HTML 주석 처리.

> 이 단위는 사이드바 트리 등록 + 대시보드 화면만 이관한다. 개별 목록/조회 화면(order_step1 등)은 후속 단위로 순차 이관하며, 미이관 링크는 라우트 부재 상태로 남긴다(다른 영역 기반 선례 동일).

## 데이터 (legacy)
- 대시보드: 도메인 클래스·SQL 없음(정적 껍데기).
- 사이드바: 정적 마크업.

## API 계약 (백엔드 전달)
- 없음. 대시보드/사이드바 모두 데이터 호출 없음.

## 타겟 매핑
- 라우트: `src/routes/order/dashboard_order.tsx` → `/order/dashboard_order`
- 스크린: `screens/order-dashboard` (`OrderDashboardScreen`, 정적)
- 사이드바: `widgets/sidebar/model/nav.ts` — `ORDER_SIDE_NAV` 추가 + `resolveSideNav`에 `/order` 분기(expandAll=false, goods와 동일 아코디언)
- entities: 없음
- mock: 없음

## Parity 체크리스트
- [ ] 화면 요소 일치 — 대시보드 h4 "주문 대시보드", 빈 page-title-right, 카드/breadcrumb 없음
- [ ] 사이드바 트리 일치 — 대시보드 link(uil-comments-alt) + 7그룹 라벨·항목·순서
- [ ] 분기/플로우 일치 — expandAll=false(active 그룹만 초기 펼침), topbar order→대시보드
- [ ] 엣지케이스 일치 — 주석 그룹(v1/반품교환)·주석 항목(예약/실패/취소/동기화) 미노출, 미이관 링크 라우트 부재
