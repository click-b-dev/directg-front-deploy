# 어드민 — 주문(Order)

> 대상: `pc/_Admin_/order/` (+ `order/batch/`) 총 59개 파일. 사이드바 `inc/sidebar_order.php`, topbar 진입점 `order/dashboard_order.php`.
> 이 문서는 **어드민 화면이 주문 도메인 규칙을 어떻게 조작·노출하는가**를 기술한다. 상태 계약의 근거(전이 조건, 결제 승인, 이행 분기, 메일 트리거)는 도메인 문서를 단일 진실 원천으로 삼는다: `ORDER-WORKFLOW-AUDIT.md`, `PAYMENT-APPROVAL.md`, `BUSINESS-RULES.md`, `NOTIFICATION-EMAIL.md`.
> 공통 인프라(세션가드 `lib/lib.php` + `$_SESSION['admin']`, DB 2개 `$conn`(메인)/`$conn_dgkr`(dgkr), 레이아웃 `admin_head`+`topbar`+`sidebar_order`+`footer`, jQuery/Bootstrap5, 공통 JS)는 반복 서술하지 않는다.

## 개요

### 상태값 (코드 확인분 — `AdminOrder.php`)

주문 라이프사이클은 **결제상태(step, `tbl_order.step`)** / **주문상태(status, `tbl_order_item.status`)** / **배송상태(shipment_status, `tbl_order_shipment.shipment_status`)** 세 축으로 관리된다. `send_status`는 항목의 발송 결과(`pending`/`delivered`/`fail`)를 담는다.

- **step (결제상태 · `getCheckoutStatus`)**: `1`=입금대기, `2`=결제완료, `8`=환불요청, `9`=환불완료, `99`=취소완료
- **status (주문상태 · `getOrderStatus`)**: `1`=주문대기, `2`=주문완료, `3`=배송준비, `4`=배송중, `5`=배송완료, `6`=구매확정, `8`=취소요청, `9`=취소완료
- **shipment_status (배송상태 · `getShipmentStatus`)**: `2`=배송대기, `3`=배송준비, `4`=배송중, `5`=배송완료, `6`=구매확정, `8`=취소요청, `9`=취소완료
- **delivery_type (배송유형 · `getDeliveryType`)**: `1`=코드발송, `2`=택배발송, `3`=코드+택배발송
- **payment_method (결제수단 · `getSettlekindLabel`)**: `SC0010`신용카드, `SC0030`계좌이체, `SC0040`가상계좌, `SC0060`휴대폰, `POINT`포인트, `PAYCO`페이코, `DG0000`전액할인, `samsung`삼성페이, `toss_bank`퀵계좌이체, `toss_pay`토스머니

> 배경(프롬프트 제공): 결제수단 VCNT(가상계좌)면 주문상태 입금대기(step=3 상당), 그 외 즉시발송. 상세 승인/입금대기 분기와 근거는 PAYMENT-APPROVAL.md 참조. 어드민 화면 관점에서 `getCheckoutStatus`의 `1`=입금대기가 이에 해당한다.

### 이행 분기 (order_system)

주문항목의 `order_system` 값으로 공급사 이행이 분기된다. 어드민에서 이 값에 따라 취소/재발송/키확인 API 대상이 달라진다. 코드에서 확인된 문자열 키: **`Asset` / `Ztorm` / `Genba` / `Vaultn` / `PointNexus`** (`order_ps.php` case "order_item_cancel"·"resend", `order_licence.php`). 프롬프트의 숫자코드(1 Asset/2 Ztorm/8 Vaultn/9 Genba/10 PointNexus)와 문자열 라벨의 매핑 계약은 PAYMENT-APPROVAL.md 참조.

