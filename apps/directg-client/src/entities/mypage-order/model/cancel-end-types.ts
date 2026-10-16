/**
 * 취소완료 내역 (legacy `Mypage2::getOrderList_v2` — status 9 필터, 날짜/상품명 미적용).
 * 계약: `GET /api/mypage/orders/cancel-end`.
 * 문서: docs/migration/storefront/mypage/cancel-end-list.md
 */
export interface CancelEndItem {
  /** 표시용 주문일자(b.order_date). */
  order_date: string;
  ordno: string;
  settle_no: string;
  product_name: string;
  price: number;
  /** "1" 코드발송 / "2" 택배발송 / "3" 코드+택배발송. */
  delivery_type: string;
  /** tbl_order_item.status (="9" 취소완료). getOrderStatus 라벨. */
  status: string;
  /** getOrderShipment.shipment_status — delivery_type≠1일 때만, 그 외 null. */
  shipment_status: string | null;
}

export interface MypageCancelEndResponse {
  list: CancelEndItem[];
  page: number;
  totalPages: number;
}
