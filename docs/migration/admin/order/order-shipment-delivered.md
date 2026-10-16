# 배송완료 리스트 (order_shipment_delivered)

O1 영역 배송 주문 관리 v2 5번째 화면. shipment_status='5'(배송완료) 고정. #205(shipping)의 소폭 변형 — 구매확정 전환 mutation.

## 원본
- 파일: `pc/_Admin_/order/order_shipment_delivered.php` (라이브)
- 도메인: `AdminOrder::getOrderShipmentDelivered()` + `getShipmentStatus()` + `order_ps.php`(mode=actual_delivery)
- 참조: [order-shipment-shipping.md](order-shipment-shipping.md)

## #205(shipping) 대비 차이
1. page_title "배송완료 리스트", shipment_status='5' 고정(`getOrderShipmentDelivered`)
2. 하단 버튼 **"선택 구매확정"(btnConfirm)** (shipping은 "선택 배송완료")
3. mutation mode = **`actual_delivery`**(shipping은 shipment_shipped). confirm "선택한 주문의 상태를 구매확정으로 변경하겠습니까?". payload 5배열(step/settle_no/escw/tno/ordno) 동일, escw `$$` 버그 빈값 동일.
- 나머지(상품정보 통합·배송상태 getShipmentStatus·운송장번호+배송조회·기본 2025-01-01~이번달말일·search_settle_no 정상·12컬럼·order_item_id desc·20/page) **#205와 동일**.

## 데이터 (legacy)
- SQL: `... where a.step='2' and b.status='2' and c.shipment_status='5' and b.delivery_type<>'1' <add_where> order by order_item_id desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/shipment-delivered`
- 요청: #205와 동일(page/search_key+value/start/end)
- 백엔드: 3중 조인 + `c.shipment_status='5'`, `order_item_id desc`, 20/page. 응답 item에 tracking_number·tno 포함.

### `POST /admin/order/shipment/actual-delivery` (구매확정 전환)
- payload(배열 5): step_arr/settle_no_arr/escw_arr(빈값)/tno_arr/ordno_arr
- 백엔드: shipment_status 5→6(구매확정). onSuccess → invalidate.

## 타겟 매핑
- 라우트: `src/routes/order/order_shipment_delivered.tsx` → `/order/order_shipment_delivered` (OrderShipmentFixedSearch)
- 스크린: `screens/order-shipment-delivered` (#205 골격, 버튼 라벨·mutation만 상이)
- entities: `entities/order` 확장 — `fetchOrderShipmentDelivered`/`useOrderShipmentDelivered`, `confirmPurchaseOrderShipment`/`useConfirmPurchaseOrderShipment`(actual_delivery). `OrderShipmentShippedRequest`·`resolveOrderShipmentReadySearch`·`getShipmentStatusFullLabel`·`openDeliveryTracking` 재사용.
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/shipment-delivered` GET status=5 + `/admin/order/shipment/actual-delivery` POST)

## Parity 체크리스트
- [ ] 화면 요소 일치 — h4·검색필터·체크박스·12컬럼·"선택 구매확정" 버튼
- [ ] 필드/검증 일치 — shipment_status=5·기본 2025-01-01~이번달말일·escw $$ 버그
- [ ] 분기/플로우 일치 — 구매확정 전환 confirm→actual_delivery mutation→invalidate·배송조회·order_item_id desc·20/page
- [ ] 엣지케이스 일치 — 빈 목록·M뱃지·settle_no 링크 미이관