- **Asset** — 자사/예약형. 취소 시 `runReserveCancel(reserve_id)`. 키확인 `getAssetLicence`.
- **Ztorm** — Hub 별도취소 필요(어드민은 취소 API 미호출, 안내문만 표기). 조회 `ztorm_order_view.php`.
- **Genba** — 취소 `runGenbaPerformOrderActionAsync(ID)` → State=3이면 로컬 반영. 조회 `genba_order_view.php`.
- **Vaultn** — 취소 `runCancelOrder(orderId)`. 조회 `vaultn_order_view.php`.
- **PointNexus** — append-only 이력 모델. 취소는 booked→`runBookCancel`(동기), 그 외→`runOperationCancel`(비동기, cancel_pending 후 검증배치가 확정). 조회 `pointnexus_operation_view.php`, 키확인 `getPointNexusLicence`.

## 메뉴 트리 (sidebar_order.php 기준)

주석 처리된(비활성) 항목은 `~~취소선~~`으로 표기. topbar에 별도로 `주문 대시보드`(`dashboard_order.php`)가 사이드 최상단.

- **주문 대시보드** → `order/dashboard_order.php`
- **결제 관리 v2**
  - 입금대기 리스트 → `order/order_step1.php`
  - 결제완료 리스트 → `order/order_step2.php`
  - 가상계좌 리스트 → `order/order_vbank.php`
  - ~~결제내역 동기화 → `order/order_sync.php`~~ (비활성)
- **주문 관리 v2**
  - 주문통합 리스트 → `order/order_all.php`
  - 주문대기 리스트 → `order/order_ready.php`
  - 주문완료 리스트 → `order/order_success.php`
  - 취소요청 리스트 → `order/order_cancel_request.php`
  - 취소완료 리스트 → `order/order_cancel_complete.php`
  - 과거주문 리스트 → `order/order_old_list.php`
- **배송 주문 관리 v2**
  - 배송통합 → `order/order_shipment_all.php`
  - 배송대기 → `order/order_shipment_pending.php`
  - 배송준비 → `order/order_shipment_ready.php`
  - 배송중 → `order/order_shipment_shipping.php`
  - 배송완료 → `order/order_shipment_delivered.php`
  - 구매확정 → `order/order_shipment_confirm.php`
- **Asset 주문 관리**: 주문완료 `order/order_asset_success.php` / 주문조회 `order/order_asset_key.php` / 일괄조회 `order/order_asset_key_bulk.php` (예약주문·주문실패는 비활성)
- **Ztorm 주문 관리**: 주문완료 `order/order_ztorm_success.php` / 주문조회 `order/ztorm_order_view.php`
- **Genba 주문 관리**: 주문완료 `order/order_genba_success.php` / 주문조회 `order/genba_order_view.php`
- **Vaultn 주문 관리**: 주문완료 `order/order_vaultn_success.php` / 주문조회 `order/vaultn_order_view.php`
- ~~반품/교환 관리 v2 (`order_exchange_request.php`, `order_exchange_completed.php`)~~ (전체 비활성, 파일 미존재)
- ~~주문 관리 v1 (`order_ready`, `order_end`, `order_cancel_request`, `order_cancel_end`, `order_delete`)~~ (구버전 메뉴 비활성)

> **사이드바 미노출(orphan) 파일**: `order_reseller.php`, `order_not_received.php`, `order_refund_completed.php`, `order_delete.php`, `order_end.php`, `order_detail.php`, `order_licence.php`, `order_excel_export.php`, `order_old_excel.php`, `order_view.php`/`order_view_v2.php`(목록에서 링크 진입), `pointnexus_operation_view.php`, `order_vaultna_cancel.php`, 각종 `*_sync*`·`batch/*`. 목록 상세 링크·다른 화면 AJAX·배치 실행으로만 접근한다.

## 페이지별 정의

