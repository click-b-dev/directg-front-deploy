# 배송중 리스트 (order_shipment_shipping)

O1 영역 배송 주문 관리 v2 4번째 화면. shipment_status='4'(배송중) 고정. 체크박스 선택 → 배송완료 전환 + 배송조회.

## 원본
- 파일: `pc/_Admin_/order/order_shipment_shipping.php` (라이브)
- 도메인: `AdminOrder::getOrderShipmentShipping()` + `getShipmentStatus()` + `getOrderKcpLog`(행 enrichment) + `order_ps.php`(mode=shipment_shipped)
- 참조: `docs/legacy-admin/40-order.md`, [order-shipment-ready.md](order-shipment-ready.md)

## #204(ready) 대비 차이
1. page_title "배송중 리스트", shipment_status='4' 고정(`getOrderShipmentShipping`)
2. **search_key case `search_settle_no` 정상**(ready의 오타 버그 없음 → 결제번호 검색 동작)
3. 기본 시작 `"2025-01-01"` 하드코딩(ready와 동일) → `resolveOrderShipmentReadySearch` 재사용
4. **컬럼 변경**:
   - 상품코드+상품명(2컬럼) → **상품정보 통합**(product_code `<br/>` M뱃지 + `<p class="text-wrap" style="width:500px">`product_name`</p>`) 1컬럼
   - 배송상태 = **`getShipmentStatus(shipment_status)` 라벨**(2~9, all의 send_status raw/2~6 배열과 다름)
   - 수령여부 제거 → **운송장번호(`tracking_number`)** + **배송조회 버튼** 2컬럼 추가
5. 행 enrichment: **`getOrderKcpLog`만 항상 조회**(pg 무관), escw_yn·tno. 체크박스 data: step/settleno/**escw(=`$$kcp_info['escw_yn']` 변수변수 버그 → 빈값)**/tno/ordno. (ready의 pg/trackingno/deliverycode 없음)
6. **"선택 배송완료" 버튼(btnShipped)** — `order_ps.php mode=shipment_shipped` (payload 5배열: step/settle_no/escw/tno/ordno). confirm→POST→reload.
7. **배송조회 버튼(btn_delivery_search)**: `data-deliverycode="001"` 고정, tracking=str_replace("-","",tracking_number). delivery_code=="002"면 우체국(epost), else CJ대한통운 target=_blank POST → **`shared/lib/delivery-tracking` `openDeliveryTracking` 재사용**.

## 화면·플로우
- 진입 URL: `/order/order_shipment_shipping.php` → `/order/order_shipment_shipping`
- 파라미터: pending/ready와 동일(page/search_key/search_value/start/end/date_label)
- 정렬 `order_item_id desc`, 20/page, 기본 2025-01-01~이번달 말일

### 목록 (table, 12컬럼: 체크박스 + 11)
체크박스(전체선택+행별)/번호(역순 ×20)/주문일자/결제번호(order_view 미이관)/주문번호/회원아이디/**상품정보(통합)**/주문금액/주문상태(getOrderStatus)/**배송상태(getShipmentStatus 라벨)**/**운송장번호(tracking_number)**/**배송조회(버튼)**
- 하단 **"선택 배송완료" 버튼**(btn-success)

### getShipmentStatus 라벨 (2~9, 미매칭 빈셀)
2배송대기/3배송준비/4배송중/5배송완료/6구매확정/8취소요청/9취소완료

## 데이터 (legacy)
- SQL: `... where a.step='2' and b.status='2' and c.shipment_status='4' and b.delivery_type<>'1' <add_where> order by order_item_id desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/shipment-shipping`
- 요청: `page`, `search_key`+`search_value`(settle_no 정상 동작), `search_start_date`/`search_end_date`
- 백엔드: 3중 조인 + `c.shipment_status='4'`, `order_item_id desc`, `20/page`. 응답 item에 `tracking_number`(운송장/배송조회용) + 배송완료 전환용 `tno`(kcp_info) 포함. escw는 legacy `$$` 버그로 빈값 전송(재현).

### `POST /admin/order/shipment/shipped`
- payload(배열): `step_arr`, `settle_no_arr`, `escw_arr`(legacy $$ 버그로 빈 문자열), `tno_arr`, `ordno_arr`
- 백엔드: shipment_status 4→5 + 에스크로 처리. onSuccess → invalidate.

**응답(GET) 200**: shipment item + `tracking_number`.

## 타겟 매핑
- 라우트: `src/routes/order/order_shipment_shipping.tsx` → `/order/order_shipment_shipping` (OrderShipmentFixedSearch)
- 스크린: `screens/order-shipment-shipping`
- entities: `entities/order` 확장 — `OrderShipmentItem`에 `tracking_number` 옵셔널 추가, `SHIPMENT_STATUS_FULL_LABEL`(2~9)/`getShipmentStatusFullLabel`, `OrderShipmentShippedRequest`, `fetchOrderShipmentShipping`/`useOrderShipmentShipping`, `shipCompleteOrderShipment`/`useShipCompleteOrderShipment`. `resolveOrderShipmentReadySearch`(2025-01-01)·`ORDER_CANCEL_SEARCH_KEY_OPTIONS`·`getOrderStatusLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`·`ServerPagination`·`shared/lib/delivery-tracking`(openDeliveryTracking)
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/shipment-shipping` GET status=4 + `/admin/order/shipment/shipped` POST). shipment rows에 tracking_number 추가.

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터·체크박스·12컬럼(상품정보 통합·운송장번호·배송조회)·"선택 배송완료"
- [ ] 필드/검증 일치 — 기본 2025-01-01~이번달말일·settle_no 정상 검색·배송상태 getShipmentStatus 라벨·escw $$ 버그(빈값)
- [ ] 분기/플로우 일치 — shipment_status=4 고정·배송완료 전환 confirm→mutation→invalidate·배송조회(CJ/epost)·order_item_id desc·20/page
- [ ] 엣지케이스 일치 — 빈 목록·M뱃지·운송장 하이픈 제거·settle_no 링크 미이관
