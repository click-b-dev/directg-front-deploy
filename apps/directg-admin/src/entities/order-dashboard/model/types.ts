// legacy order/yjs_dashboard_order.php — "처리 필요" 6 카운트 스냅샷(read-only).
// docs/migration/admin/order/order-dashboard.md
// 각 필드 null = 집계 실패(테이블 부재/쿼리 오류) → 카드에 '-'(경고색) 표시.
export type OrderDashboard = {
  key_fail: number | null; // 1. 키발급 실패 (결제완료 step=2 · send_status=fail · status=1)
  cancel_req: number | null; // 2. 취소요청 (order_item status 7/8)
  vbank: number | null; // 3. 가상계좌 입금대기 (발급 후 미입금)
  ship_pending: number | null; // 4. 실물 배송대기 (shipment_status=2 · delivery_type<>1)
  no_system: number | null; // 5. 연동없음 의심 (코드발송인데 order_system 빈값)
  pn_book: number | null; // 6. PointNexus 미confirm (action=book · status=booked)
};