### 주문통합 리스트 — `order/order_all.php`
- **유형**: `*_list` (목록)
- **기능**: 전 주문을 기간·연동시스템·검색키로 필터. 컬럼: 주문일자/결제번호(→`order_view.php?settle_no=`)/결제상태/주문번호/회원아이디+IP/상품정보/주문금액/주문상태/수령여부(`is_actv`)/배송유형.
- **정책·규칙**: 기간 미지정 시 오늘 하루. JS로 최대 93일 제한, 종료<시작 방지. 검색어 입력 시 기간필터 해제(전체기간). 상태/유형은 `AdminOrder`의 라벨 헬퍼로 렌더.
- **데이터소스**: `AdminOrder::getOrderAll($page,$where,$orderby,$param,'20')`; `tbl_order b`(별칭). 페이지당 20건.
- **폼필드·파라미터(GET)**: `page`, `search_key`(search_ordno/search_settle_no/search_m_id/search_product_code), `search_value`, `search_start_date`, `search_end_date`, `date_label`, `order_system`(all/Asset/Ztorm/Genba/Vaultn).
- **연계**: 읽기전용. 상세로 링크만.
- **참조**: ORDER-WORKFLOW-AUDIT.md.

### 주문 상세 — `order/order_view.php`
> 주문 도메인의 **핵심 조작 화면**(98KB). 결제취소/환불·주문취소·재발송·운송장등록·메모·키확인의 모든 버튼이 여기에 모여 있고, 대부분 `order_ps.php`(일부는 `order_licence.php`)로 POST한다.
- **유형**: `*_view` (상세) — 다수의 AJAX 트리거 포함.
- **기능(섹션)**:
  1. **주문상품/취소처리**: 항목별 `취소` 버튼(모달 `#order-cancel-modal`), `반려` 버튼(취소요청 반려), 조건부 `재발송` 버튼.
  2. **PG별 결제취소 카드**: 결제수단(KCP/Toss/Tossadapter/Tosspay/Payco/NaverPay)에 따라 각기 다른 폼·버튼 노출. 가상계좌는 `계좌반납`.
  3. **적립금/포인트**: `결제취소+사용적립금 반환`(mode=order_refund), `사용적립금 반환`(mode=point_refund).
  4. **배송(delivery_type 2/3)**: 운송장 등록 폼(`register_tracking_no_item`), 배송조회(CJ/우체국 외부 폼 submit).
  5. **관리자 메모**: `memo_add`(memo_gubun: 취소환불/차액환불 등).
  6. **키확인**: `키 확인` 버튼 → `order_licence.php`로 AJAX(모달 표시).
- **정책·규칙(코드 확인)**:
  - **재발송 노출 가드**(항목 렌더): `step=='2'`(결제완료) && `delivery_type in (1,3)`(코드발송) && `send_status=='fail'` && `status=='1'`(주문대기)일 때만 `재발송` 버튼 표시.
  - **취소 모달**: 시스템이 `Ztorm`이면 "Hub에서 별도 주문취소 필요" 안내 표기(취소 API는 호출하지 않음 — ps case에서도 Ztorm은 로컬 처리만).
  - 처리자(`admin_id`)는 세션에서 채워 hidden으로 전송.
- **데이터소스(클래스·테이블)**: `AdminOrder`(주문/항목/주소/PG로그/주문로그 조회 다수), `PaycoPG`. 테이블: `tbl_order`, `tbl_order_item`, `tbl_order_shipment`, `tbl_order_item_asset/ztorm/genba/vaultn/pointnexus`, `tbl_order_log`, `kcp_log`/`toss_log`/`tosspay_log`/`payco_log`/`naverpay_log` 계열.
- **폼필드·파라미터(POST → order_ps.php)**: `mode`, `settle_no`, `ordno`, `order_system`, `delivery_type`, `message`, `admin_id`, `memo_gubun`, `tracking_no`, `delivery_code`, PG별 키(`paymentKey`/`cancelAmount`/`tno`/`mod_type`/`orderNo`/`orderCertifyKey`/`cancelTotalAmt`/`payToken`/`refundNo`/`paymentId`), `use_emoney`.
- **연계**: → `order_ps.php`(대부분 액션), → `order_licence.php`(키확인), → PointNexus operation 뷰(신규창), 외부 택배사 추적.
- **참조**: PAYMENT-APPROVAL.md, ORDER-WORKFLOW-AUDIT.md, NOTIFICATION-EMAIL.md.

