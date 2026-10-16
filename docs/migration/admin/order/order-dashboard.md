# 주문 대시보드 (처리 필요 6카드)

O1 영역 대시보드 콘텐츠 이관. #192(order-foundation)에서 라이브 `dashboard_order.php`(정적 껍데기)를 이관했으나, **개발자 지시로 개인 변형본 `yjs_dashboard_order.php`를 채택**한다(parity 이탈, 개발자 승인 기록).

## 원본
- 파일: `pc/_Admin_/order/yjs_dashboard_order.php` (163줄, `yjs_` 개인 변형본 — 라이브 `dashboard_order.php`는 정적 껍데기)
- 채택 근거: 라이브는 h4 제목만 있는 빈 껍데기이며, 운영에 필요한 "처리 필요" 모니터링 대시보드로 `yjs_` 변형본을 사용하기로 개발자가 결정(#192는 정적 상태 그대로 검증완료였고, 본 단위에서 콘텐츠를 얹음).
- 참조 문서: `docs/legacy-admin/40-order.md`, `../legacy-project/docs/ORDER-WORKFLOW-AUDIT.md`

## 화면·플로우
- 진입 URL: `/order/dashboard_order.php` → 타겟 `/order/dashboard_order` (라우트 동일, 스크린 콘텐츠 교체)
- 파라미터: 없음
- topmenu['order']=active (topbar #3 배선 유지)

### 화면 요소 (legacy 기준)
- `page-title-box`: `page-title-right`에 **새로고침 버튼**(`btn btn-sm btn-light`, `<i class="uil-sync"></i> 새로고침`, `onclick="location.reload()"`) + `h4.page-title "주문 대시보드"`. **breadcrumb 없음.**
- **처리 필요 섹션 헤더**: `<h5 class="mb-2"><i class="uil-bolt-alt text-danger"></i> 처리 필요</h5>`
- **카드 6종**(row 안, 각 `col-xl-2 col-md-4 col-6 mb-2`, 순서 고정):
  | # | label | desc | icon | 링크(legacy → 타겟) |
  |---|-------|------|------|------|
  | 1 | 키발급 실패 | 결제완료인데 키 미발급 | `uil-exclamation-octagon` | `order_ready.php` → `/order/order_ready` |
  | 2 | 취소요청 | 취소요청 상태 대기 | `uil-history` | `order_cancel_request.php` → `/order/order_cancel_request` |
  | 3 | 가상계좌 입금대기 | 가상계좌 발급 후 미입금 | `uil-clock` | `order_vbank.php` → `/order/order_vbank` |
  | 4 | 실물 배송대기 | 배송 시작 전 | `uil-truck` | `order_shipment_pending.php` → `/order/order_shipment_pending` |
  | 5 | 연동없음 의심 | 코드발송인데 연동시스템 없음 | `uil-question-circle` | `order_success.php?order_system=none&search_start_date=2020-01-01&search_end_date=<today>` → `/order/order_success?...` |
  | 6 | PointNexus 미confirm | 가상계좌 book 입금확인 대기 | `uil-key-skeleton` | `goods/pointnexus/pointnexus_book_confirm.php` → `/goods/pointnexus/pointnexus_book_confirm` |
- 카드 마크업: `<a href=url class="text-reset text-decoration-none">` > `card h-100 border {border}` > `card-body p-2 text-center` > `i.{icon} font-20 {num_cls}` + `h2.my-1.{num_cls}` (건수) + `p.mb-0.fw-bold` (label) + `p.mb-0.text-muted.font-12` (desc).
- **하단 안내**: `<p class="text-muted font-12 mt-1">※ 각 건수는 해당 리스트 페이지와 동일 기준으로 집계됩니다. 카드를 클릭하면 상세 리스트로 이동합니다.</p>`

### 카드 색상/건수 규칙 (legacy 124~133행)
- `count === null` (집계 실패/테이블 없음): `border-warning` · `text-warning` · 건수 표시 `-`
- `count > 0`: `border-danger` · `text-danger` · 건수 `number_format(count)`(천단위 콤마)
- `count === 0`: `border-light` · `text-muted` · 건수 `0`

### 분기/플로우
- 카드 클릭 → 각 리스트 페이지 이동(모두 이관 완료된 라우트, `<a href>`).
- 새로고침 버튼 → 페이지 리로드(legacy `location.reload()`) → 건수 재조회.
- **연동없음(#5) 링크만 특수**: order_success 기본 기간이 "오늘"이라, 전체를 보도록 `search_start_date=2020-01-01`, `search_end_date=<오늘 Y-m-d>`을 명시적으로 전달. `<today>`는 렌더 시점 로컬 날짜.

## 데이터 (legacy)
- `yjs_dashboard_order.php` 내 6개 inline `COUNT(*)` SQL(dash_count 헬퍼, 예외 시 null 반환):
  1. **키발급 실패**: `tbl_order a ⋈ tbl_order_item b ON a.settle_no=b.settle_no WHERE a.step='2' AND b.send_status='fail' AND b.status='1'` (= order_ready 조건)
  2. **가상계좌 입금대기**: `COUNT(DISTINCT a.settle_no)` `tbl_order a LEFT JOIN kcp_log b ON a.settle_no=b.settle_no AND a.payment_method='SC0040' LEFT JOIN payco_log c ON a.settle_no=c.sellerOrderReferenceKey AND c.paymentCompletionYn='N' WHERE a.step='1' AND (b.settle_no IS NOT NULL OR c.sellerOrderReferenceKey IS NOT NULL)` (= order_vbank getOrderVbankReady 조건)
  3. **취소요청**: `tbl_order a ⋈ tbl_order_item b WHERE (b.status='7' OR b.status='8')`
  4. **실물 배송대기**: `tbl_order a ⋈ tbl_order_item b ⋈ tbl_order_shipment c ON a.settle_no=c.settle_no AND b.ordno=c.ordno WHERE a.step='2' AND b.status='2' AND c.shipment_status='2' AND b.delivery_type<>'1'` (= order_shipment_pending 조건)
  5. **연동없음 의심**: `tbl_order_item WHERE status='2' AND (order_system='' OR order_system IS NULL) AND (delivery_type='1' OR delivery_type='3')`
  6. **PointNexus 미confirm**: `tbl_order_item_pointnexus a ⋈ (SELECT ordno, productID, MAX(idx) max_idx ... GROUP BY ordno, productID) b ... WHERE a.action='book' AND a.status='booked'`
- 각 건수는 대상 리스트 페이지와 **동일 조건**으로 집계(건수 일치 보장) — 백엔드 책임.

## API 계약 (백엔드 전달)
- `GET /admin/order/dashboard` — 처리 필요 6 카운트 스냅샷(read-only).
  - 요청: 파라미터 없음.
  - 응답 `200`:
    ```jsonc
    {
      "key_fail":      number | null,  // 1. 키발급 실패
      "cancel_req":    number | null,  // 2. 취소요청 (status 7/8)
      "vbank":         number | null,  // 3. 가상계좌 입금대기
      "ship_pending":  number | null,  // 4. 실물 배송대기
      "no_system":     number | null,  // 5. 연동없음 의심
      "pn_book":       number | null   // 6. PointNexus 미confirm
    }
    ```
  - **null 규약**: 개별 집계가 실패(테이블 부재/쿼리 오류)하면 해당 필드만 `null` — 프론트가 카드에 `-`(경고색) 표시. legacy `dash_count`가 예외 시 null 반환하는 동작 계약화.
  - 각 카운트 SQL 조건은 위 "데이터" 절 참조. 대상 리스트 페이지와 동일 기준 유지가 백엔드 책임.
  - 에러: 전체 DB 연결 실패 시 legacy는 `die()`(500 상당). 프론트는 표준 에러 처리.

## 타겟 매핑
- 라우트: `src/routes/order/dashboard_order.tsx` (기존 유지, 컴포넌트 `OrderDashboardScreen`)
- 스크린: `screens/order-dashboard` (`OrderDashboardScreen` 재작성 — 정적 껍데기 → 6카드)
- entities: **신규 `entities/order-dashboard`** (goods-dashboard/member-dashboard 선례 — 독립 슬라이스). `fetchOrderDashboard` + `useOrderDashboard` + `OrderDashboard` 타입
- mock: 신규 `shared/mocks/handlers/order-dashboard.ts` (고정 payload, `GET /admin/order/dashboard`) + handlers.ts 등록

## Parity 체크리스트
- [ ] 화면 요소 일치 — 새로고침 버튼·처리 필요 헤더·6카드(라벨/desc/아이콘/순서)·하단 안내문
- [ ] 필드/색상 일치 — null=`-`+warning / >0=콤마+danger / 0=`0`+muted, border 규칙
- [ ] 분기/링크 일치 — 6카드 각 타겟 라우트, 연동없음 특수 쿼리(order_system=none + 2020-01-01~오늘)
- [ ] 엣지케이스 일치 — 집계 null 카드 `-` 경고색, 새로고침=리로드
