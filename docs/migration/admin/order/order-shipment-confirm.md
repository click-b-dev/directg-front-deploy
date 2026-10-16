# 구매확정 리스트 (order_shipment_confirm)

O1 영역 배송 주문 관리 v2 6번째(마지막) 화면. shipment_status='6'(구매확정) 고정. **읽기전용**(전환 mutation 없음).

## 원본
- 파일: `pc/_Admin_/order/order_shipment_confirm.php` (라이브)
- 도메인: `AdminOrder::getOrderShipmentConfirm()` + `getShipmentStatus()`
- 참조: [order-shipment-shipping.md](order-shipment-shipping.md)

## #205(shipping) 대비 차이
1. page_title "구매확정 리스트", shipment_status='6' 고정(`getOrderShipmentConfirm`)
2. **체크박스 컬럼 없음**(전체선택 헤더·행 체크박스 제거) — **읽기전용**
3. **하단 전환 버튼 없음**(btnShipped/mutation 제거)
4. 행별 **kcp_info enrichment 제거**(getOrderKcpLog 없음)
5. **주문일자 컬럼 = 주문일자 `<br/>(`구매확정일자 `actual_delivery_date)`** 2줄 (헤더 "주문일자<br/>(구매확정일자)")
- 나머지(상품정보 통합·배송상태 getShipmentStatus·운송장번호+배송조회·기본 2025-01-01~이번달말일·search_settle_no 정상·order_item_id desc·20/page) **#205와 동일**.

## 화면·플로우
- 진입 URL: `/order/order_shipment_confirm.php` → `/order/order_shipment_confirm`
- 파라미터: shipping과 동일(page/search_key/search_value/start/end/date_label)

### 목록 (table, 11컬럼: 체크박스 없음)
번호(역순 ×20)/**주문일자(구매확정일자 2줄)**/결제번호(order_view 미이관)/주문번호/회원아이디/상품정보(통합)/주문금액/주문상태(getOrderStatus)/배송상태(getShipmentStatus 라벨)/운송장번호(tracking_number)/배송조회(openDeliveryTracking)

## 데이터 (legacy)
- SQL: `... where a.step='2' and b.status='2' and c.shipment_status='6' and b.delivery_type<>'1' <add_where> order by order_item_id desc`, `results_per_page=20`

## API 계약 (백엔드 전달)

### `GET /admin/order/shipment-confirm`
- 요청: #205와 동일(page/search_key+value/start/end)
- 백엔드: 3중 조인 + `c.shipment_status='6'`, `order_item_id desc`, 20/page. 응답 item에 `tracking_number`·`actual_delivery_date`(구매확정일자) 포함.

**응답 200**: shipment item + `actual_delivery_date`. (전환 mutation 없음)

## 타겟 매핑
- 라우트: `src/routes/order/order_shipment_confirm.tsx` → `/order/order_shipment_confirm` (OrderShipmentFixedSearch)
- 스크린: `screens/order-shipment-confirm` (읽기전용, 체크박스·mutation 없음)
- entities: `entities/order` 확장 — `OrderShipmentItem`에 `actual_delivery_date` 옵셔널 추가, `fetchOrderShipmentConfirm`/`useOrderShipmentConfirm`. `resolveOrderShipmentReadySearch`·`getShipmentStatusFullLabel`·`getOrderStatusLabel`·`openDeliveryTracking` 재사용.
- mock: `shared/mocks/handlers/order.ts` 확장(`/admin/order/shipment-confirm` GET status=6). shipment rows에 actual_delivery_date 추가.

## Parity 체크리스트
- [ ] 화면 요소 일치 — h4·검색필터·**체크박스 없음**·11컬럼(주문일자+구매확정일자 2줄)·전환 버튼 없음
- [ ] 필드/검증 일치 — shipment_status=6·기본 2025-01-01~이번달말일·배송상태 getShipmentStatus 라벨
- [ ] 분기/플로우 일치 — 읽기전용·배송조회·order_item_id desc·20/page·번호 ×20
- [ ] 엣지케이스 일치 — 빈 목록·M뱃지·settle_no 링크 미이관