### 주문 액션 처리기 — `order/order_ps.php`
> 주문 영역의 **중앙 POST 디스패처**(31.6KB). `mode` 스위치로 결제취소·환불·주문취소·재발송·운송장/배송상태·메모를 처리한다. log4php 로깅 사용. `order_view`·`order_shipment_ready` 등 다수 화면이 여기로 POST. 개별 mode의 상태변화/부수효과는 아래 **상태전이·액션 매핑표** 참조.
- **유형**: `*_ps` (POST 처리, 화면 없음).
- **데이터소스**: `$conn`+`$conn_dgkr`, `AdminOrder`, `Order`, `OrderRepository`, `OrderFulfillment`(+`OrderFulfillment_PointNexus`), PG 클래스(`Kcp`/`Toss`/`Tossadapter`/`Tosspay`/`PaycoPG`/`NaverPay`), 공급사 클래스(`Asset`/`Ztorm`/`Genba`/`Vaultn`/`PointNexus`).
- **참조**: PAYMENT-APPROVAL.md(환불 승인), ORDER-WORKFLOW-AUDIT.md(상태전이).

### 결제 리스트들 — `order_step1.php` / `order_step2.php` / `order_vbank.php`
- **유형**: `*_list`.
- **기능/데이터소스**:
  - `order_step1.php` (입금 대기): `getOrderPaymentReady(...,'30')`. 결제수단 라벨 표시.
  - `order_step2.php` (결제완료): `getOrderPaymentApproved(...,'30')`. `getPGProvider`+`getSettlekindLabel`, `getCheckoutStatus` 표기.
  - `order_vbank.php` (가상계좌): `getOrderVbankReady(...,'30')`. `step=='8'`은 "취소요청"으로 표기(그 외 `getCheckoutStatus`).
- **정책·규칙**: 상세는 `order_view.php`에서 조작. 목록은 조회+진입.
- **참조**: PAYMENT-APPROVAL.md.

### 주문 리스트들 — `order_ready.php` / `order_success.php` / `order_cancel_request.php` / `order_cancel_complete.php`
- **유형**: `*_list`.
- **데이터소스**: 각각 `getOrderReadyList` / `getOrderSuccess` / `getOrderCancelRequest` / `getOrderCancelComplete` (대부분 페이지당 30, success는 20). 공통 `getOrderStatus`·`getDeliveryType` 라벨.
- **연계**: 취소요청 목록의 반려/취소는 상세(`order_view`)에서 처리.
- **참조**: ORDER-WORKFLOW-AUDIT.md.

### 배송 주문 리스트들 — `order_shipment_*.php` (all/pending/ready/shipping/delivered/confirm)
- **유형**: `*_list` (+ `ready`는 액션 포함).
- **데이터소스**: `getOrderShipmentAll/Pending/Ready/Shipping/Delivered/Confirm(...,'30')`; `tbl_order_shipment` 중심.
- **정책·규칙**:
  - `order_shipment_ready.php`: 체크박스 선택 → `mode=shipment_shipping` 배열 POST(`order_ps.php`). shipment_status 3→4로 일괄 전이 + 에스크로(`escw`=Y)·PG(toss/kcp)에 배송등록/에스크로 배송통보 API. KCP/Tossadapter 로그 조회(`getOrderKcpLog`/`getOrderTossAdapterLog`), 택배사(`getShipmentCompany`) 표시.
  - `order_shipment_*` 여러 화면에 CSV용 `sales_excel_download` 폼 존재(정산/매출 내보내기).
- **연계**: → `order_ps.php`(shipment_shipping/shipment_shipped/actual_delivery).
- **참조**: ORDER-WORKFLOW-AUDIT.md, STATISTICS-REPORTING.md.

### 공급사 주문완료 리스트 — `order_asset_success.php` / `order_ztorm_success.php` / `order_genba_success.php` / `order_vaultn_success.php`
- **유형**: `*_list` (공급사별).
- **데이터소스**: `getOrderAssetSuccess` / `getOrderZtormSuccess` / `getOrderGenbaSuccess` / `getOrderVaultnSuccess`. 각 `tbl_order_item_<system>` 조인.
- **참조**: PAYMENT-APPROVAL.md(order_system 매핑).

