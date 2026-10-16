# 배송준비 리스트 (order_shipment_ready)

O1 영역 배송 주문 관리 v2 3번째 화면. shipment_status='3'(배송준비) 고정. 체크박스 선택 → 배송중 일괄 전환 mutation.

## 원본
- 파일: `pc/_Admin_/order/order_shipment_ready.php` (라이브)
- 도메인: `AdminOrder::getOrderShipmentReady()` + 행별 enrichment(`getOrderKcpLog`/`getOrderTossAdapterLog`/`getOrderTossLog`/`getOrderItemDelivery`/`getShipmentCompany`) + `order_ps.php`(mode=shipment_shipping)
- 참조: `docs/legacy-admin/40-order.md`, [order-shipment-pending.md](order-shipment-pending.md)

## #203(pending) 대비 차이
1. page_title "배송준비 리스트", shipment_status='3' 고정(`getOrderShipmentReady`)
2. **기본 시작일 `"2025-01-01"` 하드코딩**(의도 코드 `date('Y-m-01')`는 주석) — **개발자 승인: legacy 그대로 이식**(quirk). end는 이번달 말일 동일.
3. **search_key switch `case "settle_no"` 오타**(select value는 `search_settle_no`) → **결제번호 선택 시 case 미매칭 → 필터 안 됨(전체 반환) legacy 버그**. 그대로 이식.
4. **엑셀다운로드 버튼 없음**(pending의 float-start 블록 제거)
5. **체크박스 컬럼 추가**: thead 전체선택(`chk_all`/js-checkall) + tbody 행별 체크박스(data-step/settleno/escw/tno/ordno/pg/trackingno/deliverycode)
6. **행별 배송/에스크로 enrichment**: pg=kcp → `getOrderKcpLog`(escw_yn·tno), pg=toss → `getOrderTossAdapterLog`/`getOrderTossLog`(escw_yn·tno), `getOrderItemDelivery`(tracking_no·delivery_code). **화면 미표시, 체크박스 data(=mutation 파라미터)로만 사용**.
7. **"선택 배송중" 버튼 + btnShipping mutation**: 선택 항목 → `order_ps.php mode=shipment_shipping` AJAX. confirm→POST→reload.

## 화면·플로우
- 진입 URL: `/order/order_shipment_ready.php` → `/order/order_shipment_ready`
- 파라미터: pending과 동일(page/search_key/search_value/start/end/date_label)
- 정렬 `order_item_id desc`, 기본 프리셋 세트(지난해 없음)

### 목록 (table, 12컬럼: 체크박스 + 11)
0. **체크박스** (전체선택 헤더 + 행별, mutation 대상 data 보유)
1~11. #203과 동일: 번호(역순 ×20)/주문일자/결제번호(order_view 미이관)/주문번호/회원아이디/상품코드/상품명(M뱃지)/주문금액/주문상태(getOrderStatus)/배송상태(send_status raw)/수령여부(O·X)
- 하단 **"선택 배송중" 버튼**(btn-success), 20/page, ServerPagination

### 배송중 전환 (btnShipping)
- confirm "선택한 주문의 상태를 배송중으로 변경하겠습니까?" → 선택 체크박스 data 배열 수집 → `POST order_ps.php mode=shipment_shipping` → 성공 시 reload(=invalidate).
- 백엔드(`order_ps.php`): `UPDATE tbl_order_shipment SET shipment_status='4', shipped_date=NOW() WHERE settle_no AND ordno AND shipment_status='3'`. 에스크로(escw='Y') 주문은 PG 배송등록(toss `regDelivery` dlvtype=03 / kcp `cancelPayment` mod_type=STE1). **모두 백엔드 책임**.

## 데이터 (legacy)
- SQL: `... where a.step='2' and b.status='2' and c.shipment_status='3' and b.delivery_type<>'1' <add_where> order by order_item_id desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/shipment-ready`
- 요청: `page`, `search_key`+`search_value`, `search_start_date`/`search_end_date`.
  - **legacy 버그 이식**: `search_key=search_settle_no`는 case 오타로 필터 안 됨(전체 반환). 백엔드도 동일 재현(결제번호 검색 무효).
- 백엔드: 3중 조인 + `c.shipment_status='3'`, `order_item_id desc`, `results_per_page=20`. 응답 item에 배송중 전환용 필드(`escw_yn`/`tno`/`tracking_no`/`delivery_code`) + `send_status` 포함.

### `POST /admin/order/shipment/shipping`
- payload(배열): `step_arr`, `settle_no_arr`, `escw_arr`, `tno_arr`, `ordno_arr`, `pg_arr`, `tracking_no_arr`, `delivery_code_arr`.
- 백엔드: shipment_status 3→4 + shipped_date, 에스크로 PG 배송등록. 응답 `{ success: boolean }`. onSuccess → 목록 invalidate.

**응답(GET) 200**: #203 item + `escw_yn`/`tno`/`tracking_no`/`delivery_code`.

## 타겟 매핑
- 라우트: `src/routes/order/order_shipment_ready.tsx` → `/order/order_shipment_ready` (validateSearch, OrderShipmentFixedSearch 재사용)
- 스크린: `screens/order-shipment-ready` (`OrderShipmentReadyScreen`)
- entities: `entities/order` 확장 — `OrderShipmentItem`에 `escw_yn`/`tno`/`tracking_no`/`delivery_code` 옵셔널 추가, `OrderShipmentShippingRequest`, `resolveOrderShipmentReadySearch`(기본 시작 2025-01-01·end 이번달 말일), `fetchOrderShipmentReady`/`useOrderShipmentReady`, `shipOrderShipment`/`useShipOrderShipment`(mutation). `ORDER_CANCEL_SEARCH_KEY_OPTIONS`/`getOrderStatusLabel` 재사용.
- 공용 UI: `shared/ui/DateRangePicker`·`ServerPagination`
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/shipment-ready` GET + `/admin/order/shipment/shipping` POST). shipment rows에 escw_yn/tno/tracking_no/delivery_code 추가.

## Parity 체크리스트
- [ ] 화면 요소 일치 — breadcrumb·h4·검색필터(엑셀버튼 없음)·체크박스 컬럼·12컬럼·"선택 배송중" 버튼
- [ ] 필드/검증 일치 — 기본 2025-01-01~이번달말일(하드코딩 quirk)·search_settle_no 무효 버그·send_status raw
- [ ] 분기/플로우 일치 — shipment_status=3 고정·전체선택·배송중 전환 confirm→mutation→invalidate·order_item_id desc·20/page
- [ ] 엣지케이스 일치 — 빈 목록·M뱃지·에스크로 PG 배송등록(백엔드)·settle_no 링크 미이관