### 공급사 API 실시간 조회 — `ztorm_order_view.php` / `genba_order_view.php` / `vaultn_order_view.php` / `pointnexus_operation_view.php`
- **유형**: `*_view` (외부 API 조회형, 읽기).
- **기능**: 검색어(주문키/operationID/customer_product_id 등)로 공급사 API를 실시간 호출해 원본 상태를 보여줌. DB(`getOrderItem<System>`)와 대조.
- **데이터소스**: `Ztorm`/`Genba("Live")`/`Vaultn`/`PointNexus($mode)` 클래스 + `AdminOrder::getOrderItem<System>`. `pointnexus_operation_view`는 `mode` 셀렉트로 API 모드 전환.
- **참조**: PAYMENT-APPROVAL.md.

### 키/라이선스 확인 (AJAX) — `order/order_licence.php`
- **유형**: `*_json`(AJAX, HTML 조각 반환).
- **기능**: `order_view`의 `키 확인` 버튼 대상. `mode`별로 공급사 키/라이선스 조회 후 모달용 HTML 반환.
- **modes(코드 확인)**: `getAssetLicence`(Asset, `reserve_id`), `getZtormLicence`, `getGenbaLicence`, `getVaultnLicence`, `getPointNexusLicence`(배송행 1건, `item_order_id=tbl_order_item_pointnexus.idx`, 라이브 조회 실패 시 DB 폴백).
- **파라미터(POST)**: `mode`, `item_order_id`.
- **데이터소스**: `Asset`/`PointNexus` 등 공급사 클래스.

### Asset 주문조회 — `order_asset_key.php` / `order_asset_key_bulk.php`
- **유형**: `*_view`(단건/일괄 조회).
- **기능**: Asset 발급키/주문 조회(bulk는 일괄 폼). `Asset($conn)` 클래스 사용.
- **참조**: PAYMENT-APPROVAL.md.

### 과거주문 리스트/엑셀 — `order_old_list.php` / `order_old_excel.php` / `order_old_view.php`
- **유형**: `*_list` / `*_excel`(CSV) / `*_view`.
- **기능**: 연도별 과거 주문(`$search_year`). `dgkr` DB(`$conn_dgkr`) 사용. `getOrderOldList`/`getOrderOldView`. `order_old_list`에서 `order_old_excel.php`로 POST하여 CSV 다운로드(`Content-Disposition: attachment`).
- **연계**: → `order_old_excel.php`(CSV 내보내기), 상세는 `order_old_view.php`(164.8KB — 구버전 상세, 나열).
- **참조**: STATISTICS-REPORTING.md.

### 정산/내보내기 계열 — `order_excel_export.php`
- **유형**: `*_excel`(CSV 다운로드, 화면 없음).
- **기능**: `DGKR_미발송목록_YYYY-MM-DD.csv` 다운로드. 미발송 목록 CSV 생성(`$conn`).
- **참조**: STATISTICS-REPORTING.md.

### 운영 보조 목록(orphan) — `order_reseller.php` / `order_not_received.php` / `order_refund_completed.php` / `order_delete.php` / `order_end.php`
- **유형**: `*_list`.
- **기능/데이터소스**:
  - `order_reseller.php`: 리셀러 의심회원 주문(`getResellerOrderList`).
  - `order_not_received.php`: 미수령 리스트(`getOrderNotReceived(...,'30')`, `is_actv` 기준).
  - `order_refund_completed.php`: 취소/환불 완료(`getOrderRefund(...,'30')`).
  - `order_delete.php` / `order_end.php`: 구버전(v1) 목록, `$conn_dgkr`+`getOrderList`. 사이드바 비노출.
- **참조**: ORDER-WORKFLOW-AUDIT.md, MEMBER-LIFECYCLE.md(리셀러).

### 기타 조회/보조
- `order/order_detail.php` (953B): `PaycoPG`로 Payco 결제 상세 조회(AJAX 조각). `order_view`의 결제 상세정보 버튼 대상 추정.
- `order/order_vaultna_cancel.php` (2.7K): Vaultn 주문취소 보조 화면(GET 검색 폼). 사이드바 비활성.
- `order/order_view_v2.php` (79.7K): `order_view.php`의 v2 변형 — 아래 변형 파일 참조.

### 동기화·배치 — `order/*sync*.php`, `order/batch/*`
- **유형**: `batch/`(일괄·CLI/관리자 실행형).
- **기능(코드 확인)**:
  - `order_sync_batch.php` / `order_cancel_sync_batch.php`: `dgkr` 레거시 `tbl_order`(및 `tbl_order_2020`)에서 신규 `tbl_order`로 **주문 마이그레이션 upsert**(`mode=batch_day`, `ord_ymd`·`search_year` 파라미터, `ON DUPLICATE KEY UPDATE`). 상태변경/메일 없음 — 데이터 이관용. 완료 시 "완료" 출력.
  - `order_item_sync*.php` / `order_item_cancel_sync_batch.php` / `order_bundle_item_sync.php` / `retail_sync_batch.php`: 주문항목·번들·리테일 동기화 배치(로직 유사, 나열 수준).
  - `batch/order_reserve_batch.php`: Asset 예약 재등록 배치 — 특정 `product_code`+`asset_id`의 주문(status='2')을 `runReserveRegisterAdmin`으로 신규 asset에 재예약, `tbl_order_item_asset.reserve_id/asset_id` 갱신. `$_SESSION['admin']` 없으면 리다이렉트(관리자 실행).
  - `batch/order_reserve.php` / `order_reserve_gift.php` / `order_reserve_gift_batch.php` / `order_reserve_to_bundle_batch.php`: 예약/사은품/번들 전환 보조 배치(나열).
- **정책·규칙**: 세션 관리자 실행(일부 세션 없으면 리다이렉트). PG/공급사 API 없이 DB upsert 위주(단, reserve 배치는 Asset API 호출).
- **참조**: ORDER-WORKFLOW-AUDIT.md.

## 상태전이·액션 매핑표

어드민 버튼/액션 → `order_ps.php`의 `mode`(별도 표기 없으면 `order_ps.php`) → 상태변화 → 부수효과. (근거·조건 상세는 PAYMENT-APPROVAL.md / ORDER-WORKFLOW-AUDIT.md)

| 진입 화면 · 버튼 | mode | 상태변화 | 부수효과 (PG/이행/로그/포인트) |
|---|---|---|---|
| order_view · Payco 결제취소 | `payco_refund` | `tbl_order.step=9`, `cancel_date=now` (응답 success 시) | `PaycoPG::paycoCancel` 호출, `payco_log_cancel` 기록, `tbl_order_log`("PAYCO 결제취소 완료") |
| order_view · Payco 계좌반납(입금만료) | `payco_cancel` | `step=9`, `cancel_date` | API 미호출, `payco_log_cancel`("입금일 만료"), 주문로그 |
| (테스트) Payco 취소 | `payco_refund_test` | 전액이면 `step=9`, 부분이면 유지 | test모드 `PaycoPG("test")`, 부분취소 시 `orderCertifyKey` 갱신, 응답 원문 echo |
| order_view · KCP 결제취소/계좌반납 | `kcp_refund` | res_cd=0000이면 `step=9`,`cancel_date` | `Kcp::cancelPayment`, 주문로그("KCP 결제취소 완료") |
| order_view · Tossadapter 결제취소 | `toss_adapter_refund` | res_cd=0000이면 `step=9` | `Tossadapter::cancelPayment`, 주문로그 |
| order_view · Toss 결제취소(모달) | `toss_refund` | 잔액 0이면 `cancelOrder(settle_no,'9')` | `Toss::cancelPayment`(부분취소 `cancelAmount` 지원), `toss_log` 갱신, 주문로그 |
| order_view · Tosspay 결제취소(모달) | `tosspay_refund` | code=0이면 `cancelOrder(...,'9')` | `Tosspay::cancelPayment`, 주문로그 |
| order_view · NaverPay 결제취소 | `naverpay_refund` | Success면 `cancelOrder(...,'9')` | `NaverPay::naverPayCancel`(고객요청 환불), 주문로그 |
| order_view · 사용적립금 반환 | `point_refund` | `tbl_order.use_emoney=0` (step 유지) | `tbl_emoney_log` 삭제(dgkr), 주문로그("사용포인트 반환") |
| order_view · 결제취소+적립금 반환 | `order_refund` | `use_emoney=0`, `step=9`, `cancel_date` | `tbl_emoney_log` 삭제, 주문로그("[결제취소] …반환") |
| order_view · 항목 취소(모달) | `order_item_cancel` | `cancelOrderItem(ordno,'9')` (status=9); delivery_type 2/3면 배송항목 9; 1/3면 공급사 취소 API | 공급사 분기: Asset `runReserveCancel` / Ztorm 로컬만(Hub 별도) / Genba `runGenbaPerformOrderActionAsync`→State3 / Vaultn `runCancelOrder` / PointNexus booked=동기취소·그외=cancel_pending(비동기, 검증배치 확정). 주문로그. **PointNexus는 API 성공 확인 후에만 취소완료(9)** |
| order_view · 취소요청 반려 | `order_reject` | `cancelOrderItem(ordno,'2')` (주문완료로 되돌림) | 주문로그("주문취소반려") |
| order_view · 재발송 | `resend` | 성공 시 `updateItemStatus`(발급결과 반영) | 가드(step2·fail·status1·미수령·delivery 1/3). `OrderFulfillment::processItem`로 재발급(세션 없이 DB로 payment_info 재구성, 즉시발급 `pay_type=PACA`). 주문로그, `msg()` 리다이렉트 |
| order_view · 운송장 등록(항목) | `register_tracking_no_item` | `tbl_order_shipment.shipment_status=3` + tracking/delivery_code | — |
| order_view · 운송장 등록(주문) | `register_tracking_no` | `tbl_order_shipment.shipment_status=3` + tracking | (toss/에스크로 배송통보 코드 존재하나 주석 처리) |
| shipment_ready · 발송(일괄) | `shipment_shipping` | shipment_status `3→4`, `shipped_date` | toss(escw=Y) `Tossadapter::regDelivery`, kcp(escw=Y) 에스크로 STE1 |
| shipment · 배송완료(일괄) | `shipment_shipped` | shipment_status `4→5`, `estimated_delivery_date` | — |
| shipment · 실배송완료(일괄) | `actual_delivery` | shipment_status `5→6`, `actual_delivery_date` | — |
| order_view · 메모 기록 | `memo_add` | 상태변화 없음 | `tbl_order_log` INSERT(memo_gubun 라벨) |

> 메일 발송: 이 어드민 액션 코드에서 직접 메일을 발송하는 지점은 확인되지 않음(취소/재발송 로그만 기록). 결제완료/발송 시점의 고객 메일은 결제 플로우(스토어프론트)·NOTIFICATION-EMAIL.md 계약에 따른다. **추정**: 재발송(`resend`)이 발급 로직을 차용하므로 발급 성공 시 메일이 그 하위에서 트리거될 수 있음 — 도메인 문서와 대조 필요.

## 변형/테스트 파일 (나열)

- `order/order_view_v2.php` (79.7K) — `order_view.php`의 v2 변형(리팩터 버전 추정, 사이드바 미연결).
- `order/order_old_view.php` (164.8K) — 과거주문 상세 구버전.
- `order/order_item_sync_20251013.php`, `order/order_sync_20251013.php` — 날짜접미(2025-10-13) 스냅샷/일회성 동기화 변형.
- `order/yjs_dashboard_order.php`, `order/yjs_order_view.php`, `order/yjs_toss_delivery.php` — `yjs_` 접두 개인/실험 변형(대시보드·상세·토스 배송 테스트).
- `order/order_sync.php`, `order/order_cancel_sync.php`, `order/order_item_sync.php`, `order/order_cancel_sync_batch.php`, `order/order_item_sync_batch.php`, `order/order_item_cancel_sync_batch.php`, `order/order_bundle_item_sync.php`, `order/retail_sync_batch.php` — 동기화/배치 실행 화면(위 배치 항목 참조).
- `order/batch/order_reserve.php`, `order/batch/order_reserve_batch.php`, `order/batch/order_reserve_gift.php`, `order/batch/order_reserve_gift_batch.php`, `order/batch/order_reserve_to_bundle_batch.php` — 예약/사은품/번들 전환 배치.

## 마이그레이션 유의점

- **`order_ps.php`가 사실상 주문 커맨드 API다.** Next.js 이관 시 mode 스위치를 그대로 라우트/서버액션 집합으로 옮기고, 상태전이(step/status/shipment_status 코드값)와 부수효과(PG API·공급사 API·`tbl_order_log`·`tbl_emoney_log`)를 mode 단위로 1:1 재현한다. 코드값(1/2/3/8/9/99)은 라벨이 아니라 **DB 저장값**이므로 그대로 유지.
- **공급사 이행 분기는 `order_system` 문자열 키(Asset/Ztorm/Genba/Vaultn/PointNexus)로 하드코딩**되어 있다. 특히 PointNexus의 booked=동기/그외=비동기(cancel_pending→검증배치) 및 Ztorm의 "Hub 별도취소"(어드민 API 미호출) 예외를 반드시 보존. Ztorm 취소는 로컬 상태만 바꾼다는 점이 함정.
- **재발송(`resend`)은 결제 플로우의 발급 로직을 세션 없이 DB로 재구성**한다(`OrderFulfillment::processItem`, `pay_type=PACA` 강제 즉시발급). 가드 조건(step2·send_status=fail·status1·미수령·delivery 1/3)을 그대로 옮겨야 오발송을 막는다.
- **DB 이중화**: 메인 `$conn`과 dgkr `$conn_dgkr`를 동시에 쓴다(포인트/적립금 로그·과거주문·구버전 목록은 dgkr). 이관 시 두 데이터소스 경계를 명확히.
- **PG별 취소 경로가 6종(KCP/Toss/Tossadapter/Tosspay/Payco/NaverPay)**으로 화면·폼·API가 제각각이다. 각 성공코드 판정(`res_cd=='0000'`, `code=='0'`, `message=='success'`, `code=='Success'`, 잔액 0)과 그에 따른 step=9 조건이 서로 다르니 개별 재현.
- **부분취소/연속취소**: Toss `cancelAmount`+잔액판정, Payco 연속 부분취소 시 `orderCertifyKey` 갱신 등 부분취소 상태 관리 로직 존재. 전액이 아닐 때 step을 유지하는 규칙 보존.
- **배송 상태 일괄전이**는 체크박스 배열 POST(`*_arr`)로 다건 처리 + 에스크로/PG 배송통보를 곁들인다. 배열 파라미터 구조와 escw=Y 분기(Tossadapter `regDelivery`, KCP STE1)를 유지.
- **sync/batch 파일은 대부분 레거시 dgkr→신규 upsert 데이터 이관용**(상태변경·메일 없음)으로, 신규 시스템에서는 원천적으로 불필요할 가능성이 높다. reserve 배치만 Asset API를 호출하므로 별도 취급. 실사용 여부는 도메인팀 확인 후 이관 범위 결정 권장.
- **v2/yjs/날짜접미 변형은 이관 대상 정본이 아니다.** 정본은 `order_view.php`/각 `*_success`/`order_ps.php`. 변형 파일은 참고만 하고 이관하지 않는다(중복·실험 코드).
- 결제상태(step)와 주문상태(status)가 **서로 다른 축**임에 주의(예: step=2 결제완료여도 status는 1~6로 배송 진행). 통합/필터 목록은 축을 섞어 라벨링하므로 매핑을 분리 관리.
